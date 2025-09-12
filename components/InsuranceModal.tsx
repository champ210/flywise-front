import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SavedTrip, TravelInsuranceQuote } from '../types';
import { Icon } from './Icon';
import { styles } from './styles';

interface InsuranceModalProps {
  trip: SavedTrip;
  quotes: TravelInsuranceQuote[];
  onClose: () => void;
}

const InsuranceQuoteCard: React.FC<{ quote: TravelInsuranceQuote }> = ({ quote }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View style={localStyles.quoteCard}>
            <View>
                <View style={localStyles.quoteHeader}>
                    <Text style={localStyles.providerName}>{quote.provider}</Text>
                    <View style={localStyles.bestForBadge}>
                        <Text style={localStyles.bestForText}>{quote.bestFor}</Text>
                    </View>
                </View>
                <View style={{marginVertical: 16, alignItems: 'center'}}>
                    <Text style={localStyles.priceText}>${quote.price.toLocaleString()}</Text>
                    <Text style={localStyles.priceSubtext}>Total Price</Text>
                </View>
                <View>
                    <View style={localStyles.coverageItem}>
                        <Text style={localStyles.coverageLabel}>Medical Coverage:</Text>
                        <Text style={localStyles.coverageValue}>${quote.coverage.medical.limit.toLocaleString()}</Text>
                    </View>
                     <View style={localStyles.coverageItem}>
                        <Text style={localStyles.coverageLabel}>Cancellation Coverage:</Text>
                        <Text style={localStyles.coverageValue}>${quote.coverage.cancellation.limit.toLocaleString()}</Text>
                    </View>
                     <View style={localStyles.coverageItem}>
                        <Text style={localStyles.coverageLabel}>Baggage Coverage:</Text>
                        <Text style={localStyles.coverageValue}>${quote.coverage.baggage.limit.toLocaleString()}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={[styles.button, styles.buttonPrimary, {marginTop: 24}]}>
                <Text style={styles.buttonText}>{isExpanded ? 'Hide Details' : 'View Details'}</Text>
            </TouchableOpacity>
        </View>
    );
};


const InsuranceModal: React.FC<InsuranceModalProps> = ({ trip, quotes, onClose }) => {
  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalContainer, {maxWidth: 900}]} onStartShouldSetResponder={() => true}>
            <View style={localStyles.modalHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="shield" style={{width: 28, height: 28, marginRight: 12}} color="#2563eb" />
                    <Text style={localStyles.modalTitle}>Insurance Quotes for {trip.name}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{padding: 8}}>
                    <Icon name="x-mark" style={{width: 24, height: 24}} color="#9ca3af" />
                </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={{padding: 24}}>
                {quotes.length > 0 ? (
                    <View style={localStyles.grid}>
                        {quotes.map((quote, index) => (
                            <InsuranceQuoteCard key={index} quote={quote} />
                        ))}
                    </View>
                ) : (
                    <View style={localStyles.emptyState}>
                        <Icon name="search" style={{width: 48, height: 48}} color="#94a3b8" />
                        <Text style={localStyles.emptyTitle}>No insurance quotes found</Text>
                        <Text style={localStyles.emptySubtitle}>We couldn't generate any insurance quotes for this trip. Please try again later.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: -12, // Gutter
    },
    quoteCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        justifyContent: 'space-between',
        // FIX: Cast web-specific 'calc' value to any to satisfy React Native's stricter DimensionValue type.
        width: 'calc(33.333% - 24px)' as any, // For 3 columns
        margin: 12,
    },
    quoteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    providerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    bestForBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    bestForText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#166534',
    },
    priceText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    priceSubtext: {
        fontSize: 14,
        color: '#64748b',
    },
    coverageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
        paddingTop: 12,
        marginTop: 12,
    },
    coverageLabel: {
        fontWeight: '600',
        color: '#475569',
        fontSize: 14,
    },
    coverageValue: {
        fontWeight: 'bold',
        color: '#1e293b',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
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
    }
});

export default InsuranceModal;