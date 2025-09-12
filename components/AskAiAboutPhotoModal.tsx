import React, { useState, useEffect, useRef } from 'react';
import { WandergramPost } from '../types';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import { chatAboutImage } from '../services/geminiService';

interface AskAiAboutPhotoModalProps {
  post: WandergramPost;
  onClose: () => void;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

const AskAiAboutPhotoModal: React.FC<AskAiAboutPhotoModalProps> = ({ post, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'initial', sender: 'ai', text: "Hi there! What would you like to know about this photo?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        try {
            // Data URL format: "data:[<mediatype>];base64,[<data>]"
            const parts = post.imageUrl.split(',');
            const mimeType = parts[0].split(':')[1].split(';')[0];
            const base64Image = parts[1];

            if (!mimeType || !base64Image) {
                throw new Error("Invalid image format.");
            }
            
            const aiResponseText = await chatAboutImage(base64Image, mimeType, input);

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: aiResponseText,
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: error instanceof Error ? error.message : "Sorry, I couldn't process that request.",
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <Icon name="sparkles" className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-800">Ask AI About Photo</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </header>

                <div className="flex-shrink-0 h-1/3">
                    <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-contain bg-slate-100" />
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    <Icon name="logo" className="w-5 h-5"/>
                                </div>
                            )}
                            <div className={`rounded-2xl p-3 max-w-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            {msg.sender === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                    <Icon name="user" className="w-5 h-5"/>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                <Icon name="logo" className="w-5 h-5"/>
                            </div>
                            <div className="rounded-2xl p-3 bg-slate-100 text-slate-800 rounded-bl-none flex items-center">
                                <LoadingSpinner />
                                <span className="text-sm ml-2 text-slate-500">... is thinking</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                
                <div className="flex-shrink-0 border-t border-slate-200 p-2">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about this location..."
                            className="flex-1 block w-full rounded-full border-transparent bg-slate-100 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm py-2 px-4"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                        >
                            <Icon name="send" className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AskAiAboutPhotoModal;
