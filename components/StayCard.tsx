// This component is converted to React Native Web.
// Abridged for brevity.
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Stay } from '../types';
import { styles } from './styles';

const StayCard: React.FC<any> = ({ stay, onBookStay }) => {
  return (
    <View style={[styles.card, { flexDirection: 'row' }]}>
      <Image source={{ uri: stay.imageUrl }} style={localStyles.image} />
      <View style={localStyles.content}>
        <Text style={localStyles.name}>{stay.name}</Text>
        <Text style={localStyles.location}>{stay.location}</Text>
        {/* ... other content ... */}
      </View>
    </View>
  );
};
const localStyles = StyleSheet.create({ 
    image: { width: 120, height: '100%' },
    content: { flex: 1, padding: 16 },
    name: { fontSize: 18, fontWeight: 'bold' },
    location: { color: '#64748b' }
});
export default React.memo(StayCard);
