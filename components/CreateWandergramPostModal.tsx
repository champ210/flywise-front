import React, { useState, useCallback } from 'react';
import { WandergramPost } from '@/types';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CreateWandergramPostModalProps {
  onClose: () => void;
  onCreatePost: (post: Omit<WandergramPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'user'>) => void;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};

const CreateWandergramPostModal: React.FC<CreateWandergramPostModalProps> = ({ onClose, onCreatePost }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return;

        setIsSubmitting(true);
        
        const imageUrl = await fileToDataUrl(imageFile);

        const newPostData = {
            imageUrl,
            caption,
            location,
        };

        setTimeout(() => {
            onCreatePost(newPostData);
            setIsSubmitting(false);
            onClose();
        }, 1000);

    }, [imageFile, caption, location, onCreatePost, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Create a New Post</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    {!imagePreview ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Upload Photo</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Icon name="image" className="mx-auto h-12 w-12 text-slate-400" />
                                    <div className="flex text-sm text-slate-600">
                                        <label htmlFor="post-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                            <span>Select a file</span>
                                            <input id="post-file-upload" name="post-file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required />
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <img src={imagePreview} alt="Post preview" className="w-full h-64 object-cover rounded-md" />
                             <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="mt-2 text-sm text-blue-600 hover:underline">Change photo</button>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="caption" className="block text-sm font-medium text-slate-700">Caption</label>
                        <textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="Write a caption..." className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location (optional)</label>
                        <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Kyoto, Japan" className="mt-1 block w-full rounded-md border-slate-300 bg-white shadow-sm" />
                    </div>
                </form>
                <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-200 mr-2">Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={isSubmitting || !imageFile} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center">
                        {isSubmitting && <LoadingSpinner />}
                        <span className={isSubmitting ? 'ml-2' : ''}>Share</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreateWandergramPostModal;
