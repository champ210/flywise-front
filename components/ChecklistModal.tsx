import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { SavedTrip, Checklist, ChecklistItem } from '../types';
import { Icon } from './Icon';
import { styles } from './styles';

interface ChecklistModalProps {
  trip: SavedTrip;
  checklist: Checklist;
  onClose: () => void;
}

const CheckboxIcon: React.FC<{ checked: boolean }> = ({ checked }) => {
    if (checked) {
        return (
            <View style={localStyles.checkboxChecked}>
                <Icon name="check-circle" color="white" style={{width: 16, height: 16}} />
            </View>
        );
    }
    return <View style={localStyles.checkboxUnchecked} />;
};

const ChecklistSection: React.FC<{
  title: string;
  icon: string;
  items: ChecklistItem[];
  onToggle: (index: number) => void;
  children?: React.ReactNode;
}> = ({ title, icon, items, onToggle, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <View style={localStyles.sectionContainer}>
            <TouchableOpacity
                onPress={() => setIsOpen(!isOpen)}
                style={localStyles.sectionHeader}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name={icon} style={{width: 24, height: 24, marginRight: 12}} color="#2563eb" />
                    <Text style={localStyles.sectionTitle}>{title}</Text>
                </View>
                <Icon name="chevron-down" style={{width: 20, height: 20, transform: [{rotate: isOpen ? '180deg' : '0deg'}]}} color="#64748b" />
            </TouchableOpacity>
            {isOpen && (
                <View style={localStyles.sectionContent}>
                    {items.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => onToggle(index)} style={localStyles.checklistItem}>
                            <CheckboxIcon checked={item.checked} />
                            <Text style={[localStyles.itemText, item.checked && localStyles.itemTextChecked]}>
                                {item.item}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    {children}
                </View>
            )}
        </View>
    );
};


const ChecklistModal: React.FC<ChecklistModalProps> = ({ trip, checklist, onClose }) => {
  const [currentChecklist, setCurrentChecklist] = useState<Checklist>(checklist);

  const handleToggle = (section: keyof Checklist, itemIndex: number) => {
    setCurrentChecklist(prev => {
      const newChecklist = { ...prev };
      const isChecklistItemArray = (arr: any): arr is ChecklistItem[] => Array.isArray(arr) && (arr.length === 0 || typeof arr[0].item === 'string');

      if (section === 'documents') {
        const newItems = [...prev.documents.items];
        newItems[itemIndex] = { ...newItems[itemIndex], checked: !newItems[itemIndex].checked };
        newChecklist.documents = { ...prev.documents, items: newItems };
      } else if (isChecklistItemArray(newChecklist[section])) {
        const newItems = [...(newChecklist[section] as ChecklistItem[])];
        newItems[itemIndex] = { ...newItems[itemIndex], checked: !newItems[itemIndex].checked };
        (newChecklist as any)[section] = newItems;
      }
      
      return newChecklist;
    });
  };

  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalContainer, {maxWidth: 600}]} onStartShouldSetResponder={() => true}>
          <View style={localStyles.modalHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Icon name="check-circle" style={{width: 28, height: 28, marginRight: 12}} color="#22c55e" />
              <Text style={localStyles.modalTitle}>Travel Checklist for {trip.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{padding: 8}}>
              <Icon name="x-mark" style={{width: 24, height: 24}} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
              <ChecklistSection 
                  title="Packing List"
                  icon="suitcase"
                  items={currentChecklist.packingList}
                  onToggle={(index) => handleToggle('packingList', index)}
              />
              <ChecklistSection 
                  title="Essential Documents"
                  icon="document"
                  items={currentChecklist.documents.items}
                  onToggle={(index) => handleToggle('documents', index)}
              >
                  {currentChecklist.documents.sources && currentChecklist.documents.sources.length > 0 && (
                      <View style={localStyles.sourcesContainer}>
                          <Text style={localStyles.sourcesTitle}>Sources</Text>
                          {currentChecklist.documents.sources.map((source, i) => (
                              <Text key={i} style={localStyles.sourceLink}>{source.title || source.uri}</Text>
                          ))}
                      </View>
                  )}
              </ChecklistSection>
               <ChecklistSection 
                  title="Local Essentials"
                  icon="lightbulb"
                  items={currentChecklist.localEssentials}
                  onToggle={(index) => handleToggle('localEssentials', index)}
              />
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
    sectionContainer: {
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    sectionContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkboxChecked: {
        width: 20,
        height: 20,
        backgroundColor: '#2563eb',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxUnchecked: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#94a3b8',
        borderRadius: 4,
    },
    itemText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#334155',
    },
    itemTextChecked: {
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    sourcesContainer: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
    },
    sourcesTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    sourceLink: {
        fontSize: 12,
        color: '#2563eb',
        textDecorationLine: 'underline',
        marginTop: 4,
    }
});

export default ChecklistModal;