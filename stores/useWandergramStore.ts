import { create } from 'zustand';
import { WandergramPost, WandergramStory, WandergramConversation, WandergramComment } from '../types';
import * as xanoService from '../services/xanoService';

interface WandergramState {
  posts: WandergramPost[];
  stories: WandergramStory[];
  conversations: WandergramConversation[];
  activeView: 'feed' | 'chatList' | 'chat';
  activeConversationId: string | null;

  fetchPosts: () => Promise<void>;
  fetchStories: () => Promise<void>;
  fetchConversations: () => Promise<void>;

  createPost: (postData: Omit<WandergramPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'user'>) => Promise<void>;
  addComment: (postId: string, commentText: string) => Promise<void>;
  
  navigate: (view: 'feed' | 'chatList') => void;
  selectConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
}

export const useWandergramStore = create<WandergramState>((set, get) => ({
  posts: [],
  stories: [],
  conversations: [],
  activeView: 'feed',
  activeConversationId: null,

  fetchPosts: async () => {
    const posts = await xanoService.getWandergramFeed();
    set({ posts });
  },
  
  fetchStories: async () => {
    const stories = await xanoService.getWandergramStories();
    set({ stories });
  },
  
  fetchConversations: async () => {
    const conversations = await xanoService.getWandergramConversations();
    set({ conversations });
  },

  createPost: async (postData) => {
    const newPost = await xanoService.createWandergramPost(postData);
    set((state) => ({ posts: [newPost, ...state.posts] }));
  },

  addComment: async (postId, commentText) => {
    const newComment = await xanoService.addWandergramComment(postId, commentText);
    set((state) => ({
      posts: state.posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment as WandergramComment] } 
          : post
      ),
    }));
  },
  
  navigate: (view) => set({ activeView: view }),
  selectConversation: (conversationId) => set({ activeView: 'chat', activeConversationId: conversationId }),

  sendMessage: async (conversationId, text) => {
    const newMessage = await xanoService.sendWandergramMessage(conversationId, text);
    set((state) => ({
      conversations: state.conversations.map(convo => 
        convo.id === conversationId
          ? { ...convo, messages: [...convo.messages, newMessage] }
          : convo
      )
    }));
  },
}));
