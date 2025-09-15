import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';

interface CreateExperienceListingProps {
  onCancel: () => void;
}

const STEPS = [
  { id: 1, name: 'Basics' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Photos' },
  { id: 4, name: 'Pricing' },
];

const CreateExperienceListing: React.FC<CreateExperienceListingProps> = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => currentStep < STEPS.length && setCurrentStep(currentStep + 1);
  const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  
  const renderStepContent = () => {
    switch(currentStep) {
        case 1:
            return <div className="text-center p-8">Step 1: Basics form will go here.</div>;
        case 2:
            return <div className="text-center p-8">Step 2: Details form will go here.</div>;
        case 3:
            return <div className="text-center p-8">Step 3: Photos upload will go here.</div>;
        case 4:
            return <div className="text-center p-8">Step 4: Pricing & Review will go here.</div>;
        default:
            return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in-up">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">Create Your Experience</h2>
            <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
            <ol className="mt-2 grid grid-cols-4 text-sm font-medium text-slate-500">
                {STEPS.map(step => ( <li key={step.id} className={`text-center ${currentStep >= step.id ? 'text-blue-600 font-semibold' : ''}`}><span>{step.name}</span></li>))}
            </ol>
        </div>
        <div className="min-h-[350px]">
            {renderStepContent()}
        </div>
        <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between items-center">
            <button onClick={onCancel} className="text-sm font-medium text-slate-600 hover:text-blue-600">
                Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
                {currentStep > 1 && <button onClick={handleBack} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">Back</button>}
                {currentStep < STEPS.length ? (
                    <button onClick={handleNext} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Next</button>
                ) : (
                    <button onClick={onCancel} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Submit for Review</button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExperienceListing;
