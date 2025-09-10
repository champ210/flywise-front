


import { GoogleGenAI, Type } from "@google/genai";
// FIX: Changed import from TravelStory to WandergramPost to match the type of data being passed from the SocialFeed component.
// FIX: Add TravelTrend type to imports
import { Flight, Stay, Car, ApiParams, ItineraryPlan, Checklist, DailyPlan, MapMarker, TravelInsuranceQuote, NearbyAttraction, ChatMessage, UserProfile, SavedTrip, SearchResult, WeatherForecast, ItinerarySnippet, TravelBuddyPreferences, TravelBuddyProfile, AlternativeSuggestion, LocalVibe, GroundingSource, VibeSearchResult, DestinationSuggestion, RealTimeSuggestion, GamificationProfile, AIVoyageMission, SuperServiceData, TripMemory, SocialPostSuggestion, LocalProfile, HangoutSuggestion, CoworkingSpace, Badge, BudgetOptimizationSuggestion, AIHomeSuggestion, FlightStatus, SocialReel, AIDiscoveryData, WandergramPost, TravelTrend } from '../../types';

// The GoogleGenAI constructor will now throw an error if API_key is not set, which is the correct behavior.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * A helper function to add retry logic with exponential backoff for API calls.
 * This is specifically for handling 429 "RESOURCE_EXHAUSTED" errors from the Gemini API.
 * @param apiCall The function that makes the API call.
 * @param maxRetries The maximum number of times to retry.
 * @param initialDelay The initial delay in milliseconds.
 * @returns The result of the API call.
 */
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 2, initialDelay = 1000): Promise<T> => {
    let retries = 0;
    while (true) {
        try {
            return await apiCall();
        } catch (error: unknown) {
            // Check if it's a rate limit error based on Gemini SDK's error structure or standard Error messages.
            const isRateLimitError = (
                (typeof error === 'object' && error !== null && 'error' in error && ((error as any).error.status === 'RESOURCE_EXHAUSTED' || (error as any).error.code === 429)) ||
                (error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")))
            );

            if (isRateLimitError && retries < maxRetries) {
                retries++;
                const delay = initialDelay * Math.pow(2, retries - 1); // e.g., 1000ms, 2000ms
                console.warn(`Rate limit exceeded. Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // For non-rate-limit errors or if max retries are exceeded, re-throw the original error to be handled by handleApiError.
                throw error;
            }
        }
    }
};


/**
 * A centralized utility to handle API errors and provide user-friendly messages.
 * This is designed to work with both the Gemini SDK and standard fetch API calls (like to a Xano backend).
 * @param error The error object caught from the API call.
 * @param defaultMessage A default error message to use as a fallback.
 * @returns An Error object with a user-friendly message.
 */
const handleApiError = (error: unknown, defaultMessage: string): Error => {
    console.error("API/Service Error:", error);

    // Handle network errors from fetch (e.g., offline, CORS, DNS issues)
    // This is crucial for a good offline experience and for handling real backend calls to services like Xano.
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return new Error("A network error occurred. Please check your internet connection and try again.");
    }
    
    // The Gemini SDK can throw a non-standard error object on API failure.
    // This block also handles potential error structures from a Xano backend.
    if (typeof error === 'object' && error !== null && 'error' in error) {
        const nestedError = (error as any).error;
        if (typeof nestedError === 'object' && nestedError !== null) {
            switch(nestedError.status || nestedError.code) {
                case 'INVALID_ARGUMENT':
                case 400:
                    return new Error("The request was invalid. Please check the data you provided and try again.");
                case 'PERMISSION_DENIED':
                case 403:
                    return new Error("You do not have permission for this action. Please check your API key's permissions.");
                case 'RESOURCE_EXHAUSTED':
                case 429:
                    return new Error("You've made too many requests. Please wait a moment before trying again.");
                case 'INTERNAL':
                case 500:
                    return new Error("A server error occurred. We've been notified and are looking into it. Please try again later.");
                default:
                    // Fall through for other specific errors
                    break;
            }
            if (nestedError.message?.includes("API key not valid")) {
                 return new Error("Your API key is invalid or not configured correctly. Please check your setup.");
            }
        }
    }

    // Fallback to checking the message of a standard Error object
    if (error instanceof Error) {
        if (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
            return new Error("You've exceeded the request limit for today. Please try again tomorrow.");
        }
        if (error.message.includes("API key not valid")) {
             return new Error("Your API key is invalid or not configured correctly. Please check your setup.");
        }
    }
    
    // Return a generic default message if no specific case was matched.
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

// Schema for itinerary snippet.
const itinerarySnippetSchema = {
    type: Type.OBJECT,
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
            description: "A string of 5-7 relevant hashtags, separated by spaces, e.g., '#travel #kyoto #japan #travelgram'."
        }
    },
    required: ["caption", "hashtags"]
};

const socialReelSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, catchy, and engaging title for the social media reel (max 8 words)." },
        musicSuggestion: { type: Type.STRING, description: "A suggestion for a background music track or genre that fits the vibe of the images and trip, e.g., 'Upbeat indie pop like 'Good Days' by SZA' or 'Cinematic orchestral score'." },
        sceneTexts: {
            type: Type.ARRAY,
            description: "An array of short, punchy text overlays, one for each image provided. The array must have the same number of strings as the number of images in the prompt.",
            items: { type: Type.STRING, description: "Text overlay for one scene (max 10 words)." }
        },
        socialPost: {
            type: Type.OBJECT,
            properties: {
                caption: { type: Type.STRING, description: "A short, engaging caption for the social media post, summarizing the trip. It should be written in a personal, first-person tone. Use emojis where appropriate." },
                hashtags: { type: Type.STRING, description: "A string of 5-7 relevant hashtags, separated by spaces, e.g., '#travel #adventure #kyoto #japan #travelgram'." }
            },
            required: ["caption", "hashtags"]
        }
    },
    required: ["title", "musicSuggestion", "sceneTexts", "socialPost"]
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

const storySummarySchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A catchy, one-sentence summary for a social media feed post. Include emojis. Example: 'An unforgettable week-long cultural immersion in Kyoto, Japan 🏯🍣'."
        },
        estimatedCost: {
            type: Type.NUMBER,
            description: "A realistic estimated total cost for one person for this trip, in USD. Base it on the description and common travel costs for the location."
        },
        tags: {
            type: Type.ARRAY,
            description: "An array of 3-5 relevant tags for the trip. Examples: 'budget-travel', 'luxury', 'adventure', 'foodie', 'cultural-immersion', 'solo-travel'.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["summary", "estimatedCost", "tags"]
};

// Schema for AI Discovery Layer
const aiDiscoverySchema = {
    type: Type.OBJECT,
    properties: {
        trendingDestinations: {
            type: Type.ARRAY,
            description: "An array of 3-4 trending travel destinations based on engagement and recency. For each, provide a compelling reason and pick a representative image URL from one of the posts.",
            items: {
                type: Type.OBJECT,
                properties: {
                    destination: { type: Type.STRING, description: "The name of the destination, e.g., 'Kyoto, Japan'." },
                    image: { type: Type.STRING, description: "The URL of a high-quality image from one of the stories about this destination." },
                    reason: { type: Type.STRING, description: "A short, catchy reason why this destination is trending." }
                },
                required: ["destination", "image", "reason"]
            }
        },
        hiddenGems: {
            type: Type.ARRAY,
            description: "An array of 2-3 story IDs for 'hidden gems' - posts about less common destinations that have high engagement.",
            items: { type: Type.STRING }
        },
        recommendations: {
            type: Type.ARRAY,
            description: "An array of 2-3 story IDs for posts that are a great personal match for the user, based on their profile.",
            items: { type: Type.STRING }
        }
    },
    required: ["trendingDestinations", "hiddenGems", "recommendations"]
};

// FIX: Add schema for Travel Trends
// Schema for Travel Trend Radar
const travelTrendsSchema = {
    type: Type.OBJECT,
    properties: {
        trends: {
            type: Type.ARRAY,
            description: "An array of 5-8 fictional but realistic and diverse travel trends.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    destination: { type: Type.STRING },
                    image: { type: Type.STRING, description: "URL to a stunning, license-free photo." },
                    category: { type: Type.STRING, enum: ['Adventure', 'City Break', 'Relaxation', 'Cultural', 'Hidden Gem'] },
                    trendScore: { type: Type.NUMBER, description: "A score from 0-100 indicating current popularity." },
                    monthlyGrowth: { type: Type.NUMBER, description: "Percentage growth in interest over the last month." },
                    socialProof: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING, enum: ['TikTok', 'Instagram', 'Booking', 'FlyWise'] },
                                value: { type: Type.STRING, description: "e.g., '2.1M views', '8.9/10 rating', 'Trending Topic'" }
                            },
                            required: ["platform", "value"]
                        }
                    },
                    personalizationReason: { type: Type.STRING, description: "A short, one-sentence reason why this trend is a good match for the user's profile." }
                },
                required: ["id", "destination", "image", "category", "trendScore", "monthlyGrowth", "socialProof", "personalizationReason"]
            }
        }
    },
    required: ["trends"]
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
        return await withRetry(async () => {
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
                            if (r.type === 'flight') return `Flight ${r.airline} ${r.flightNumber} to ${r.arrival} for $${r.price}`;
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
        });
    } catch (error) {
        throw handleApiError(error, "Could not understand your request. Please try rephrasing it.");
    }
};

/**
 * Generates a friendly, one-sentence summary of the search results.
 * @param results The array of search results from the backend.
 * @returns A promise that resolves to a summary string.
 */
// FIX: Exporting all missing functions to resolve import errors.
export const generateSearchSummary = async (results: SearchResult[]): Promise<string> => {
    if (results.length === 0) {
        return "I couldn't find any results for your search. Would you like to try different criteria?";
    }
    const prompt = `Based on the following search results, generate a friendly, one-sentence summary. Mention the number of flights, hotels, or cars found. Results: ${JSON.stringify(results.slice(0, 5))}`;

    try {
        return await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return response.text;
        });
    } catch (error) {
        throw handleApiError(error, "I'm having trouble summarizing the results right now.");
    }
};

export const getItinerarySnippet = async (params: { destination?: string, interests?: string }): Promise<ItinerarySnippet> => {
    const prompt = `Generate 2-4 diverse activity suggestions for a trip to ${params.destination} with interests in ${params.interests}.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: itinerarySnippetSchema,
                },
            });

            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as ItinerarySnippet;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate itinerary suggestions.");
    }
};

export const getAlternativeSuggestions = async (chatHistory: ChatMessage[], profile: UserProfile): Promise<AlternativeSuggestion[]> => {
    const lastUserMessage = chatHistory.filter(m => m.sender === 'user').pop();
    if (!lastUserMessage) return [];

    const prompt = `The user is searching for a trip. Their last message was "${lastUserMessage.text}". Their favorite destinations are ${profile.favoriteDestinations.join(', ')}. Based on this, suggest up to 3 alternative destinations. The last search results (if any) are in the chat history.`;
    const fullHistory = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `${fullHistory}\n\n${prompt}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: alternativeSuggestionsSchema,
                },
            });

            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.suggestions || []) as AlternativeSuggestion[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not get alternative suggestions.");
    }
};

export const getRealTimeSuggestions = async (chatHistory: ChatMessage[], profile: UserProfile, itinerary: ItineraryPlan, currentLocation: { lat: number, lng: number }): Promise<RealTimeSuggestion[]> => {
    const prompt = `A user's plans have been disrupted. Their last message was: "${chatHistory[chatHistory.length-1].text}". Their current itinerary is for ${itinerary.destination} and their current (mock) location is near ${currentLocation.lat}, ${currentLocation.lng}. Using Google Search grounding, suggest 2-3 real-world alternative activities nearby that they could do instead.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: realTimeSuggestionsSchema,
                    tools: [{ googleSearch: {} }]
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.suggestions || []) as RealTimeSuggestion[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not get real-time suggestions.");
    }
};

