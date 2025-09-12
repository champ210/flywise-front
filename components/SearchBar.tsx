import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { UserProfile } from '../types';
import { Icon } from './Icon';
import { styles } from './styles';

interface SearchBarProps {
  onSearch: (results: any[]) => void;
  onLoading: (isLoading: boolean) => void;
  onError: (error: string) => void;
  userProfile: UserProfile;
}

enum SearchType {
  Flights = 'Flights',
  Stays = 'Stays',
  Cars = 'Cars',
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLoading, onError, userProfile }) => {
  const [searchType, setSearchType] = useState<SearchType>(SearchType.Flights);

  const handleSearch = (e: any) => {
    onLoading(true);
    onError("Please use the Chat Assistant to perform searches. The standard search bar is for demonstration purposes.");
    onSearch([]);
    onLoading(false);
  };

  const renderFlightForm = () => (
    <View style={localStyles.formContainer}>
        {/* Form fields would be implemented here */}
        <TouchableOpacity onPress={handleSearch} style={[styles.button, styles.buttonPrimary, { width: '100%'}]}>
           <Icon name="search" style={{ marginRight: 8, width: 20, height: 20 }} color="white" />
           <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
    </View>
  );

  // ... renderStayForm and renderCarForm would be similar

  return (
    <View>
      <View style={localStyles.tabsContainer}>
        <TouchableOpacity onPress={() => setSearchType(SearchType.Flights)} style={[localStyles.tab, searchType === SearchType.Flights && localStyles.activeTab]}>
          <Icon name="flight" style={localStyles.tabIcon} color={searchType === SearchType.Flights ? '#334155' : '#4b5563'} />
          <Text style={localStyles.tabText}>Flights</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSearchType(SearchType.Stays)} style={[localStyles.tab, searchType === SearchType.Stays && localStyles.activeTab]}>
          <Icon name="hotel" style={localStyles.tabIcon} color={searchType === SearchType.Stays ? '#334155' : '#4b5563'} />
          <Text style={localStyles.tabText}>Stays</Text>
        </TouchableOpacity>
         <TouchableOpacity onPress={() => setSearchType(SearchType.Cars)} style={[localStyles.tab, searchType === SearchType.Cars && localStyles.activeTab]}>
          <Icon name="car" style={localStyles.tabIcon} color={searchType === SearchType.Cars ? '#334155' : '#4b5563'} />
          <Text style={localStyles.tabText}>Cars</Text>
        </TouchableOpacity>
      </View>
      <View style={localStyles.formWrapper}>
        {/* Simplified form for demonstration */}
        {renderFlightForm()}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        padding: 4,
        alignSelf: 'flex-start',
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: 'white',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    tabIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    formWrapper: {
        padding: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#e5e7eb',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8,
    },
    formContainer: {
        // Add styles for form grid
    }
});

export default React.memo(SearchBar);