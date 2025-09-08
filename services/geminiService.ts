





import { GoogleGenAI, Type } from "@google/genai";
// FIX: Implement missing Gemini service functions and related types to fix import errors.
import { Flight, Stay, Car, ApiParams, ItineraryPlan, Checklist, DailyPlan, MapMarker, TravelInsuranceQuote, NearbyAttraction, ChatMessage, UserProfile, SavedTrip, SearchResult, WeatherForecast, ItinerarySnippet, TravelBuddyPreferences, TravelBuddyProfile, AlternativeSuggestion, LocalVibe, GroundingSource, VibeSearchResult, DestinationSuggestion, RealTimeSuggestion, GamificationProfile, AIVoyageMission, TravelTrend, SuperServiceData, TripMemory, SocialPostSuggestion, LocalProfile, HangoutSuggestion, CoworkingSpace, Badge, BudgetOptimizationSuggestion, AIHomeSuggestion, FlightStatus } from '../types';

// The GoogleGenAI constructor will now throw an error if API_key is not set, which is the correct behavior.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A centralized utility to handle Gemini API errors and provide user-friendly messages.
 * @param error The error object caught from the API call.
 * @param defaultMessage A default error message to use as a fallback.
 * @returns An Error object with a user-friendly message.
 */
const handleGeminiError = (error: unknown, defaultMessage: string): Error => {
    console.error("Gemini API Error:", error);
    
    // The Gemini SDK can throw a non-standard error object on API failure.
    // Check for the specific structure of a rate-limit error.
    if (typeof error === 'object' && error !== null && 'error' in error) {
        const nestedError = (error as any).error;
        if (typeof nestedError === 'object' && nestedError !== null &&
            (nestedError.code === 429 || nestedError.status === 'RESOURCE_EXHAUSTED')) {
            return new Error("You've exceeded the request limit for today. Please check your API plan and billing details, then try again tomorrow.");
        }
    }

    // Fallback to checking the message of a standard Error object
    if (error instanceof Error) {
        if (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
            return new Error("You've exceeded the request limit for today. Please check your API plan and billing details, then try again tomorrow.");
        }
        if (error.message.includes("API key not valid")) {
             return new Error("Your API key is invalid or not configured correctly. Please check your setup.");
        }
    }
    
    return new Error(defaultMessage);
};


// Schema to parse a user's query into structured API parameters.
const searchParamsSchema = {
    type: Type.OBJECT,
    properties: {
        analyzedQuery: {
            type: Type.STRING,
            description: "A short, one-sentence summary of what you are searching for based on the user's prompt. For example: 'Searching for flights from Casablanca to Dubai and a 4-star hotel.'"
        },
        flight_search_params: {
            type: Type.OBJECT,
            description: "Structured parameters for a flight API call, based on Amadeus API specs.",
            properties: {
                originLocationCode: { type: Type.STRING, description: "Origin airport IATA code, e.g., CMN" },
                destinationLocationCode: { type: Type.STRING, description: "Destination airport IATA code, e.g., DXB" },
                departureDate: { type: Type.STRING, description: "Departure date in YYYY-MM-DD format" },
                adults: { type: Type.INTEGER, description: "Number of adult passengers, default to 1 if not specified."}
            }
        },
        hotel_search_params: {
            type: Type.OBJECT,
            description: "Structured parameters for a hotel API call, based on Booking.com API specs.",
            properties: {
                destination: { type: Type.STRING, description: "The city or area for the hotel search." },
                checkin_date: { type: Type.STRING, description: "Check-in date in YYYY-MM-DD format" },
                checkout_date: { type: Type.STRING, description: "Check-out date in YYYY-MM-DD format" },
                adults_number: { type: Type.INTEGER, description: "Number of adults, default to 1 if not specified."},
                stars: { type: Type.INTEGER, description: "Minimum star rating for the hotel" },
                max_price_per_night: { type: Type.NUMBER, description: "Maximum price per night in USD" }
            }
        },
        car_search_params: {
            type: Type.OBJECT,
            description: "Structured parameters for a car rental API call.",
            properties: {
                location: { type: Type.STRING, description: "The city or pickup location." },
                pickup_date: { type: Type.STRING, description: "Pickup date in YYYY-MM-DD format" },
                dropoff_date: { type: Type.STRING, description: "Drop-off date in YYYY-MM-DD format" },
                car_type: { type: Type.STRING, enum: ['Sedan', 'SUV', 'Luxury', 'Van', 'Electric'], description: "The type of car the user is interested in."},
                max_price_per_day: { type: Type.NUMBER, description: "Maximum price per day in USD" }
            }
        },
        itinerary_request: {
            type: Type.OBJECT,
            description: "Parameters for generating a mini-itinerary or activity suggestions ONLY if the user explicitly asks for them (e.g., 'suggest some activities', 'what is there to do there').",
            properties: {
                destination: { type: Type.STRING, description: "The destination for the itinerary, inferred from the conversation." },
                duration: { type: Type.INTEGER, description: "The duration of the trip in days, inferred from the hotel booking if available." },
                interests: { type: Type.STRING, description: "A summary of any interests the user mentioned for the activities." }
            }
        },
    },
    required: ['analyzedQuery']
};

// Schema to generate mock flight and stay data.
const mockResultsSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A friendly, one-sentence summary of the deals found. e.g., 'I've found several flights and highly-rated hotels for your trip!'"
        },
        flights: {
            type: Type.ARRAY,
            description: "An array of 8-12 fictional flight options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Should always be 'flight'" },
                    airline: { type: Type.STRING },
                    flightNumber: { type: Type.STRING },
                    departureAirport: { type: Type.STRING },
                    arrivalAirport: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "e.g., '08:30 AM'" },
                    arrivalTime: { type: Type.STRING, description: "e.g., '05:45 PM'" },
                    duration: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    stops: { type: Type.INTEGER },
                    provider: { type: Type.STRING, description: "Simulate a real-world data provider, e.g., 'Kiwi', 'Skyscanner', 'Travelpayouts'."},
                    pricePrediction: {
                        type: Type.OBJECT,
                        description: "An AI-driven prediction on whether the price is likely to rise or fall.",
                        properties: {
                            recommendation: { type: Type.STRING, enum: ['Wait', 'Buy Now'], description: "Recommendation to the user." },
                            reason: { type: Type.STRING, description: "A brief, one-sentence explanation for the recommendation." }
                        }
                    },
                    negotiationTip: {
                        type: Type.STRING,
                        description: "A short, actionable tip for the user on how to get a better deal or save money on this flight. e.g., 'Booking on a Tuesday often yields lower prices.' or 'Check for deals on round-trip bookings.'"
                    },
                    affiliateLink: {
                        type: Type.STRING,
                        description: "A realistic but fictional booking link, formatted like 'https://flywise.ai/deals/f/[random_id]'."
                    },
                    rankingScore: { type: Type.NUMBER, description: "A score from 0-100 indicating how well this result matches the user's inferred criteria. Only for top ranked items." },
                    rankingReason: { type: Type.STRING, description: "A short, one-sentence explanation for why this item is highly ranked. Only for top ranked items." },
                },
                required: ["type", "airline", "flightNumber", "departureAirport", "arrivalAirport", "departureTime", "arrivalTime", "duration", "price", "stops", "provider", "affiliateLink"]
            }
        },
        stays: {
            type: Type.ARRAY,
            description: "An array of 8-12 fictional hotel/stay options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Should always be 'stay'" },
                    name: { type: Type.STRING },
                    stayType: { type: Type.STRING, enum: ['Hotel', 'Apartment', 'Guesthouse', 'Villa'] },
                    location: { type: Type.STRING },
                    pricePerNight: { type: Type.NUMBER },
                    rating: { type: Type.NUMBER, description: "A rating from 1 to 5, can include decimals." },
                    amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    imageUrl: { type: Type.STRING, description: "A URL to a relevant stock photo of a hotel or city." },
                    numberOfNights: { type: Type.INTEGER, description: "The total number of nights for the booking, inferred from the user's query. Default to 1 if not specified." },
                    provider: { type: Type.STRING, description: "Simulate a real-world data provider, e.g., 'Booking.com', 'Agoda', 'Expedia'."},
                    negotiationTip: {
                        type: Type.STRING,
                        description: "A short, actionable tip for the user on how to negotiate or get a better deal on this stay. e.g., 'Booking mid-week can be up to 20% cheaper.' or 'Ask for a corner room for more space at the same price.'"
                    },
                    reviews: {
                        type: Type.ARRAY,
                        description: "An array of 2-3 fictional user reviews for the stay.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                user: { type: Type.STRING, description: "A fictional user name, e.g., 'Jane D.'" },
                                rating: { type: Type.NUMBER, description: "A rating from 1 to 5." },
                                comment: { type: Type.STRING, description: "A short, one or two-sentence review comment." }
                            },
                            required: ["user", "rating", "comment"]
                        }
                    },
                    affiliateLink: {
                        type: Type.STRING,
                        description: "A realistic but fictional booking link, formatted like 'https://flywise.ai/deals/s/[random_id]'."
                    },
                    rankingScore: { type: Type.NUMBER, description: "A score from 0-100 indicating how well this result matches the user's inferred criteria. Only for top ranked items." },
                    rankingReason: { type: Type.STRING, description: "A short, one-sentence explanation for why this item is highly ranked. Only for top ranked items." },
                },
                required: ["type", "name", "stayType", "location", "pricePerNight", "rating", "amenities", "imageUrl", "numberOfNights", "reviews", "provider", "affiliateLink"]
            }
        },
        cars: {
            type: Type.ARRAY,
            description: "An array of 5-8 fictional car rental options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Should always be 'car'" },
                    make: { type: Type.STRING },
                    model: { type: Type.STRING },
                    carType: { type: Type.STRING, enum: ['Sedan', 'SUV', 'Luxury', 'Van', 'Electric'] },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    pricePerDay: { type: Type.NUMBER },
                    rating: { type: Type.NUMBER, description: "A rating from 1 to 5, can include decimals." },
                    passengers: { type: Type.INTEGER },
                    fuelType: { type: Type.STRING, enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'] },
                    imageUrl: { type: Type.STRING, description: "A URL to a relevant stock photo of a car." },
                    provider: { type: Type.STRING, description: "Simulate a real-world data provider, e.g., 'Hertz', 'RentalCars.com', 'Avis'."},
                    recommendation: { type: Type.STRING, description: "A short, helpful AI recommendation, e.g., 'Best for city driving' or 'Great for families'."},
                    negotiationTip: {
                        type: Type.STRING,
                        description: "A short, actionable tip for the user on how to negotiate or save money on this car rental. e.g., 'Ask about weekly rates for potential discounts.' or 'Prepaying for fuel is often more expensive.'"
                    },
                    numberOfDays: { type: Type.INTEGER, description: "The total number of days for the rental, inferred from the user's query. Default to 1 if not specified." },
                    affiliateLink: {
                        type: Type.STRING,
                        description: "A realistic but fictional booking link, formatted like 'https://flywise.ai/deals/c/[random_id]'."
                    },
                    rankingScore: { type: Type.NUMBER, description: "A score from 0-100 indicating how well this result matches the user's inferred criteria. Only for top ranked items." },
                    rankingReason: { type: Type.STRING, description: "A short, one-sentence explanation for why this item is highly ranked. Only for top ranked items." },
                },
                required: ["type", "make", "model", "carType", "company", "location", "pricePerDay", "rating", "passengers", "fuelType", "imageUrl", "numberOfDays", "provider", "affiliateLink"]
            }
        },
        itinerary_snippet: {
            type: Type.OBJECT,
            description: "A small itinerary snippet with 2-4 activity suggestions. ONLY generate this if an 'itinerary_request' was part of the input parameters.",
            properties: {
                destination: { type: Type.STRING },
                suggestions: {
                    type: Type.ARRAY,
                    description: "An array of 2-4 diverse activity suggestions.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Name of the activity, landmark, or restaurant." },
                            description: { type: Type.STRING, description: "A compelling, one-sentence description of the suggestion."}
                        },
                        required: ["name", "description"]
                    }
                }
            },
            required: ["destination", "suggestions"]
        },
    }
};

// Schema for generating a travel itinerary.
const itinerarySchema = {
    type: Type.OBJECT,
    properties: {
        destination: {
            type: Type.STRING,
            description: "The destination city for the itinerary, as specified by the user."
        },
        itinerary: {
            type: Type.ARRAY,
            description: "A day-by-day plan for the trip. For each activity, find a real-world location with a specific name and full address.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    morning: { 
                        type: Type.OBJECT,
                        description: "A suggested activity for the morning at a specific, real-world location.",
                        properties: {
                            locationName: { type: Type.STRING, description: "The specific name of the real-world location (e.g., 'The Louvre Museum', 'Caffè Florian')." },
                            address: { type: Type.STRING, description: "The full, real street address of the location." },
                            description: { type: Type.STRING, description: "A brief, one-sentence description of the activity at this location." }
                        },
                        required: ["locationName", "address", "description"]
                    },
                    afternoon: { 
                        type: Type.OBJECT,
                        description: "A suggested activity for the afternoon at a specific, real-world location.",
                        properties: {
                            locationName: { type: Type.STRING, description: "The specific name of the real-world location (e.g., 'Eiffel Tower', 'Katz's Delicatessen')." },
                            address: { type: Type.STRING, description: "The full, real street address of the location." },
                            description: { type: Type.STRING, description: "A brief, one-sentence description of the activity at this location." }
                        },
                        required: ["locationName", "address", "description"]
                    },
                    evening: { 
                        type: Type.OBJECT,
                        description: "A suggested activity for the evening at a specific, real-world location.",
                        properties: {
                            locationName: { type: Type.STRING, description: "The specific name of the real-world location (e.g., 'Le Jules Verne', 'Moulin Rouge')." },
                            address: { type: Type.STRING, description: "The full, real street address of the location." },
                            description: { type: Type.STRING, description: "A brief, one-sentence description of the activity at this location." }
                        },
                        required: ["locationName", "address", "description"]
                    },
                },
                required: ["day", "morning", "afternoon", "evening"]
            }
        },
        culturalTips: {
            type: Type.ARRAY,
            description: "An array of 2-4 useful cultural tips or must-try local food recommendations for the destination.",
            items: {
                type: Type.STRING
            }
        },
        totalBudget: {
            type: Type.NUMBER,
            description: "The total estimated budget for the trip in USD, based on the user's input or a reasonable estimate if not provided."
        },
        budgetBreakdown: {
            type: Type.OBJECT,
            description: "A breakdown of the estimated budget into major categories.",
            properties: {
                lodging: {
                    type: Type.OBJECT,
                    properties: {
                        estimate: { type: Type.NUMBER, description: "Estimated cost for lodging in USD." },
                        details: { type: Type.STRING, description: "A brief one-sentence explanation for the lodging estimate." }
                    }
                },
                food: {
                    type: Type.OBJECT,
                    properties: {
                        estimate: { type: Type.NUMBER, description: "Estimated cost for food in USD." },
                        details: { type: Type.STRING, description: "A brief one-sentence explanation for the food estimate, e.g., 'Based on a mix of local eateries and one fine dining experience.'" }
                    }
                },
                activities: {
                    type: Type.OBJECT,
                    properties: {
                        estimate: { type: Type.NUMBER, description: "Estimated cost for activities in USD." },
                        details: { type: Type.STRING, description: "A brief one-sentence explanation for the activities estimate." }
                    }
                },
                transport: {
                    type: Type.OBJECT,
                    properties: {
                        estimate: { type: Type.NUMBER, description: "Estimated cost for local transport in USD." },
                        details: { type: Type.STRING, description: "A brief one-sentence explanation for the transport estimate." }
                    }
                }
            }
        }
    },
    required: ["destination", "itinerary"]
};

// Schema for generating travel insurance quotes.
const insuranceQuotesSchema = {
    type: Type.OBJECT,
    properties: {
        quotes: {
            type: Type.ARRAY,
            description: "An array of 3-4 fictional but realistic travel insurance quotes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    provider: { type: Type.STRING, description: "The name of the insurance company." },
                    price: { type: Type.NUMBER, description: "The total price for the trip duration in USD." },
                    coverage: {
                        type: Type.OBJECT,
                        properties: {
                            medical: {
                                type: Type.OBJECT,
                                properties: {
                                    limit: { type: Type.NUMBER, description: "Medical coverage limit in USD." },
                                    description: { type: Type.STRING, description: "Brief description of medical coverage." }
                                }
                            },
                            cancellation: {
                                type: Type.OBJECT,
                                properties: {
                                    limit: { type: Type.NUMBER, description: "Trip cancellation coverage limit in USD." },
                                    description: { type: Type.STRING, description: "Brief description of cancellation coverage." }
                                }
                            },
                            baggage: {
                                type: Type.OBJECT,
                                properties: {
                                    limit: { type: Type.NUMBER, description: "Baggage loss/delay coverage limit in USD." },
                                    description: { type: Type.STRING, description: "Brief description of baggage coverage." }
                                }
                            }
                        }
                    },
                    bestFor: { type: Type.STRING, description: "A short tag describing who this plan is best for, e.g., 'Budget Travelers', 'Adventure Sports', 'Family Coverage'." }
                },
                required: ["provider", "price", "coverage", "bestFor"]
            }
        }
    }
};

// Schema for nearby attractions.
const nearbyAttractionsSchema = {
    type: Type.OBJECT,
    properties: {
        attractions: {
            type: Type.ARRAY,
            description: "An array of 3-5 nearby attractions or points of interest.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the attraction." },
                    description: { type: Type.STRING, description: "A brief, one-sentence description of the attraction." }
                },
                required: ["name", "description"]
            }
        }
    },
    required: ["attractions"]
};

const weatherForecastSchema = {
    type: Type.OBJECT,
    properties: {
        forecast: {
            type: Type.ARRAY,
            description: "An array of daily weather forecast objects.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "The day of the week, e.g., 'Monday' or 'Tue'." },
                    highTemp: { type: Type.NUMBER, description: "The forecasted high temperature in Celsius." },
                    lowTemp: { type: Type.NUMBER, description: "The forecasted low temperature in Celsius." },
                    description: { type: Type.STRING, description: "A brief description of the weather conditions, e.g., 'Sunny with scattered clouds'." },
                    icon: { type: Type.STRING, enum: ['sun', 'cloud', 'rain', 'snow', 'storm', 'partly-cloudy'], description: "An icon name that best represents the weather conditions."}
                },
                required: ["day", "highTemp", "lowTemp", "description", "icon"]
            }
        }
    },
    required: ["forecast"]
};

// Schema for generating a Travel Buddy profile
const travelBuddyProfileSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A creative and fitting name for the travel buddy persona, e.g., 'Alex the Adventurer'." },
        bio: { type: Type.STRING, description: "A short, engaging one-paragraph biography that brings the persona to life." },
        keyTraits: {
            type: Type.ARRAY,
            description: "An array of 3-4 specific, actionable travel-related personality traits.",
            items: { type: Type.STRING }
        },
        travelStyle: { type: Type.STRING, enum: ['Relaxed', 'Adventurous', 'Cultural Explorer'] },
        budget: { type: Type.STRING, enum: ['Budget-conscious', 'Mid-range', 'Luxury'] },
        gender: { type: Type.STRING, enum: ['Male', 'Female', 'Non-binary'], description: "The gender of the travel buddy persona." },
        age: { type: Type.INTEGER, description: "A specific age for the travel buddy, which should fall within the user's requested age range." },
        compatibilityScore: { type: Type.NUMBER, description: "A compatibility score between 0 and 100, representing how well the buddy matches the user's travel style and preferences." },
        compatibilityReason: { type: Type.STRING, description: "A short, one-sentence justification for the compatibility score, explaining the synergy or interesting contrasts." },
    },
    required: ["name", "bio", "keyTraits", "travelStyle", "budget", "gender", "age", "compatibilityScore", "compatibilityReason"]
};

// Schema for alternative destination suggestions.
const alternativeSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of up to 3 alternative airport or location suggestions based on the user's last search. For each suggestion, provide a compelling reason and estimates for savings.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['flight', 'stay'], description: "The type of search this suggestion applies to." },
                    originalLocation: { type: Type.STRING, description: "The original location/airport code from the user's query." },
                    alternativeLocationName: { type: Type.STRING, description: "The name of the alternative location or airport (including its IATA code if applicable)." },
                    reason: { type: Type.STRING, description: "A short, compelling reason for choosing this alternative, e.g., 'Often has cheaper flights' or 'Closer to the city center'." },
                    estimatedCostSaving: { type: Type.STRING, description: "A realistic estimated cost saving, e.g., '$50 - $100' or 'Up to 20% cheaper'." },
                    estimatedTimeDifference: { type: Type.STRING, description: "Estimated difference in travel time to the main point of interest, e.g., '20 minutes shorter drive' or 'Adds 30 minutes by train'."}
                },
                required: ["type", "originalLocation", "alternativeLocationName", "reason"]
            }
        }
    },
    required: ["suggestions"]
};

// Schema for real-time suggestions.
const realTimeSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of 2-3 alternative, real-world activity suggestions based on the user's situation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the suggested venue or place." },
                    address: { type: Type.STRING, description: "The real, full street address of the venue." },
                    reason: { type: Type.STRING, description: "A compelling, one-sentence reason why this is a good alternative, considering the user's context (weather, preferences, original plan)." },
                    openingHours: { type: Type.STRING, description: "The opening hours for today, if available from the search. e.g., 'Open 10 AM - 6 PM'." },
                    travelTime: { type: Type.STRING, description: "Estimated travel time from the user's current location, e.g., '10-minute walk' or '15-minute taxi'." }
                },
                required: ["name", "address", "reason"]
            }
        }
    },
    required: ["suggestions"]
};

// Schema for destination suggestions in the "Inspire Me" feature.
const destinationSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        destinations: {
            type: Type.ARRAY,
            description: "An array of 3 real-world travel destinations that match the vibe.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the destination, e.g., 'Kyoto, Japan'." },
                    reason: { type: Type.STRING, description: "A compelling one-sentence reason why this destination matches the vibe." }
                },
                required: ["name", "reason"]
            }
        }
    },
    required: ["destinations"]
};

// Schema for HomeShare AI host matching
const homeShareHostSchema = {
    type: Type.OBJECT,
    properties: {
        hosts: {
            type: Type.ARRAY,
            description: "An array of 5-8 fictional but realistic HomeShare host profiles that are a good match for the user.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique ID for the host." },
                    name: { type: Type.STRING },
                    age: { type: Type.INTEGER },
                    location: { type: Type.STRING, description: "Specific neighborhood and city, e.g., 'Shibuya, Tokyo'." },
                    avatarUrl: { type: Type.STRING, description: "URL to a realistic, license-free portrait photo." },
                    bio: { type: Type.STRING, description: "A short, welcoming bio (2-3 sentences) that reflects their personality." },
                    interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isVerified: { type: Type.BOOLEAN, description: "Set to true for about half of the hosts." },
                    hostingPolicy: { type: Type.STRING, enum: ['Free', 'Small Fee'] },
                    maxGuests: { type: Type.INTEGER },
                    housePhotos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 3 URLs to realistic, license-free photos of a home interior." },
                    compatibilityScore: { type: Type.NUMBER, description: "A score from 0-100 indicating how well this host matches the user's profile and request. Higher is better." },
                    compatibilityReason: { type: Type.STRING, description: "A short, one-sentence explanation for the compatibility score, highlighting shared interests or values." },
                    reviews: {
                        type: Type.ARRAY,
                        description: "An array of 2-3 fictional reviews from past guests.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                authorName: { type: Type.STRING },
                                authorAvatarUrl: { type: Type.STRING, description: "URL to a realistic, license-free portrait photo." },
                                rating: { type: Type.NUMBER, description: "Rating from 1 to 5." },
                                comment: { type: Type.STRING },
                                createdAt: { type: Type.STRING, description: "ISO date string." },
                            },
                            required: ["id", "authorName", "authorAvatarUrl", "rating", "comment", "createdAt"]
                        }
                    },
                    offeredExperiences: {
                        type: Type.ARRAY,
                        description: "An array of 1-2 optional local experiences the host offers.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                price: { type: Type.NUMBER, description: "Price in USD. 0 for free experiences." },
                                category: { type: Type.STRING, enum: ['Tour', 'Meal', 'Workshop', 'Other'] },
                            },
                            required: ["id", "title", "description", "price", "category"]
                        }
                    }
                },
                required: ["id", "name", "age", "location", "avatarUrl", "bio", "interests", "languages", "isVerified", "hostingPolicy", "maxGuests", "housePhotos", "compatibilityScore", "compatibilityReason", "reviews", "offeredExperiences"]
            }
        }
    },
    required: ["hosts"]
};

// New schema for AI Voyage Missions
const voyageMissionsSchema = {
    type: Type.OBJECT,
    properties: {
        missions: {
            type: Type.ARRAY,
            description: "An array of exactly 3 personalized and creative travel missions for the user.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy, engaging title for the mission, e.g., 'Culinary Quest in Italy'." },
                    description: { type: Type.STRING, description: "A one or two-sentence description of the mission that inspires action." },
                    destination: { type: Type.STRING, description: "The destination for the mission, e.g., 'Rome, Italy'." },
                    badgeToUnlock: { type: Type.STRING, description: "The ID of the badge the user will unlock by completing this mission." },
                    pointsToEarn: { type: Type.NUMBER, description: "The number of FlyWise points the user will earn." },
                },
                required: ["title", "description", "destination", "badgeToUnlock", "pointsToEarn"]
            }
        }
    },
    required: ["missions"]
};

// Schema for Travel Trend Radar
const travelTrendSchema = {
    type: Type.OBJECT,
    properties: {
        trends: {
            type: Type.ARRAY,
            description: "An array of 5-8 personalized, trending travel destinations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique ID for the trend." },
                    destination: { type: Type.STRING, description: "The name of the trending destination (City, Country)." },
                    image: { type: Type.STRING, description: "A URL to a stunning, relevant, and license-free photo of the destination." },
                    trendScore: { type: Type.NUMBER, description: "A score from 0-100 indicating the current popularity and momentum of the trend." },
                    monthlyGrowth: { type: Type.NUMBER, description: "The percentage growth in interest or bookings over the last month." },
                    category: { type: Type.STRING, enum: ['Adventure', 'City Break', 'Relaxation', 'Cultural', 'Hidden Gem'] },
                    socialProof: {
                        type: Type.ARRAY,
                        description: "An array of 2-3 data points showing why this destination is trending.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING, enum: ['TikTok', 'Instagram', 'Booking', 'FlyWise'] },
                                value: { type: Type.STRING, description: "A short, impactful metric, e.g., '1.5M Views', '+120% Increase in Bookings'." }
                            },
                            required: ["platform", "value"]
                        }
                    },
                    personalizationReason: { type: Type.STRING, description: "A concise, one-sentence explanation of why this trend is a good match for the user, explicitly referencing their profile." }
                },
                required: ["id", "destination", "image", "trendScore", "monthlyGrowth", "category", "socialProof", "personalizationReason"]
            }
        }
    },
    required: ["trends"]
};

const superServiceDataSchema = {
    type: Type.OBJECT,
    properties: {
        availableApps: {
            type: Type.ARRAY,
            description: "An array of 2-4 of the most popular, REAL-WORLD food delivery and ride-hailing apps available in the specified city. For example, for Tokyo, you might list 'Uber Eats', 'Demae-can', 'Uber', 'JapanTaxi'.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The official name of the app, e.g., 'Uber Eats', 'Careem', 'Glovo'." },
                    category: { type: Type.STRING, enum: ['Food Delivery', 'Ride-Hailing'] },
                    description: { type: Type.STRING, description: "A brief, one-sentence description of the service and what it's known for in that region." },
                },
                required: ["name", "category", "description"],
            },
        },
        restaurants: {
            type: Type.ARRAY,
            description: "An array of 8-12 fictional but realistic restaurants available for delivery. CRITICAL: The `provider` for each restaurant MUST exactly match one of the food delivery app names listed in `availableApps`.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    cuisine: { type: Type.ARRAY, items: { type: Type.STRING } },
                    rating: { type: Type.NUMBER },
                    priceRange: { type: Type.STRING, enum: ['$', '$$', '$$$', '$$$$'] },
                    deliveryTime: { type: Type.STRING },
                    deliveryFee: { type: Type.NUMBER },
                    imageUrl: { type: Type.STRING, description: "URL to a relevant, license-free photo of food or a restaurant." },
                    provider: { type: Type.STRING, description: "The delivery service provider, must be from the `availableApps` list." },
                    menu: {
                        type: Type.ARRAY,
                        description: "An array of 3-5 popular menu items.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                price: { type: Type.STRING, description: "e.g., '$12.99'" },
                                description: { type: Type.STRING },
                            },
                            required: ["name", "price", "description"],
                        },
                    },
                },
                required: ["id", "name", "cuisine", "rating", "priceRange", "deliveryTime", "deliveryFee", "imageUrl", "provider", "menu"],
            },
        },
        foodSuggestions: {
            type: Type.ARRAY,
            description: "An array of 2-3 personalized restaurant suggestions based on user profile and context.",
            items: {
                type: Type.OBJECT,
                properties: {
                    restaurant: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            cuisine: { type: Type.ARRAY, items: { type: Type.STRING } },
                            rating: { type: Type.NUMBER },
                            priceRange: { type: Type.STRING, enum: ['$', '$$', '$$$', '$$$$'] },
                            deliveryTime: { type: Type.STRING },
                            deliveryFee: { type: Type.NUMBER },
                            imageUrl: { type: Type.STRING },
                            provider: { type: Type.STRING },
                            menu: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        price: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                    },
                                    required: ["name", "price", "description"],
                                },
                            },
                        },
                         required: ["id", "name", "cuisine", "rating", "priceRange", "deliveryTime", "deliveryFee", "imageUrl", "provider", "menu"],
                    },
                    reason: { type: Type.STRING },
                },
                required: ["restaurant", "reason"],
            },
        },
        rideSuggestion: {
            type: Type.OBJECT,
            description: "A single, smart ride suggestion. CRITICAL: The `serviceName` for each ride option MUST exactly match one of the ride-hailing app names listed in `availableApps`. This can be null if no obvious suggestion exists.",
            properties: {
                destination: { type: Type.STRING },
                reason: { type: Type.STRING },
                options: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            serviceName: { type: Type.STRING, description: "The ride-hailing service name, must be from the `availableApps` list." },
                            serviceLogoUrl: { type: Type.STRING },
                            vehicleType: { type: Type.STRING },
                            eta: { type: Type.STRING },
                            estimatedPrice: { type: Type.NUMBER },
                            passengerCapacity: { type: Type.INTEGER },
                        },
                        required: ["id", "serviceName", "serviceLogoUrl", "vehicleType", "eta", "estimatedPrice", "passengerCapacity"],
                    },
                },
            },
            required: ["destination", "reason", "options"],
        },
        smartCombo: {
            type: Type.OBJECT,
            description: "A creative combo suggestion linking a food order and a ride. Can be null.",
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                restaurant: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        cuisine: { type: Type.ARRAY, items: { type: Type.STRING } },
                        rating: { type: Type.NUMBER },
                        priceRange: { type: Type.STRING, enum: ['$', '$$', '$$$', '$$$$'] },
                        deliveryTime: { type: Type.STRING },
                        deliveryFee: { type: Type.NUMBER },
                        imageUrl: { type: Type.STRING },
                        provider: { type: Type.STRING },
                        menu: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    price: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                },
                                required: ["name", "price", "description"],
                            },
                        },
                    },
                    required: ["id", "name", "cuisine", "rating", "priceRange", "deliveryTime", "deliveryFee", "imageUrl", "provider", "menu"],
                },
                ride: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        serviceName: { type: Type.STRING },
                        serviceLogoUrl: { type: Type.STRING },
                        vehicleType: { type: Type.STRING },
                        eta: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER },
                        passengerCapacity: { type: Type.INTEGER },
                    },
                    required: ["id", "serviceName", "serviceLogoUrl", "vehicleType", "eta", "estimatedPrice", "passengerCapacity"],
                },
            },
            required: ["title", "description", "restaurant", "ride"],
        },
    },
    required: ["availableApps", "restaurants", "foodSuggestions"],
};

const tripMemorySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy, short, and evocative title for the travel memory video, e.g., 'Echoes of Rome' or 'Kyoto in Bloom'." },
        narrativeSummary: { type: Type.STRING, description: "A warm, engaging, one-paragraph narrative summary of the trip, written in a storytelling style as if recapping a fond memory." },
        keyStats: {
            type: Type.OBJECT,
            properties: {
                distanceTraveled: { type: Type.NUMBER, description: "An estimated total distance traveled in kilometers, including flights and local travel. Be creative and realistic." },
                destinationsVisited: { type: Type.NUMBER, description: "The number of distinct cities or major areas visited." },
                photosTaken: { type: Type.NUMBER, description: "A fun, simulated number of photos taken, e.g., 342." }
            },
            required: ["distanceTraveled", "destinationsVisited", "photosTaken"]
        },
        videoHighlightImageUrls: {
            type: Type.ARRAY,
            description: "An array of exactly 3 URLs to stunning, relevant, and license-free stock photos (from sites like Unsplash, Pexels) that represent the key moments or locations of the trip.",
            items: { type: Type.STRING }
        },
        musicTheme: { type: Type.STRING, enum: ['Uplifting', 'Chill', 'Epic', 'Sentimental'], description: "The musical theme that best fits the vibe of the trip." },
        mapRoute: {
            type: Type.ARRAY,
            description: "An array of latitude and longitude coordinates for each main location in the itinerary to be plotted on a map.",
            items: {
                type: Type.OBJECT,
                properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                },
                required: ["lat", "lng"]
            }
        }
    },
    required: ["title", "narrativeSummary", "keyStats", "videoHighlightImageUrls", "musicTheme", "mapRoute"]
};

const socialPostSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        caption: {
            type: Type.STRING,
            description: "A short, engaging, and friendly caption for a social media post, summarizing the trip. It should be written in a personal, first-person tone. Use emojis where appropriate."
        },
        hashtags: {
            type: Type.STRING,
            description: "A string of 5-7 relevant hashtags, separated by spaces, e.g., '#travel #adventure #kyoto #japan #travelgram'."
        }
    },
    required: ["caption", "hashtags"]
};

const coworkingSpaceSchema = {
    type: Type.OBJECT,
    properties: {
        spaces: {
            type: Type.ARRAY,
            description: "An array of 5-8 fictional but realistic coworking spaces.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique ID for the space." },
                    name: { type: Type.STRING },
                    location: { type: Type.STRING, description: "Full, real-looking street address of the space." },
                    imageUrl: { type: Type.STRING, description: "A URL to a relevant, license-free photo of a modern office interior." },
                    price: {
                        type: Type.OBJECT,
                        properties: {
                            perHour: { type: Type.NUMBER },
                            perDay: { type: Type.NUMBER },
                            perMonth: { type: Type.NUMBER },
                        },
                        required: ["perHour", "perDay", "perMonth"],
                    },
                    rating: { type: Type.NUMBER, description: "A rating from 1 to 5." },
                    amenities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key amenities like 'High-speed WiFi', 'Free Coffee', 'Meeting Rooms', '24/7 Access'." },
                    availability: {
                        type: Type.OBJECT,
                        properties: {
                            hotDesks: { type: Type.NUMBER, description: "Number of available hot desks." },
                            privateOffices: { type: Type.NUMBER, description: "Number of available private offices." },
                        },
                        required: ["hotDesks", "privateOffices"],
                    },
                    aiInsight: { type: Type.STRING, description: "A short, one-sentence AI-powered insight about the space, e.g., 'Best for creative professionals due to its vibrant atmosphere and natural light.'" },
                    reviews: {
                        type: Type.ARRAY,
                        description: "An array of 2-3 fictional user reviews.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                user: { type: Type.STRING },
                                rating: { type: Type.NUMBER },
                                comment: { type: Type.STRING },
                            },
                            required: ["user", "rating", "comment"],
                        }
                    },
                    networkingOpportunity: { type: Type.STRING, description: "A specific, engaging networking opportunity available at the space, e.g., 'Hosts a weekly tech meetup every Thursday evening.'" },
                },
                required: ["id", "name", "location", "imageUrl", "price", "rating", "amenities", "availability", "aiInsight", "reviews", "networkingOpportunity"],
            }
        }
    },
    required: ["spaces"]
};

// FIX: Add schemas for missing functions.
// Schema for budget optimizations.
const budgetOptimizationSchema = {
    type: Type.OBJECT,
    properties: {
        optimizations: {
            type: Type.ARRAY,
            description: "An array of 2-4 actionable budget optimization suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['Stay', 'Activity', 'Transport', 'Food'], description: "The category of the suggestion." },
                    originalItem: { type: Type.STRING, description: "The original item from the itinerary that can be optimized." },
                    suggestedAlternative: { type: Type.STRING, description: "A cheaper but still high-quality alternative." },
                    reason: { type: Type.STRING, description: "A compelling one-sentence reason for the suggestion." },
                    estimatedSavings: { type: Type.NUMBER, description: "The estimated savings in USD." },
                },
                required: ["type", "originalItem", "suggestedAlternative", "reason", "estimatedSavings"]
            }
        }
    },
    required: ["optimizations"]
};

// Schema for home dashboard AI suggestions.
const aiHomeSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of exactly 2 personalized 'next step' suggestions for the user.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy, short title for the suggestion card." },
                    description: { type: Type.STRING, description: "A concise, one-sentence description of the suggested action." },
                    actionText: { type: Type.STRING, description: "A short, actionable call-to-action text, e.g., 'Plan Your Trip' or 'Find Inspiration'." },
                    actionTarget: {
                        type: Type.OBJECT,
                        properties: {
                            tab: { type: Type.STRING, description: "The exact name of the tab the user should be directed to (e.g., 'Planner', 'Inspire', 'Chat')." },
                            query: { type: Type.STRING, description: "An optional pre-filled query for the chat or search bar." },
                        },
                        required: ["tab"]
                    },
                },
                required: ["title", "description", "actionText", "actionTarget"]
            }
        }
    },
    required: ["suggestions"]
};

const flightStatusSchema = {
  type: Type.OBJECT,
  properties: {
    flightNumber: { type: Type.STRING },
    airline: { type: Type.STRING },
    departure: {
      type: Type.OBJECT,
      properties: {
        airport: { type: Type.STRING },
        iata: { type: Type.STRING },
        city: { type: Type.STRING },
        scheduledTime: { type: Type.STRING, description: "Full ISO 8601 date-time string" },
        actualTime: { type: Type.STRING, description: "Full ISO 8601 date-time string, null if not departed" },
        terminal: { type: Type.STRING },
        gate: { type: Type.STRING },
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER },
      },
      required: ["airport", "iata", "city", "scheduledTime", "latitude", "longitude"]
    },
    arrival: {
      type: Type.OBJECT,
      properties: {
        airport: { type: Type.STRING },
        iata: { type: Type.STRING },
        city: { type: Type.STRING },
        scheduledTime: { type: Type.STRING, description: "Full ISO 8601 date-time string" },
        actualTime: { type: Type.STRING, description: "Full ISO 8601 date-time string, null if not landed" },
        terminal: { type: Type.STRING },
        gate: { type: Type.STRING },
        baggageClaim: { type: Type.STRING },
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER },
      },
      required: ["airport", "iata", "city", "scheduledTime", "latitude", "longitude"]
    },
    status: { type: Type.STRING, enum: ['Scheduled', 'En Route', 'Landed', 'Delayed', 'Cancelled'] },
    aircraft: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: "e.g., 'Boeing 777-300ER'" },
        registration: { type: Type.STRING, description: "e.g., 'A6-EPU'" }
      },
      required: ["type"]
    },
    livePosition: {
      type: Type.OBJECT,
      description: "Current coordinates of the aircraft. Null if not en route.",
      properties: {
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER },
        altitude: { type: Type.NUMBER, description: "in feet" },
        speed: { type: Type.NUMBER, description: "in knots" }
      }
    },
    progressPercent: { type: Type.NUMBER, description: "Flight completion percentage, from 0 to 100." },
    aiSummary: { type: Type.STRING, description: "A concise, helpful, one or two-sentence summary of the current flight status, mentioning any delays or important changes. e.g., 'Your flight is currently on time and cruising over the Atlantic. Expected arrival is on schedule at gate B24.'" },
    waypoints: {
        type: Type.ARRAY,
        description: "An array of 5-7 intermediate waypoints for 'En Route' flights. Should be an empty array for other statuses. Each waypoint represents a point along the great-circle flight path.",
        items: {
            type: Type.OBJECT,
            properties: {
                lat: { type: Type.NUMBER, description: "Latitude of the waypoint." },
                lng: { type: Type.NUMBER, description: "Longitude of the waypoint." },
                eta: { type: Type.STRING, description: "Estimated time of arrival at this waypoint in full ISO 8601 date-time format." },
                progressPercent: { type: Type.NUMBER, description: "The flight progress percentage at this waypoint (0-100)." }
            },
            required: ["lat", "lng", "eta", "progressPercent"]
        }
    },
  },
  required: ["flightNumber", "airline", "departure", "arrival", "status", "aircraft", "progressPercent", "aiSummary", "waypoints"]
};

/**
 * Parses a user's natural language query to extract structured API parameters.
 * @param chatHistory The user's conversation history.
 * @param profile The user's saved travel preferences.
 * @param savedTrips The user's saved trips for additional context.
 * @returns A promise that resolves to the structured ApiParams object.
 */
export const getApiParamsFromChat = async (chatHistory: ChatMessage[], profile: UserProfile, savedTrips: SavedTrip[]): Promise<ApiParams> => {
    try {
        const lastMessage = chatHistory[chatHistory.length - 1];
        
        let contentParts: any[] = [];

        const formattedHistory = chatHistory
            .map(msg => {
                let content = `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`;
                if (msg.imageData) {
                  content += " [User provided an image]";
                }
                // Add context from search results to the history
                if (msg.sender === 'ai' && msg.results && msg.results.length > 0) {
                    const resultsSummary = msg.results.slice(0, 3).map(r => {
                        if (r.type === 'flight') return `Flight ${r.airline} ${r.flightNumber} to ${r.arrivalAirport} for $${r.price}`;
                        if (r.type === 'stay') return `Stay at ${r.name} (${r.rating} stars) for $${r.pricePerNight}/night`;
                        if (r.type === 'car') return `Car ${r.make} ${r.model} for $${r.pricePerDay}/day`;
                    }).join(', ');
                    content += `\n[Presented search results: ${resultsSummary}]`;
                }
                return content;
            })
            .join('\n\n');

        const preferencesString = `
User Profile Preferences (These are default filters. The user's latest message can override them.):
- Preferred Airlines: ${profile.preferredAirlines || 'Any'}
- Minimum Hotel Stars: ${profile.minHotelStars > 0 ? `${profile.minHotelStars}` : 'Any'}
- Preferred Car Types: ${profile.preferredCarTypes.length > 0 ? profile.preferredCarTypes.join(', ') : 'Any'}
- Favorite Destinations: ${profile.favoriteDestinations.length > 0 ? profile.favoriteDestinations.join(', ') : 'None'}
- Budget Constraints: Max flight price ${profile.budget.flightMaxPrice ? `$${profile.budget.flightMaxPrice}`: 'N/A'}, Max hotel price ${profile.budget.hotelMaxPrice ? `$${profile.budget.hotelMaxPrice}/night`: 'N/A'}, Max car price ${profile.budget.carMaxPrice ? `$${profile.budget.carMaxPrice}/day`: 'N/A'}.
`;
        
        const savedTripsString = `
User's Saved Trips (for context, if user says 'near my Paris trip'):
${savedTrips.length > 0 ? savedTrips.slice(0, 5).map(trip => `- ${trip.name} (type: ${trip.type})`).join('\n') : 'None'}
`;

        const imagePrompt = lastMessage.imageData 
            ? `An image has been provided. First, identify the location, landmark, or key features in the image. Then, use this visual context combined with the user's text prompt to determine the search parameters. For example, if the image is of the Eiffel Tower and the user says "find flights here", the destination is Paris.`
            : '';

        const prompt = `You are a sophisticated AI travel concierge. Your primary task is to analyze a conversation and extract structured search parameters for flights, hotels, or cars.
${imagePrompt}

**MULTI-TASKING CAPABILITIES:**
- Your primary goal is to extract structured search parameters for flights, hotels, and cars.
- ADDITIONALLY, if the user ALSO asks for activity suggestions, an itinerary, or "things to do", you MUST populate the 'itinerary_request' object.
- The 'destination' for the itinerary request should be inferred from the flight or hotel search.
- Do NOT populate 'itinerary_request' if the user only asks for flights, hotels, or cars.

**CONTEXT IS KING:**
- **Full Conversation History:** Maintain context from the ENTIRE conversation. The user's latest message is most important, but context from earlier messages (like a previously mentioned destination or presented search results) is absolutely crucial for follow-up questions. For example, if the AI presented flights and the user says 'find hotels there', 'there' refers to the destination of the flights.
- **Date Awareness:** Today's date is ${new Date().toISOString().split('T')[0]}. Interpret relative dates like 'tomorrow' or 'next week' accordingly.

**CRITICAL INSTRUCTIONS FOR APPLYING USER PREFERENCES:**
You MUST use the provided User Profile Preferences as default filters for the search parameters.
1.  **Apply Defaults:** If the user's query is vague (e.g., "find me a hotel in Paris"), you MUST apply their saved preferences. For instance, set the 'stars' and 'max_price_per_night' parameters according to their profile.
2.  **User Overrides:** The user's latest message ALWAYS takes priority. If their message contradicts a profile setting (e.g., profile says 4-star hotels, but they ask for "a cheap 2-star hotel"), you MUST use the parameters from their message for this specific search.
3.  **Airlines & Car Types:** Do not populate flight airline preferences into the search parameters. For car rentals, only populate the 'car_type' parameter if the user explicitly asks for a specific type in their message (e.g., "rent an SUV"). Do NOT use the user's saved 'Preferred Car Types' from their profile to populate this parameter.

${preferencesString}

${savedTripsString}

Conversation History to Analyze:
${formattedHistory}`;

        contentParts.push({ text: prompt });
        if (lastMessage.imageData) {
             contentParts.push({
                inlineData: {
                    mimeType: lastMessage.imageData.mimeType,
                    data: lastMessage.imageData.base64,
                },
            });
        }


        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: contentParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: searchParamsSchema,
            },
        });

        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed as ApiParams;
    } catch (error) {
        throw handleGeminiError(error, "Could not understand your request. Please try rephrasing it.");
    }
};

/**
 * Generates mock travel data based on structured API parameters.
 * @param params The ApiParams object from getApiParamsFromChat.
 * @param profile The user's saved travel preferences.
 * @returns A promise that resolves to an object containing mock flights, stays, and a summary.
 */
export const getMockResultsFromParams = async (params: ApiParams, profile: UserProfile): Promise<{ summary: string; flights?: Flight[]; stays?: Stay[]; cars?: Car[]; itinerary_snippet?: ItinerarySnippet }> => {
    try {
        const preferencesString = `
**User Preferences (Mandatory Rules for Generating Results):**
- **Preferred Airlines:** If the user's profile lists preferred airlines (${profile.preferredAirlines || 'None are listed'}), you must generate several flight options from these airlines, if a flight search was requested.
- **Minimum Hotel Stars:** All generated hotel options MUST have a star rating of ${profile.minHotelStars > 0 ? `${profile.minHotelStars} or higher` : 'any rating'}. This is a strict filter. If search parameters also specified a star rating, the higher of the two values must be used.
- **Preferred Car Types:** If the user has preferred car types (${profile.preferredCarTypes.length > 0 ? profile.preferredCarTypes.join(', ') : 'None are listed'}), ensure several of the generated options match these types.
- **Budget:** All generated options MUST be cheaper than the user's budget constraints: Max flight price ${profile.budget.flightMaxPrice ? `$${profile.budget.flightMaxPrice}`: 'N/A'}, Max hotel price ${profile.budget.hotelMaxPrice ? `$${profile.budget.hotelMaxPrice}/night`: 'N/A'}, Max car price ${profile.budget.carMaxPrice ? `$${profile.budget.carMaxPrice}/day`: 'N/A'}. This is a strict filter.
`;

        const prompt = `You are a data generation and AI ranking engine for a travel app. Your task is to generate a list of fictional, yet highly realistic, travel deals based on structured search parameters.

**Search Parameters:** ${JSON.stringify(params)}

**Data Simulation Requirements:**
- **Provider Simulation:** For each generated item (flight, stay, car), you MUST include a 'provider' field. This simulates data coming from different real-world APIs.
  - For flights, use providers like 'Kiwi', 'Skyscanner', 'Travelpayouts', 'Google Flights'.
  - For stays, use providers like 'Booking.com', 'Agoda', 'Expedia', 'Hotels.com'.
  - For cars, use providers like 'Hertz', 'RentalCars.com', 'Avis', 'Enterprise'.
- **Realistic Links:** For each generated item, you **MUST** create a realistic but fictional booking affiliate link. The \`affiliateLink\` field is mandatory. The link should follow a pattern like 'https://flywise.ai/deals/[type]/[random_id]', where [type] is 'f' for flight, 's' for stay, and 'c' for car.

**AI Ranking Layer (CRITICAL):**
1.  **Infer Criterion:** First, analyze the user's query and preferences to infer the most important ranking criterion. This could be 'best value' (a balance of price and quality), 'shortest duration' (for flights), 'luxury' (high rating and price), or 'eco-friendly'. Default to 'best value' if unclear.
2.  **Rank and Score:** After generating the list of results, re-rank them based on the inferred criterion.
3.  **Add Reason:** For the top 3-5 results that best match the criterion, you MUST add a 'rankingReason' (e.g., "Best value for a direct flight.", "Top luxury hotel with excellent reviews.") and a 'rankingScore' (from 80-100). For other results, omit these fields.

**ITINERARY SNIPPET GENERATION:**
- If the search parameters include an 'itinerary_request' object, you MUST generate a concise 'itinerary_snippet' with 2-4 relevant and exciting activity suggestions for the specified destination.
- If there is NO 'itinerary_request', you MUST NOT generate an 'itinerary_snippet'. The field should be omitted from the JSON response.

**CRITICAL INSTRUCTIONS FOR GENERATING RESULTS:**
You MUST strictly adhere to the user's preferences below when creating the fictional results. These are not suggestions; they are mandatory rules for filtering and prioritizing the output. If the search parameters from the user's query conflict with their saved profile, the search parameters take precedence.

${preferencesString}

Generate results for all search types present in the search parameters, and an itinerary snippet if requested.
`;
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: mockResultsSchema,
            },
        });
        
        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed as { summary: string; flights?: Flight[]; stays?: Stay[]; cars?: Car[]; itinerary_snippet?: ItinerarySnippet };
    } catch (error) {
        throw handleGeminiError(error, "Could not fetch travel deals. The AI service may be temporarily unavailable.");
    }
};