export const getItinerary = async (destination: string, duration: number, interests: string, budget?: number): Promise<ItineraryPlan> => {
    const prompt = `Create a detailed ${duration}-day travel itinerary for a trip to ${destination}. The traveler is interested in: ${interests}. ${budget ? `Their total budget is around $${budget} USD.` : ''} For each activity, find a real-world location with a specific name and full address. Also provide cultural tips and a budget breakdown.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: itinerarySchema,
                },
            });
            const jsonStr = result.text.trim();
            const plan = JSON.parse(jsonStr) as ItineraryPlan;
            plan.interests = interests; // Add interests to the plan for later use
            return plan;
        });
    } catch (error) {
        throw handleApiError(error, "Failed to generate itinerary. The AI may be busy, or the request might be too complex. Try simplifying your interests.");
    }
};

export const getBudgetOptimizations = async (plan: ItineraryPlan): Promise<BudgetOptimizationSuggestion[]> => {
    const prompt = `Analyze this travel itinerary for ${plan.destination} and suggest 2-4 actionable ways to save money without sacrificing the experience. Original Itinerary: ${JSON.stringify(plan)}`;
    try {
        return await withRetry(async () => {
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
            return (parsed.optimizations || []) as BudgetOptimizationSuggestion[];
        });
    } catch (error) {
        throw handleApiError(error, "Failed to analyze budget optimizations.");
    }
};

export const getTravelChecklist = async (itinerary: ItineraryPlan): Promise<Checklist> => {
    const prompt = `Generate a comprehensive travel checklist for a trip to ${itinerary.destination}. Include a packing list, essential documents (with real source links for visa info if applicable, using Google Search), and local essentials specific to the destination.`;

    const checklistSchema = {
        type: Type.OBJECT,
        properties: {
            packingList: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, checked: { type: Type.BOOLEAN } } } },
            documents: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, checked: { type: Type.BOOLEAN } } } }, sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { uri: { type: Type.STRING }, title: { type: Type.STRING } } } } } },
            localEssentials: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, checked: { type: Type.BOOLEAN } } } }
        },
        required: ["packingList", "documents", "localEssentials"]
    };

    try {
        return await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            // A second call to structure the grounded data
            const structurePrompt = `Based on the following information, create a structured checklist object. Information: ${response.text}`;
            const structuredResult = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: structurePrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: checklistSchema,
                }
            });
            
            const checklist = JSON.parse(structuredResult.text) as Checklist;
            // Add grounding metadata to the documents section
// FIX: Return the generated checklist object to satisfy the function's return type.
            if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                checklist.documents.sources = response.candidates[0].groundingMetadata.groundingChunks.map(
                    (chunk: any) => ({
                        uri: chunk.web?.uri || '',
                        title: chunk.web?.title || '',
                    })
                );
            }
            return checklist;
        });
    } catch (error) {
        throw handleApiError(error, "Failed to generate a travel checklist.");
    }
};

// FIX: Add all missing function exports to resolve module resolution errors.

// Schema for map coordinates
const mapCoordinatesSchema = {
    type: Type.OBJECT,
    properties: {
        markers: {
            type: Type.ARRAY,
            description: "An array of map markers, one for each activity in the itinerary.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The specific location name of the activity." },
                    lat: { type: Type.NUMBER, description: "The latitude of the location." },
                    lng: { type: Type.NUMBER, description: "The longitude of the location." },
                    day: { type: Type.INTEGER, description: "The day of the itinerary this activity is on." },
                    timeOfDay: { type: Type.STRING, enum: ['Morning', 'Afternoon', 'Evening'], description: "The time of day for the activity." },
                    activity: { type: Type.STRING, description: "A brief description of the activity." }
                },
                required: ["name", "lat", "lng", "day", "timeOfDay", "activity"]
            }
        }
    },
    required: ["markers"]
};

export const getCoordinatesForActivities = async (itinerary: DailyPlan[]): Promise<MapMarker[]> => {
    const activities = itinerary.flatMap(day => [
        { ...day.morning, day: day.day, timeOfDay: 'Morning' as const, activity: day.morning.description, name: day.morning.locationName },
        { ...day.afternoon, day: day.day, timeOfDay: 'Afternoon' as const, activity: day.afternoon.description, name: day.afternoon.locationName },
        { ...day.evening, day: day.day, timeOfDay: 'Evening' as const, activity: day.evening.description, name: day.evening.locationName },
    ]);
    const prompt = `For the following list of locations and activities, find the geographic coordinates (latitude and longitude) for each one.
    Activities: ${JSON.stringify(activities.map(a => ({ name: a.name, address: a.address })))}`;

    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: mapCoordinatesSchema,
                    tools: [{ googleSearch: {} }]
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.markers || []) as MapMarker[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not retrieve coordinates for the itinerary locations.");
    }
};

export const getWeatherForecast = async (destination: string, days: number): Promise<WeatherForecast> => {
    const prompt = `Provide a realistic, but fictional, ${days}-day weather forecast for ${destination}. Today is ${new Date().toLocaleDateString()}.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: weatherForecastSchema,
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.forecast || []) as WeatherForecast;
        });
    } catch (error) {
        throw handleApiError(error, "Could not fetch weather forecast.");
    }
};

export const getInsuranceQuotes = async (itinerary: ItineraryPlan): Promise<TravelInsuranceQuote[]> => {
    const prompt = `Generate 3-4 fictional but realistic travel insurance quotes for a ${itinerary.itinerary.length}-day trip to ${itinerary.destination}. The traveler's interests include ${itinerary.interests}.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: insuranceQuotesSchema,
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.quotes || []) as TravelInsuranceQuote[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate insurance quotes.");
    }
};

export const getNearbyAttractions = async (stayName: string, location: string): Promise<NearbyAttraction[]> => {
    const prompt = `List 3-5 interesting attractions or points of interest near ${stayName} in ${location}.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: nearbyAttractionsSchema,
                    tools: [{ googleSearch: {} }]
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.attractions || []) as NearbyAttraction[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not find nearby attractions.");
    }
};

// Schema for local vibe
const localVibeSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "A detailed, one-paragraph description of the local vibe and atmosphere, especially concerning safety and activity at night. Use a reassuring and informative tone." },
    },
    required: ["description"]
};

export const getLocalVibe = async (stayName: string, location: string): Promise<LocalVibe> => {
    const prompt = `Analyze the local vibe for the area around "${stayName}" in "${location}". Focus on the atmosphere at night, walkability, safety, and what kind of activities (e.g., quiet residential, bustling nightlife, etc.) are common in the evening. Use Google Search grounding for real-world context.`;
    try {
        return await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const structurePrompt = `Based on the following information, generate a structured local vibe object: ${response.text}`;
            const structuredResult = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: structurePrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: localVibeSchema,
                }
            });

            const vibe = JSON.parse(structuredResult.text) as LocalVibe;
            if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                vibe.sources = response.candidates[0].groundingMetadata.groundingChunks.map(
                    (chunk: any) => ({
                        uri: chunk.web?.uri || '',
                        title: chunk.web?.title || '',
                    })
                ).filter((s: GroundingSource) => s.uri);
            }
            return vibe;
        });
    } catch (error) {
        throw handleApiError(error, "Could not analyze the local vibe.");
    }
};

