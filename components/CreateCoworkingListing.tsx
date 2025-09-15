import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';

interface CreateCoworkingListingProps {
  onCancel: () => void;
}

const STEPS = [
  { id: 1, name: 'Basics' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Photos' },
  { id: 4, name: 'Review' },
];

const AMENITIES_LIST = [
    'High-speed WiFi', 'Free Coffee', 'Meeting Rooms', 
    '24/7 Access', 'Printing Services', 'Quiet Zone', 'Phone Booths', 'Kitchenette'
];

const CreateCoworkingListing: React.FC<CreateCoworkingListingProps> = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    pricePerHour: '',
    pricePerDay: '',
    pricePerMonth: '',
    hotDesks: '',
    privateOffices: '',
    amenities: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => {
        const newAmenities = prev.amenities.includes(amenity)
            ? prev.amenities.filter(a => a !== amenity)
            : [...prev.amenities, amenity];
        return { ...prev, amenities: newAmenities };
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        setImages(prev => [...prev, ...filesArray]);
        const previewsArray = filesArray.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previewsArray]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => currentStep < STEPS.length && setCurrentStep(currentStep + 1);
  const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  
  const handleSubmit = () => {
      console.log('Submitting listing:', { formData, images });
      alert('Listing created successfully! (Simulation)');
      onCancel();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">Let's start with the basics</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Workspace Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
            </div>
             <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location (Full Address)</label>
              <input type="text" name="location" id="location" value={formData.location} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" id="description" rows={4} value={formData.description} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-800">Pricing & Details</h3>
            <div>
                <label className="block text-sm font-medium text-slate-700">Pricing (USD)</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                    <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleInputChange} placeholder="Per Hour" className="rounded-md border-slate-300 shadow-sm" />
                    <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleInputChange} placeholder="Per Day" className="rounded-md border-slate-300 shadow-sm" />
                    <input type="number" name="pricePerMonth" value={formData.pricePerMonth} onChange={handleInputChange} placeholder="Per Month" className="rounded-md border-slate-300 shadow-sm" />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Availability</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                    <input type="number" name="hotDesks" value={formData.hotDesks} onChange={handleInputChange} placeholder="# Hot Desks" className="rounded-md border-slate-300 shadow-sm" />
                    <input type="number" name="privateOffices" value={formData.privateOffices} onChange={handleInputChange} placeholder="# Private Offices" className="rounded-md border-slate-300 shadow-sm" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Amenities</label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES_LIST.map(amenity => (
                         <label key={amenity} className="flex items-center text-sm p-2 border border-slate-200 rounded-md bg-white cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityChange(amenity)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                            <span className="ml-2">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Showcase Your Space</h3>
            <p className="text-sm text-slate-500 mb-4">Upload high-quality photos of your workspace.</p>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <Icon name="image" className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                        <label htmlFor="file-upload-coworking" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload photos</span>
                            <input id="file-upload-coworking" name="file-upload-coworking" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
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
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Review Your Listing</h3>
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                <p><span className="font-medium">Name:</span> {formData.name}</p>
                <p><span className="font-medium">Location:</span> {formData.location}</p>
                <p><span className="font-medium">Description:</span> {formData.description}</p>
                <hr/>
                <p><span className="font-medium">Pricing:</span> ${formData.pricePerHour}/hr, ${formData.pricePerDay}/day, ${formData.pricePerMonth}/month</p>
                <p><span className="font-medium">Availability:</span> {formData.hotDesks} Hot Desks, {formData.privateOffices} Private Offices</p>
                <p><span className="font-medium">Amenities:</span> {formData.amenities.join(', ')}</p>
                <hr/>
                 <div className="grid grid-cols-3 gap-2">
                     {imagePreviews.map((preview, index) => (
                        <img key={index} src={preview} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-md" />
                    ))}
                 </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in-up">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="mb-8">
            <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
            <ol className="mt-2 grid grid-cols-4 text-sm font-medium text-slate-500">
                {STEPS.map(step => ( <li key={step.id} className={`text-center ${currentStep >= step.id ? 'text-blue-600 font-semibold' : ''}`}><span>{step.name}</span></li>))}
            </ol>
        </div>
        <div className="min-h-[350px]">{renderStepContent()}</div>
        <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between items-center">
            <button onClick={onCancel} className="text-sm font-medium text-slate-600 hover:text-blue-600">Back to Dashboard</button>
            <div className="flex items-center gap-4">
                {currentStep > 1 && <button onClick={handleBack} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">Back</button>}
                {currentStep < STEPS.length ? (
                    <button onClick={handleNext} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Next Step</button>
                ) : (
                    <button onClick={handleSubmit} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Submit Listing</button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoworkingListing;