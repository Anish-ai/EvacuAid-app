import { View, Text, StyleSheet, FlatList, Pressable, Linking, Alert } from 'react-native';
import { MOCK_CONTACTS } from '../../data/mockData';
import { Phone, MessageCircle, Shield, Activity, Bell, Flame, Wrench } from 'lucide-react-native';

export default function ContactsScreen() {
  
  const getIcon = (name: string, color: string) => {
    switch(name) {
      case 'shield': return <Shield color={color} size={24} />;
      case 'activity': return <Activity color={color} size={24} />;
      case 'bell': return <Bell color={color} size={24} />;
      case 'flame': return <Flame color={color} size={24} />;
      case 'wrench': return <Wrench color={color} size={24} />;
      default: return <Phone color={color} size={24} />;
    }
  };

  const handleCall = (phone: string, name: string) => {
    Alert.alert(`Calling ${name}`, `Simulating dial to ${phone}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>Tap to simulate a call or message</Text>
      </View>

      <FlatList
        data={MOCK_CONTACTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              {getIcon(item.iconName, item.priority === 'high' ? '#dc2626' : '#2563eb')}
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.roleText}>{item.role}</Text>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.phoneText}>{item.phone}</Text>
            </View>
            <View style={styles.actionContainer}>
               <Pressable style={styles.actionBtn} onPress={() => handleCall(item.phone, item.name)}>
                 <Phone size={20} color="#16a34a" />
               </Pressable>
               <Pressable style={styles.actionBtn} onPress={() => Alert.alert('Message', 'Simulating message overlay')}>
                 <MessageCircle size={20} color="#2563eb" />
               </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  subtitle: { color: '#64748b', marginTop: 4, fontWeight: '500' },
  listContainer: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  iconContainer: { padding: 12, backgroundColor: '#f1f5f9', borderRadius: 40, marginRight: 16 },
  infoContainer: { flex: 1 },
  roleText: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  nameText: { fontSize: 14, color: '#475569', marginTop: 2 },
  phoneText: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  actionContainer: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 8, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }
});
