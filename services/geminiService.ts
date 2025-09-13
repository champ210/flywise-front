import { GoogleGenAI, Type, GenerateContentResponse, GenerateImagesResponse } from "@google/genai";
import { Flight, Stay, Car, ApiParams, ItineraryPlan, Checklist, DailyPlan, MapMarker, TravelInsuranceQuote, NearbyAttraction, ChatMessage, UserProfile, SavedTrip, SearchResult, WeatherForecast, ItinerarySnippet, TravelBuddyPreferences, TravelBuddyProfile, AlternativeSuggestion, LocalVibe, GroundingSource, VibeSearchResult, DestinationSuggestion, RealTimeSuggestion, GamificationProfile, AIVoyageMission, SuperServiceData, TripMemory, SocialPostSuggestion, LocalProfile, HangoutSuggestion, CoworkingSpace, Badge, BudgetOptimizationSuggestion, AIHomeSuggestion, FlightStatus, SocialReel, AIDiscoveryData, WandergramPost, TravelTrend, DocumentScanResult, TranslationResult, GroupTripPoll, TripIdea } from '../types';

let ai: GoogleGenAI | null = null;

// Hardcoded API key for a build-less environment.
const API_KEY = "AIzaSyDGd9WnVLOE5pB6RQu19dEdgHBUwNi0ul0";

const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    if (!API_KEY) {
        throw new Error("Configuration Error: GEMINI_API_KEY is not configured.");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
};


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
        // This will catch the "Configuration Error: GEMINI_API_KEY is not available" from our lazy loader.
        if (error.message.includes("Configuration Error")) {
            return error;
        }
    }
    
    // Return a generic default message if no specific case was matched.
    return new Error(defaultMessage);
};

// ... Schemas remain the same ...

const documentScanSchema = {
    type: Type.OBJECT,
    properties: {
        documentType: { type: Type.STRING, enum: ['Flight Itinerary', 'Hotel Confirmation', 'Rental Car', 'Other'] },
        confirmationNumber: { type: Type.STRING },
        passengerName: { type: Type.STRING },
        details: {
            type: Type.OBJECT,
            description: "An object containing key-value pairs of all other relevant information extracted, like 'Flight Number', 'Departure Date', 'Hotel Name', etc.",
            properties: {
                additionalProperties: { type: Type.STRING }
            }
        }
    },
    required: ['documentType', 'details']
};

const translationSchema = {
    type: Type.OBJECT,
    properties: {
        originalText: { type: Type.STRING, description: "All the text extracted from the image, preserving line breaks." },
        translatedText: { type: Type.STRING, description: "The English translation of the extracted text, preserving line breaks." }
    },
    required: ['originalText', 'translatedText']
};

const tripIdeaSchema = {
    type: Type.OBJECT,
    properties: {
        destination: { type: Type.STRING, description: "The destination (City, Country) identified from the image and caption." },
        interests: { type: Type.STRING, description: "A comma-separated string of 3-5 inferred interests or vibes from the image and caption (e.g., 'nightlife, cityscapes, modern architecture')." }
    },
    required: ['destination', 'interests']
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
                                createdAt: { type: Type.STRING, description: "ISO 8601 date string." }
                            }
                        }
                    },
                     offeredExperiences: {
                        type: Type.ARRAY,
                        description: "An array of 1-2 fictional local experiences the host offers.",
                        items: {
                             type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                price: { type: Type.NUMBER },
                                category: { type: Type.STRING, enum: ['Tour', 'Meal', 'Workshop', 'Other'] }
                            }
                        }
                    }
                }
            }
        }
    },
    required: ["hosts"]
};

// ... More schemas ...

const budgetOptimizationSchema = {
    type: Type.OBJECT,
    properties: {
        optimizations: {
            type: Type.ARRAY,
            description: "An array of 3-4 specific, actionable budget optimization suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['Stay', 'Activity', 'Transport', 'Food'] },
                    originalItem: { type: Type.STRING, description: "The original item from the itinerary to be replaced." },
                    suggestedAlternative: { type: Type.STRING, description: "The cheaper but still high-quality alternative." },
                    reason: { type: Type.STRING, description: "A compelling reason for the swap." },
                    estimatedSavings: { type: Type.NUMBER, description: "The estimated savings in USD." }
                },
                required: ["type", "originalItem", "suggestedAlternative", "reason", "estimatedSavings"]
            }
        }
    },
    required: ["optimizations"]
};

const coordinatesSchema = {
    type: Type.OBJECT,
    properties: {
        locations: {
            type: Type.ARRAY,
            description: "An array of map marker objects with coordinates for each activity.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the location." },
                    lat: { type: Type.NUMBER, description: "The latitude." },
                    lng: { type: Type.NUMBER, description: "The longitude." },
                    day: { type: Type.INTEGER, description: "The day of the itinerary this location belongs to." },
                    timeOfDay: { type: Type.STRING, enum: ['Morning', 'Afternoon', 'Evening'] },
                    activity: { type: Type.STRING, description: "The activity at this location." }
                },
                required: ["name", "lat", "lng", "day", "timeOfDay", "activity"]
            }
        }
    },
    required: ["locations"]
};