export const generateDestinationImages = async (destination: string, duration: number, interests: string, budget?: number): Promise<string[]> => {
    const prompt = `Generate a set of 4 stunning, photorealistic images representing a trip to ${destination} for ${duration} days, with interests in ${interests}. ${budget ? `The trip has a budget of around $${budget}.` : ''} The images should evoke a sense of adventure, culture, and relaxation.`;
    try {
        return await withRetry(async () => {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 4,
                    outputMimeType: 'image/jpeg',
                },
            });

            return response.generatedImages.map(img => img.image.imageBytes);
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate destination images.");
    }
};

export const generateTravelBuddyProfile = async (preferences: TravelBuddyPreferences, userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<TravelBuddyProfile> => {
    const prompt = `Create a fictional travel buddy profile that matches the following user preferences. The buddy should be compatible with a user who likes ${userProfile.favoriteDestinations.join(', ')} and has a budget of ${userProfile.budget.hotelMaxPrice ? `$${userProfile.budget.hotelMaxPrice}/night` : 'any'}.
    Preferences: ${JSON.stringify(preferences)}`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: travelBuddyProfileSchema,
                },
            });
            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as TravelBuddyProfile;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate a travel buddy profile.");
    }
};

export const generateJointItinerary = async (userProfile: UserProfile, buddyProfile: TravelBuddyProfile, destination: string, duration: number): Promise<ItineraryPlan> => {
    const prompt = `Create a joint travel itinerary for two people: User and a Buddy. The itinerary should be for a ${duration}-day trip to ${destination}. It must balance the interests of both.
    User's Interests: ${userProfile.favoriteDestinations.join(', ')}, hotel budget up to $${userProfile.budget.hotelMaxPrice}.
    Buddy's Profile: ${JSON.stringify(buddyProfile)}.
    Generate a detailed itinerary with activities that both would enjoy.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: itinerarySchema,
                },
            });
            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as ItineraryPlan;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate a joint itinerary.");
    }
};

export const chatWithTravelBuddy = async (chatHistory: ChatMessage[], userProfile: UserProfile, buddyProfile: TravelBuddyProfile, itinerary: ItineraryPlan): Promise<string> => {
    const formattedHistory = chatHistory.map(m => `${m.sender === 'user' ? 'You' : buddyProfile.name}: ${m.text}`).join('\n');
    const prompt = `You are roleplaying as ${buddyProfile.name}, a travel buddy. Your personality is defined by: ${JSON.stringify(buddyProfile)}. You are chatting with a user about your upcoming joint trip to ${itinerary.destination}.
    Here is the conversation so far:
    ${formattedHistory}
    
    Now, provide a natural, in-character response to the user's last message.`;
    try {
        return await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return response.text;
        });
    } catch (error) {
        throw handleApiError(error, "The travel buddy is currently unavailable.");
    }
};

