
import React, { useState } from 'react';
import { CommunityQuestion } from '../types';
import { getQASummary } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface CommunityQandAProps {
  questions: CommunityQuestion[];
}

const CommunityQandA: React.FC<CommunityQandAProps> = ({ questions }) => {
  const [summaries, setSummaries] = useState<{ [questionId: string]: string }>({});
  const [loadingStates, setLoadingStates] = useState<{ [questionId: string]: boolean }>({});
  const [errorStates, setErrorStates] = useState<{ [questionId: string]: string | null }>({});

  const handleGetSummary = async (question: CommunityQuestion) => {
    setLoadingStates(prev => ({ ...prev, [question.id]: true }));
    setErrorStates(prev => ({ ...prev, [question.id]: null }));
    try {
      const answerContents = question.answers.map(a => a.content);
      const summary = await getQASummary(question.question, answerContents);
      setSummaries(prev => ({ ...prev, [question.id]: summary }));
    } catch (err) {
      setErrorStates(prev => ({ ...prev, [question.id]: err instanceof Error ? err.message : 'Failed to get summary.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [question.id]: false }));
    }
  };

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };


  return (
    <div className="space-y-6">
      {questions.map(q => (
        <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-200">
          {/* Question */}
          <div className="flex items-start gap-3">
            <img src={q.author.avatarUrl} alt={q.author.name} className="w-9 h-9 rounded-full" />
            <div>
              <p className="font-semibold text-sm text-slate-800">{q.author.name} asked:</p>
              <p className="text-slate-700">{q.question}</p>
            </div>
          </div>
          
          {/* Answers */}
          <div className="mt-4 pl-8 space-y-3">
            {q.answers.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <img src={a.author.avatarUrl} alt={a.author.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1 bg-slate-50 rounded-md p-2">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-xs text-slate-700">{a.author.name}</p>
                    <p className="text-xs text-slate-500">{timeSince(a.createdAt)}</p>
                  </div>
                  <p className="text-sm text-slate-600">{a.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            {summaries[q.id] ? (
              <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200 animate-fade-in-up">
                <h4 className="text-sm font-semibold text-indigo-800 flex items-center">
                    <Icon name="sparkles" className="h-4 w-4 mr-2 text-indigo-500" />
                    AI Summary
                </h4>
                <p className="text-sm text-slate-700 mt-2">{summaries[q.id]}</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => handleGetSummary(q)}
                  disabled={loadingStates[q.id]}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {loadingStates[q.id] ? <LoadingSpinner/> : <Icon name="sparkles" className="h-4 w-4 mr-2" />}
                  {loadingStates[q.id] ? 'Summarizing...' : 'Get AI Summary'}
                </button>
              </div>
            )}
            {errorStates[q.id] && <p className="text-xs text-red-500 text-center mt-2">{errorStates[q.id]}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityQandA;