/**
 * Generates alternative destination suggestions based on a conversation history.
 * @param chatHistory The user's conversation history.
 * @param userProfile The user's saved travel preferences.
 * @returns A promise that resolves to an array of AlternativeSuggestion objects.
 */
export const getAlternativeSuggestions = async (chatHistory: ChatMessage[], userProfile: UserProfile): Promise<AlternativeSuggestion[]> => {
    try {
        const formattedHistory = chatHistory
            .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
            .join('\n\n');

        const preferencesString = `
User Profile Preferences (Consider these when suggesting alternatives):
- Favorite Destinations: ${userProfile.favoriteDestinations.length > 0 ? userProfile.favoriteDestinations.join(', ') : 'None'}
- Budget Constraints: Max flight price ${userProfile.budget.flightMaxPrice ? `$${userProfile.budget.flightMaxPrice}`: 'N/A'}, Max hotel price ${userProfile.budget.hotelMaxPrice ? `$${userProfile.budget.hotelMaxPrice}/night`: 'N/A'}.
`;
        const prompt = `You are an AI travel expert specializing in finding creative and value-driven alternative destinations.
Based on the full conversation history, identify the user's most recent trip search (destination, dates, etc.).
Your task is to suggest 1-3 alternative destinations that are similar in vibe but might offer better value, fewer crowds, or a unique experience.

**CRITICAL INSTRUCTIONS:**
1.  **Analyze the Last Search:** Determine the core request from the conversation. What was the destination? What were they looking for (e.g., beach vacation, city break, adventure)?
2.  **Suggest Smart Alternatives:** If the user searched for a major hub (like LAX, Paris, Rome), suggest nearby secondary airports (Burbank instead of LAX) or different but similar cities (e.g., suggest Bologna instead of Florence for food lovers).
3.  **Provide Justification:** For each suggestion, you MUST provide a compelling 'reason', an 'estimatedCostSaving', and an 'estimatedTimeDifference' if applicable.
4.  **Consider User Profile:** Look at the user's preferences to tailor suggestions. If they like specific destinations, maybe suggest something similar.

${preferencesString}

Conversation History:
${formattedHistory}

Generate the alternative suggestions now.
`;
        
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: alternativeSuggestionsSchema,
            },
        });

        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.suggestions as AlternativeSuggestion[];
    } catch (error) {
        throw handleGeminiError(error, "Could not generate alternative suggestions at this time.");
    }
};


/**
 * Generates a travel itinerary.
 * @param destination The travel destination.
 * @param duration The duration of the trip in days.
 * @param interests User's interests.
 * @param budget (Optional) The total budget for the trip.
 * @returns A promise that resolves to an ItineraryPlan.
 */
export const getItinerary = async (destination: string, duration: number, interests: string, budget?: number): Promise<ItineraryPlan> => {
    try {
        const prompt = `Create a ${duration}-day travel itinerary for a trip to ${destination}. The user's interests are: "${interests}". ${budget ? `The total budget for the trip is strictly $${budget} USD.` : 'The user has not specified a budget, so create a plan with a reasonable, mid-range budget.'} For each suggested activity (morning, afternoon, evening), you must provide the name of a specific, real establishment (e.g., a museum, restaurant, park, or cafe), its full physical address, and a brief description. Generate a detailed budget breakdown for lodging, food, activities, and local transportation. The sum of the breakdown should match the total budget. Also include cultural tips and must-try food.`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: itinerarySchema,
            },
        });

        const jsonStr = result.text.trim();
        // The AI generates the core plan; we re-attach the user's interests to the final object.
        const parsed = JSON.parse(jsonStr) as Omit<ItineraryPlan, 'interests'>;
        return { ...parsed, interests };
    } catch (error) {
        throw handleGeminiError(error, "Could not create an itinerary. The AI service may be temporarily unavailable.");
    }
};

/**
 * Generates AI-powered, creative images for a travel destination.
 * @param destination The travel destination city.
 * @param duration The trip duration in days.
 * @param interests A string of user interests.
 * @param budget The total trip budget.
 * @returns A promise that resolves to an array of base64 image strings.
 */
export const generateDestinationImages = async (destination: string, duration: number, interests: string, budget?: number): Promise<string[]> => {
    try {
        const getBudgetDescriptor = (b?: number, d?: number): string => {
            if (!b || !d) return 'a vibrant, appealing';
            const perDay = b / d;
            if (perDay > 500) return 'a luxurious, opulent, and high-end';
            if (perDay > 200) return 'a comfortable, stylish, mid-range';
            return 'a charming, cozy, budget-friendly';
        };

        const budgetDescriptor = getBudgetDescriptor(budget, duration);
        const interestsText = interests
            ? `The traveler's interests are: "${interests}".`
            : `The image should capture the iconic beauty and atmosphere of the destination.`;

        const prompt = `Create a breathtaking, cinematic, and emotionally resonant travel photograph of ${destination}. The image should look like an award-winning shot from a National Geographic photographer.

**Core Theme:** The scene must embody the spirit of a ${budgetDescriptor} trip and be heavily influenced by the traveler's interests: "${interestsText}".

**Artistic Direction:**
- **Mood & Atmosphere:** Evoke a powerful sense of place. Whether it's the serene tranquility of a hidden cove, the bustling energy of a city market, or the majestic grandeur of a mountain peak, the emotion should be palpable.
- **Lighting:** Utilize dramatic and natural lighting. Aim for the soft, warm glow of the golden hour, the cool, moody tones of the blue hour, or dramatic sunbeams filtering through clouds.
- **Composition:** Employ strong compositional techniques like the rule of thirds, leading lines, or framing to draw the viewer into the scene. The composition must be balanced and visually stunning.
- **Color Palette:** Use a rich and vibrant color palette that feels authentic to the location but is artistically enhanced to be more captivating.

**Technical Specifications:**
- **Style:** Ultra-realistic, photorealistic, 8K resolution, incredibly detailed.
- **Optics:** Emulate the look of a professional DSLR camera with a high-quality prime lens, creating a beautiful shallow depth of field and artistic bokeh where appropriate.

**Strict Exclusions:** NO text, NO logos, NO watermarks, NO identifiable human faces. The focus must be entirely on the location and its unique atmosphere.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 3,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        
        return response.generatedImages.map(img => img.image.imageBytes);

    } catch (error) {
        throw handleGeminiError(error, "Could not generate destination images. The AI service may be temporarily unavailable.");
    }
};


/**
 * Parses a markdown string from the AI into a Checklist object.
 * @param markdown The raw markdown string from the Gemini API.
 * @returns A structured Checklist object.
 */
const parseChecklistFromMarkdown = (markdown: string): Omit<Checklist, 'documents'> & { documents: { items: { item: string, checked: boolean }[] } } => {
    const checklist: Omit<Checklist, 'documents'> & { documents: { items: { item: string, checked: boolean }[] } } = {
        packingList: [],
        documents: { items: [] },
        localEssentials: [],
    };

    const lines = markdown.split('\n');
    let currentSection: keyof typeof checklist | null = null;

    for (const line of lines) {
        if (line.startsWith('### Packing List')) {
            currentSection = 'packingList';
        } else if (line.startsWith('### Essential Documents')) {
            currentSection = 'documents';
        } else if (line.startsWith('### Local Essentials')) {
            currentSection = 'localEssentials';
        } else if (currentSection && (line.startsWith('* ') || line.startsWith('- '))) {
            const item = line.substring(2).trim();
            if (item) {
                if (currentSection === 'documents') {
                     checklist.documents.items.push({ item, checked: false });
                } else {
                    checklist[currentSection].push({ item, checked: false });
                }
            }
        }
    }
    return checklist;
};


/**
 * Generates a travel-ready checklist using Google Search grounding for visa info.
 * @param plan The ItineraryPlan to generate a checklist for.
 * @returns A promise that resolves to a Checklist object.
 */
export const getTravelChecklist = async (plan: ItineraryPlan): Promise<Checklist> => {
    try {
        const activitiesSummary = plan.itinerary.map(day => `${day.morning.description}, ${day.afternoon.description}, ${day.evening.description}`).join(', ');
        const prompt = `Create a travel-ready checklist for a ${plan.itinerary.length}-day trip to ${plan.destination} for a US citizen. The planned activities include: ${activitiesSummary}.
Respond in markdown format with three and only three sections, each with a heading: '### Packing List', '### Essential Documents', and '### Local Essentials'.
- Under '### Packing List', generate a personalized packing list.
- Under '### Essential Documents', use your search tool to provide up-to-date visa and entry document requirements for a US citizen traveling to ${plan.destination}.
- Under '### Local Essentials', list the local currency, the main emergency phone number, and one highly recommended local travel app.
For each section, provide a bulleted list of items.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const markdownText = response.text;
        if (!markdownText) {
            throw new Error("The AI returned an empty response.");
        }

        const checklist = parseChecklistFromMarkdown(markdownText);
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = groundingChunks
            ?.map((chunk: any) => chunk.web ? ({ uri: chunk.web.uri, title: chunk.web.title }) : null)
            .filter((source: any): source is { uri: string; title: string } => source !== null);

        return {
            ...checklist,
            documents: {
                ...checklist.documents,
                sources: sources,
            }
        };

    } catch (error) {
        throw handleGeminiError(error, "Could not create a travel checklist. The AI service may be temporarily unavailable.");
    }
};

const mapMarkerSchema = {
    type: Type.OBJECT,
    properties: {
        markers: {
            type: Type.ARRAY,
            description: "An array of map markers for the itinerary activities.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The specific name of the location or landmark mentioned in the activity." },
                    lat: { type: Type.NUMBER, description: "The latitude of the location." },
                    lng: { type: Type.NUMBER, description: "The longitude of the location." },
                    day: { type: Type.INTEGER, description: "The day of the itinerary this marker belongs to." },
                    timeOfDay: { type: Type.STRING, enum: ['Morning', 'Afternoon', 'Evening'], description: "The time of day for the activity." },
                    activity: { type: Type.STRING, description: "A brief description of the activity at this marker." },
                },
                required: ["name", "lat", "lng", "day", "timeOfDay", "activity"]
            }
        }
    },
    required: ["markers"]
};