export const generateBuddyProfilePicture = async (buddyProfile: TravelBuddyProfile): Promise<string> => {
    const prompt = `Generate a realistic, license-free, high-quality profile picture for a travel buddy.
    Name: ${buddyProfile.name}
    Age: ${buddyProfile.age}
    Gender: ${buddyProfile.gender}
    Bio: ${buddyProfile.bio}
    The style should be a natural, friendly portrait of a traveler.`;
    try {
        return await withRetry(async () => {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });
            return response.generatedImages[0].image.imageBytes;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate a profile picture.");
    }
};

export const generateTripMemory = async (itinerary: ItineraryPlan): Promise<Omit<TripMemory, 'tripId'>> => {
    const prompt = `Based on the following travel itinerary for a trip to ${itinerary.destination}, create a "Trip Memory" object. This should include a catchy title, a warm narrative summary, creative key statistics, a music theme, and map route coordinates.
    Itinerary: ${JSON.stringify(itinerary)}`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: tripMemorySchema,
                },
            });
            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as Omit<TripMemory, 'tripId'>;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate the trip memory.");
    }
};

export const generateVibeSearchIdeas = async (vibe: string): Promise<VibeSearchResult> => {
    const prompt = `A user wants to find travel destinations based on a vibe.
    Vibe description: "${vibe}"
    First, generate a diverse set of 4 stunning, photorealistic images that capture this vibe.
    Second, suggest 3 real-world travel destinations that perfectly match the vibe, with a compelling one-sentence reason for each.`;
    try {
        return await withRetry(async () => {
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `A stunning, photorealistic image that captures the vibe of: "${vibe}"`,
                config: {
                    numberOfImages: 4,
                    outputMimeType: 'image/jpeg',
                },
            });
            const images = imageResponse.generatedImages.map(img => img.image.imageBytes);

            const textResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: destinationSuggestionsSchema,
                },
            });
            const jsonStr = textResponse.text.trim();
            const destinations = (JSON.parse(jsonStr) as { destinations: DestinationSuggestion[] }).destinations;

            return { images, destinations };
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate vibe search ideas.");
    }
};

export const getAILocalMatches = async (location: string, userProfile: UserProfile, matchType: 'stay' | 'hangout'): Promise<LocalProfile[]> => {
    const prompt = `A user is looking for a local ${matchType} in ${location}. Generate a list of 5-8 fictional but realistic and diverse local profiles that would be a good match for the user.
    User Profile: ${JSON.stringify(userProfile)}`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: homeShareHostSchema,
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            // Add the profileType to each host
            const hosts = (parsed.hosts || []).map((h: any) => ({ ...h, profileType: matchType }));
            return hosts as LocalProfile[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not find local matches.");
    }
};

// Schema for Hangout suggestions
const hangoutSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of 2-3 creative and personalized hangout suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy title for the hangout idea." },
                    description: { type: Type.STRING, description: "A one-sentence description of the activity." },
                    location: { type: Type.STRING, description: "A specific, real-world location for the hangout." },
                    estimatedCost: { type: Type.STRING, description: "e.g., 'Free', '$10-20', etc." },
                },
                required: ["title", "description", "location", "estimatedCost"]
            }
        }
    },
    required: ["suggestions"]
};

export const getHangoutSuggestions = async (userProfile: UserProfile, localProfile: LocalProfile): Promise<HangoutSuggestion[]> => {
    const prompt = `Generate 2-3 creative and personalized hangout suggestions for a user and a local. The suggestions should combine the interests of both people.
    User's Interests: ${userProfile.favoriteDestinations.join(', ')} (can be used to infer general interests).
    Local's Profile: ${JSON.stringify(localProfile)}`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: hangoutSuggestionsSchema,
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.suggestions || []) as HangoutSuggestion[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate hangout suggestions.");
    }
};

export const getAIVoyageMissions = async (profile: GamificationProfile): Promise<AIVoyageMission[]> => {
    const prompt = `Based on the user's gamification profile, suggest exactly 3 new, personalized "Voyage Missions". The missions should be creative and encourage travel or use of the app's features. The user has already earned these badges: ${profile.earnedBadgeIds.join(', ')}.
    User Profile: ${JSON.stringify(profile)}`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: voyageMissionsSchema,
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.missions || []) as AIVoyageMission[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate new voyage missions.");
    }
};

