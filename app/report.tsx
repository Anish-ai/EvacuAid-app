import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { submitIncidentReport } from '../services/MockApi';
import { useAppStore } from '../data/store';
import { IncidentType } from '../types';
import { Flame, ShieldAlert, Activity, Users, AlertOctagon, Droplet, PowerOff, HelpCircle } from 'lucide-react-native';

const INCIDENT_CATEGORIES: { type: IncidentType, label: string, icon: React.ReactNode }[] = [
  { type: 'fire', label: 'Fire/Smoke', icon: <Flame color="white" /> },
  { type: 'medical', label: 'Medical', icon: <Activity color="white" /> },
  { type: 'suspicious_activity', label: 'Security', icon: <ShieldAlert color="white" /> },
  { type: 'crowd_congestion', label: 'Overcrowding', icon: <Users color="white" /> },
  { type: 'blocked_exit', label: 'Blocked Route', icon: <AlertOctagon color="white" /> },
  { type: 'water_leakage', label: 'Leakage', icon: <Droplet color="white" /> },
  { type: 'power_outage', label: 'Power', icon: <PowerOff color="white" /> },
  { type: 'other', label: 'Other', icon: <HelpCircle color="white" /> },
];

export default function ReportScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addIncident, setEmergencyMode, setActiveIncidentId } = useAppStore();

  const handleSubmit = async () => {
    if (!selectedType || !location) {
      Alert.alert('Missing Info', 'Please select an incident type and provide a location.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Fake API call
      const newIncident = await submitIncidentReport(
        selectedType,
        'high',
        description || 'No description provided',
        location
      );

      addIncident(newIncident);
      setActiveIncidentId(newIncident.id);
      
      // Auto-trigger emergency mode if it's fire or medical
      if (selectedType === 'fire' || selectedType === 'medical') {
        setEmergencyMode(true);
        router.replace('/emergency');
      } else {
        Alert.alert('Report Submitted', 'Responders have been notified.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (e) {
      Alert.alert('Error', 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
       <View style={styles.content}>
          <Text style={styles.label}>What is the emergency?</Text>
          <View style={styles.grid}>
             {INCIDENT_CATEGORIES.map(cat => (
               <Pressable 
                  key={cat.type} 
                  style={[styles.typeCard, selectedType === cat.type && styles.typeCardSelected]}
                  onPress={() => setSelectedType(cat.type)}
               >
                  <View style={[styles.iconWrapper, selectedType === cat.type ? { backgroundColor: 'transparent' } : null]}>
                     {selectedType === cat.type ? <Flame color="#dc2626" /> : cat.icon}
                  </View>
                  <Text style={[styles.typeLabel, selectedType === cat.type && styles.typeLabelSelected]}>
                     {cat.label}
                  </Text>
               </Pressable>
             ))}
          </View>

          <Text style={styles.label}>Where are you?</Text>
          <TextInput 
            style={styles.input} 
            placeholder="E.g., Floor 2 Corridor, Room 304" 
            placeholderTextColor="#94a3b8"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Additional Details (Optional)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Describe what you see..." 
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <Pressable 
             style={[styles.submitBtn, (!selectedType || !location || isSubmitting) && styles.submitBtnDisabled]} 
             onPress={handleSubmit}
             disabled={!selectedType || !location || isSubmitting}
          >
             {isSubmitting ? (
                <ActivityIndicator color="white" />
             ) : (
                <Text style={styles.submitText}>Submit Report</Text>
             )}
          </Pressable>
          <Text style={styles.notice}>If you are in immediate life-threatening danger, prioritize your physical safety and EVACUATE.</Text>
       </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '48%', backgroundColor: '#475569', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeCardSelected: { backgroundColor: '#fee2e2', borderWidth: 2, borderColor: '#dc2626' },
  iconWrapper: { marginBottom: 8 },
  typeLabel: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  typeLabelSelected: { color: '#dc2626' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#dc2626', padding: 20, borderRadius: 16, marginTop: 32, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: 'white', fontWeight: '900', fontSize: 18 },
  notice: { color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 }
});
