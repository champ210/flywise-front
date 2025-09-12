import React, { useState } from 'react';
import { Experience } from '../types';
import { Icon } from './Icon';

interface ExperienceDetailProps {
  experience: Experience;
  onBack: () => void;
  onBook: (experience: Experience) => void;
  t: (key: string) => string;
}

const StarRating: React.FC<{ rating: number, className?: string }> = ({ rating, className = 'h-5 w-5' }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Icon key={i} name="star" className={`${className} ${i < Math.round(rating) ? 'text-yellow-400' : 'text-slate-300'}`} />
        ))}
    </div>
);


const ExperienceDetail: React.FC<ExperienceDetailProps> = ({ experience, onBack, onBook, t }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [guests, setGuests] = useState(1);

    return (
    <div className="max-w-4xl mx-auto animate-fade-in-up p-2 sm:p-4">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <Icon name="chevron-left" className="h-5 w-5 mr-1" />
        Back to Experiences
      </button>

      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
        {/* Image Gallery */}
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-80">
            <div className="col-span-2 row-span-2">
                 <img src={experience.images[0]} alt={experience.title} className="w-full h-full object-cover" />
            </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
                <div>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{experience.category}</span>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">{experience.title}</h2>
                    <p className="mt-1 text-slate-500">{experience.location}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-b border-slate-200 py-4">
                    <div><Icon name="clock" className="h-6 w-6 mx-auto text-slate-500"/><p className="text-xs mt-1">{experience.duration}</p></div>
                    <div><Icon name="users" className="h-6 w-6 mx-auto text-slate-500"/><p className="text-xs mt-1">Up to {experience.groupSize.max} people</p></div>
                    <div><Icon name="chat" className="h-6 w-6 mx-auto text-slate-500"/><p className="text-xs mt-1">{experience.languages.join(', ')}</p></div>
                    <div className="flex items-center justify-center"><StarRating rating={experience.rating} /><span className="text-xs ml-1">({experience.reviews.length})</span></div>
                </div>

                <div>
                    <h3 className="font-semibold text-slate-800">About this experience</h3>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed">{experience.description}</p>
                </div>

                <div className="flex items-center gap-4">
                    <img src={experience.host.avatarUrl} alt={experience.host.name} className="w-16 h-16 rounded-full" />
                    <div>
                        <h4 className="font-semibold text-slate-800">Hosted by {experience.host.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{experience.host.bio}</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-slate-800">Reviews</h3>
                    <div className="mt-2 space-y-4">
                        {experience.reviews.map(review => (
                            <div key={review.id} className="border-t border-slate-200 pt-3">
                                <div className="flex items-center gap-3">
                                    <img src={review.user.avatarUrl} alt={review.user.name} className="w-9 h-9 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-sm">{review.user.name}</p>
                                        <StarRating rating={review.rating} className="h-4 w-4" />
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 italic mt-2">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Booking Sidebar */}
            <div className="sticky top-4 self-start">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-md">
                    <p className="text-2xl font-bold text-slate-800">${experience.price} <span className="text-sm font-normal text-slate-500">/ person</span></p>
                    <div className="mt-4">
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700">Date</label>
                        <input type="date" id="date" onChange={e => setSelectedDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                    </div>
                     <div className="mt-4">
                        <label htmlFor="guests" className="block text-sm font-medium text-slate-700">Guests</label>
                        <input type="number" id="guests" value={guests} onChange={e => setGuests(parseInt(e.target.value, 10))} min="1" max={experience.groupSize.max} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                    </div>
                    <button 
                        onClick={() => onBook(experience)}
                        disabled={!selectedDate}
                        className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