// FIX: Stub implementation for getRealTimeSuggestions
export const getRealTimeSuggestions = async (
    chatHistory: ChatMessage[],
    userProfile: UserProfile,
    itinerary: ItineraryPlan,
    location: { lat: number, lng: number }
): Promise<RealTimeSuggestion[]> => {
    console.log('STUB: getRealTimeSuggestions called');
    return Promise.resolve([
        { name: "Le Café de la Paix", address: "5 Place de l'Opéra, 75009 Paris", reason: "Classic Parisian cafe nearby, perfect for a coffee.", openingHours: "Open until 11 PM", travelTime: "5 min walk" },
        { name: "Musée du Parfum Fragonard", address: "9 Rue Scribe, 75009 Paris", reason: "A quick, interesting museum if you have an hour to spare.", openingHours: "Open until 6 PM", travelTime: "8 min walk" }
    ]);
};

// FIX: Stub implementation for getCoordinatesForActivities
export const getCoordinatesForActivities = async (itinerary: DailyPlan[]): Promise<MapMarker[]> => {
    console.log('STUB: getCoordinatesForActivities called');
    // Simple mock based on a known location like Paris
    return Promise.resolve([
        { name: "Louvre Museum", lat: 48.8606, lng: 2.3376, day: 1, timeOfDay: 'Morning', activity: 'Visit the museum' },
        { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, day: 1, timeOfDay: 'Afternoon', activity: 'Go up the tower' },
        { name: "Moulin Rouge", lat: 48.8841, lng: 2.3323, day: 1, timeOfDay: 'Evening', activity: 'See a show' },
    ]);
};

// FIX: Stub implementation for getWeatherForecast
export const getWeatherForecast = async (destination: string, duration: number): Promise<WeatherForecast> => {
    console.log('STUB: getWeatherForecast called');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const icons: WeatherForecast[0]['icon'][] = ['sun', 'partly-cloudy', 'cloud', 'rain'];
    return Promise.resolve(
        Array.from({ length: duration }, (_, i) => ({
            day: days[new Date(Date.now() + i * 86400000).getDay()],
            highTemp: 20 + i,
            lowTemp: 12 + i,
            description: 'Mixed clouds',
            icon: icons[i % icons.length],
        }))
    );
};

// FIX: Stub implementation for getInsuranceQuotes
export const getInsuranceQuotes = async (plan: ItineraryPlan): Promise<TravelInsuranceQuote[]> => {
    console.log('STUB: getInsuranceQuotes called');
    return Promise.resolve([
        { provider: "SafetyWing", price: 45.50, coverage: { medical: { limit: 250000, description: "Emergency medical coverage." }, cancellation: { limit: 1000, description: "For covered reasons." }, baggage: { limit: 500, description: "For lost or delayed baggage." } }, bestFor: "Digital Nomads" },
        { provider: "World Nomads", price: 75.20, coverage: { medical: { limit: 500000, description: "Includes adventure sports." }, cancellation: { limit: 2500, description: "Comprehensive cancellation." }, baggage: { limit: 1000, description: "Higher limits for baggage." } }, bestFor: "Adventure Travel" },
        { provider: "Allianz Global", price: 95.00, coverage: { medical: { limit: 1000000, description: "Premium medical coverage." }, cancellation: { limit: 5000, description: "Cancel for any reason option." }, baggage: { limit: 2000, description: "Extensive baggage protection." } }, bestFor: "Family Coverage" }
    ]);
};

// FIX: Stub implementation for getNearbyAttractions
export const getNearbyAttractions = async (name: string, location: string): Promise<NearbyAttraction[]> => {
    console.log('STUB: getNearbyAttractions called');
    return Promise.resolve([
        { name: "Local Market", description: "A bustling market with local crafts and food." },
        { name: "Historic Park", description: "A beautiful park with walking trails and monuments." },
        { name: "Art Museum", description: "Features a collection of modern and classic art." }
    ]);
};

// FIX: Stub implementation for getLocalVibe
export const getLocalVibe = async (name: string, location: string): Promise<LocalVibe> => {
    console.log('STUB: getLocalVibe called');
    return Promise.resolve({
        description: "The neighborhood is generally considered safe and vibrant at night, with many well-lit streets and a lively cafe culture. Local sources recommend staying on main roads after 11 PM.",
        sources: [{ uri: "https://example-travel-blog.com/location-safety", title: "Is [Location] Safe at Night? - Travel Blog" }]
    });
};

// FIX: Stub implementation for generateTravelBuddyProfile
export const generateTravelBuddyProfile = async (preferences: TravelBuddyPreferences, userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<TravelBuddyProfile> => {
    console.log('STUB: generateTravelBuddyProfile called');
    return Promise.resolve({
        name: "Alex the Explorer",
        bio: "An avid photographer and foodie who loves finding hidden gems. Alex believes the best travel memories are made off the beaten path.",
        keyTraits: ["Spontaneous", "Loves trying new food", "Early riser"],
        travelStyle: preferences.travelStyle,
        budget: preferences.budget,
        gender: "Non-binary",
        age: 28,
        compatibilityScore: 88,
        compatibilityReason: "Your love for adventure and their spontaneous nature makes for a great match!"
    });
};

// FIX: Stub implementation for generateJointItinerary
export const generateJointItinerary = async (userProfile: UserProfile, buddyProfile: TravelBuddyProfile, destination: string, duration: number): Promise<ItineraryPlan> => {
    console.log('STUB: generateJointItinerary called');
    return getItinerary(destination, duration, `${userProfile.favoriteDestinations?.join(', ')}, ${buddyProfile.keyTraits.join(', ')}`);
};

// FIX: Stub implementation for chatWithTravelBuddy
export const chatWithTravelBuddy = async (chatHistory: ChatMessage[], userProfile: UserProfile, buddyProfile: TravelBuddyProfile, jointPlan: ItineraryPlan): Promise<string> => {
    console.log('STUB: chatWithTravelBuddy called');
    return Promise.resolve("That's a great idea! I'm totally up for that. Should we book it now or wait until we get there?");
};

// FIX: Stub implementation for generateBuddyProfilePicture
export const generateBuddyProfilePicture = async (profile: TravelBuddyProfile): Promise<string> => {
    // This is a mock base64 string. A real implementation would call an image generation API.
    return Promise.resolve("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
};

// FIX: Stub implementation for generateTripMemory
export const generateTripMemory = async (plan: ItineraryPlan): Promise<Omit<TripMemory, 'tripId'>> => {
    console.log('STUB: generateTripMemory called');
    return Promise.resolve({
        title: `Unforgettable memories from ${plan.destination}`,
        narrativeSummary: `Our ${plan.itinerary.length}-day trip to ${plan.destination} was a whirlwind of amazing food, stunning sights, and incredible experiences. We'll never forget the moments we shared.`,
        keyStats: { distanceTraveled: 4500, destinationsVisited: 1, photosTaken: 523 },
        videoHighlightImageUrls: [
            "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1533105079780-52b9be4ac215?q=80&w=800&auto=format&fit=crop",
        ],
        musicTheme: 'Uplifting',
        mapRoute: plan.itinerary.flatMap(day => [{ lat: 48.85, lng: 2.35 }, { lat: 48.86, lng: 2.34 }]).slice(0, 5) // Mock route
    });
};

// FIX: Stub implementation for generateVibeSearchIdeas
export const generateVibeSearchIdeas = async (vibe: string): Promise<VibeSearchResult> => {
    console.log('STUB: generateVibeSearchIdeas called');
    return Promise.resolve({
        images: [/* base64 strings */],
        destinations: [
            { name: "Kyoto, Japan", reason: "Matches the vibe of ancient traditions and serene nature." },
            { name: "Prague, Czech Republic", reason: "Famous for its cobblestone streets and historic architecture." },
            { name: "Bruges, Belgium", reason: "A fairytale medieval town with canals and cozy cafes." }
        ]
    });
};

// FIX: Stub implementation for getAILocalMatches
export const getAILocalMatches = async (location: string, userProfile: UserProfile, profileType: 'stay' | 'hangout'): Promise<LocalProfile[]> => {
    console.log('STUB: getAILocalMatches called');
    return Promise.resolve([
        { id: '1', profileType, name: 'Yuki', age: 28, location: `Shibuya, ${location}`, avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200', bio: "I love showing people the best hidden ramen spots and vintage shops in Tokyo!", interests: ['Foodie', 'Fashion', 'Photography'], languages: ['Japanese', 'English'], isVerified: true, compatibilityScore: 92, compatibilityReason: "Shared love for food and photography.", housePhotos: ['https://images.unsplash.com/photo-1560185007-c5ca9d2c015d?q=80&w=400'], hostingPolicy: 'Small Fee', maxGuests: 2, reviews: [], offeredExperiences: [] },
        { id: '2', profileType, name: 'Marco', age: 34, location: `Trastevere, ${location}`, avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200', bio: "Let's grab an espresso and explore ancient ruins. I enjoy deep conversations and long walks.", interests: ['History', 'Art', 'Coffee'], languages: ['Italian', 'English'], isVerified: false, compatibilityScore: 85, compatibilityReason: "A great match for cultural exploration.", housePhotos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400'], hostingPolicy: 'Free', maxGuests: 1, reviews: [], offeredExperiences: [] }
    ]);
};

// FIX: Stub implementation for getHangoutSuggestions
export const getHangoutSuggestions = async (userProfile: UserProfile, local: LocalProfile): Promise<HangoutSuggestion[]> => {
    console.log('STUB: getHangoutSuggestions called');
    return Promise.resolve([
        { title: "Explore a Local Market", description: "Let's wander through the nearby market and grab some local snacks.", location: "Central Market", estimatedCost: "$10-20" },
        { title: "Coffee & Chat", description: "I know a great little cafe where we can chat and get to know each other.", location: "The Corner Grind", estimatedCost: "Under $10" },
        { title: "Scenic Viewpoint Walk", description: "There's a beautiful viewpoint not too far away. We could take a walk and enjoy the scenery.", location: "Sunset Hill", estimatedCost: "Free" }
    ]);
};

// FIX: Stub implementation for getAIVoyageMissions
export const getAIVoyageMissions = async (profile: GamificationProfile): Promise<AIVoyageMission[]> => {
    console.log('STUB: getAIVoyageMissions called');
    return Promise.resolve([
        { title: "Culinary Quest in Italy", description: "Explore the foodie scene in Rome and learn to make pasta.", destination: "Rome, Italy", badgeToUnlock: 'foodie-explorer', pointsToEarn: 300 },
        { title: "Connect in Kyoto", description: "Stay with a local host and discover the hidden temples of Kyoto.", destination: "Kyoto, Japan", badgeToUnlock: 'explorer-buddy', pointsToEarn: 500 },
        { title: "Remote Work in Bali", description: "Book a coworking space and experience the digital nomad life in Canggu.", destination: "Canggu, Bali", badgeToUnlock: 'digital-nomad', pointsToEarn: 400 }
    ]);
};

// FIX: Stub implementation for getTravelTrends
export const getTravelTrends = async (userProfile: UserProfile): Promise<TravelTrend[]> => {
    console.log('STUB: getTravelTrends called');
    return Promise.resolve([
        { id: '1', destination: 'Albanian Riviera', image: 'https://images.unsplash.com/photo-1617373258398-63a48e7e2b6a?q=80&w=400', trendScore: 88, monthlyGrowth: 150, category: 'Hidden Gem', socialProof: [{ platform: 'TikTok', value: '2.1M Views' }], personalizationReason: "A perfect hidden gem for your adventurous spirit." },
        { id: '2', destination: 'Seoul, South Korea', image: 'https://images.unsplash.com/photo-1534275336963-441a5d61d011?q=80&w=400', trendScore: 95, monthlyGrowth: 120, category: 'City Break', socialProof: [{ platform: 'Instagram', value: '+1.5M Posts' }], personalizationReason: "Your interest in culture and food makes Seoul a great fit." }
    ]);
};

export const getSuperServiceData = async (location: string, userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<SuperServiceData> => {
    try {
        const prompt = `You are an AI travel assistant acting as a local expert for ${location}.
Your primary task is to identify the most popular, real-world applications (apps) that locals and tourists use for food delivery and ride-hailing in this city.

1.  First, populate the \`availableApps\` array with the top 2-4 apps for 'Food Delivery' and 2-4 for 'Ride-Hailing'. Provide a brief, helpful description for each app.
2.  Then, generate personalized suggestions for restaurants and rides.
3.  CRITICAL: The \`provider\` for each restaurant and the \`serviceName\` for each ride option MUST EXACTLY match one of the app names you identified in the \`availableApps\` list. For example, if you list 'Uber Eats', then some restaurants must have 'Uber Eats' as their provider.
4.  Base your personalized suggestions on the user's profile and trip context.

User Profile:
- Favorite Destinations (Interests): ${userProfile.favoriteDestinations.join(', ') || 'None'}
- Budget: Prefers mid-range options.

Saved Trips Context:
${savedTrips.length > 0 ? savedTrips.slice(0, 2).map(t => `- ${t.name}`).join('\n') : 'None'}
`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: superServiceDataSchema,
            },
        });

        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed as SuperServiceData;
    } catch (error) {
        throw handleGeminiError(error, `Could not find services for ${location}. Please try a different city.`);
    }
};

export const generateSocialPostSuggestion = async (memory: TripMemory): Promise<SocialPostSuggestion> => {
    try {
        const prompt = `You are a creative social media manager for a travel enthusiast. Based on the following travel memory, generate a short, engaging caption and a set of relevant hashtags for an Instagram or Facebook post. The tone should be personal, friendly, and inspiring. Use emojis.

        Travel Memory Title: "${memory.title}"
        Travel Memory Summary: "${memory.narrativeSummary}"
        `;
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: socialPostSuggestionSchema,
            },
        });
        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed as SocialPostSuggestion;
    } catch (error) {
        throw handleGeminiError(error, "Could not generate a social media post suggestion.");
    }
};

// FIX: Stub implementation for generateHangoutRequestMessage
export const generateHangoutRequestMessage = async (userProfile: UserProfile, local: LocalProfile, suggestion: HangoutSuggestion): Promise<string> => {
    console.log('STUB: generateHangoutRequestMessage called');
    return Promise.resolve(`Hey ${local.name}! I'm visiting soon and saw your profile. I'd love to take you up on your suggestion to "${suggestion.title}". It sounds like a great way to experience the city. Let me know if you might be free!`);
};

export const getCoworkingSpaces = async (location: string, userProfile: UserProfile): Promise<CoworkingSpace[]> => {
    try {
        const prompt = `
            You are a data generation engine for a travel app. Your task is to generate a list of 5-8 fictional but highly realistic coworking spaces in ${location}.
            The addresses must be real-looking street addresses within the specified location.
            Tailor the "aiInsight" and "networkingOpportunity" to a traveler with the following preferences:
            - Interests: ${userProfile.favoriteDestinations?.join(', ') || 'general travel'}
            - Budget: ${userProfile.budget.hotelMaxPrice ? `around $${userProfile.budget.hotelMaxPrice}/night for accommodation, so mid-range coworking is good` : 'mid-range'}

            Generate realistic details for each space, including amenities, pricing, and user reviews.
            Use license-free image URLs from Unsplash, Pexels, etc., for modern office or coworking interiors.
        `;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: coworkingSpaceSchema,
            },
        });

        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.spaces as CoworkingSpace[];
    } catch (error) {
        throw handleGeminiError(error, "Could not find coworking spaces at this time. The AI service may be temporarily unavailable.");
    }
};

// FIX: Implement missing functions.
export const getBudgetOptimizations = async (plan: ItineraryPlan): Promise<BudgetOptimizationSuggestion[]> => {
    try {
        const prompt = `You are a budget travel expert. Analyze the following travel itinerary and suggest 2-4 specific, actionable ways to save money without significantly compromising the experience. Focus on suggesting alternative activities, dining options, or transport methods.

        **Itinerary to Analyze:**
        - Destination: ${plan.destination}
        - Duration: ${plan.itinerary.length} days
        - Total Budget: $${plan.totalBudget}
        - Interests: ${plan.interests}
        - Daily Plan Summary: ${plan.itinerary.map(day => `Day ${day.day}: ${day.morning.locationName}, ${day.afternoon.locationName}, ${day.evening.locationName}`).join('; ')}

        For each suggestion, provide a clear alternative and a realistic estimated saving in USD.
        `;
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: budgetOptimizationSchema,
            },
        });
        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.optimizations as BudgetOptimizationSuggestion[];
    } catch (error) {
        throw handleGeminiError(error, "Could not generate budget optimizations at this time.");
    }
};

export const getAIHomeSuggestions = async (userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<AIHomeSuggestion[]> => {
    try {
        const prompt = `You are a proactive AI travel assistant. Based on the user's profile and their saved trips, generate exactly 2 personalized and actionable "next step" suggestions for their home dashboard. The suggestions should be diverse and encourage exploration of the app's features.

        **User Profile:**
        - Favorite Destinations/Interests: ${userProfile.favoriteDestinations.join(', ') || 'None'}
        - Budget level: ${userProfile.budget.hotelMaxPrice ? 'Mid-range to Luxury' : 'Budget-conscious'}

        **Saved Trips:**
        ${savedTrips.length > 0 ? savedTrips.map(t => `- ${t.name}`).join('\n') : 'No saved trips yet.'}

        **Example Suggestions:**
        - If they have no trips, suggest they use the 'Inspire' tab.
        - If they have a saved search, suggest they build an itinerary for it in the 'Planner'.
        - If they have an itinerary, suggest they find a 'Travel Buddy' for it.
        - If they have mentioned an interest in food, suggest they explore 'Super Services' for their next trip.

        Generate the suggestions now.`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: aiHomeSuggestionsSchema,
            },
        });
        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.suggestions as AIHomeSuggestion[];
    } catch (error) {
        throw handleGeminiError(error, "Could not generate home suggestions at this time.");
    }
};

export const getQASummary = async (question: string, answers: string[]): Promise<string> => {
    try {
        if (answers.length === 0) {
            return "No answers available to summarize.";
        }
        const prompt = `You are an AI assistant that summarizes community discussions.
        Analyze the following travel-related question and the answers provided by the community.
        Provide a concise, helpful summary that synthesizes the key points from the answers. The summary should directly address the user's question.

        **Question:**
        "${question}"

        **Community Answers:**
        ${answers.map(a => `- "${a}"`).join('\n')}

        **Your Summary:**`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const summary = response.text.trim();
        if (!summary) {
            throw new Error("The AI returned an empty summary.");
        }
        return summary;
    } catch (error) {
        throw handleGeminiError(error, "Could not generate a summary for the Q&A.");
    }
};

export const getFlightStatus = async (flightNumber: string): Promise<FlightStatus> => {
    try {
        const prompt = `You are a sophisticated flight tracking data aggregator. Your task is to provide a complete, realistic, real-time flight status report for the flight number: "${flightNumber}".
        Simulate data as if you are fetching it from multiple sources like FlightAware, FlightRadar24, and the airline's own API.
        
        CRITICAL INSTRUCTIONS:
        - The current date is ${new Date().toISOString()}. All scheduled and actual times should be realistic relative to this date.
        - Generate all fields in the provided schema, including realistic latitude/longitude for airports, and if the flight is 'En Route', provide a plausible live position.
        - **Waypoints**: If the flight status is 'En Route', you MUST generate a 'waypoints' array containing 5-7 intermediate geographical points along the great-circle path from departure to arrival. Each waypoint must have a realistic latitude, longitude, an estimated time of arrival (ETA) in ISO 8601 format, and its corresponding flight progress percentage. If the status is NOT 'En Route', this array MUST be empty.
        - The 'aiSummary' must be a human-friendly, concise summary of the flight's current situation.
        - If the flight is delayed, the summary should explain the reason (e.g., weather, technical issue).
        - If the flight is cancelled, provide a plausible reason in the summary.
        - Ensure airport names, IATA codes, and city names are accurate.
        `;
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: flightStatusSchema,
            },
        });
        const jsonStr = result.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed as FlightStatus;

    } catch (error) {
        throw handleGeminiError(error, `Could not find real-time data for flight ${flightNumber}. Please check the flight number and try again.`);
    }
};