import React from 'react';
// FIX: Import ScrollView from react-native
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SavedTrip, SearchResult, ItineraryPlan, Flight, Stay, Car } from '../types';

interface ComparisonViewProps {
  tripsToCompare: SavedTrip[];
}

const getPriceRange = (items: (Flight | Stay | Car)[]) => {
  if (items.length === 0) return 'N/A';
  const prices = items.map(item => {
    if (item.type === 'flight') return item.price;
    if (item.type === 'stay') return item.pricePerNight;
    if (item.type === 'car') return item.pricePerDay;
    return 0;
  });
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};


const ComparisonView: React.FC<ComparisonViewProps> = ({ tripsToCompare }) => {
  const allItineraries = tripsToCompare.length > 0 && tripsToCompare.every(trip => trip.type === 'itinerary');
  const allSearches = tripsToCompare.length > 0 && tripsToCompare.every(trip => trip.type === 'search');

  const baseFeatures = [
    "Destination", "Duration", "Activities", "Cultural Tips", "Flights", "Stays", "Cars", "Total Estimated Cost"
  ];

  let features = baseFeatures;

  if (allItineraries) {
    features = baseFeatures.filter(f => !["Flights", "Stays", "Cars"].includes(f));
  } else if (allSearches) {
    features = baseFeatures.filter(f => !["Activities", "Cultural Tips"].includes(f));
  }

  const getCellContent = (trip: SavedTrip, feature: string) => {
    const tripData = trip.data;
    let cellContent = <Text style={localStyles.cellTextMuted}>—</Text>;

    if (trip.type === 'itinerary') {
        const plan = tripData as ItineraryPlan;
        switch (feature) {
            case "Destination": cellContent = <Text style={localStyles.cellText}>{plan.destination}</Text>; break;
            case "Duration": cellContent = <Text style={localStyles.cellText}>{plan.itinerary.length} days</Text>; break;
            case "Activities": cellContent = <Text style={localStyles.cellText}>{plan.itinerary.length * 3} activities planned</Text>; break;
            case "Cultural Tips": cellContent = <Text style={localStyles.cellText}>{plan.culturalTips?.length || 0} tips</Text>; break;
            case "Total Estimated Cost":
            if (plan.totalBudget) {
                cellContent = (
                <View>
                    <Text style={localStyles.cellTextBold}>${plan.totalBudget.toLocaleString()}</Text>
                    <Text style={localStyles.cellSubText}>AI Estimated</Text>
                </View>
                );
            }
            break;
        }
    } else { // 'search'
        const results = tripData as SearchResult[];
        const flights = results.filter(r => r.type === 'flight') as Flight[];
        const stays = results.filter(r => r.type === 'stay') as Stay[];
        const cars = results.filter(r => r.type === 'car') as Car[];
        const isPackage = flights.length > 0 && stays.length > 0;

        switch (feature) {
            case "Destination": {
                let destination = 'N/A';
                if (flights.length > 0) destination = flights[0].arrivalAirport;
                else if (stays.length > 0) destination = stays[0].location;
                else if (cars.length > 0) destination = cars[0].location;
                cellContent = <Text style={localStyles.cellText}>{destination}</Text>;
                break;
            }
            case "Flights":
                cellContent = flights.length > 0 ? (
                    <View>
                        <Text style={localStyles.cellText}>{flights.length} found</Text>
                        <Text style={localStyles.cellSubText}>{getPriceRange(flights)}</Text>
                        {isPackage && <Text style={localStyles.packageDealText}>Package Deal</Text>}
                    </View>
                ) : <Text style={localStyles.cellText}>0 found</Text>;
                break;
             case "Stays":
                cellContent = stays.length > 0 ? (
                    <View>
                        <Text style={localStyles.cellText}>{stays.length} found</Text>
                        <Text style={localStyles.cellSubText}>{getPriceRange(stays)}/night</Text>
                        {isPackage && <Text style={localStyles.packageDealText}>Package Deal</Text>}
                    </View>
                ) : <Text style={localStyles.cellText}>0 found</Text>;
                break;
            // ... more cases
        }
    }
    return cellContent;
  };

  return (
    <ScrollView horizontal>
        <View style={localStyles.table}>
            {/* Header Row */}
            <View style={localStyles.row}>
                <View style={[localStyles.headerCell, localStyles.featureCell]}>
                    <Text style={localStyles.headerText}>Feature</Text>
                </View>
                {tripsToCompare.map(trip => (
                    <View key={trip.id} style={[localStyles.headerCell, localStyles.dataCell]}>
                        <Text style={localStyles.headerText}>{trip.name}</Text>
                    </View>
                ))}
            </View>
            {/* Data Rows */}
            {features.map((feature, index) => (
                <View key={feature} style={[localStyles.row, index % 2 !== 0 && localStyles.altRow]}>
                    <View style={[localStyles.featureCell, localStyles.bodyCell]}>
                        <Text style={localStyles.featureText}>{feature}</Text>
                    </View>
                    {tripsToCompare.map(trip => (
                        <View key={trip.id} style={[localStyles.dataCell, localStyles.bodyCell]}>
                            {getCellContent(trip, feature)}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
    table: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        backgroundColor: 'white',
        minWidth: 600,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
    },
    altRow: {
        backgroundColor: '#f8fafc',
    },
    headerCell: {
        padding: 12,
        backgroundColor: '#f8fafc',
    },
    bodyCell: {
        padding: 12,
        justifyContent: 'center',
    },
    featureCell: {
        width: 150,
    },
    dataCell: {
        flex: 1,
        borderLeftWidth: 1,
        borderColor: '#e2e8f0',
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        textTransform: 'uppercase',
    },
    featureText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    cellText: {
        fontSize: 14,
        color: '#334155',
    },
    cellTextBold: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    cellTextMuted: {
        fontSize: 14,
        color: '#64748b',
    },
    cellSubText: {
        fontSize: 12,
        color: '#64748b',
    },
    packageDealText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563eb',
    }
});

export default React.memo(ComparisonView);