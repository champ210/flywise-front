import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // App Container
  appContainer: {
    width: '100%',
    maxWidth: 1280,
    marginHorizontal: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderRadius: 16,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    // FIX: Cast 'vh' unit to 'any' for RNW compatibility with RN types
    maxHeight: '95vh' as any,
  },
  
  // Header
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Navigation
  navContainer: {
    borderBottomWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTabs: {
    flexDirection: 'row',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  navButtonActive: {
    borderColor: '#2563eb',
  },
  navIcon: {
    width: 20,
    height: 20,
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  navTextActive: {
    color: '#2563eb',
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContentContainer: {
      padding: 16,
  },
  
  // More Menu
  moreMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    width: 256,
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    padding: 8,
    zIndex: 50,
  },
  moreMenuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  moreMenuItemActive: {
    backgroundColor: '#eff6ff',
  },
  moreMenuIcon: {
      width: 20,
      height: 20,
      marginRight: 12,
  },
  moreMenuText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#334155',
  },
  moreMenuTextActive: {
      color: '#2563eb',
  },

  // Generic Card
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },

  // Generic form input
  formInput: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: 'white',
      fontSize: 14,
  },

  // Modals
  modalBackdrop: {
      // FIX: Cast 'fixed' to any to allow web-specific positioning in RNW
      position: 'fixed' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 50,
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContainer: {
      backgroundColor: 'white',
      borderRadius: 12,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: 500,
      // FIX: Cast 'vh' unit to 'any' for RNW compatibility with RN types
      maxHeight: '90vh' as any,
      display: 'flex',
      flexDirection: 'column',
  },
});