export const getSuperServiceData = async (location: string, userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<SuperServiceData> => {
    const lastTrip = savedTrips.find(t => t.type === 'itinerary');
    const prompt = `Generate a comprehensive set of super service data for a user currently in ${location}.
    - List popular, real-world food and ride apps for this city.
    - Create a list of 8-12 diverse, fictional but realistic restaurants available for delivery, ensuring the provider matches one of the listed apps.
    - Based on the user's profile, provide 2-3 personalized food suggestions.
    - If the user has a saved itinerary, suggest a ride to the next logical destination.
    - Create one creative "smart combo" deal.
    User Profile: ${JSON.stringify(userProfile)}
    Most recent itinerary (if available): ${lastTrip ? JSON.stringify(lastTrip.data) : 'None'}`;

    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: superServiceDataSchema,
                },
            });
            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as SuperServiceData;
        });
    } catch (error) {
        throw handleApiError(error, "Could not fetch local services data.");
    }
};

export const generateSocialPostSuggestion = async (memory: TripMemory): Promise<SocialPostSuggestion> => {
    const prompt = `Based on this trip memory, generate a short, engaging social media caption and a set of relevant hashtags.
    Memory: ${JSON.stringify(memory)}`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: socialPostSuggestionSchema,
                },
            });
            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as SocialPostSuggestion;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate social post suggestion.");
    }
};

export const getQASummary = async (question: string, answers: string[]): Promise<string> => {
    const prompt = `Summarize the following answers to the question: "${question}". Combine the key points from the answers into a single, helpful paragraph.
    Answers:
    ${answers.map(a => `- ${a}`).join('\n')}`;
    try {
        return await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return response.text;
        });
    } catch (error) {
        throw handleApiError(error, "Could not summarize the answers.");
    }
};