const checklistSchema = {
    type: Type.OBJECT,
    properties: {
        packingList: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { item: { type: Type.STRING }, checked: { type: Type.BOOLEAN, default: false } }
            }
        },
        documents: {
            type: Type.OBJECT,
            properties: {
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { item: { type: Type.STRING }, checked: { type: Type.BOOLEAN, default: false } }
                    }
                }
            }
        },
        localEssentials: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { item: { type: Type.STRING }, checked: { type: Type.BOOLEAN, default: false } }
            }
        }
    },
    required: ["packingList", "documents", "localEssentials"]
};

const localVibeSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "A detailed description of the local vibe at night, covering safety, atmosphere, and things to do." }
    },
    required: ["description"]
};

const tripMemorySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A creative, catchy title for the trip memory." },
        narrativeSummary: { type: Type.STRING, description: "A heartfelt, one-paragraph summary of the trip's highlights and feelings." },
        keyStats: {
            type: Type.OBJECT,
            properties: {
                distanceTraveled: { type: Type.NUMBER },
                destinationsVisited: { type: Type.NUMBER },
                photosTaken: { type: Type.NUMBER, description: "A simulated number of photos." }
            }
        },
        musicTheme: { type: Type.STRING, enum: ['Uplifting', 'Chill', 'Epic', 'Sentimental'] },
        mapRoute: {
            type: Type.ARRAY,
            description: "An array of lat/lng objects tracing the journey.",
            items: {
                type: Type.OBJECT,
                properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } }
            }
        }
    },
    required: ["title", "narrativeSummary", "keyStats", "musicTheme", "mapRoute"]
};

const storySummarySchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise, engaging one-paragraph summary of the story." },
        estimatedCost: { type: Type.NUMBER, description: "An estimated cost for a similar trip in USD." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 relevant tags." }
    },
    required: ["summary", "estimatedCost", "tags"]
};

const hangoutSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of 3 diverse and personalized hangout suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    location: { type: Type.STRING },
                    estimatedCost: { type: Type.STRING }
                },
                required: ["title", "description", "location", "estimatedCost"]
            }
        }
    },
    required: ["suggestions"]
};

const aiVoyageMissionsSchema = {
    type: Type.OBJECT,
    properties: {
        missions: {
            type: Type.ARRAY,
            description: "An array of 3 personalized AIVoyageMission objects.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    destination: { type: Type.STRING },
                    badgeToUnlock: { type: Type.STRING },
                    pointsToEarn: { type: Type.NUMBER }
                },
                required: ["title", "description", "destination", "badgeToUnlock", "pointsToEarn"]
            }
        }
    },
    required: ["missions"]
};

const travelTrendsSchema = {
    type: Type.OBJECT,
    properties: {
        trends: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    destination: { type: Type.STRING },
                    image: { type: Type.STRING, description: "URL to a relevant, license-free photo." },
                    category: { type: Type.STRING, enum: ['Adventure', 'City Break', 'Relaxation', 'Cultural', 'Hidden Gem'] },
                    trendScore: { type: Type.NUMBER },
                    monthlyGrowth: { type: Type.NUMBER },
                    socialProof: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING, enum: ['TikTok', 'Instagram', 'Booking', 'FlyWise'] },
                                value: { type: Type.STRING }
                            }
                        }
                    },
                    personalizationReason: { type: Type.STRING }
                },
                required: ["id", "destination", "image", "category", "trendScore", "monthlyGrowth", "socialProof", "personalizationReason"]
            }
        }
    },
    required: ["trends"]
};

const superServiceSchema = {
    type: Type.OBJECT,
    properties: {
        availableApps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['Food Delivery', 'Ride-Hailing'] },
                    description: { type: Type.STRING }
                }
            }
        },
        restaurants: {
            type: Type.ARRAY,
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
                    imageUrl: { type: Type.STRING },
                    menu: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                price: { type: Type.STRING },
                                description: { type: Type.STRING }
                            }
                        }
                    },
                    provider: { type: Type.STRING }
                }
            }
        },
        foodSuggestions: {
            type: Type.ARRAY,
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
                            menu: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        price: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    }
                                }
                            },
                            provider: { type: Type.STRING }
                        }
                    },
                    reason: { type: Type.STRING }
                }
            }
        },
        rideSuggestion: {
            type: Type.OBJECT,
            properties: {
                destination: { type: Type.STRING },
                reason: { type: Type.STRING },
                options: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            serviceName: { type: Type.STRING },
                            serviceLogoUrl: { type: Type.STRING },
                            vehicleType: { type: Type.STRING },
                            eta: { type: Type.STRING },
                            estimatedPrice: { type: Type.NUMBER },
                            passengerCapacity: { type: Type.NUMBER }
                        }
                    }
                }
            }
        },
        smartCombo: {
            type: Type.OBJECT,
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
                        menu: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    price: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            }
                        },
                        provider: { type: Type.STRING }
                    }
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
                        passengerCapacity: { type: Type.NUMBER }
                    }
                }
            }
        }
    }
};

const socialPostSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        caption: { type: Type.STRING, description: "A creative and engaging caption for a social media post." },
        hashtags: { type: Type.STRING, description: "A string of relevant, space-separated hashtags (e.g., #travel #adventure #destination)." }
    },
    required: ["caption", "hashtags"]
};

const coworkingSpacesSchema = {
    type: Type.OBJECT,
    properties: {
        spaces: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    location: { type: Type.STRING },
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER },
                    imageUrl: { type: Type.STRING },
                    price: {
                        type: Type.OBJECT,
                        properties: {
                            perHour: { type: Type.NUMBER },
                            perDay: { type: Type.NUMBER },
                            perMonth: { type: Type.NUMBER }
                        }
                    },
                    rating: { type: Type.NUMBER },
                    amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    availability: {
                        type: Type.OBJECT,
                        properties: {
                            hotDesks: { type: Type.NUMBER },
                            privateOffices: { type: Type.NUMBER }
                        }
                    },
                    aiInsight: { type: Type.STRING },
                    reviews: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                user: { type: Type.STRING },
                                rating: { type: Type.NUMBER },
                                comment: { type: Type.STRING }
                            }
                        }
                    },
                    networkingOpportunity: { type: Type.STRING }
                }
            }
        }
    },
    required: ["spaces"]
};

const aiHomeSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    actionText: { type: Type.STRING },
                    actionTarget: {
                        type: Type.OBJECT,
                        properties: {
                            tab: { type: Type.STRING },
                            query: { type: Type.STRING }
                        }
                    }
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
                scheduledTime: { type: Type.STRING },
                actualTime: { type: Type.STRING },
                terminal: { type: Type.STRING },
                gate: { type: Type.STRING },
                latitude: { type: Type.NUMBER },
                longitude: { type: Type.NUMBER }
            }
        },
        arrival: {
            type: Type.OBJECT,
            properties: {
                airport: { type: Type.STRING },
                iata: { type: Type.STRING },
                city: { type: Type.STRING },
                scheduledTime: { type: Type.STRING },
                actualTime: { type: Type.STRING },
                terminal: { type: Type.STRING },
                gate: { type: Type.STRING },
                baggageClaim: { type: Type.STRING },
                latitude: { type: Type.NUMBER },
                longitude: { type: Type.NUMBER }
            }
        },
        status: { type: Type.STRING, enum: ['Scheduled', 'En Route', 'Landed', 'Delayed', 'Cancelled'] },
        aircraft: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING },
                registration: { type: Type.STRING }
            }
        },
        livePosition: {
            type: Type.OBJECT,
            properties: {
                latitude: { type: Type.NUMBER },
                longitude: { type: Type.NUMBER },
                altitude: { type: Type.NUMBER },
                speed: { type: Type.NUMBER }
            }
        },
        progressPercent: { type: Type.NUMBER },
        aiSummary: { type: Type.STRING },
        waypoints: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER },
                    eta: { type: Type.STRING },
                    progressPercent: { type: Type.NUMBER }
                }
            }
        }
    },
    required: ["flightNumber", "airline", "departure", "arrival", "status", "aircraft", "progressPercent", "aiSummary"]
};

const socialReelSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        musicSuggestion: { type: Type.STRING },
        scenes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    imageUrl: { type: Type.STRING },
                    overlayText: { type: Type.STRING }
                }
            }
        },
        socialPost: {
            type: Type.OBJECT,
            properties: {
                caption: { type: Type.STRING },
                hashtags: { type: Type.STRING }
            }
        }
    },
    required: ["title", "musicSuggestion", "scenes", "socialPost"]
};

const aiDiscoverySchema = {
    type: Type.OBJECT,
    properties: {
        trendingDestinations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    destination: { type: Type.STRING },
                    image: { type: Type.STRING },
                    reason: { type: Type.STRING }
                }
            }
        },
        hiddenGems: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["trendingDestinations", "hiddenGems", "recommendations"]
};


export const getApiParamsFromChat = async (messages: ChatMessage[], userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<ApiParams> => {
    const ai = getAiClient();
    const prompt = `
        Current Date: ${new Date().toISOString().split('T')[0]}.
        Analyze the following user chat history to determine the correct parameters for flight, hotel, and car rental API calls.
        The user's preferences are: ${JSON.stringify(userProfile)}.
        The user's saved trips are: ${JSON.stringify(savedTrips)}.
        Chat History:
        ${messages.map(m => `${m.sender}: ${m.text}`).join('\n')}
        
        Infer dates, locations, and other parameters. Use the user's profile to fill in missing details (like preferred car types, min hotel stars, etc.) where appropriate.
        If a user asks for "tomorrow", calculate the actual date.
        Provide a short, one-sentence summary of your understanding of the user's request.
        If the user explicitly asks for activities or things to do, populate the 'itinerary_request' field.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: searchParamsSchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, 'Failed to understand your request.');
    }
};

// ... All other functions (getItinerary, getTravelChecklist, etc.) remain the same but use the getAiClient() which now has the hardcoded key.

export const getAlternativeSuggestions = async (messages: ChatMessage[], userProfile: UserProfile): Promise<AlternativeSuggestion[]> => {
    const ai = getAiClient();
    const prompt = `Based on this user's request and profile, suggest up to 3 alternative destinations (airports or cities) that might be cheaper, more aligned with their interests, or offer a better experience.
    User Profile: ${JSON.stringify(userProfile)}
    Chat History:
    ${messages.map(m => `${m.sender}: ${m.text}`).join('\n')}
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: alternativeSuggestionsSchema,
            },
        }));
        const data = JSON.parse(response.text.trim());
        return data.suggestions || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to generate alternative suggestions.');
    }
};

export const getRealTimeSuggestions = async (messages: ChatMessage[], userProfile: UserProfile, latestItinerary: ItineraryPlan, currentLocation: { lat: number, lng: number }): Promise<RealTimeSuggestion[]> => {
    const ai = getAiClient();
    const prompt = `A user's plan might be disrupted (e.g., rain, closure). Based on their last message, their itinerary, their profile, and their current location, suggest 2-3 specific, real-world alternative activities nearby. Provide real addresses.
    Current Location: ${JSON.stringify(currentLocation)}
    User Profile: ${JSON.stringify(userProfile)}
    Itinerary: ${JSON.stringify(latestItinerary)}
    Last Message: "${messages[messages.length - 1].text}"
    `;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following information about real-time suggestions, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: realTimeSuggestionsSchema,
            },
        }));

        const data = JSON.parse(formatResponse.text.trim());
        return data.suggestions || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to get real-time suggestions.');
    }
};

export const generateSearchSummary = async (results: SearchResult[]): Promise<string> => {
    const ai = getAiClient();
    const hasFlights = results.some(r => r.type === 'flight');
    const hasStays = results.some(r => r.type === 'stay');
    const hasCars = results.some(r => r.type === 'car');

    let upsellPrompt = '';
    if (hasFlights && !hasStays) {
        upsellPrompt = " If the user is happy with these flights, ask if you should look for hotels at their destination or perhaps an airport transfer.";
    } else if (hasFlights && hasStays && !hasCars) {
        upsellPrompt = " If the user is happy with these options, ask if they need a rental car for their trip.";
    }

    const prompt = `
        Summarize these search results in a friendly, concise paragraph. Mention the number of flights, hotels, or cars found.
        ${upsellPrompt}
        Results: ${JSON.stringify(results.slice(0, 5))}
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        }));
        return response.text.trim();
    } catch (error) {
        throw handleApiError(error, 'Failed to generate a search summary.');
    }
};

export const getItinerarySnippet = async (params: { destination?: string; duration?: number; interests?: string; }): Promise<ItinerarySnippet> => {
    const ai = getAiClient();
    const prompt = `Generate a short snippet of 2-4 activity suggestions for a trip to ${params.destination} based on these interests: ${params.interests}.`;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: itinerarySnippetSchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, 'Failed to generate itinerary suggestions.');
    }
};

export const getItinerary = async (destination: string, duration: number, interests: string, budget?: number): Promise<ItineraryPlan> => {
    const ai = getAiClient();
    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination}.
    User interests: ${interests}.
    ${budget ? `The user has an approximate budget of $${budget}. Please create the itinerary and a budget breakdown around this amount.` : 'The user has not specified a budget, please estimate a reasonable "mid-range" budget.'}
    Find real-world locations with specific names and full addresses for each activity.
    Also include some cultural tips and local food recommendations.
    `;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following itinerary information, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: itinerarySchema,
            },
        }));

        return JSON.parse(formatResponse.text.trim());
    } catch (error) {
        throw handleApiError(error, 'Failed to create your itinerary.');
    }
};

export const getBudgetOptimizations = async (plan: ItineraryPlan): Promise<BudgetOptimizationSuggestion[]> => {
    const ai = getAiClient();
    const prompt = `Analyze this itinerary and suggest 3-4 specific ways to save money without significantly compromising the experience. For each suggestion, provide the original item, the suggested alternative, a reason, and an estimated saving in USD.
    Itinerary: ${JSON.stringify(plan)}
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: budgetOptimizationSchema,
            },
        }));
        const data = JSON.parse(response.text.trim());
        return data.optimizations || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to get budget optimizations.');
    }
};

export const getCoordinatesForActivities = async (itinerary: DailyPlan[]): Promise<MapMarker[]> => {
    const ai = getAiClient();
    const prompt = `For each activity in this itinerary, find its precise latitude and longitude.
    Itinerary: ${JSON.stringify(itinerary)}
    Return an array of locations.
    `;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following location information, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: coordinatesSchema,
            },
        }));

        const data = JSON.parse(formatResponse.text.trim());
        return data.locations || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to get coordinates for activities.');
    }
};

export const getWeatherForecast = async (destination: string, duration: number): Promise<WeatherForecast> => {
    const ai = getAiClient();
    const prompt = `Provide a realistic ${duration}-day weather forecast for ${destination}, starting from tomorrow.`;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following weather information, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: weatherForecastSchema,
            },
        }));
        
        const data = JSON.parse(formatResponse.text.trim());
        return data.forecast || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to get weather forecast.');
    }
};

export const getTravelChecklist = async (plan: ItineraryPlan): Promise<Checklist> => {
    const ai = getAiClient();
    const prompt = `Generate a comprehensive travel checklist for a trip based on this itinerary. Include sections for packing, documents (use Google Search for any specific visa or entry requirements), and local essentials (e.g., specific apps, cash, clothing advice).
    Itinerary: ${JSON.stringify(plan)}
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const searchResults = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title
        })) || [];

        // Now, ask the model to format the checklist as JSON
        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the previous response, format the checklist into JSON. Response text: ${response.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: checklistSchema
            }
        }));

        const checklistData: Checklist = JSON.parse(formatResponse.text.trim());
        checklistData.documents.sources = searchResults;

        return checklistData;
    } catch (error) {
        throw handleApiError(error, 'Failed to generate your travel checklist.');
    }
};

