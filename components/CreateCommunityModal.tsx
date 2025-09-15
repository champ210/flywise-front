import React, { useState, useCallback } from 'react';
import { Community } from '@/types';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CreateCommunityModalProps {
  onClose: () => void;
  onCreateCommunity: (community: Community) => void;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ onClose, onCreateCommunity }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'destination' | 'interest'>('destination');
    const [type, setType] = useState<'public' | 'private'>('public');
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
        if (!name || !description || !coverImage) return;

        setIsSubmitting(true);

        const coverImageUrl = await fileToDataUrl(coverImage);

        const newCommunity: Community = {
            id: `community${Date.now()}`,
            name,
            description,
            coverImageUrl,
            memberCount: 1, // Starts with the creator
            type,
            category,
            posts: [],
        };

        // Simulate network delay
        setTimeout(() => {
            onCreateCommunity(newCommunity);
            setIsSubmitting(false);
            onClose();
        }, 1000);

    }, [name, description, type, category, coverImage, onCreateCommunity, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Create a New Community</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="community-name" className="block text-sm font-medium text-slate-700">Community Name</label>
                        <input type="text" id="community-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Solo Travelers in Southeast Asia" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="community-description" className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea id="community-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this community about?" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Category</label>
                           <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md mt-1">
                                <button type="button" onClick={() => setCategory('destination')} className={`flex-1 text-center px-3 py-1 text-sm font-medium rounded ${category === 'destination' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>Destination</button>
                                <button type="button" onClick={() => setCategory('interest')} className={`flex-1 text-center px-3 py-1 text-sm font-medium rounded ${category === 'interest' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>Interest</button>
                           </div>
                        </div>
                         <div>
                           <label className="block text-sm font-medium text-slate-700">Type</label>
                           <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md mt-1">
                                <button type="button" onClick={() => setType('public')} className={`flex-1 text-center px-3 py-1 text-sm font-medium rounded ${type === 'public' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>Public</button>
                                <button type="button" onClick={() => setType('private')} className={`flex-1 text-center px-3 py-1 text-sm font-medium rounded ${type === 'private' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>Private</button>
                           </div>
                        </div>
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
                            <label htmlFor="cover-upload-community" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50">
                                <span>{coverImage ? 'Change photo' : 'Upload photo'}</span>
                                <input id="cover-upload-community" name="cover-upload-community" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!coverImage}/>
                            </label>
                        </div>
                    </div>
                </form>
                <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-200 mr-2">Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={isSubmitting || !name || !description || !coverImage} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center">
                        {isSubmitting && <LoadingSpinner />}
                        <span className={isSubmitting ? 'ml-2' : ''}>Create Community</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreateCommunityModal;