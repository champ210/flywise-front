import React, { useState, useMemo } from 'react';

interface ChecklistItem {
  id: number;
  text: string;
  checked: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

const initialChecklistData: ChecklistSection[] = [
  {
    id: 'essentials',
    title: 'Essentials',
    items: [
      { id: 1, text: 'Clothes & Shoes', checked: false },
      { id: 2, text: 'Toiletries (toothbrush, toothpaste, etc.)', checked: false },
      { id: 3, text: 'Phone & Electronics Chargers', checked: false },
      { id: 4, text: 'Travel Adapter', checked: false },
      { id: 5, text: 'Power Bank', checked: false },
    ],
  },
  {
    id: 'documents',
    title: 'Documents',
    items: [
      { id: 6, text: 'Passport / ID Card', checked: false },
      { id: 7, text: 'Visa (if required)', checked: false },
      { id: 8, text: 'Flight / Train / Bus Tickets', checked: false },
      { id: 9, text: 'Hotel Booking Confirmations', checked: false },
      { id: 10, text: "Driver's License / IDP", checked: false },
      { id: 11, text: 'Digital & Physical Copies of Documents', checked: false },
    ],
  },
  {
    id: 'health',
    title: 'Health & Safety',
    items: [
      { id: 12, text: 'Personal Medications', checked: false },
      { id: 13, text: 'First-Aid Kit', checked: false },
      { id: 14, text: 'Hand Sanitizer & Masks', checked: false },
      { id: 15, text: 'Insect Repellent', checked: false },
      { id: 16, text: 'Sunscreen', checked: false },
    ],
  },
  {
    id: 'misc',
    title: 'Miscellaneous',
    items: [
      { id: 17, text: 'Cash & Credit/Debit Cards', checked: false },
      { id: 18, text: 'Reusable Water Bottle', checked: false },
      { id: 19, text: 'Snacks for the trip', checked: false },
      { id: 20, text: 'Book / Entertainment', checked: false },
    ],
  },
];

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
    // An empty square for the unchecked state
    return <div className="w-5 h-5 border-2 border-slate-400 rounded flex-shrink-0 bg-white"></div>;
};


export default function PackingChecklist() {
  const [checklist, setChecklist] = useState<ChecklistSection[]>(initialChecklistData);

  const handleToggle = (sectionId: string, itemId: number) => {
    setChecklist(prevChecklist =>
      prevChecklist.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : section
      )
    );
  };

  const { progress } = useMemo(() => {
    const totalItems = checklist.reduce((sum, section) => sum + section.items.length, 0);
    const checkedItems = checklist.reduce((sum, section) => sum + section.items.filter(item => item.checked).length, 0);
    return {
      progress: totalItems > 0 ? (checkedItems / totalItems) * 100 : 0,
    };
  }, [checklist]);

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4 animate-fade-in-up">
        {/* Progress Section */}
        <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-blue-600">Packing Progress</h3>
                <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        {/* Checklist */}
        <div className="space-y-8">
            {checklist.map(section => (
                <div key={section.id}>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{section.title}</h2>
                    <ul className="space-y-0 divide-y divide-slate-200">
                        {section.items.map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleToggle(section.id, item.id)}
                                className="flex items-center py-3 px-1 hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                                role="checkbox"
                                aria-checked={item.checked}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleToggle(section.id, item.id)}}}
                            >
                                <CheckboxIcon checked={item.checked} />
                                <span className={`ml-4 text-sm flex-grow ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
  );
}