export const getInsuranceQuotes = async (plan: ItineraryPlan): Promise<TravelInsuranceQuote[]> => {
    const ai = getAiClient();
    const prompt = `Generate 3-4 fictional but realistic travel insurance quotes for a trip to ${plan.destination} for ${plan.itinerary.length} days. Include different coverage levels and price points.`;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: insuranceQuotesSchema,
            },
        }));
        const data = JSON.parse(response.text.trim());
        return data.quotes || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to get insurance quotes.');
    }
};

export const getNearbyAttractions = async (stayName: string, location: string): Promise<NearbyAttraction[]> => {
    const ai = getAiClient();
    const prompt = `List 3-5 interesting attractions or points of interest near ${stayName} in ${location}.`;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following information about nearby attractions, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: nearbyAttractionsSchema,
            },
        }));

        const data = JSON.parse(formatResponse.text.trim());
        return data.attractions || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to find nearby attractions.');
    }
};

export const getLocalVibe = async (stayName: string, location: string): Promise<LocalVibe> => {
    const ai = getAiClient();
    const prompt = `Describe the local "vibe" at night around ${stayName} in ${location}. Focus on safety, atmosphere (lively, quiet, etc.), and types of places open (restaurants, bars, etc.). Use Google Search to ground your answer.`;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title
        })) || [];

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the previous response, format the description of the local vibe into JSON. Response text: ${response.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: localVibeSchema
            }
        }));
        
        const vibeData: LocalVibe = JSON.parse(formatResponse.text.trim());
        vibeData.sources = sources;
        return vibeData;
    } catch (error) {
        throw handleApiError(error, 'Failed to analyze the local vibe.');
    }
};

export const generateDestinationImages = async (destination: string, duration: number, interests: string, budget?: number): Promise<string[]> => {
    const ai = getAiClient();
    const prompt = `A cinematic, photorealistic collage of a ${duration}-day trip to ${destination}. Interests: ${interests}. ${budget ? `Budget: around $${budget}.` : ''} Show iconic landmarks and hidden gems.`;
    try {
        const response = await withRetry<GenerateImagesResponse>(() => ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 4,
              aspectRatio: '16:9',
            },
        }));
        return response.generatedImages
            .map(img => img.image?.imageBytes)
            .filter((bytes): bytes is string => !!bytes);
    } catch (error) {
        throw handleApiError(error, 'Failed to generate destination images.');
    }
};

export const generateTravelBuddyProfile = async (preferences: TravelBuddyPreferences, userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<TravelBuddyProfile> => {
    const ai = getAiClient();
    const prompt = `Create a fictional travel buddy profile that would be a great match for a user with these preferences:
    User's Travel Preferences: ${JSON.stringify(userProfile)}.
    User's Saved Trips: ${JSON.stringify(savedTrips)}.
    Desired Buddy Preferences: ${JSON.stringify(preferences)}.
    Generate a creative persona that complements or interestingly contrasts with the user. Calculate a compatibility score and provide a reason.`;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: travelBuddyProfileSchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, 'Failed to generate a travel buddy profile.');
    }
};

export const generateJointItinerary = async (userProfile: UserProfile, buddyProfile: TravelBuddyProfile, destination: string, duration: number): Promise<ItineraryPlan> => {
    const ai = getAiClient();
    const prompt = `Create a ${duration}-day travel itinerary for ${destination} that balances the interests of two travelers.
    Traveler 1 (User): ${JSON.stringify(userProfile)}
    Traveler 2 (AI Buddy): ${JSON.stringify(buddyProfile)}
    The itinerary should include activities that both would enjoy, and maybe a few compromises. Make it a fun, collaborative plan.
    `;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following joint itinerary information, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: itinerarySchema,
            },
        }));

        return JSON.parse(formatResponse.text.trim());
    } catch (error) {
        throw handleApiError(error, 'Failed to generate a joint itinerary.');
    }
};

