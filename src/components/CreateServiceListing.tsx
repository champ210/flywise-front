
import React, { useState } from 'react';
import { Icon } from './Icon';

interface CreateServiceListingProps {
  serviceType: 'food' | 'ride';
  onCancel: () => void;
}

const STEPS = [
  { id: 1, name: 'Basics' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Photos' },
  { id: 4, name: 'Review' },
];

const CreateServiceListing: React.FC<CreateServiceListingProps> = ({ serviceType, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    cuisine: '', // Food only
  });
  const [menuItems, setMenuItems] = useState([{ name: '', price: '', description: '' }]); // Food only
  const [vehicleTypes, setVehicleTypes] = useState([{ type: '', capacity: '', pricePerKm: '' }]); // Ride only
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDynamicChange = (index: number, e: React.ChangeEvent<HTMLInputElement>, type: 'menu' | 'vehicle') => {
    const { name, value } = e.target;
    if (type === 'menu') {
        const newItems = [...menuItems];
        newItems[index] = { ...newItems[index], [name]: value };
        setMenuItems(newItems);
    } else {
        const newItems = [...vehicleTypes];
        newItems[index] = { ...newItems[index], [name]: value };
        setVehicleTypes(newItems);
    }
  };

  const addDynamicItem = (type: 'menu' | 'vehicle') => {
    if (type === 'menu') setMenuItems([...menuItems, { name: '', price: '', description: '' }]);
    else setVehicleTypes([...vehicleTypes, { type: '', capacity: '', pricePerKm: '' }]);
  };

  const removeDynamicItem = (index: number, type: 'menu' | 'vehicle') => {
    if (type === 'menu' && menuItems.length > 1) setMenuItems(menuItems.filter((_, i) => i !== index));
    if (type === 'vehicle' && vehicleTypes.length > 1) setVehicleTypes(vehicleTypes.filter((_, i) => i !== index));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        setImages(prev => [...prev, ...filesArray]);
        const previewsArray = filesArray.map(file => URL.createObjectURL(file as Blob));
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
      console.log('Submitting listing:', { serviceType, formData, menuItems, vehicleTypes, images });
      alert('Service listed successfully! (Simulation)');
      onCancel();
  };

  const renderFoodSteps = () => {
    switch(currentStep) {
        case 1: // Basics
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-800">Restaurant Basics</h3>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Restaurant Name" className="w-full rounded-md border-slate-300 shadow-sm" />
                    <input type="text" name="cuisine" value={formData.cuisine} onChange={handleInputChange} placeholder="Cuisine Types (e.g., Italian, Pizza, Pasta)" className="w-full rounded-md border-slate-300 shadow-sm" />
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Address" className="w-full rounded-md border-slate-300 shadow-sm" />
                </div>
            );
        case 2: // Menu
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-800">Build Your Menu</h3>
                    {menuItems.map((item, index) => (
                        <div key={index} className="p-3 bg-slate-50 border rounded-md grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-2 items-end">
                            <input type="text" name="name" value={item.name} onChange={(e) => handleDynamicChange(index, e, 'menu')} placeholder="Item Name" className="w-full rounded-md border-slate-300 shadow-sm text-sm" />
                             <input type="text" name="price" value={item.price} onChange={(e) => handleDynamicChange(index, e, 'menu')} placeholder="Price ($)" className="w-full rounded-md border-slate-300 shadow-sm text-sm" />
                             <input type="text" name="description" value={item.description} onChange={(e) => handleDynamicChange(index, e, 'menu')} placeholder="Description" className="w-full sm:col-span-3 rounded-md border-slate-300 shadow-sm text-sm" />
                            {menuItems.length > 1 && <button type="button" onClick={() => removeDynamicItem(index, 'menu')} className="sm:col-start-4 p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"><Icon name="x-mark" className="h-4 w-4" /></button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => addDynamicItem('menu')} className="text-sm font-semibold text-blue-600 hover:underline">+ Add Menu Item</button>
                </div>
            );
        case 4: // Review
            return (
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                    <p><span className="font-medium">Name:</span> {formData.name}</p>
                    <p><span className="font-medium">Cuisine:</span> {formData.cuisine}</p>
                    <p><span className="font-medium">Location:</span> {formData.location}</p>
                    <hr/>
                    <h4 className="font-medium">Menu Items:</h4>
                    <ul className="list-disc pl-5 text-sm">
                        {menuItems.map((item, i) => <li key={i}>{item.name} - {item.price}</li>)}
                    </ul>
                </div>
            )
    }
  };
  
  const renderRideSteps = () => {
    switch(currentStep) {
        case 1: // Basics
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-800">Ride Service Basics</h3>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Service Name (e.g., City Cabs)" className="w-full rounded-md border-slate-300 shadow-sm" />
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Briefly describe your service" className="w-full rounded-md border-slate-300 shadow-sm" />
                </div>
            );
        case 2: // Vehicles
             return (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-800">Add Your Vehicle Types</h3>
                    {vehicleTypes.map((vehicle, index) => (
                        <div key={index} className="p-3 bg-slate-50 border rounded-md grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                            <input type="text" name="type" value={vehicle.type} onChange={(e) => handleDynamicChange(index, e, 'vehicle')} placeholder="Vehicle Type (e.g., Sedan)" className="w-full rounded-md border-slate-300 shadow-sm text-sm" />
                            <input type="number" name="capacity" value={vehicle.capacity} onChange={(e) => handleDynamicChange(index, e, 'vehicle')} placeholder="Capacity" className="w-full rounded-md border-slate-300 shadow-sm text-sm" />
                             <input type="text" name="pricePerKm" value={vehicle.pricePerKm} onChange={(e) => handleDynamicChange(index, e, 'vehicle')} placeholder="Price/km ($)" className="w-full rounded-md border-slate-300 shadow-sm text-sm" />
                            {vehicleTypes.length > 1 && <button type="button" onClick={() => removeDynamicItem(index, 'vehicle')} className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"><Icon name="x-mark" className="h-4 w-4" /></button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => addDynamicItem('vehicle')} className="text-sm font-semibold text-blue-600 hover:underline">+ Add Vehicle Type</button>
                </div>
            );
        case 4: // Review
             return (
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                    <p><span className="font-medium">Service Name:</span> {formData.name}</p>
                    <p><span className="font-medium">Description:</span> {formData.description}</p>
                    <hr/>
                    <h4 className="font-medium">Vehicle Types:</h4>
                    <ul className="list-disc pl-5 text-sm">
                        {vehicleTypes.map((v, i) => <li key={i}>{v.type} ({v.capacity} seats) - ${v.pricePerKm}/km</li>)}
                    </ul>
                </div>
            )
    }
  };

  const renderSharedSteps = () => {
    switch (currentStep) {
      case 3: // Photos
        return (
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Showcase Your Service</h3>
            <p className="text-sm text-slate-500 mb-4">Upload relevant photos (e.g., your restaurant interior, food dishes, or vehicles).</p>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center"><Icon name="image" className="mx-auto h-12 w-12 text-slate-400" /><div className="flex text-sm text-slate-600"><label htmlFor="file-upload-service" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"><span>Upload photos</span><input id="file-upload-service" name="file-upload-service" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} /></label></div></div>
            </div>
            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (<div key={index} className="relative group"><img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" /><button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><Icon name="x-mark" className="h-4 w-4" /></button></div>))}
                </div>
            )}
          </div>
        );
      case 4: // Review
          return (
              <div className="bg-slate-50 p-4 rounded-lg border">
                {serviceType === 'food' ? renderFoodSteps() : renderRideSteps()}
                <hr className="my-4"/>
                <h4 className="font-semibold">Photos</h4>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {imagePreviews.map((preview, index) => (<img key={index} src={preview} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-md" />))}
                </div>
              </div>
          );
      default: return serviceType === 'food' ? renderFoodSteps() : renderRideSteps();
    }
  }

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
        <div className="min-h-[350px]">{renderSharedSteps()}</div>
        <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between items-center">
            <button onClick={onCancel} className="text-sm font-medium text-slate-600 hover:text-blue-600">Back to Dashboard</button>
            <div className="flex items-center gap-4">
                {currentStep > 1 && <button onClick={handleBack} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">Back</button>}
                {currentStep < STEPS.length ? (
                    <button onClick={handleNext} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Next</button>
                ) : (
                    <button onClick={handleSubmit} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Submit Listing</button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceListing;
