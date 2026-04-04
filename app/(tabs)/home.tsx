import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useAppStore } from '../../data/store';
import { useRouter } from 'expo-router';
import { ShieldCheck, AlertCircle, MapPin, Activity, Navigation, ArrowRight } from 'lucide-react-native';

export default function HomeScreen() {
  const { role, incidents, emergencyMode } = useAppStore();
  const router = useRouter();

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const isSafe = activeIncidents.length === 0 && !emergencyMode;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header Profile */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>EvacuAid System</Text>
          <Text style={styles.roleBadge}>{role} Mode</Text>
        </View>
        <Pressable onPress={() => router.replace('/')} style={styles.changeRoleBtn}>
           <Text style={styles.changeRoleText}>Switch</Text>
        </Pressable>
      </View>

      {/* Main Status Card */}
      <View style={[styles.statusCard, { backgroundColor: isSafe ? '#f0fdf4' : '#fef2f2', borderColor: isSafe ? '#bbf7d0' : '#fecaca' }]}>
        <View style={styles.statusHeaderRow}>
           {isSafe ? <ShieldCheck color="#16a34a" size={32} /> : <AlertCircle color="#dc2626" size={32} />}
           <Text style={[styles.statusTitle, { color: isSafe ? '#16a34a' : '#dc2626' }]}>
             {isSafe ? 'Everything looks safe.' : 'Attention Needed'}
           </Text>
        </View>
        <Text style={styles.statusSubtitle}>
          {isSafe ? 'No active emergencies reported.' : `${activeIncidents.length} active incidents require your attention.`}
        </Text>
      </View>

      {/* Primary Action Button (Report Issue) */}
      <Pressable style={styles.emergencyButton} onPress={() => router.push('/report')}>
        <View style={styles.emergencyIcon}>
          <AlertCircle color="#fff" size={32} />
        </View>
        <Text style={styles.emergencyBtnTitle}>Report an Issue</Text>
        <Text style={styles.emergencyBtnSub}>Fire, Medical, Security</Text>
      </Pressable>

      {/* Quick Actions Grid */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <ActionCard title="Map View" icon={<Navigation color="#0f172a" size={24} />} onPress={() => router.push('/(tabs)/map')} />
        <ActionCard title="AI Assistant" icon={<Activity color="#0f172a" size={24} />} onPress={() => router.push('/assistant')} />
        <ActionCard title="Safety Tips" icon={<ShieldCheck color="#0f172a" size={24} />} onPress={() => router.push('/safety-tips')} />
        <ActionCard title="Contacts" icon={<MapPin color="#0f172a" size={24} />} onPress={() => router.push('/(tabs)/contacts')} />
      </View>

      {/* Recent Alerts Feed */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Incidents</Text>
        <Pressable onPress={() => router.push('/(tabs)/alerts')}>
           <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      </View>

      {incidents.slice(0, 2).map((inc) => (
         <View key={inc.id} style={styles.incidentCard}>
            <View style={styles.incidentTop}>
               <Text style={styles.incidentType}>{inc.type.toUpperCase()}</Text>
               <View style={[styles.badge, { backgroundColor: inc.status === 'active' ? '#fee2e2' : '#f1f5f9' }]}>
                  <Text style={[styles.badgeText, { color: inc.status === 'active' ? '#dc2626' : '#64748b' }]}>
                     {inc.status}
                  </Text>
               </View>
            </View>
            <Text style={styles.incidentLoc}>{inc.location}</Text>
            <Text style={styles.incidentDesc} numberOfLines={2}>{inc.description}</Text>
         </View>
      ))}

    </ScrollView>
  );
}

function ActionCard({ title, icon, onPress }: { title: string, icon: React.ReactNode, onPress: () => void }) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>{icon}</View>
      <Text style={styles.actionText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  roleBadge: { fontSize: 14, color: '#dc2626', fontWeight: 'bold', marginTop: 2 },
  changeRoleBtn: { padding: 8, backgroundColor: '#e2e8f0', borderRadius: 8 },
  changeRoleText: { color: '#475569', fontWeight: 'bold' },
  
  statusCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  statusHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  statusTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  statusSubtitle: { fontSize: 14, color: '#475569', marginTop: 8 },

  emergencyButton: { backgroundColor: '#dc2626', borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24, elevation: 4, shadowColor: '#dc2626', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width:0, height:4} },
  emergencyIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 50, marginBottom: 12 },
  emergencyBtnTitle: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  emergencyBtnSub: { color: '#fee2e2', fontSize: 14, marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  seeAllText: { color: '#2563eb', fontWeight: '600', marginBottom: 12 },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', elevation: 1 },
  actionIcon: { marginBottom: 8 },
  actionText: { fontWeight: '600', color: '#334155' },

  incidentCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  incidentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  incidentType: { fontWeight: '800', color: '#0f172a' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  incidentLoc: { color: '#475569', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  incidentDesc: { color: '#64748b', fontSize: 13, lineHeight: 18 },
});
