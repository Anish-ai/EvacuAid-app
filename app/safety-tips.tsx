import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DEFAULT_SAFETY_TIPS } from '../data/mockData';
import { Flame, Cross, Eye, Users, Info } from 'lucide-react-native';

export default function SafetyTipsScreen() {
  const getIcon = (name: string, color: string) => {
    switch(name) {
      case 'flame': return <Flame color={color} size={32} />;
      case 'cross': return <Cross color={color} size={32} />;
      case 'eye': return <Eye color={color} size={32} />;
      case 'users': return <Users color={color} size={32} />;
      default: return <Info color={color} size={32} />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
         <Info color="#0f172a" size={48} style={{marginBottom: 16}}/>
         <Text style={styles.title}>Safety Guidelines</Text>
         <Text style={styles.subtitle}>Review these standard procedures to stay safe during an emergency.</Text>
      </View>

      <View style={styles.cardsContainer}>
        {DEFAULT_SAFETY_TIPS.map(tip => (
          <View key={tip.id} style={styles.tipCard}>
             <View style={styles.iconContainer}>
               {getIcon(tip.iconName, '#2563eb')}
             </View>
             <View style={styles.textContainer}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
             </View>
          </View>
        ))}
      </View>
      
      <View style={styles.footerNote}>
         <Text style={styles.footerText}>In any emergency, remain calm and follow instructions from staff or automated voice alerts.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 60 },
  headerBox: { backgroundColor: '#e0f2fe', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#334155', textAlign: 'center', lineHeight: 22 },
  
  cardsContainer: { gap: 16 },
  tipCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'flex-start', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset:{width:0, height:2} },
  iconContainer: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 12, marginRight: 16 },
  textContainer: { flex: 1 },
  tipTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  tipDescription: { fontSize: 14, color: '#475569', lineHeight: 20 },

  footerNote: { marginTop: 32, padding: 16, backgroundColor: '#fff7ed', borderRadius: 12, borderWidth: 1, borderColor: '#ffedd5' },
  footerText: { color: '#c2410c', fontSize: 14, lineHeight: 20, textAlign: 'center', fontWeight: '500' }
});
