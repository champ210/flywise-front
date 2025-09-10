
import { Badge, VoyageurLevel } from '../../types';

export const ALL_BADGES: Badge[] = [
  { id: 'first-booking', name: 'First Booking', description: 'Awarded for making your first flight or hotel booking.', icon: 'first-booking' },
  { id: 'storyteller', name: 'Storyteller', description: 'Share your first travel story with the community.', icon: 'story-writer' },
  { id: 'community-pioneer', name: 'Community Pioneer', description: 'Join your first travel community.', icon: 'community-pioneer' },
  { id: 'appreciator', name: 'Appreciator', description: 'Liked your first community post.', icon: 'heart' },
  { id: 'curator', name: 'Curator', description: 'Saved your first post to your inspiration board.', icon: 'bookmark' },
  { id: 'conversation-starter', name: 'Conversation Starter', description: 'Commented on a post for the first time.', icon: 'chat-bubble' },
  { id: 'trip-planner', name: 'Trip Planner', description: 'Create and save your first itinerary.', icon: 'planner' },
  { id: 'jet-setter', name: 'Jet Setter', description: 'Book flights to 3 different countries.', icon: 'flight' },
  { id: 'social-butterfly', name: 'Social Butterfly', description: 'Join 5 different travel communities.', icon: 'users' },
  { id: 'memory-maker', name: 'Memory Maker', description: 'Create your first AI-powered travel documentary.', icon: 'movie' },
  { id: 'foodie-explorer', name: 'Foodie Explorer', description: 'Order from a local restaurant via Super Services.', icon: 'food' },
  { id: 'local-rider', name: 'Local Rider', description: 'Take a ride to explore the city via Super Services.', icon: 'car' },
  { id: 'explorer-buddy', name: 'Explorer Buddy', description: 'Complete your first hangout with a local.', icon: 'compass' },
  { id: 'digital-nomad', name: 'Digital Nomad', description: 'Book your first coworking space.', icon: 'briefcase' },
  { id: 'global-connector', name: 'Global Connector', description: 'Book coworking spaces in 3 different countries.', icon: 'globe' },
];


export const VOYAGEUR_LEVELS: VoyageurLevel[] = [
  { level: 1, name: 'Wanderer', pointsRequired: 0 },
  { level: 2, name: 'Explorer', pointsRequired: 1000 },
  { level: 3, name: 'Adventurer', pointsRequired: 2500 },
  { level: 4, name: 'Globetrotter', pointsRequired: 5000 },
  { level: 5, name: 'Voyageur', pointsRequired: 10000 },
];
