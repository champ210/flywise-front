// This component is converted to React Native Web.
// Abridged for brevity.
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Car } from '../types';
import { styles } from './styles';

const CarCard: React.FC<any> = ({ car, onBookCar }) => {
  return (
    <View style={[styles.card, { flexDirection: 'row' }]}>
      <Image source={{ uri: car.imageUrl }} style={localStyles.image} />
      <View style={localStyles.content}>
        <Text style={localStyles.name}>{car.make} {car.model}</Text>
        <Text style={localStyles.company}>{car.company}</Text>
        {/* ... other content ... */}
      </View>
    </View>
  );
};
const localStyles = StyleSheet.create({ 
    image: { width: 120, height: '100%' },
    content: { flex: 1, padding: 16 },
    name: { fontSize: 18, fontWeight: 'bold' },
    company: { color: '#64748b' }
});
export default React.memo(CarCard);
