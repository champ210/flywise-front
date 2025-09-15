import React from 'react';
import { WandergramStory } from '@/types';
import { Icon } from '@/components/common/Icon';

interface WandergramStoriesProps {
    stories: WandergramStory[];
}

const WandergramStories: React.FC<WandergramStoriesProps> = ({ stories }) => {
    return (
        <div className="py-4">
            <div className="flex space-x-4 overflow-x-auto custom-scrollbar pb-2">
                {/* Your Story Placeholder */}
                <div className="flex flex-col items-center flex-shrink-0 w-20 text-center cursor-pointer group">
                    <div className="relative p-0.5 rounded-full">
                        <div className="bg-white p-0.5 rounded-full">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" alt="Your Story" className="w-16 h-16 rounded-full object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                            <Icon name="plus" className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <p className="text-xs mt-1 truncate w-full text-slate-600">Your Story</p>
                </div>
                
                {/* Other stories */}
                {stories.map(story => (
                    <div key={story.id} className="flex flex-col items-center flex-shrink-0 w-20 text-center cursor-pointer group">
                         <div className={`relative p-0.5 rounded-full ${story.viewed ? 'bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'}`}>
                            <div className="bg-white p-0.5 rounded-full">
                                <img src={story.user.avatarUrl} alt={story.user.name} className="w-16 h-16 rounded-full object-cover" />
                            </div>
                        </div>
                        <p className="text-xs mt-1 truncate w-full group-hover:underline">{story.user.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WandergramStories;