export const chatWithTravelBuddy = async (chatHistory: ChatMessage[], userProfile: UserProfile, buddyProfile: TravelBuddyProfile, jointPlan: ItineraryPlan): Promise<string> => {
    const ai = getAiClient();
    const prompt = `You are ${buddyProfile.name}, the AI travel buddy. Your personality is defined by: ${JSON.stringify(buddyProfile)}.
    You are chatting with a user about your upcoming trip to ${jointPlan.destination}.
    Your joint itinerary is: ${JSON.stringify(jointPlan)}.
    The user's profile is: ${JSON.stringify(userProfile)}.
    Continue the conversation naturally based on the chat history.
    Chat History:
    ${chatHistory.map(m => `${m.sender === 'user' ? 'User' : buddyProfile.name}: ${m.text}`).join('\n')}
    ${buddyProfile.name}:`;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        }));
        return response.text.trim();
    } catch (error) {
        throw handleApiError(error, 'Failed to get a response from your buddy.');
    }
};

export const generateBuddyProfilePicture = async (profile: TravelBuddyProfile): Promise<string> => {
    const ai = getAiClient();
    const prompt = `Create a realistic, photorealistic portrait of a travel blogger that matches this description. Head and shoulders shot.
    Name: ${profile.name}
    Age: ${profile.age}
    Gender: ${profile.gender}
    Key Traits: ${profile.keyTraits.join(', ')}
    Travel Style: ${profile.travelStyle}
    Bio: ${profile.bio}
    `;
    try {
        const response = await withRetry<GenerateImagesResponse>(() => ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '1:1',
            },
        }));
        const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (!imageBytes) {
            throw new Error('Failed to generate profile picture data.');
        }
        return imageBytes;
    } catch (error) {
        throw handleApiError(error, 'Failed to generate a profile picture.');
    }
};

export const generateTripMemory = async (plan: ItineraryPlan): Promise<Omit<TripMemory, 'tripId'>> => {
    const ai = getAiClient();
    const prompt = `Based on this itinerary, generate a creative and nostalgic "Trip Memory".
    Itinerary: ${JSON.stringify(plan)}
    Create a catchy title, a heartfelt summary, and some key stats. Also suggest a music theme and a simplified map route.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: tripMemorySchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, 'Failed to generate your trip memory.');
    }
};

export const generateStorySummary = async (title: string, content: string): Promise<{ summary: string; estimatedCost: number; tags: string[] }> => {
    const ai = getAiClient();
    const prompt = `Analyze this travel story. Provide a one-paragraph summary, estimate a budget for a similar trip, and suggest 3-5 relevant tags.
    Title: ${title}
    Content: ${content}
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: storySummarySchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, 'Failed to generate a story summary.');
    }
};

export const generateVibeSearchIdeas = async (vibe: string): Promise<VibeSearchResult> => {
    const ai = getAiClient();
    try {
        const imagePromise = withRetry<GenerateImagesResponse>(() => ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A mood board of 4 images representing this travel vibe: "${vibe}". Photorealistic, atmospheric.`,
            config: { numberOfImages: 4, aspectRatio: '1:1' },
        }));

        const textPromise = withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the vibe "${vibe}", suggest 3 real-world travel destinations that are a perfect match. For each, provide a compelling one-sentence reason.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: destinationSuggestionsSchema,
            },
        }));

        const [imageResponse, textResponse] = await Promise.all([imagePromise, textPromise]);
        
        const images = imageResponse.generatedImages
            .map(img => img.image?.imageBytes)
            .filter((bytes): bytes is string => !!bytes);
        const destinations = JSON.parse(textResponse.text.trim()).destinations;

        return { images, destinations };
    } catch (error) {
        throw handleApiError(error, 'Failed to generate vibe search ideas.');
    }
};

export const getAILocalMatches = async (location: string, userProfile: UserProfile, matchType: 'stay' | 'hangout'): Promise<LocalProfile[]> => {
    const ai = getAiClient();
    const prompt = `Generate 5-8 fictional but realistic profiles for a HomeShare / Local Connections app. The user is searching for a "${matchType}" in "${location}".
    The user's profile is: ${JSON.stringify(userProfile)}.
    The generated profiles should be a good match for the user, with high compatibility scores. Make them diverse in age, interests, and background.
    Ensure you generate all fields in the schema, including house photos for 'stay' types and realistic reviews.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: homeShareHostSchema,
            },
        }));
        const data = JSON.parse(response.text.trim());
        return (data.hosts || []).map((h: any) => ({ ...h, profileType: matchType }));
    } catch (error) {
        throw handleApiError(error, 'Failed to find local matches.');
    }
};

export const getHangoutSuggestions = async (userProfile: UserProfile, localProfile: LocalProfile): Promise<HangoutSuggestion[]> => {
    const ai = getAiClient();
    const prompt = `Based on the shared interests of a user and a local, suggest 3 creative and fun hangout ideas in ${localProfile.location}.
    User Profile: ${JSON.stringify(userProfile.interests)}
    Local Profile: ${JSON.stringify(localProfile.interests)}
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: hangoutSuggestionsSchema,
            },
        }));
        const data = JSON.parse(response.text.trim());
        return data.suggestions || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to get hangout suggestions.');
    }
};

export const getAIVoyageMissions = async (profile: GamificationProfile): Promise<AIVoyageMission[]> => {
    const ai = getAiClient();
    const prompt = `Based on the user's gamification profile, suggest 3 personalized "Voyage Missions" to help them earn points and unlock new badges. The missions should be tailored to their earned badges and play style.
    Profile: ${JSON.stringify(profile)}
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: aiVoyageMissionsSchema,
            },
        }));
        const data = JSON.parse(response.text.trim());
        return data.missions || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to get AI voyage missions.');
    }
};

