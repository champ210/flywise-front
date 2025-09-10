

import React, { useState, useCallback } from 'react';
import { TravelStory } from '../../types';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface CreateStoryModalProps {
  onClose: () => void;
  onCreateStory: (story: TravelStory) => void;
  onEarnPoints: (points: number, badgeId?: string) => void;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};


const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ onClose, onCreateStory, onEarnPoints }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(files);

            const previews = files.map(file => URL.createObjectURL(file as Blob));
            setImagePreviews(previews);
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;

        setIsSubmitting(true);
        
        const imageDataUrls = await Promise.all(images.map(file => fileToDataUrl(file)));

        const newStory: TravelStory = {
            id: Date.now().toString(),
            authorName: 'Valued Member', // Mock current user
            authorAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
            title,
            content,
            images: imageDataUrls,
            locationTags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            likes: 0,
            createdAt: new Date().toISOString(),
        };

        // Simulate network delay
        setTimeout(() => {
            onCreateStory(newStory);
            setIsSubmitting(false);
        }, 1000);

    }, [title, content, tags, images, onCreateStory, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Share Your Travel Story</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., An Unforgettable Trip to the Rockies" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-slate-700">Your Story</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Share the details of your adventure..." className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-slate-700">Location Tags</label>
                        <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., Canada, Hiking, Nature" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" />
                        <p className="mt-1 text-xs text-slate-500">Separate tags with a comma.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Upload Photos</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Icon name="image" className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                        <span>Upload files</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                        {imagePreviews.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <img key={index} src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                ))}
                            </div>
                        )}
                    </div>
                </form>
                <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-200 mr-2">Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={isSubmitting || !title || !content} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center">
                        {isSubmitting && <LoadingSpinner />}
                        <span className={isSubmitting ? 'ml-2' : ''}>Share Story</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreateStoryModal;