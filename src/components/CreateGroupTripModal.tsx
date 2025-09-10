
import React, { useState, useCallback } from 'react';
import { GroupTrip } from '../../types';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface CreateGroupTripModalProps {
  onClose: () => void;
  onCreateTrip: (trip: GroupTrip) => void;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};

// Mock current user for new trip
const mockCurrentUser = { id: 'u1', name: 'You', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', role: 'admin' as const };

const CreateGroupTripModal: React.FC<CreateGroupTripModalProps> = ({ onClose, onCreateTrip }) => {
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverImage(file);
            setImagePreview(URL.createObjectURL(file as Blob));
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !destination || !startDate || !endDate || !coverImage) return;

        setIsSubmitting(true);

        const coverImageUrl = await fileToDataUrl(coverImage);

        const newTrip: GroupTrip = {
            id: `trip${Date.now()}`,
            name,
            destination,
            coverImageUrl,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            description,
            members: [mockCurrentUser], // Start with the creator
            itinerary: [],
            tasks: [],
            polls: [],
            expenses: [],
        };

        // Simulate network delay
        setTimeout(() => {
            onCreateTrip(newTrip);
            setIsSubmitting(false);
            onClose();
        }, 1000);

    }, [name, destination, startDate, endDate, description, coverImage, onCreateTrip, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Start a New Group Trip</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="trip-name" className="block text-sm font-medium text-slate-700">Trip Name</label>
                        <input type="text" id="trip-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Summer in the Alps" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                    </div>
                     <div>
                        <label htmlFor="trip-destination" className="block text-sm font-medium text-slate-700">Destination</label>
                        <input type="text" id="trip-destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Interlaken, Switzerland" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-slate-700">Start Date</label>
                            <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-slate-700">End Date</label>
                            <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Trip Info / Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Share some details about the trip..." className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Cover Photo</label>
                        <div className="mt-1 flex items-center gap-4">
                             {imagePreview ? (
                                <img src={imagePreview} alt="Cover preview" className="w-48 h-24 object-cover rounded-md" />
                            ) : (
                                <div className="w-48 h-24 bg-slate-100 rounded-md flex items-center justify-center">
                                    <Icon name="image" className="h-10 w-10 text-slate-400" />
                                </div>
                            )}
                            <label htmlFor="cover-upload" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50">
                                <span>{coverImage ? 'Change photo' : 'Upload photo'}</span>
                                <input id="cover-upload" name="cover-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!coverImage}/>
                            </label>
                        </div>
                    </div>
                </form>
                <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-200 mr-2">Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={isSubmitting || !name || !destination || !startDate || !endDate || !coverImage} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center">
                        {isSubmitting && <LoadingSpinner />}
                        <span className={isSubmitting ? 'ml-2' : ''}>Create Trip</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreateGroupTripModal;
