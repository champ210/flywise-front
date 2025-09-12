import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SavedTrip, Checklist, ItineraryPlan, TravelInsuranceQuote } from '../types';
import { Icon } from './Icon';
import ComparisonView from './ComparisonView';
import ChecklistModal from './ChecklistModal';
import InsuranceModal from './InsuranceModal';
import { getTravelChecklist, getInsuranceQuotes } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import LiveTripDashboard from './LiveTripDashboard';
import { styles } from './styles';

interface MyTripsProps {
  savedTrips: SavedTrip[];
  onDeleteTrip: (tripId: string) => void;
  isOffline: boolean;
  onOpenScanner: () => void;
  onGetNearbySuggestions: () => void;
}

const MyTrips: React.FC<MyTripsProps> = ({ savedTrips, onDeleteTrip, isOffline, onOpenScanner, onGetNearbySuggestions }) => {
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<{ type: 'checklist' | 'insurance', tripId: string } | null>(null);
  const [modalData, setModalData] = useState<{ trip: SavedTrip, checklist: Checklist } | null>(null);
  const [insuranceModalData, setInsuranceModalData] = useState<{ trip: SavedTrip; quotes: TravelInsuranceQuote[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const comparisonRef = useRef<ScrollView>(null);

  const activeTrip = savedTrips.find(trip => {
    if (trip.type !== 'itinerary' || !trip.startDate || !trip.endDate) return false;
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return now >= start && now <= end;
  });

  const handleToggleSelect = (tripId: string) => {
    setSelectedTripIds(prev =>
      prev.includes(tripId)
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const handleGenerateChecklist = async (trip: SavedTrip) => {
    if (trip.type !== 'itinerary') return;
    setIsGenerating({ type: 'checklist', tripId: trip.id });
    setError(null);
    try {
      const checklist = await getTravelChecklist(trip.data as ItineraryPlan);
      setModalData({ trip, checklist });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGetInsurance = async (trip: SavedTrip) => {
    if (trip.type !== 'itinerary') return;
    setIsGenerating({ type: 'insurance', tripId: trip.id });
    setError(null);
    try {
      const quotes = await getInsuranceQuotes(trip.data as ItineraryPlan);
      setInsuranceModalData({ trip, quotes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(null);
    }
  };

  const tripsToCompare = savedTrips.filter(trip => selectedTripIds.includes(trip.id));

  if (activeTrip && activeTrip.type === 'itinerary') {
    return (
      <LiveTripDashboard
        trip={activeTrip as SavedTrip & { data: ItineraryPlan }}
        onOpenScanner={onOpenScanner}
        onGetNearbySuggestions={onGetNearbySuggestions}
      />
    );
  }

  return (
    <View style={localStyles.container}>
        {modalData && (
          <ChecklistModal
            trip={modalData.trip}
            checklist={modalData.checklist}
            onClose={() => setModalData(null)}
          />
        )}
        {insuranceModalData && (
          <InsuranceModal
            trip={insuranceModalData.trip}
            quotes={insuranceModalData.quotes}
            onClose={() => setInsuranceModalData(null)}
          />
        )}
        <View style={localStyles.header}>
          <View>
            <Text style={localStyles.title}>My Saved Trips</Text>
            <Text style={localStyles.subtitle}>
              Here are your saved itineraries and searches. Select two or more to compare.
            </Text>
          </View>
        </View>
        
        {error && (
            <View style={localStyles.errorBox}>
                <Text style={localStyles.errorText}>Error: {error}</Text>
            </View>
        )}

        {savedTrips.length === 0 ? (
          <View style={localStyles.emptyState}>
            <Icon name="bookmark" style={localStyles.emptyIcon} color="#94a3b8" />
            <Text style={localStyles.emptyTitle}>No saved trips yet</Text>
            <Text style={localStyles.emptySubtitle}>Save itineraries or search results to see them here.</Text>
          </View>
        ) : (
          <View>
            {savedTrips.map(trip => (
              <View key={trip.id} style={localStyles.tripItem}>
                {/* Checkbox would be a custom component in RN */}
                <View style={{flex: 1}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name={trip.type === 'itinerary' ? 'planner' : 'search'} style={{width: 20, height: 20, marginRight: 8}} color={trip.type === 'itinerary' ? '#4f46e5' : '#2563eb'} />
                    <Text style={localStyles.tripName}>{trip.name}</Text>
                  </View>
                  <Text style={localStyles.tripDate}>
                    Saved on {new Date(trip.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {trip.type === 'itinerary' && (
                      <>
                        <TouchableOpacity onPress={() => handleGetInsurance(trip)} disabled={!!isGenerating || isOffline} style={localStyles.actionButton}>
                          {isGenerating?.type === 'insurance' && isGenerating?.tripId === trip.id ? <LoadingSpinner /> : <Icon name="shield" style={{width: 20, height: 20}} color="#64748b" />}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleGenerateChecklist(trip)} disabled={!!isGenerating || isOffline} style={localStyles.actionButton}>
                          {isGenerating?.type === 'checklist' && isGenerating?.tripId === trip.id ? <LoadingSpinner /> : <Icon name="lightbulb" style={{width: 20, height: 20}} color="#64748b" />}
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity onPress={() => onDeleteTrip(trip.id)} style={localStyles.actionButton}>
                        <Icon name="trash" style={{width: 20, height: 20}} color="#64748b"/>
                    </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {tripsToCompare.length > 0 && (
          <View style={{marginTop: 48}}>
            <Text style={localStyles.title}>Comparison</Text>
            <ComparisonView tripsToCompare={tripsToCompare} />
          </View>
        )}
    </View>
  );
};

const localStyles = StyleSheet.create({
    container: {
        padding: 16,
        maxWidth: 900,
        marginHorizontal: 'auto',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: '#475569',
    },
    errorBox: {
        marginVertical: 16,
        padding: 16,
        backgroundColor: '#fff1f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 8,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#e2e8f0',
        borderRadius: 8,
    },
    emptyIcon: {
        width: 48,
        height: 48,
    },
    emptyTitle: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#0f172a',
    },
    emptySubtitle: {
        marginTop: 4,
        fontSize: 14,
        color: '#64748b',
    },
    tripItem: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tripName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    tripDate: {
        fontSize: 12,
        color: '#64748b',
        paddingLeft: 28,
    },
    actionButton: {
        padding: 8,
        borderRadius: 9999,
    }
});

export default React.memo(MyTrips);
