import React, { useState, useMemo } from 'react';
import { GroupTrip, GroupTripTask, GroupTripPoll, GroupTripExpense, DebtCalculation, GroupTripMember } from '../types';
import { Icon } from './Icon';
import { getCompromiseSuggestion } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface GroupTripDetailProps {
  trip: GroupTrip;
  onBack: () => void;
}

const GroupTripDetail: React.FC<GroupTripDetailProps> = ({ trip, onBack }) => {
  const [tasks, setTasks] = useState<GroupTripTask[]>(trip.tasks);
  const [polls, setPolls] = useState<GroupTripPoll[]>(trip.polls);
  const [expenses, setExpenses] = useState<GroupTripExpense[]>(trip.expenses);
  const [votedPolls, setVotedPolls] = useState<{ [pollId: string]: string }>({}); // pollId -> optionId
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: trip.members[0].id,
    sharedWith: trip.members.map(m => m.id),
  });
  const [expenseError, setExpenseError] = useState('');
  const [showAddPoll, setShowAddPoll] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [isSuggesting, setIsSuggesting] = useState<string | null>(null); // pollId
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleToggleTask = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };
  
  const handleVote = (pollId: string, optionId: string) => {
    if (votedPolls[pollId]) return;

    setPolls(currentPolls =>
      currentPolls.map(poll => {
        if (poll.id !== pollId) return poll;
        const newOptions = poll.options.map(option =>
          option.id === optionId ? { ...option, votes: [...option.votes, 'u1'] } : option
        );
        return { ...poll, options: newOptions };
      })
    );
    setVotedPolls(prev => ({ ...prev, [pollId]: optionId }));
  };

  const handleSuggestCompromise = async (poll: GroupTripPoll) => {
      setIsSuggesting(poll.id);
      setSuggestion(null);
      try {
        const result = await getCompromiseSuggestion(poll, trip.destination);
        setSuggestion(result);
      } catch (error) {
          alert(error instanceof Error ? error.message : "Could not get a suggestion.");
      } finally {
          setIsSuggesting(null);
      }
  };
  
  const handleNewExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleShareWithChange = (memberId: string) => {
    setNewExpense(prev => {
      const newSharedWith = prev.sharedWith.includes(memberId)
        ? prev.sharedWith.filter(id => id !== memberId)
        : [...prev.sharedWith, memberId];
      return { ...prev, sharedWith: newSharedWith };
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newExpense.amount);
    if (!newExpense.description.trim() || !amount || amount <= 0) {
        setExpenseError('Please enter a valid description and amount.');
        return;
    }
    if (newExpense.sharedWith.length === 0) {
        setExpenseError('An expense must be shared with at least one person.');
        return;
    }
    setExpenseError('');
    
    const expenseToAdd: GroupTripExpense = {
        id: `e${Date.now()}`,
        description: newExpense.description.trim(),
        amount,
        paidBy: newExpense.paidBy,
        sharedWith: newExpense.sharedWith,
    };
    setExpenses(prev => [expenseToAdd, ...prev]);

    // Reset form
    setNewExpense({
        description: '',
        amount: '',
        paidBy: trip.members[0].id,
        sharedWith: trip.members.map(m => m.id),
    });
  };

    const handleNewPollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPoll(prev => ({ ...prev, question: e.target.value }));
    };

    const handleNewPollOptionChange = (index: number, value: string) => {
        const newOptions = [...newPoll.options];
        newOptions[index] = value;
        setNewPoll(prev => ({ ...prev, options: newOptions }));
    };

    const addPollOption = () => {
        setNewPoll(prev => ({ ...prev, options: [...prev.options, ''] }));
    };

    const removePollOption = (index: number) => {
        if (newPoll.options.length <= 2) return;
        const newOptions = newPoll.options.filter((_, i) => i !== index);
        setNewPoll(prev => ({ ...prev, options: newOptions }));
    };

    const handleAddPoll = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) {
            alert("Please fill in the poll question and all options.");
            return;
        }
        const pollToAdd: GroupTripPoll = {
            id: `p${Date.now()}`,
            question: newPoll.question.trim(),
            isClosed: false,
            options: newPoll.options.map((opt, i) => ({
                id: `o${Date.now()}${i}`,
                text: opt.trim(),
                votes: [],
            })),
        };
        setPolls(prev => [pollToAdd, ...prev]);
        setNewPoll({ question: '', options: ['', ''] });
        setShowAddPoll(false);
    };

    const handleClosePoll = (pollId: string) => {
        setPolls(prev => prev.map(p => p.id === pollId ? { ...p, isClosed: true } : p));
    };
  
  const settledDebts = useMemo<DebtCalculation[]>(() => {
    if (expenses.length === 0) return [];

    const balances = new Map<string, number>();
    trip.members.forEach(m => balances.set(m.id, 0));

    expenses.forEach(expense => {
      if (expense.sharedWith.length === 0) return;
      const share = expense.amount / expense.sharedWith.length;
      balances.set(expense.paidBy, (balances.get(expense.paidBy) || 0) + expense.amount);
      expense.sharedWith.forEach(memberId => {
        balances.set(memberId, (balances.get(memberId) || 0) - share);
      });
    });

    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];
    for (const [id, balance] of balances.entries()) {
      if (balance < -0.01) debtors.push({ id, amount: -balance });
      if (balance > 0.01) creditors.push({ id, amount: balance });
    }

    const debts: DebtCalculation[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
          debts.push({
            from: trip.members.find(m => m.id === debtor.id)!,
            to: trip.members.find(m => m.id === creditor.id)!,
            amount,
          });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    return debts;
  }, [expenses, trip.members]);


  const totalVotesForPoll = (poll: GroupTripPoll) => {
    return poll.options.reduce((sum, option) => sum + option.votes.length, 0);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  const findMember = (memberId: string): GroupTripMember | undefined => trip.members.find(m => m.id === memberId);
  const isAdmin = useMemo(() => trip.members.some(m => m.id === 'u1' && m.role === 'admin'), [trip.members]);
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up p-2 sm:p-4">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <Icon name="chevron-left" className="h-5 w-5 mr-1" />
        Back to All Trips
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">{trip.name}</h2>
        <p className="mt-1 text-slate-500">{trip.destination}</p>
        <div className="mt-4 flex items-center -space-x-2">
            {trip.members.map(member => (
                <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
            ))}
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 border-2 border-white">
                +{trip.members.length}
            </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Itinerary & Expenses) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center mb-4">
              <Icon name="calendar" className="h-5 w-5 mr-3 text-blue-600" />
              Shared Itinerary
            </h3>
            <div className="space-y-4">
              {trip.itinerary.map(day => (
                <div key={day.date}>
                  <p className="font-semibold text-slate-700">{formatDate(day.date)}</p>
                  <ul className="mt-2 ml-4 border-l border-slate-200 pl-4 space-y-3">
                    {day.items.map(item => (
                      <li key={item.id} className="relative">
                         <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></div>
                         <p className="text-sm font-semibold text-slate-800">{item.time}: {item.activity}</p>
                         {item.location && <p className="text-xs text-slate-500">{item.location}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {/* Expense Tracker */}
           <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center mb-4">
                    <Icon name="receipt" className="h-5 w-5 mr-3 text-blue-600" />
                    Expense Tracker
                </h3>
                {/* Add Expense Form */}
                <form onSubmit={handleAddExpense} className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-4">
                    <h4 className="font-semibold text-sm text-slate-700">Add a New Expense</h4>
                    <input type="text" name="description" value={newExpense.description} onChange={handleNewExpenseChange} placeholder="Description (e.g., Dinner)" className="w-full text-sm rounded-md border-slate-300 shadow-sm" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="amount" value={newExpense.amount} onChange={handleNewExpenseChange} placeholder="Amount ($)" min="0.01" step="0.01" className="w-full text-sm rounded-md border-slate-300 shadow-sm" />
                        <select name="paidBy" value={newExpense.paidBy} onChange={handleNewExpenseChange} className="w-full text-sm rounded-md border-slate-300 shadow-sm">
                            <option value="" disabled>Paid by...</option>
                            {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">Shared with:</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {trip.members.map(m => (
                                <label key={m.id} className="flex items-center text-sm cursor-pointer">
                                    <input type="checkbox" checked={newExpense.sharedWith.includes(m.id)} onChange={() => handleShareWithChange(m.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2">{m.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {expenseError && <p className="text-xs text-red-600">{expenseError}</p>}
                    <button type="submit" className="w-full px-4 py-2 text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700">Add Expense</button>
                </form>

                {/* Expense List */}
                <div className="mt-6 space-y-3">
                    {expenses.map(exp => (
                        <div key={exp.id} className="p-3 bg-white border border-slate-200 rounded-md text-sm">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-slate-800">{exp.description}</p>
                                <p className="font-bold text-slate-900">${exp.amount.toFixed(2)}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Paid by {findMember(exp.paidBy)?.name || 'Unknown'}</p>
                        </div>
                    ))}
                </div>

                {/* Who Owes Who */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                     <h4 className="font-semibold text-sm text-slate-700 mb-2">Who Owes Who</h4>
                     {settledDebts.length > 0 ? (
                        <ul className="space-y-2">
                            {settledDebts.map((debt, i) => (
                                <li key={i} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-md">
                                    <div className="flex items-center">
                                        <img src={debt.from.avatarUrl} alt={debt.from.name} className="w-6 h-6 rounded-full mr-2" />
                                        <span>{debt.from.name} owes {debt.to.name}</span>
                                    </div>
                                    <span className="font-semibold text-green-700">${debt.amount.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-sm text-slate-500 italic">Everyone is settled up!</p>
                     )}
                </div>
            </div>
        </div>

        {/* Right Column (Tasks & Polls) */}
        <div className="space-y-6">
           <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center mb-4">
              <Icon name="check-circle" className="h-5 w-5 mr-3 text-blue-600" />
              To-Do List
            </h3>
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => handleToggleTask(task.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-3 text-sm ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {task.task}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <Icon name="lightbulb" className="h-5 w-5 mr-3 text-blue-600" />
                Group Polls
                </h3>
                <button onClick={() => setShowAddPoll(prev => !prev)} className="text-sm font-medium text-blue-600 hover:text-blue-800">{showAddPoll ? 'Cancel' : 'Add Poll'}</button>
            </div>

            {showAddPoll && (
                <form onSubmit={handleAddPoll} className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3 mb-4 animate-fade-in">
                    <input type="text" value={newPoll.question} onChange={handleNewPollChange} placeholder="Poll question..." className="w-full text-sm rounded-md border-slate-300 shadow-sm" required />
                    {newPoll.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="text" value={option} onChange={(e) => handleNewPollOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className="flex-grow text-sm rounded-md border-slate-300 shadow-sm" required />
                            {newPoll.options.length > 2 && (
                                <button type="button" onClick={() => removePollOption(index)} className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600">
                                    <Icon name="x-mark" className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={addPollOption} className="text-xs font-semibold text-blue-600 hover:underline">+ Add Option</button>
                        <button type="submit" className="px-3 py-1 text-xs font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700">Create Poll</button>
                    </div>
                </form>
            )}

            <div className="space-y-5">
              {polls.map(poll => {
                 const winningOptionIds = useMemo(() => {
                    if (!poll.isClosed) return [];
                    let maxVotes = 0;
                    poll.options.forEach(option => {
                        if (option.votes.length > maxVotes) maxVotes = option.votes.length;
                    });
                    if (maxVotes === 0) return [];
                    return poll.options.filter(option => option.votes.length === maxVotes).map(option => option.id);
                }, [poll]);

                return (
                    <div key={poll.id}>
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm text-slate-800 mb-2">{poll.question}</p>
                        {isAdmin && !poll.isClosed && (
                            <button onClick={() => handleClosePoll(poll.id)} className="text-xs font-bold text-red-600 hover:underline">Close Poll</button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {poll.options.map(option => {
                        const totalVotes = totalVotesForPoll(poll);
                        const votePercentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                        const isWinner = winningOptionIds.includes(option.id);
                        return (
                            <button
                            key={option.id}
                            onClick={() => handleVote(poll.id, option.id)}
                            disabled={!!votedPolls[poll.id] || poll.isClosed}
                            className={`w-full text-left p-2 rounded-md border relative overflow-hidden disabled:cursor-not-allowed group transition-colors ${
                                isWinner ? 'border-green-400' : 'border-slate-200'
                            }`}
                            >
                            <div
                                className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                                    isWinner ? 'bg-green-100' : 'bg-blue-100'
                                }`}
                                style={{ width: `${(votedPolls[poll.id] || poll.isClosed) ? votePercentage : 0}%` }}
                            ></div>
                            <div className="relative flex justify-between items-center text-sm">
                                <span>
                                    {votedPolls[poll.id] === option.id && <span className="mr-2">✅</span>}
                                    {isWinner && <Icon name="trophy" className="h-4 w-4 mr-2 inline text-green-600"/>}
                                    {option.text}
                                </span>
                                <span className="text-xs font-semibold text-slate-600">
                                    {option.votes.length} vote{option.votes.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            </button>
                        );
                        })}
                    </div>
                    {isSuggesting === poll.id && <div className="text-center p-2"><LoadingSpinner/></div>}
                    {suggestion && isSuggesting === null && (
                        <div className="mt-2 p-3 bg-indigo-50 rounded-md border border-indigo-200 text-sm">{suggestion}</div>
                    )}
                    {!poll.isClosed && (
                        <div className="mt-2 text-center">
                            <button onClick={() => handleSuggestCompromise(poll)} disabled={!!isSuggesting} className="text-xs font-semibold text-blue-600 hover:underline">
                                <Icon name="sparkles" className="h-4 w-4 inline mr-1"/>
                                {isSuggesting === poll.id ? 'Thinking...' : 'Suggest Compromise'}
                            </button>
                        </div>
                    )}
                    </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupTripDetail;
