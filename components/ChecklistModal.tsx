import React, { useState, useEffect } from 'react';
import { SavedTrip, Checklist, ChecklistItem } from '../types';
import { Icon } from './Icon';

interface ChecklistModalProps {
  trip: SavedTrip;
  checklist: Checklist;
  onClose: () => void;
}

const ChecklistSection: React.FC<{
  title: string;
  icon: string;
  items: ChecklistItem[];
  onToggle: (index: number) => void;
  children?: React.ReactNode;
}> = ({ title, icon, items, onToggle, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b border-slate-200 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <div className="flex items-center">
                    <Icon name={icon} className="h-6 w-6 mr-3 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                </div>
                <Icon name="chevron-down" className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    <ul className="space-y-2">
                        {items.map((item, index) => (
                            <li key={index} className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={() => onToggle(index)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={`ml-3 text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {item.item}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    {children}
                </div>
            )}
        </div>
    );
};


const ChecklistModal: React.FC<ChecklistModalProps> = ({ trip, checklist, onClose }) => {
  const [currentChecklist, setCurrentChecklist] = useState<Checklist>(checklist);

  useEffect(() => {
    // Add class to body to prevent scrolling when modal is open
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);


  const handleToggle = (section: keyof Checklist, itemIndex: number) => {
    setCurrentChecklist(prev => {
      const newChecklist = { ...prev };

      // This is a type guard to ensure the section exists and is an array.
      const isChecklistItemArray = (arr: any): arr is ChecklistItem[] => {
        return Array.isArray(arr) && (arr.length === 0 || typeof arr[0].item === 'string');
      };

      if (section === 'documents') {
        const newItems = [...prev.documents.items];
        newItems[itemIndex] = { ...newItems[itemIndex], checked: !newItems[itemIndex].checked };
        newChecklist.documents = { ...prev.documents, items: newItems };
      } else if (isChecklistItemArray(newChecklist[section])) {
        const newItems = [...(newChecklist[section] as ChecklistItem[])];
        newItems[itemIndex] = { ...newItems[itemIndex], checked: !newItems[itemIndex].checked };
        // @ts-ignore
        newChecklist[section] = newItems;
      }
      
      return newChecklist;
    });
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        aria-labelledby="checklist-title"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
    >
      <div 
        className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-slate-50 rounded-t-xl">
          <div className="flex items-center">
             <Icon name="check-circle" className="h-7 w-7 mr-3 text-green-500" />
            <h2 id="checklist-title" className="text-xl font-bold text-slate-800">
              Travel Checklist for {trip.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            aria-label="Close checklist"
          >
            <Icon name="x-mark" className="h-6 w-6" />
          </button>
        </header>
        
        <main className="overflow-y-auto">
            <ChecklistSection 
                title="Packing List"
                icon="suitcase"
                items={currentChecklist.packingList}
                onToggle={(index) => handleToggle('packingList', index)}
            />
            <ChecklistSection 
                title="Essential Documents"
                icon="document"
                items={currentChecklist.documents.items}
                onToggle={(index) => handleToggle('documents', index)}
            >
                {currentChecklist.documents.sources && currentChecklist.documents.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sources</h4>
                        <ul className="mt-2 space-y-1">
                            {currentChecklist.documents.sources.map((source, i) => (
                                <li key={i}>
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </ChecklistSection>
             <ChecklistSection 
                title="Local Essentials"
                icon="lightbulb"
                items={currentChecklist.localEssentials}
                onToggle={(index) => handleToggle('localEssentials', index)}
            />
        </main>
      </div>
    </div>
  );
};

export default ChecklistModal;