import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getApiParamsFromChat, getAlternativeSuggestions, getRealTimeSuggestions, generateSearchSummary, getItinerarySnippet } from '../services/geminiService';
import * as xanoService from '../services/xanoService';
import { ChatMessage, ApiParams, SavedTrip, UserProfile, Flight, Stay, Car, AlternativeSuggestion, ItineraryPlan, RealTimeSuggestion, SearchResult } from '../../types';
import ResultsList from './ResultsList';
import { Icon } from './Icon';
import LoadingOverlay from './LoadingOverlay';
import AlternativeSuggestionsDisplay from './AlternativeSuggestionsDisplay';
import RealTimeSuggestionsDisplay from './RealTimeSuggestionsDisplay';

interface ChatInterfaceProps {
  onSaveTrip: (tripData: Omit<SavedTrip, 'id' | 'createdAt'>) => void;
  userProfile: UserProfile;
  savedTrips: SavedTrip[];
  onBookFlight: (flight: Flight) => void;
  onBookStay: (stay: Stay) => void;
  onBookCar: (car: Car) => void;
}

// Helper to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

type ConversationState = 'idle' | 'awaiting_suggestion_response';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSaveTrip, userProfile, savedTrips, onBookFlight, onBookStay, onBookCar }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      sender: 'ai',
      text: "Hello! I'm your FlyWise.AI assistant. How can I help you plan your trip today? You can ask for flights, hotels, or car rentals. Try: 'Find an SUV in Los Angeles from tomorrow for 5 days.'",
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<{ file: File, previewUrl: string } | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const performSearch = useCallback(async (currentMessages: ChatMessage[]) => {
    setIsLoading(true);
    setLoadingMessage("Analyzing your travel request...");

    try {
      // Step 1: Get structured API parameters from the user's query.
      const params: ApiParams = await getApiParamsFromChat(currentMessages, userProfile, savedTrips);
      
      setLoadingMessage("Searching for the best deals...");
      const analysisMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: params.analyzedQuery || "Okay, I've analyzed your request. Now, let's find some great deals for you.",
      };
      setMessages((prev) => [...prev, analysisMessage]);


      // Step 2: Call Xano APIs based on the structured parameters.
      const searchPromises: Promise<SearchResult[]>[] = [];
      if (params.flight_search_params) {
        searchPromises.push(xanoService.searchFlights(params.flight_search_params));
      }
      if (params.hotel_search_params) {
        searchPromises.push(xanoService.searchStays(params.hotel_search_params));
      }
      if (params.car_search_params) {
        searchPromises.push(xanoService.searchCars(params.car_search_params));
      }
      
      const searchResultsArrays = await Promise.all(searchPromises);
      const combinedResults = searchResultsArrays.flat();

      // Step 3: Generate a summary and optional itinerary snippet.
      const summaryText = await generateSearchSummary(combinedResults);
      const itinerarySnippet = params.itinerary_request 
          ? await getItinerarySnippet(params.itinerary_request) 
          : undefined;

      const resultsMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: 'ai',
        text: summaryText as string,
        results: combinedResults,
        analyzedQuery: params.analyzedQuery,
        itinerarySnippet: itinerarySnippet,
      };
      setMessages((prev) => [...prev, resultsMessage]);
      
      // If the search returned flights or stays, ask about alternatives.
      if (combinedResults.some(r => r.type === 'flight' || r.type === 'stay')) {
        const suggestionPromptMessage: ChatMessage = {
          id: (Date.now() + 3).toString(),
          sender: 'ai',
          text: "Would you like me to find some alternative destinations for this trip?",
        };
        setMessages((prev) => [...prev, suggestionPromptMessage]);
        setConversationState('awaiting_suggestion_response');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      const aiErrorMessage: ChatMessage = {
         id: (Date.now() + 1).toString(),
         sender: 'ai',
         text: `I'm sorry, but I encountered an issue processing your request. Please try rephrasing it. Error: ${errorMessage}`
      };
      setMessages((prev) => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, [userProfile, savedTrips]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const query = input;
    const imageInfo = selectedImage;

    setInput('');
    setSelectedImage(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    if (imageInfo) {
      const base64 = await fileToBase64(imageInfo.file);
      userMessage.imageData = {
        mimeType: imageInfo.file.type,
        base64,
      };
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const isRealTimeRequest = /rain|cancel|change|instead|alternative for|what else|something else/i.test(query.trim());
    const latestItinerary = savedTrips.find(t => t.type === 'itinerary')?.data as ItineraryPlan | undefined;

    if (isRealTimeRequest && latestItinerary) {
        setIsLoading(true);
        setLoadingMessage("Checking what's nearby...");
        try {
            // A real app would use navigator.geolocation. A mock location is used here.
            const mockLocation = { lat: 48.8584, lng: 2.2945 }; // Eiffel Tower as a default

            const suggestions = await getRealTimeSuggestions(updatedMessages, userProfile, latestItinerary, mockLocation);
            
            if (suggestions && suggestions.length > 0) {
                 const suggestionMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'ai',
                    text: "I understand. Plans change! Based on your situation and what's nearby, here are a few ideas:",
                    realTimeSuggestions: suggestions,
                };
                setMessages(prev => [...prev, suggestionMessage]);
            } else {
                 const noSuggestionsMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'ai',
                    text: "I looked around but couldn't find any standout alternatives right now. Is there another way I can help?",
                };
                setMessages(prev => [...prev, noSuggestionsMessage]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            const aiErrorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: `I'm sorry, I ran into an issue finding alternatives. Error: ${errorMessage}`
            };
            setMessages(prev => [...prev, aiErrorMessage]);
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
        return; // Exit here to prevent falling through to other logic paths
    }
    
    if (conversationState === 'awaiting_suggestion_response') {
      const isNewSearch = /flight|hotel|car|find|search|look for|how about/i.test(query.trim());
      
      // If the user starts a new search, override the suggestion flow
      if (isNewSearch) {
          setConversationState('idle');
          await performSearch(updatedMessages);
          return;
      }

      setConversationState('idle'); // Reset state after handling
      const isPositiveResponse = /yes|sure|ok|yeah|yep|why not|sounds good|do it/i.test(query.trim());

      if (isPositiveResponse) {
        setIsLoading(true);
        setLoadingMessage("Finding smart alternatives...");
        try {
          // Pass the history including the user's "yes" to provide context
          const suggestions = await getAlternativeSuggestions(updatedMessages, userProfile);
          if (suggestions && suggestions.length > 0) {
            const suggestionMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: "Great! Here are a few alternative ideas for your trip:",
              alternativeSuggestions: suggestions,
            };
            setMessages(prev => [...prev, suggestionMessage]);
          } else {
             const noSuggestionsMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: "I looked around but couldn't find any standout alternatives for this particular search. Is there anything else I can help with?",
            };
            setMessages(prev => [...prev, noSuggestionsMessage]);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          const aiErrorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: `I'm sorry, I ran into an issue finding alternatives. Error: ${errorMessage}`
          };
          setMessages(prev => [...prev, aiErrorMessage]);
        } finally {
          setIsLoading(false);
          setLoadingMessage("");
        }
      } else {
        const aiResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "No problem! Let me know if there's anything else I can help plan."
        };
        setMessages(prev => [...prev, aiResponseMessage]);
      }
    } else {
      // Normal search flow
      await performSearch(updatedMessages);
    }
  }, [input, isLoading, messages, performSearch, selectedImage, conversationState, userProfile, savedTrips]);

  const handleSelectSuggestion = useCallback((suggestion: AlternativeSuggestion) => {
    const lastUserMessage = messages.slice().reverse().find(m => m.sender === 'user');
    if (!lastUserMessage) return;
    
    // Replace the original location in the last user query with the new suggested location.
    const newQuery = lastUserMessage.text.replace(new RegExp(suggestion.originalLocation, 'i'), suggestion.alternativeLocationName.split('(')[0].trim());

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: newQuery,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    performSearch(updatedMessages);

  }, [messages, performSearch]);
  
  const handleSelectRealTimeSuggestion = useCallback((suggestion: RealTimeSuggestion) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Great, let's go to ${suggestion.name}. Can you give me directions?`,
    };
    
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: `Of course! The address for ${suggestion.name} is ${suggestion.address}. I recommend using your favorite map application for the best route.`
    };

    setMessages(prev => [...prev, userMessage, aiResponse]);
  }, []);

  const handleSaveSearch = (message: ChatMessage) => {
    // Use the AI-analyzed query as the default name, falling back to a generic name.
    const tripName = message.analyzedQuery || 'Saved Search';
    onSaveTrip({
      name: tripName,
      type: 'search',
      data: message.results || [],
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage({
        file,
        previewUrl: URL.createObjectURL(file as Blob),
      });
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      <div className="flex flex-col h-[70vh] bg-white rounded-lg">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                 {msg.sender === 'ai' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <Icon name="logo" className="w-6 h-6"/>
                    </div>
                )}
                <div className={`flex flex-col max-w-lg ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl p-4 ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                     {msg.imageData && (
                      <img src={`data:${msg.imageData.mimeType};base64,${msg.imageData.base64}`} alt="User upload" className="rounded-lg mb-2 max-h-48" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                   {msg.alternativeSuggestions && msg.alternativeSuggestions.length > 0 && (
                    <div className="mt-4 w-full max-w-lg">
                       <AlternativeSuggestionsDisplay
                        suggestions={msg.alternativeSuggestions}
                        onSelect={handleSelectSuggestion}
                      />
                    </div>
                  )}
                  {msg.realTimeSuggestions && msg.realTimeSuggestions.length > 0 && (
                    <div className="mt-4 w-full max-w-lg">
                        <RealTimeSuggestionsDisplay
                            suggestions={msg.realTimeSuggestions}
                            onSelect={handleSelectRealTimeSuggestion}
                        />
                    </div>
                  )}
                   {msg.itinerarySnippet && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 w-full animate-fade-in-up">
                        <h4 className="text-base font-semibold text-slate-800 flex items-center">
                            <Icon name="lightbulb" className="h-5 w-5 mr-2 text-indigo-500" />
                            Activity Suggestions for {msg.itinerarySnippet.destination}
                        </h4>
                        <ul className="mt-3 space-y-3">
                            {msg.itinerarySnippet.suggestions.map((suggestion, index) => (
                                <li key={index} className="border-t border-slate-200 pt-3 first:border-t-0 first:pt-0">
                                    <p className="font-semibold text-sm text-slate-700">{suggestion.name}</p>
                                    <p className="text-sm text-slate-600">{suggestion.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                  )}
                  {msg.results && msg.results.length > 0 && (
                    <div className="mt-4 w-full max-w-lg">
                      <ResultsList 
                        isLoading={false} 
                        onBookFlight={onBookFlight} 
                        onBookStay={onBookStay}
                        onBookCar={onBookCar}
                      />
                       <button 
                        onClick={() => handleSaveSearch(msg)}
                        className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Icon name="bookmark" className="mr-2 h-5 w-5" />
                        Save to My Trips
                      </button>
                    </div>
                  )}
                </div>
                 {msg.sender === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                        <Icon name="user" className="w-6 h-6"/>
                    </div>
                )}
              </div>
            ))}
          <div ref={chatEndRef} />
        </div>
        <div className="border-t border-slate-200 p-4">
          {selectedImage && (
            <div className="mb-2 flex items-center justify-between p-2 bg-slate-100 rounded-lg">
              <div className="flex items-center gap-2">
                <img src={selectedImage.previewUrl} alt="Selected preview" className="h-10 w-10 rounded-md object-cover" />
                <span className="text-xs text-slate-600 truncate">{selectedImage.file.name}</span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-500"
                aria-label="Remove image"
              >
                <Icon name="x-mark" className="h-4 w-4" />
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="inline-flex items-center justify-center h-12 w-12 rounded-full text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex-shrink-0"
              aria-label="Attach an image"
            >
              <Icon name="image" className="h-6 w-6" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your travel plans..."
              className="flex-1 block w-full rounded-full border-transparent bg-slate-100 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm py-3 px-5"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="inline-flex items-center justify-center h-12 w-12 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex-shrink-0"
              aria-label="Send message"
            >
              <Icon name="send" className="h-6 w-6" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default React.memo(ChatInterface);