export const getCoworkingSpaces = async (location: string, userProfile: UserProfile): Promise<CoworkingSpace[]> => {
    const prompt = `Generate a list of 5-8 fictional but realistic coworking spaces in ${location}. Include AI insights that might appeal to a user with these preferences: ${JSON.stringify(userProfile)}`;
    try {
        return await withRetry(async () => {
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
            // Simulate lat/lng for map view
            return (parsed.spaces || []).map((space: CoworkingSpace, index: number) => ({
                ...space,
                lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Mock data around NYC
                lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            })) as CoworkingSpace[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not find coworking spaces.");
    }
};

export const getAIHomeSuggestions = async (userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<AIHomeSuggestion[]> => {
    const prompt = `Based on the user's profile and their saved trips, generate exactly 2 personalized "next step" suggestions to display on their home dashboard.
    User Profile: ${JSON.stringify(userProfile)}
    Saved Trips: ${JSON.stringify(savedTrips.slice(0, 3).map(t => t.name))}`;
    try {
        return await withRetry(async () => {
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
            return (parsed.suggestions || []) as AIHomeSuggestion[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate home suggestions.");
    }
};

export const getFlightStatus = async (flightNumber: string): Promise<FlightStatus> => {
    const prompt = `Generate a realistic but fictional, detailed, real-time flight status object for flight number ${flightNumber}. The flight should be between two major international airports. If the flight is "En Route", include a live position and a series of waypoints along a great-circle path. Include a helpful AI summary. Today's date is ${new Date().toISOString()}.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: flightStatusSchema,
                },
            });
            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as FlightStatus;
        });
    } catch (error) {
        throw handleApiError(error, "Could not retrieve flight status.");
    }
};

// FIX: Updated function to accept WandergramPost[] and adjusted prompt and data mapping accordingly.
export const getAIDiscoverySuggestions = async (posts: WandergramPost[], userProfile: UserProfile): Promise<AIDiscoveryData> => {
    const prompt = `You are a sophisticated AI travel analyst for a social travel app called FlyWise. Your task is to analyze all available Wandergram posts and a user's profile to generate personalized discovery suggestions.

    **User Profile for Personalization:**
    - Favorite Destinations: ${userProfile.favoriteDestinations.join(', ') || 'None specified'}
    - Budget: Max hotel price per night is around $${userProfile.budget.hotelMaxPrice || 'any'}.
    - Interests (inferred from favorites): General sightseeing, culture.

    **All Available Wandergram Posts (JSON format):**
    ${JSON.stringify(posts.map(p => ({id: p.id, user: p.user.name, caption: p.caption, location: p.location, likes: p.likes, createdAt: p.createdAt, imageUrl: p.imageUrl})))}

    **Your Task:**
    Based on the user profile and the provided posts, generate the following curated lists:
    1.  **Trending Destinations:** Identify 3-4 destinations that are currently popular. Consider a combination of high 'likes', recent 'createdAt' dates, and multiple posts about the same location. Pick a representative image from one of the posts.
    2.  **Hidden Gems:** Identify 2-3 post IDs for posts about unique or less-common destinations that still have high engagement (good like count). These are places off the beaten path.
    3.  **For You (Recommendations):** Identify 2-3 post IDs for posts that are a strong match for the user's personal preferences (favorite destinations, budget).

    Return the results in the specified JSON format.`;

    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: aiDiscoverySchema,
                },
            });
            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as AIDiscoveryData;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate AI discovery suggestions.");
    }
};

// FIX: Add getTravelTrends function
export const getTravelTrends = async (userProfile: UserProfile): Promise<TravelTrend[]> => {
    const prompt = `Generate a list of 5-8 diverse and personalized travel trends for a user with these preferences: favorite destinations are ${JSON.stringify(userProfile.favoriteDestinations)} and a general travel budget. For each trend, provide a compelling personalization reason tailored to them.`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: travelTrendsSchema,
                },
            });
            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            return (parsed.trends || []) as TravelTrend[];
        });
    } catch (error) {
        throw handleApiError(error, "Could not fetch travel trends at this time.");
    }
};

export const generateSocialReel = async (itinerary: ItineraryPlan, images: { mimeType: string, dataUrl: string }[]): Promise<SocialReel> => {
    const prompt = `Given an itinerary for a trip to ${itinerary.destination} and a set of user-provided images, generate a social media reel. This includes a catchy title, a music suggestion, a short text overlay for each image (the number of text overlays must match the number of images), and a social media post with a caption and hashtags.
    Itinerary Details: ${itinerary.interests}, for ${itinerary.itinerary.length} days.
    Number of images provided: ${images.length}`;

    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: socialReelSchema,
                },
            });

            const jsonStr = result.text.trim();
            const parsed = JSON.parse(jsonStr);
            // We need to combine the generated text with the user's images.
            const reel: SocialReel = {
                tripId: '', // Will be set later
                title: parsed.title,
                musicSuggestion: parsed.musicSuggestion,
                socialPost: parsed.socialPost,
                scenes: images.map((img, index) => ({
                    imageUrl: img.dataUrl,
                    overlayText: parsed.sceneTexts[index] || `Scene ${index + 1}`,
                })),
            };
            return reel;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate social reel.");
    }
};

export const generateHangoutRequestMessage = async (userProfile: UserProfile, localProfile: LocalProfile, suggestion: HangoutSuggestion): Promise<string> => {
    const prompt = `Generate a friendly, casual, and polite icebreaker message from a user to a local to request a hangout. The message should sound natural and reference a shared interest if possible.
    User Profile: ${JSON.stringify(userProfile)}
    Local's Profile: ${JSON.stringify(localProfile)}
    Suggested Hangout: ${JSON.stringify(suggestion)}`;
    try {
        return await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return response.text;
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate an icebreaker message.");
    }
};

export const generateStorySummary = async (title: string, content: string): Promise<{ summary: string; estimatedCost: number; tags: string[] }> => {
    const prompt = `Based on the following travel story, generate a catchy one-sentence summary for social media (with emojis), a realistic estimated total cost in USD for one person, and 3-5 relevant tags.
    Title: ${title}
    Content: ${content}`;
    try {
        return await withRetry(async () => {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: storySummarySchema,
                },
            });
            const jsonStr = result.text.trim();
            return JSON.parse(jsonStr) as { summary: string; estimatedCost: number; tags: string[] };
        });
    } catch (error) {
        throw handleApiError(error, "Could not generate a summary for this story.");
    }
};

export const chatAboutImage = async (base64Image: string, mimeType: string, question: string): Promise<string> => {
    const prompt = "You are a helpful and knowledgeable travel assistant. A user has provided an image and is asking a question about it. Provide a concise and informative answer based on the visual information. If you cannot determine the answer from the image, say so politely. Do not invent information. User's question: " + question;
    
    try {
        return await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: {
                    parts: [
                        { inlineData: { data: base64Image, mimeType: mimeType } },
                        { text: prompt }
                    ]
                },
            });
            return response.text;
        });
    } catch (error) {
        throw handleApiError(error, "I'm having trouble analyzing the image right now. Please try again later.");
    }
};