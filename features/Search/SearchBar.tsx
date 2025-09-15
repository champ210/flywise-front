import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useUIStore } from '@/stores/useUIStore';

enum SearchType {
  Flights = 'Flights',
  Stays = 'Stays',
  Cars = 'Cars',
}

const SearchBar: React.FC = () => {
  const [searchType, setSearchType] = useState<SearchType>(SearchType.Flights);
  const { setResults, setIsLoading, setError } = useUIStore();

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("Please use the Chat Assistant to perform searches. The standard search bar is for demonstration purposes.");
    setResults([]);
    setIsLoading(false);
  };
  
  const TabButton: React.FC<{
    type: SearchType;
    icon: string;
    children: React.ReactNode;
  }> = ({ type, icon, children }) => (
    <button
      onClick={() => setSearchType(type)}
      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
        searchType === type ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <Icon name={icon} className={`h-5 w-5 mr-2 ${searchType === type ? 'text-slate-800' : 'text-slate-600'}`} />
      <span className={`text-sm font-medium ${searchType === type ? 'text-slate-800' : 'text-slate-600'}`}>{children}</span>
    </button>
  );


  const renderForm = () => (
    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-3">
            <p className="text-sm text-slate-600 text-center md:text-left">
                The traditional search form is for visual demonstration. To find flights, stays, or cars, please use our powerful AI Chat Assistant.
            </p>
        </div>
        <button
            onClick={handleSearch}
            className="w-full md:w-auto justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
           <Icon name="search" className="mr-2 h-5 w-5" />
           Search
        </button>
    </div>
  );

  return (
    <div className="bg-white/50 border border-slate-200 rounded-lg shadow-lg backdrop-blur-sm">
      <div className="p-2 bg-slate-100 rounded-t-lg">
        <div className="flex space-x-1">
          <TabButton type={SearchType.Flights} icon="flight">Flights</TabButton>
          <TabButton type={SearchType.Stays} icon="hotel">Stays</TabButton>
          <TabButton type={SearchType.Cars} icon="car">Cars</TabButton>
        </div>
      </div>
      <div>
        {renderForm()}
      </div>
    </div>
  );
};

export default React.memo(SearchBar);