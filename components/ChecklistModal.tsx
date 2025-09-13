import React, { useState } from 'react';
import { SavedTrip, Checklist, ChecklistItem } from '../types';
import { Icon } from './Icon';

interface ChecklistModalProps {
  trip: SavedTrip;
  checklist: Checklist;
  onClose: () => void;
}

const CheckboxIcon: React.FC<{ checked: boolean }> = ({ checked }) => {
    if (checked) {
        return (
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        );
    }
    return <div className="w-5 h-5 border-2 border-slate-400 rounded flex-shrink-0 bg-white"></div>;
};

const ChecklistSection: React.FC<{
  title: string;
  icon: string;
  items: ChecklistItem[];
  onToggle: (index: number) => void;
  children?: React.ReactNode;
}> = ({ title, icon, items, onToggle, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b border-slate-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4"
            >
                <div className="flex items-center">
                    <Icon name={icon} className="w-6 h-6 mr-3 text-blue-600" />
                    <span className="text-lg font-semibold text-slate-800">{title}</span>
                </div>
                <Icon name="chevron-down" className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    {items.map((item, index) => (
                        <div key={index} onClick={() => onToggle(index)} className="flex items-center py-2 px-1 hover:bg-slate-50 cursor-pointer rounded-md" role="button" tabIndex={0}>
                           <CheckboxIcon checked={item.checked} />
                            <span className={`ml-4 text-sm flex-grow ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.item}</span>
                        </div>
                    ))}
                    {children}
                </div>
            )}
        </div>
    );
};

const ChecklistModal: React.FC<ChecklistModalProps> = ({ trip, checklist, onClose }) => {
  const [localChecklist, setLocalChecklist] = useState(checklist);

  const handleToggle = (section: keyof Checklist, index: number) => {
    setLocalChecklist(prev => {
      const sectionItems = prev[section] as ChecklistItem[];
      const newItems = sectionItems.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      );
      if (section === 'documents') {
        return { ...prev, documents: { ...prev.documents, items: newItems } };
      }
      return { ...prev, [section]: newItems };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="flex justify-between items-center p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <Icon name="checklist" className="h-7 w-7 text-blue-600" />
                    <h2 className="text-xl font-bold text-slate-800">Travel Checklist for {trip.name}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
                    <Icon name="x-mark" className="h-6 w-6" />
                </button>
            </header>
            
            <main className="flex-grow overflow-y-auto bg-slate-50">
                <ChecklistSection title="Packing List" icon="briefcase" items={localChecklist.packingList} onToggle={(index) => handleToggle('packingList', index)} />
                <ChecklistSection title="Essential Documents" icon="document" items={localChecklist.documents.items} onToggle={(index) => handleToggle('documents', index)}>
                   {localChecklist.documents.sources && localChecklist.documents.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sources for visa/entry requirements</h5>
                            <ul className="mt-1 space-y-1">
                                {localChecklist.documents.sources.slice(0, 3).map((source, i) => (
                                    <li key={i}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </ChecklistSection>
                <ChecklistSection title="Local Essentials" icon="map" items={localChecklist.localEssentials} onToggle={(index) => handleToggle('localEssentials', index)} />
            </main>
        </div>
    </div>
  );
};

export default ChecklistModal;
