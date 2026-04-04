import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../data/store';
import { ShieldAlert, User, Activity, Shield } from 'lucide-react-native';
import { UserRole } from '../types';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const setRole = useAppStore(state => state.setRole);

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShieldAlert size={64} color="#dc2626" />
        <Text style={styles.title}>EvacuAid</Text>
        <Text style={styles.subtitle}>Rapid Crisis Response</Text>
      </View>

      <Text style={styles.question}>Select your simulation role:</Text>

      <View style={styles.roleGrid}>
        <RoleCard 
          title="Guest" 
          icon={<User size={32} color="#0369a1" />} 
          description="View routes, receive alerts, report issues." 
          onPress={() => handleRoleSelect('Guest')} 
        />
        <RoleCard 
          title="Patient" 
          icon={<Activity size={32} color="#15803d" />} 
          description="Accessible assistance, medical alert focus." 
          onPress={() => handleRoleSelect('Patient')} 
        />
        <RoleCard 
          title="Staff" 
          icon={<Shield size={32} color="#b45309" />} 
          description="Operational dashboard, coordination tools." 
          onPress={() => handleRoleSelect('Staff')} 
        />
      </View>
    </View>
  );
}

function RoleCard({ title, icon, description, onPress }: { title: string, icon: React.ReactNode, description: string, onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  }
});
