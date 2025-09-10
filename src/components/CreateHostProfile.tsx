
import React, { useState } from 'react';
import { Icon } from './Icon';

interface CreateHostProfileProps {
  onCancel: () => void;
}

const STEPS = [
  { id: 1, name: 'The Basics' },
  { id: 2, name: 'Hosting Details' },
  { id: 3, name: 'Photos' },
  { id: 4, name: 'Review' },
];

const CreateHostProfile: React.FC<CreateHostProfileProps> = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    languages: '',
    interests: '',
    hostingPolicy: 'Free',
    maxGuests: 1,
    houseRules: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        setImages(prev => [...prev, ...filesArray]);

        setImagePreviews(prev => [...prev, ...previewsArray]);
        const previewsArray = filesArray.map(file => URL.createObjectURL(file as Blob));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = () => {
      // In a real app, this would submit the data to a backend.
      console.log('Submitting host profile:', { formData, images });
      alert('Profile created successfully! (Simulation)');
      onCancel(); // Return to the dashboard
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">Tell us about yourself</h3>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio / About Me</label>
              <textarea name="bio" id="bio" rows={4} value={formData.bio} onChange={handleInputChange} placeholder="Share a bit about your hobbies, work, and personality." className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
            </div>
             <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
              <input type="text" name="location" id="location" value={formData.location} onChange={handleInputChange} placeholder="City, Country" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label htmlFor="languages" className="block text-sm font-medium text-slate-700">Languages Spoken</label>
                <input type="text" name="languages" id="languages" value={formData.languages} onChange={handleInputChange} placeholder="English, Spanish..." className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
               <div>
                <label htmlFor="interests" className="block text-sm font-medium text-slate-700">Interests</label>
                <input type="text" name="interests" id="interests" value={formData.interests} onChange={handleInputChange} placeholder="Hiking, cooking..." className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">Your Hosting Details</h3>
             <div>
              <label className="block text-sm font-medium text-slate-700">Hosting Policy</label>
              <div className="mt-2 flex gap-4">
                  <label className="flex items-center"><input type="radio" name="hostingPolicy" value="Free" checked={formData.hostingPolicy === 'Free'} onChange={handleInputChange} className="mr-2"/> Free</label>
                  <label className="flex items-center"><input type="radio" name="hostingPolicy" value="Small Fee" checked={formData.hostingPolicy === 'Small Fee'} onChange={handleInputChange} className="mr-2"/> Small Fee</label>
              </div>
            </div>
            <div>
              <label htmlFor="maxGuests" className="block text-sm font-medium text-slate-700">Maximum Guests</label>
              <input type="number" name="maxGuests" id="maxGuests" min="1" value={formData.maxGuests} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="houseRules" className="block text-sm font-medium text-slate-700">House Rules</label>
              <textarea name="houseRules" id="houseRules" rows={4} value={formData.houseRules} onChange={handleInputChange} placeholder="e.g., No smoking, quiet hours after 10 PM..." className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Add Photos of Your Space</h3>
            <p className="text-sm text-slate-500 mb-4">Showcase your home! Upload at least 3 photos.</p>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <Icon name="image" className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload photos</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>
            </div>
            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                            <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                                <Icon name="x-mark" className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Review Your Profile</h3>
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                <h4 className="font-semibold">The Basics</h4>
                <p><span className="font-medium">Bio:</span> {formData.bio || 'Not provided'}</p>
                <p><span className="font-medium">Location:</span> {formData.location || 'Not provided'}</p>
                <p><span className="font-medium">Languages:</span> {formData.languages || 'Not provided'}</p>
                <p><span className="font-medium">Interests:</span> {formData.interests || 'Not provided'}</p>
                <hr/>
                <h4 className="font-semibold">Hosting Details</h4>
                <p><span className="font-medium">Policy:</span> {formData.hostingPolicy}</p>
                <p><span className="font-medium">Max Guests:</span> {formData.maxGuests}</p>
                <p><span className="font-medium">House Rules:</span> {formData.houseRules || 'Not provided'}</p>
                <hr/>
                 <h4 className="font-semibold">Photos</h4>
                 <div className="grid grid-cols-3 gap-2">
                     {imagePreviews.map((preview, index) => (
                        <img key={index} src={preview} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-md" />
                    ))}
                 </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in-up">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        {/* Progress Bar */}
        <div className="mb-8">
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
             <ol className="mt-2 grid grid-cols-4 text-sm font-medium text-slate-500">
                {STEPS.map(step => (
                     <li key={step.id} className={`text-center ${currentStep >= step.id ? 'text-blue-600 font-semibold' : ''}`}>
                        <span>{step.name}</span>
                    </li>
                ))}
            </ol>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
             {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between items-center">
            <div>
                 <button onClick={onCancel} className="text-sm font-medium text-slate-600 hover:text-blue-600">
                    Back to Dashboard
                 </button>
            </div>
            <div className="flex items-center gap-4">
                {currentStep > 1 && (
                     <button onClick={handleBack} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">
                        Back
                    </button>
                )}
                {currentStep < STEPS.length ? (
                    <button onClick={handleNext} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Next Step
                    </button>
                ) : (
                    <button onClick={handleSubmit} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        Submit Profile
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHostProfile;
