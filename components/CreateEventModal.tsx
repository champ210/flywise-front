
import React, { useState, useCallback } from 'react';
import { MeetupEvent } from '@/types';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CreateEventModalProps {
  onClose: () => void;
  onCreateEvent: (event: MeetupEvent) => void;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};

// Mock current user for new event
const mockCurrentUser = { id: 'u1', name: 'You', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', role: 'admin' as const };

const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onCreateEvent }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [locationName, setLocationName] = useState('');
    const [category, setCategory] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !date || !locationName || !category || !coverImage) return;

        setIsSubmitting(true);

        const coverImageUrl = await fileToDataUrl(coverImage);

        const newEvent: MeetupEvent = {
            id: `event${Date.now()}`,
            title,
            description,
            date: new Date(date).toISOString(),
            location: {
                name: locationName,
                lat: 0, // Mock coordinates
                lng: 0,
            },
            organizer: mockCurrentUser,
            attendees: [],
            coverImageUrl,
            category,
        };

        // Simulate network delay
        setTimeout(() => {
            onCreateEvent(newEvent);
            setIsSubmitting(false);
            onClose();
        }, 1000);

    }, [title, description, date, locationName, category, coverImage, onCreateEvent, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Create a New Meetup Event</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="event-title" className="block text-sm font-medium text-slate-700">Event Title</label>
                        <input type="text" id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Photography Walk in Kyoto" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="event-description" className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea id="event-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Tell everyone what the event is about..." className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="event-date" className="block text-sm font-medium text-slate-700">Date & Time</label>
                            <input type="datetime-local" id="event-date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="event-category" className="block text-sm font-medium text-slate-700">Category</label>
                            <input type="text" id="event-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Photography, Food Tour" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="event-location" className="block text-sm font-medium text-slate-700">Location Name</label>
                        <input type="text" id="event-location" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g., Gion Corner, Kyoto" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
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
                            <label htmlFor="cover-upload-event" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50">
                                <span>{coverImage ? 'Change photo' : 'Upload photo'}</span>
                                <input id="cover-upload-event" name="cover-upload-event" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!coverImage}/>
                            </label>
                        </div>
                    </div>
                </form>
                <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-200 mr-2">Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={isSubmitting || !title || !description || !date || !locationName || !category || !coverImage} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center">
                        {isSubmitting && <LoadingSpinner />}
                        <span className={isSubmitting ? 'ml-2' : ''}>Create Event</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreateEventModal;
