import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { Language } from '../App';
import { styles } from './styles'; // Import styles

interface HeaderProps {
  onOpenVipModal: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogoutClick: () => void;
  isOffline: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ onOpenVipModal, isLoggedIn, onLoginClick, onSignUpClick, onLogoutClick, isOffline, language, setLanguage, t }) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  ];

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLogoContainer}>
        <Icon name="logo" style={{ width: 32, height: 32 }} color="#2563eb" />
        <Text style={styles.headerTitle}>FlyWise.AI</Text>
        {isOffline && (
          <View style={localStyles.offlineBadge}>
            <Icon name="wifi-slash" style={{ width: 16, height: 16 }} color="#d1d5db" />
            <Text style={localStyles.offlineText}>Offline Mode</Text>
          </View>
        )}
      </View>
      <View style={styles.headerActions}>
        {/* Language Dropdown would need a custom implementation or a library in RN */}
        {isLoggedIn ? (
          <>
            <Text style={localStyles.welcomeText}>Welcome!</Text>
            <TouchableOpacity onPress={onLogoutClick} style={[styles.button, localStyles.authButton]}>
              <Text style={localStyles.authButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={onLoginClick} style={[styles.button, { paddingHorizontal: 12 }]}>
              <Text style={localStyles.loginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSignUpClick} style={[styles.button, styles.buttonPrimary]}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
          </>
        )}
        
        <View style={localStyles.divider}></View>

        <TouchableOpacity onPress={onOpenVipModal} style={[styles.button, localStyles.vipButton]}>
          <Icon name="sparkles" style={{ marginRight: 8, width: 20, height: 20 }} color="#c2410c" />
          <Text style={localStyles.vipButtonText}>VIP Lounge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        backgroundColor: '#374151',
    },
    offlineText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 8,
    },
    welcomeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
    },
    authButton: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: 'white',
    },
    authButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
    },
    loginText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    divider: {
        height: 24,
        width: 1,
        backgroundColor: 'rgba(226, 232, 240, 0.8)',
    },
    vipButton: {
        backgroundColor: '#ffedd5',
        flexDirection: 'row',
    },
    vipButtonText: {
        color: '#9a3412',
        fontWeight: '500',
        fontSize: 14,
    }
});

export default React.memo(Header);