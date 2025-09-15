import React from 'react';
import SearchBar from './SearchBar';
import ResultsList from './ResultsList';
import { useUIStore } from '@/stores/useUIStore';

const SearchPage: React.FC = () => {
    const { results, isLoading, error } = useUIStore();

    return (
        <>
            <SearchBar />
            <div className="mt-4">
                <ResultsList results={results} isLoading={isLoading} error={error} />
            </div>
        </>
    );
};

export default SearchPage;
