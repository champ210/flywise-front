import { getAmadeusToken } from '@/src/services/amadeusService'; // Adjust the path as needed
import { Flight } from '@/types';

export const getIataCodeForCity = async (cityName: string): Promise<string | null> => {
    const token = await getAmadeusToken();
    const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${encodeURIComponent(cityName)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.[0]?.iataCode || null;
};

export const getCityForIataCode = async (iataCode: string): Promise<string | null> => {
    const token = await getAmadeusToken();
    const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(iataCode)}&subType=CITY`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    if (!response.ok) return null;

    const data = await response.json();
    // Path: data.data[0].name
    return data.data?.[0]?.name || null;
};

export const amadeusToFlight = (offer: any): Flight => {
  console.log({ offer });
  // Get first segment of first itinerary (outbound)
  const firstItinerary = offer.itineraries[0];
  const firstSegment = firstItinerary.segments[0];

  // Get last segment of last itinerary (inbound, for round-trip)
  const lastItinerary = offer.itineraries[offer.itineraries.length - 1];
  const lastSegment = lastItinerary.segments[lastItinerary.segments.length - 1];

  const result: Flight = {
    type: 'flight',
    airline: firstSegment.carrierCode,
    flightNumber: firstSegment.number,
    departure: firstSegment.departure.iataCode,
    arrival: firstSegment.arrival.iataCode,
    departureTime: firstSegment.departure.at,
    arrivalTime: lastSegment.arrival.at,
    duration: firstItinerary.duration,
    price: Number(offer.price?.grandTotal || offer.price?.total || 0),
    stops: firstSegment.numberOfStops,
    layovers: firstItinerary.segments.slice(1).map(seg => seg.departure.iataCode),
    pricePrediction: undefined, // Fill if you have this info
    negotiationTip: undefined,  // Fill if you have this info
    affiliateLink: '',          // Fill if you have this info
    provider: offer.validatingAirlineCodes?.[0],
    rankingScore: undefined,    // Fill if you have this info
    rankingReason: undefined,   // Fill if you have this info
  };
  console.log({ result });
  return result;
}
