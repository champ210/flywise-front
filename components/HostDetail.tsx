
import React, { useState, useCallback } from 'react';
import { LocalProfile, UserProfile, HangoutSuggestion } from '@/types';
import { Icon } from '@/components/common/Icon';
import { getHangoutSuggestions } from '@/services/geminiService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface HostDetailProps {
  local: LocalProfile;
  userProfile: UserProfile;
  onBack: () => void;
  onOpenVipModal: () => void;
  onHangoutRequest: (details: {local: LocalProfile, suggestion: HangoutSuggestion}) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Icon key={i} name="star" className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-slate-300'}`} />
        ))}
    </div>
);

const HostDetail: React.FC<HostDetailProps> = ({ local, userProfile, onBack, onOpenVipModal, onHangoutRequest }) => {
    
    const [hangoutSuggestions, setHangoutSuggestions] = useState<HangoutSuggestion[]>([]);
    const [isHangoutLoading, setIsHangoutLoading] = useState(false);
    const [hangoutError, setHangoutError] = useState<string | null>(null);

    const averageRating = local.reviews && local.reviews.length > 0
        ? local.reviews.reduce((acc, review) => acc + review.rating, 0) / local.reviews.length
        : 0;

    const handleFetchHangouts = useCallback(async () => {
        setIsHangoutLoading(true);
        setHangoutError(null);
        setHangoutSuggestions([]);
        try {
            const results = await getHangoutSuggestions(userProfile, local);
            setHangoutSuggestions(results);
        } catch(err) {
            setHangoutError(err instanceof Error ? err.message : "Failed to get suggestions.");
        } finally {
            setIsHangoutLoading(false);
        }
    }, [userProfile, local]);
    
    const renderStayDetails = () => (
         <>
            <div>
                <h4 className="font-semibold text-slate-800">My Home</h4>
                <div className="mt-2 grid grid-cols-3 gap-2">
                    {local.housePhotos?.map((photo, i) => <img key={i} src={photo} alt={`Host home photo ${i+1}`} className="w-full h-24 object-cover rounded-md" />)}
                </div>
            </div>
            {local.offeredExperiences && local.offeredExperiences.length > 0 && (
                <div>
                    <h4 className="font-semibold text-slate-800">Local Experiences Offered</h4>
                    <div className="mt-2 space-y-3">
                        {local.offeredExperiences.map(exp => (
                            <div key={exp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                                <div className="flex justify-between items-start">
                                    <h5 className="font-semibold text-sm text-slate-800">{exp.title}</h5>
                                    <p className="text-sm font-bold text-blue-600">{exp.price > 0 ? `$${exp.price}` : 'Free'}</p>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    const renderHangoutDetails = () => (
        <div>
            <h4 className="font-semibold text-slate-800">Suggested Hangouts</h4>
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
                {!isHangoutLoading && hangoutSuggestions.length === 0 && !hangoutError && (
                    <div className="text-center">
                         <p className="text-sm text-slate-600">Click to get some personalized hangout ideas with {local.name}!</p>
                         <button onClick={handleFetchHangouts} className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                             <Icon name="sparkles" className="h-5 w-5 mr-2" />
                             Get AI Suggestions
                         </button>
                    </div>
                )}
                {isHangoutLoading && <div className="flex justify-center items-center p-4"><LoadingSpinner /> <span className="ml-2 text-sm text-slate-500">Thinking of ideas...</span></div>}
                {hangoutError && <p className="text-sm text-red-600 text-center">{hangoutError}</p>}
                {hangoutSuggestions.length > 0 && (
                    <div className="space-y-3">
                        {hangoutSuggestions.map((sugg, i) => (
                            <div key={i} className="bg-white p-3 rounded-md border border-slate-200">
                                <div className="flex justify-between items-start">
                                    <h5 className="font-semibold text-sm text-slate-800">{sugg.title}</h5>
                                    <p className="text-sm font-bold text-blue-600">{sugg.estimatedCost}</p>
                                </div>
                                <p className="text-xs text-slate-500">{sugg.location}</p>
                                <p className="text-xs text-slate-600 mt-1">{sugg.description}</p>
                                <button onClick={() => onHangoutRequest({local, suggestion: sugg})} className="mt-2 w-full text-xs font-semibold text-blue-600 hover:underline">Request Hangout</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up p-2 sm:p-4">
            <button
                onClick={onBack}
                className="mb-4 inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
            >
                <Icon name="chevron-left" className="h-5 w-5 mr-1" />
                Back to Locals
            </button>
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                <div className="h-64 relative">
                    <img src={(local.profileType === 'stay' && local.housePhotos) ? local.housePhotos[0] : local.avatarUrl} alt="Profile background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white p-2">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {local.profileType === 'stay' ? `Stay with ${local.name}`: `Hangout with ${local.name}`}
                        </h2>
                        <p className="font-semibold">{local.location}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 sm:p-6">
                    {/* Main content */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-4">
                            <img src={local.avatarUrl} alt={local.name} className="w-20 h-20 rounded-full object-cover border-4 border-white -mt-16 shadow-lg" />
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">{local.name}, {local.age}</h3>
                                {local.isVerified && <p className="text-sm font-semibold text-blue-600 flex items-center"><Icon name="shield" className="h-4 w-4 mr-1.5"/>Verified Local</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800">About Me</h4>
                            <p className="mt-2 text-sm text-slate-700 leading-relaxed">{local.bio}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Interests</h4>
                                <div className="flex flex-wrap gap-2">
                                    {local.interests.map(i => <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{i}</span>)}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Languages</h4>
                                <div className="flex flex-wrap gap-2">
                                    {local.languages.map(l => <span key={l} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{l}</span>)}
                                </div>
                            </div>
                        </div>
                        {local.profileType === 'stay' ? renderStayDetails() : renderHangoutDetails()}
                        <div>
                            <h4 className="font-semibold text-slate-800">Reviews ({local.reviews?.length || 0})</h4>
                             {local.reviews && local.reviews.length > 0 ? (
                                <div className="mt-2 space-y-4">
                                {local.reviews.map(review => (
                                    <div key={review.id} className="flex items-start gap-3">
                                        <img src={review.authorAvatarUrl} alt={review.authorName} className="w-9 h-9 rounded-full object-cover" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm">{review.authorName}</p>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                             ) : <p className="text-sm text-slate-500 mt-2">No reviews yet. Be the first!</p>}
                        </div>
                    </div>
                    {/* Sidebar */}
                    <div className="space-y-4">
                        {local.profileType === 'stay' && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <p className="text-2xl font-bold text-slate-800">{local.hostingPolicy === 'Free' ? 'Free Stay' : 'Small Fee'}</p>
                                <p className="text-sm text-slate-500">Up to {local.maxGuests} guest(s)</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <StarRating rating={averageRating} />
                                    <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
                                    <span className="text-sm text-slate-500">({local.reviews?.length || 0} reviews)</span>
                                </div>
                                <button className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Request to Stay</button>
                            </div>
                        )}
                         {local.profileType === 'hangout' && (
                             <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                                <p className="font-semibold text-slate-800">Ready to Connect?</p>
                                <p className="text-xs text-slate-500 mt-1">Generate some hangout ideas to get started!</p>
                             </div>
                         )}

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                            <Icon name="sparkles" className="h-8 w-8 text-amber-500 mx-auto" />
                            <h4 className="font-semibold text-amber-900 mt-2">Unlock Premium Features</h4>
                            <p className="text-xs text-amber-800 mt-1">Get insurance coverage and priority access to verified locals with a VIP membership.</p>
                            <button onClick={onOpenVipModal} className="mt-3 text-sm font-bold text-blue-600 hover:underline">Learn More</button>
                        </div>
                        <button className="w-full text-xs text-slate-500 hover:text-red-600 flex items-center justify-center gap-2">
                            <Icon name="error" className="h-4 w-4" /> Report User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HostDetail;
