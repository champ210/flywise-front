
import React, { useCallback, useState } from 'react';

import SearchBar from '@/src/components/SearchBar';
import ResultsList from '@/src/components/ResultsList';
import { Car, Flight, Stay } from '@/types';

const SearchType: React.FC = () => {
    const [flightToBook, setFlightToBook] = useState<Flight | null>(null);
    const [stayToBook, setStayToBook] = useState<Stay | null>(null);
    const [carToBook, setCarToBook] = useState<Car | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLoading = useCallback((loadingState: boolean) => {
        setIsLoading(loadingState);
    }, []);

    const handleBookFlight = useCallback((flight: Flight) => setFlightToBook(flight), []);
    const handleBookStay = useCallback((stay: Stay) => setStayToBook(stay), []);
    const handleBookCar = useCallback((car: Car) => setCarToBook(car), []);

    return (
        <div className="p-4">
            <SearchBar onLoading={handleLoading} />
            <div className="mt-4">
                <ResultsList isLoading={isLoading} onBookFlight={handleBookFlight} onBookStay={handleBookStay} onBookCar={handleBookCar} />
            </div>
        </div>
    );
};

export default SearchType;