export const getTravelTrends = async (userProfile: UserProfile): Promise<TravelTrend[]> => {
    const ai = getAiClient();
    const prompt = `Generate a list of 6-8 current, realistic travel trends. Include a mix of categories. For each trend, provide a personalization reason based on the user's profile.
    User Profile: ${JSON.stringify(userProfile)}
    `;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following travel trend information, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: travelTrendsSchema,
            },
        }));
        const data = JSON.parse(formatResponse.text.trim());
        return data.trends || [];
    } catch (error) {
        throw handleApiError(error, 'Failed to get travel trends.');
    }
};

export const getSuperServiceData = async (location: string, userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<SuperServiceData> => {
    const ai = getAiClient();
    const prompt = `
        Generate a set of super service data for a user in "${location}".
        User Profile: ${JSON.stringify(userProfile.interests)}
        Active/Saved Trips: ${JSON.stringify(savedTrips.map(t => t.name))}
        
        - List 2-3 popular food delivery and ride-hailing apps available in that city.
        - List 6-8 diverse, highly-rated restaurants.
        - Provide 2-3 personalized food suggestions based on user profile.
        - Provide one ride suggestion to a relevant location (e.g., from a saved hotel to a landmark).
        - Provide one "smart combo" (e.g., dinner and a ride to a show).
        
        Generate realistic but fictional data for all fields.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: superServiceSchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, "Failed to fetch local services data.");
    }
};

export const generateSocialPostSuggestion = async (memory: TripMemory): Promise<SocialPostSuggestion> => {
    const ai = getAiClient();
    const prompt = `
        Based on this travel memory journal, generate an engaging social media post.
        Memory Title: "${memory.title}"
        Narrative: "${memory.narrativeSummary}"
        The post should include a creative caption and a set of relevant hashtags.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: socialPostSuggestionSchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, "Failed to generate social post suggestion.");
    }
};

export const getCoworkingSpaces = async (location: string, userProfile: UserProfile): Promise<CoworkingSpace[]> => {
    const ai = getAiClient();
    const prompt = `
        Find 5-8 fictional but realistic coworking spaces in "${location}".
        For each space, provide all the details required by the schema.
        Tailor the "aiInsight" and "networkingOpportunity" fields to be relevant for a traveler with these interests: ${JSON.stringify(userProfile.interests)}.
        Ensure you also generate realistic lat/lng coordinates for each space.
    `;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following information about coworking spaces, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: coworkingSpacesSchema,
            },
        }));

        const data = JSON.parse(formatResponse.text.trim());
        return data.spaces || [];
    } catch (error) {
        throw handleApiError(error, "Failed to find coworking spaces.");
    }
};

export const getAIHomeSuggestions = async (userProfile: UserProfile, savedTrips: SavedTrip[]): Promise<AIHomeSuggestion[]> => {
    const ai = getAiClient();
    const prompt = `
        Generate 2-4 personalized "next step" suggestions for a user's home dashboard.
        User Profile: ${JSON.stringify(userProfile)}
        Saved Trips: ${JSON.stringify(savedTrips.map(t => t.name))}
        
        The suggestions should be actionable and relevant to the user's data. For example, suggest planning a new trip based on their interests, or finding a travel buddy for a saved trip.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: aiHomeSuggestionsSchema,
            },
        }));
        const data = JSON.parse(response.text.trim());
        return data.suggestions || [];
    } catch (error) {
        throw handleApiError(error, "Failed to get AI home suggestions.");
    }
};

export const getFlightStatus = async (flightNumber: string): Promise<FlightStatus> => {
    const ai = getAiClient();
    const prompt = `Provide a detailed, realistic, real-time flight status for flight number ${flightNumber}. Use Google Search to get the latest, real-world data if possible. The flight may be in the past, present, or future. Generate all fields in the schema, including waypoints if the flight is en route.`;
    try {
        const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const formatResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the flight status information provided, format it into a JSON object matching the schema. Information: ${searchResponse.text}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: flightStatusSchema,
            },
        }));

        return JSON.parse(formatResponse.text.trim());
    } catch (error) {
        throw handleApiError(error, "Failed to get flight status.");
    }
};

export const generateSocialReel = async (plan: ItineraryPlan, images: { mimeType: string; dataUrl: string }[]): Promise<Omit<SocialReel, 'tripId'>> => {
    const ai = getAiClient();
    const prompt = `
        Generate a social media reel concept based on a travel itinerary and user-uploaded photos.
        Itinerary for: ${plan.destination}
        Interests: ${plan.interests}
        
        Create a title for the reel.
        Suggest a music theme.
        For each of the ${images.length} images provided, write a short, punchy overlay text for a scene.
        Finally, create a caption and hashtags for the social media post.
    `;
     try {
        const imageParts = images.map(img => ({
            inlineData: {
                mimeType: img.mimeType,
                data: img.dataUrl.split(',')[1],
            },
        }));

        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...imageParts, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: socialReelSchema,
            },
        }));

        const result = JSON.parse(response.text.trim());
        // The imageUrl in the scenes should be the original user-provided data URLs
        result.scenes = result.scenes.map((scene: any, index: number) => ({
            ...scene,
            imageUrl: images[index]?.dataUrl || '',
        }));

        return result;
    } catch (error) {
        throw handleApiError(error, "Failed to generate social reel.");
    }
};

export const getAIDiscoverySuggestions = async (posts: WandergramPost[], userProfile: UserProfile): Promise<AIDiscoveryData> => {
    const ai = getAiClient();
    const postSummaries = posts.slice(0, 10).map(p => ({ id: p.id, caption: p.caption, location: p.location }));
    const prompt = `
        Analyze this feed of social media posts and the user's profile to generate a discovery page.
        User Profile: ${JSON.stringify(userProfile.interests)}
        Posts: ${JSON.stringify(postSummaries)}
        
        - Identify 3-4 trending destinations from the posts and provide a reason.
        - Select 2-3 post IDs that represent "hidden gems".
        - Select 2-3 post IDs that are personalized recommendations for the user.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: aiDiscoverySchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, "Failed to get AI discovery suggestions.");
    }
};

