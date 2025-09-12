// This component is converted to React Native Web.
// Abridged for brevity.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Flight } from '../types';
import { Icon } from './Icon';
import { styles } from './styles';

const FlightCard: React.FC<any> = ({ flight, isSelected, onSelectFlight, onBookFlight }) => {
  return (
    <TouchableOpacity onPress={() => onSelectFlight(flight)} style={[styles.card, isSelected && localStyles.selectedCard]}>
      {/* ... content converted to View and Text ... */}
      <View>
          <Text style={localStyles.airline}>{flight.airline}</Text>
          <Text style={localStyles.flightNumber}>Flight {flight.flightNumber}</Text>
      </View>
      <View>
          <Text style={localStyles.price}>${flight.price.toLocaleString()}</Text>
          {onBookFlight && <TouchableOpacity onPress={() => onBookFlight(flight)} style={[styles.button, styles.buttonPrimary]}><Text style={styles.buttonText}>Book Now</Text></TouchableOpacity>}
      </View>
    </TouchableOpacity>
  );
};
const localStyles = StyleSheet.create({ 
    selectedCard: { borderColor: '#2563eb', borderWidth: 2 },
    airline: { fontWeight: '600', color: '#1e293b' },
    flightNumber: { fontSize: 14, color: '#64748b' },
    price: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' }
});
export default React.memo(FlightCard);
