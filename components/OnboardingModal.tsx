

import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: 'logo',
      title: 'Welcome to FlyWise.AI!',
      content: "Your personal AI travel assistant. Let's take a quick tour to see how you can plan your next trip smarter, not harder.",
      imgSrc: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      icon: 'chat',
      title: 'Converse with our AI Assistant',
      content: "Simply tell our AI what you're looking for in plain English. For example, 'Find me flights to Tokyo and a hotel for 2 adults next month.' Our AI will handle the rest!",
      imgSrc: "https://images.unsplash.com/photo-1517423568342-3b34b3e8e29e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      icon: 'planner',
      title: 'Craft Custom Itineraries',
      content: "Need a full travel plan? Head to the 'Planner' tab. Tell our AI your destination, duration, and interests, and get a detailed day-by-day itinerary in seconds.",
      imgSrc: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      icon: 'bookmark',
      title: 'Save and Compare Your Trips',
      content: "Found something you like? Save your search results or itineraries to 'My Trips'. You can then select multiple saved trips to compare them side-by-side.",
      imgSrc: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-labelledby="onboarding-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-fade-in-up">
        <div className="relative h-56">
            <img src={currentStep.imgSrc} alt={currentStep.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        <div className="p-6 text-center flex-1 flex flex-col justify-between">
          <div>
            <div className="mx-auto bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center -mt-14 mb-4 border-4 border-white">
                <Icon name={currentStep.icon} className="h-9 w-9 text-blue-600" />
            </div>
            <h2 id="onboarding-title" className="text-2xl font-bold text-slate-800">
              {currentStep.title}
            </h2>
            <p className="mt-2 text-slate-600">
              {currentStep.content}
            </p>
          </div>

          <div className="mt-6">
            <div className="flex justify-center space-x-2 mb-4">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setStep(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${step === index ? 'bg-blue-600 w-6' : 'bg-slate-300 w-2'}`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {step === steps.length - 1 ? 'Get Started!' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;