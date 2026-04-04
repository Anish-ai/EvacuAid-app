import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { useAppStore } from '../data/store';
import { useRouter } from 'expo-router';
import { AlertOctagon, Navigation, CheckCircle, Phone, FileWarning } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { EMERGENCY_ROUTE } from '../data/mockData';

export default function EmergencyModeScreen() {
  const { activeIncidentId, incidents, setEmergencyMode } = useAppStore();
  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  const incident = incidents.find(i => i.id === activeIncidentId) || incidents[0];

  const handleDismiss = () => {
    setEmergencyMode(false);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.alertHeader, { opacity: fadeAnim }]}>
           <AlertOctagon color="white" size={64} style={{marginBottom: 16}} />
           <Text style={styles.alertTitle}>EMERGENCY ACTIVE</Text>
           <Text style={styles.alertType}>{incident?.type.toUpperCase()} DETECTED</Text>
        </Animated.View>

        <View style={styles.card}>
           <View style={styles.cardHeader}>
              <FileWarning color="#dc2626" />
              <Text style={styles.cardTitle}>Incident Details</Text>
           </View>
           <Text style={styles.cardText}><Text style={{fontWeight: 'bold'}}>Location:</Text> {incident?.location}</Text>
           <Text style={styles.cardText}><Text style={{fontWeight: 'bold'}}>Description:</Text> {incident?.description}</Text>
           <View style={styles.aiBox}>
              <Text style={styles.aiTitle}>AI Analysis:</Text>
              <Text style={styles.aiText}>{incident?.aiSummary}</Text>
           </View>
        </View>

        <View style={styles.card}>
           <View style={styles.cardHeader}>
              <Navigation color="#16a34a" />
              <Text style={styles.cardTitle}>Evacuation Route</Text>
           </View>
           <Text style={styles.routeDistance}>Safe Distance: {EMERGENCY_ROUTE.safeDistance}</Text>
           {EMERGENCY_ROUTE.instructions.map((inst, index) => (
             <View key={index} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{index + 1}</Text></View>
                <Text style={styles.stepText}>{inst}</Text>
             </View>
           ))}
           <Pressable style={styles.mapBtn} onPress={() => { router.back(); router.push('/(tabs)/map'); }}>
              <Text style={styles.mapBtnText}>Open Live Map</Text>
           </Pressable>
        </View>

        <View style={styles.actionRow}>
           <Pressable style={styles.callBtn}>
               <Phone color="white" />
               <Text style={styles.callBtnText}>Call Help</Text>
           </Pressable>
           <Pressable style={styles.dismissBtn} onPress={handleDismiss}>
               <CheckCircle color="white" />
               <Text style={styles.dismissBtnText}>I'm Safe</Text>
           </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7f1d1d' }, // Dark Red Background
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  alertHeader: { alignItems: 'center', marginBottom: 32 },
  alertTitle: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  alertType: { color: '#fca5a5', fontSize: 16, fontWeight: '700', marginTop: 4 },
  
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#0f172a' },
  cardText: { fontSize: 15, color: '#334155', marginBottom: 6, lineHeight: 22 },
  aiBox: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#fecaca' },
  aiTitle: { fontWeight: 'bold', color: '#dc2626', marginBottom: 4 },
  aiText: { color: '#991b1b', fontSize: 14, lineHeight: 20 },

  routeDistance: { fontWeight: 'bold', color: '#16a34a', marginBottom: 16 },
  stepRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  stepNum: { backgroundColor: '#16a34a', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepNumText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  stepText: { flex: 1, fontSize: 15, color: '#334155', lineHeight: 22 },
  mapBtn: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  mapBtnText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  callBtn: { flex: 1, backgroundColor: '#000000', flexDirection: 'row', padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  callBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  dismissBtn: { flex: 1, backgroundColor: '#16a34a', flexDirection: 'row', padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  dismissBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }
});
