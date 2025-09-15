import { IconProps } from "../types";

export enum Tab {
  Home = 'Home',
  FlightTracker = 'Flight Tracker',
  Discovery = 'Discovery',
  Chat = 'Chat',
  Planner = 'Planner',
  SuperServices = 'Super Services',
  Coworking = 'Coworking',
  LocalConnections = 'Local Connections',
  // More menu tabs
  MyTrips = 'My Trips',
  Checklist = 'Checklist',
  GroupPlanning = 'Group Planning',
  Wandergram = 'Wandergram',
  TravelBuddy = 'Travel Buddy',
  Events = 'Meetup Events',
  Wallet = 'Wallet',
  Converter = 'Converter',
  Passport = 'Passport',
  Search = 'Search',
  Profile = 'My Profile',
}

interface TabConfig {
  name: Tab;
  icon: IconProps['name'];
}

export const PRIMARY_TABS: TabConfig[] = [
  { name: Tab.Home, icon: 'home' },
  { name: Tab.FlightTracker, icon: 'send' },
  { name: Tab.Discovery, icon: 'compass' },
  { name: Tab.Chat, icon: 'chat' },
  { name: Tab.Planner, icon: 'planner' },
  { name: Tab.SuperServices, icon: 'grid' },
  { name: Tab.Coworking, icon: 'briefcase' },
  { name: Tab.LocalConnections, icon: 'users' },
];

export const MORE_TABS: TabConfig[] = [
  { name: Tab.MyTrips, icon: 'bookmark' },
  { name: Tab.Checklist, icon: 'checklist' },
  { name: Tab.GroupPlanning, icon: 'clipboard-list' },
  { name: Tab.Wandergram, icon: 'instagram' },
  { name: Tab.TravelBuddy, icon: 'users' },
  { name: Tab.Events, icon: 'calendar' },
  { name: Tab.Wallet, icon: 'wallet' },
  { name: Tab.Converter, icon: 'exchange' },
  { name: Tab.Passport, icon: 'passport' },
  { name: Tab.Search, icon: 'search' },
  { name: Tab.Profile, icon: 'user' },
];