export const chatAboutImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Image } },
                    { text: prompt },
                ],
            },
        }));
        return response.text.trim();
    } catch (error) {
        throw handleApiError(error, "Failed to chat about the image.");
    }
};

export const parseDocumentFromImage = async (base64Image: string, mimeType: string): Promise<DocumentScanResult> => {
    const ai = getAiClient();
    const prompt = `Analyze the provided image of a travel document. Extract all key information such as document type (e.g., flight itinerary, hotel confirmation), confirmation numbers, names, dates, locations, etc., and structure it into the provided JSON schema.`;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Image } },
                    { text: prompt },
                ],
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: documentScanSchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, "Failed to parse document.");
    }
};

export const translateImage = async (base64Image: string, mimeType: string): Promise<TranslationResult> => {
    const ai = getAiClient();
    const prompt = `Extract all text from the image. Then, provide an English translation of the extracted text. Preserve line breaks.`;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Image } },
                    { text: prompt },
                ],
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: translationSchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, "Failed to translate image.");
    }
};

export const getTripIdeaFromPost = async (post: WandergramPost): Promise<TripIdea> => {
    const ai = getAiClient();
    const prompt = `Analyze the image and caption of this social media post to identify a travel destination and infer 3-5 vibes or interests related to it.
    Caption: "${post.caption}"
    Location: "${post.location}"`;
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg', // Assume jpeg for simplicity from URL
                data: post.imageUrl.split(',')[1],
            }
        };

        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: tripIdeaSchema,
            },
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleApiError(error, "Failed to generate a trip idea from the post.");
    }
};

export const getQASummary = async (question: string, answers: string[]): Promise<string> => {
    const ai = getAiClient();
    const prompt = `
        Summarize the answers to a community question.
        Question: "${question}"
        Answers:
        ${answers.map(a => `- ${a}`).join('\n')}
        
        Provide a concise, neutral summary that captures the main points and consensus from the answers.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        }));
        return response.text.trim();
    } catch (error) {
        throw handleApiError(error, "Failed to summarize answers.");
    }
};

// FIX: Add missing getCompromiseSuggestion function.
export const getCompromiseSuggestion = async (poll: GroupTripPoll, destination: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `
        A group is planning a trip to ${destination} and is stuck on a decision.
        The poll question is: "${poll.question}"
        The options and their votes are:
        ${poll.options.map(opt => `- "${opt.text}": ${opt.votes.length} vote(s)`).join('\n')}

        Suggest a creative and fair compromise that combines elements of the popular options or suggests a new alternative that everyone might enjoy. The suggestion should be a concise paragraph.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        }));
        return response.text.trim();
    } catch (error) {
        throw handleApiError(error, "Failed to generate a compromise suggestion.");
    }
};

export const generateHangoutRequestMessage = async (userProfile: UserProfile, localProfile: LocalProfile, suggestion: HangoutSuggestion): Promise<string> => {
    const ai = getAiClient();
    const prompt = `
        A user wants to send a hangout request to a local. Write a friendly, polite, and personalized icebreaker message.
        User's Interests: ${userProfile.interests.join(', ')}
        Local's Name: ${localProfile.name}
        Local's Interests: ${localProfile.interests.join(', ')}
        Suggested Hangout: "${suggestion.title}" - ${suggestion.description}
        
        The message should mention a shared interest to build rapport and refer to the specific hangout suggestion.
    `;
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        }));
        return response.text.trim();
    } catch (error) {
        throw handleApiError(error, "Failed to generate hangout message.");
    }
};