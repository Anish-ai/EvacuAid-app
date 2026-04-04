import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker'; // Optional if not installed, we can build a simple custom one. Actually, let's use a simpler UI or assume we install @react-native-picker/picker
import { useEditorStore } from '../../stores/editorStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { HOTEL_SCENARIOS } from '../../lib/graph/hotelExample';
import { EmergencyType } from '../../lib/graph/types';

export default function RouteControls() {
  const { building, setBuilding } = useEditorStore();
  const {
    startNodeId, endNodeId, algorithm, avoidDanger, avoidEmergencyZones,
    emergencyByNodeId, path, isComputing, error,
    setStart, setEnd, setAlgorithm, toggleAvoidDanger, toggleAvoidEmergencyZones,
    setNodeEmergency, clearNodeEmergency, clearAllEmergencies,
    computePath, clearPath, activeViewFloor, setActiveViewFloor,
  } = useNavigationStore();

  const [incidentNodeId, setIncidentNodeId] = useState<string>('');
  const [incidentType, setIncidentType] = useState<EmergencyType>('fire');

  const allNodes = useMemo(() => building.floors.flatMap(f => f.nodes), [building]);
  
  const incidentEntries = Object.entries(emergencyByNodeId).map(([nodeId, type]) => {
    return { nodeId, type, node: allNodes.find(n => n.id === nodeId) };
  });

  return (
    <BottomSheetScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
         
         <Text style={styles.sectionTitle}>Scenario</Text>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
           {HOTEL_SCENARIOS.map(s => (
             <Pressable
               key={s.id}
               style={[styles.scenarioChip, building.id === s.building.id && styles.activeChip]}
               onPress={() => { setBuilding(s.building); clearPath(); }}
             >
               <Text style={[styles.scenarioText, building.id === s.building.id && styles.activeText]}>{s.icon} {s.name}</Text>
             </Pressable>
           ))}
         </ScrollView>

         <Text style={styles.sectionTitle}>Floor View</Text>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
           {building.floors.map(floor => (
             <Pressable
               key={floor.id}
               style={[styles.scenarioChip, activeViewFloor === floor.id && styles.activeChip]}
               onPress={() => setActiveViewFloor(floor.id)}
             >
               <Text style={[styles.scenarioText, activeViewFloor === floor.id && styles.activeText]}>{floor.name}</Text>
             </Pressable>
           ))}
         </ScrollView>

         <View style={styles.col}>
            <Text style={styles.label}>Start Location</Text>
            <PickerWrapper 
              selectedValue={startNodeId || ''} 
              onValueChange={(val) => setStart(val || null)}
              building={building}
              placeholder="Select start..."
            />
         </View>
         <View style={styles.col}>
            <Text style={styles.label}>Destination</Text>
            <PickerWrapper 
              selectedValue={endNodeId || ''} 
              onValueChange={(val) => setEnd(val || null)}
              building={building}
              placeholder="Select end..."
            />
         </View>

         <View style={styles.divider} />

         <Text style={styles.sectionTitle}>Routing Algorithm</Text>
         <View style={styles.row}>
            <Pressable style={[styles.toggleBtn, algorithm === 'astar' && styles.toggleBtnActive]} onPress={() => setAlgorithm('astar')}><Text style={algorithm === 'astar' ? {fontWeight: 'bold'} : {}}>⚡ A*</Text></Pressable>
            <Pressable style={[styles.toggleBtn, algorithm === 'dijkstra' && styles.toggleBtnActive]} onPress={() => setAlgorithm('dijkstra')}><Text style={algorithm === 'dijkstra' ? {fontWeight: 'bold'} : {}}>🔄 Dijkstra</Text></Pressable>
         </View>

         <View style={styles.divider} />

         {error && <Text style={styles.errorText}>{error}</Text>}

         <Pressable 
           style={[styles.computeBtn, (isComputing || !startNodeId || !endNodeId) && styles.computeBtnDisabled]}
           onPress={computePath}
           disabled={isComputing || !startNodeId || !endNodeId}
         >
           <Text style={styles.computeBtnText}>{isComputing ? 'Computing...' : 'Find Path'}</Text>
         </Pressable>
         {path && (
            <View style={{ marginTop: 16 }}>
               <View style={styles.summaryBox}>
                  <Text style={styles.summaryTitle}>Route Summary</Text>
                  <View style={styles.summaryRow}>
                     <View style={{flex: 1}}>
                        <Text style={styles.mutedSmall}>FROM</Text>
                        <Text numberOfLines={1}>{allNodes.find(n => n.id === startNodeId)?.label}</Text>
                     </View>
                     <Text style={{fontSize: 20, color: '#94a3b8', marginHorizontal: 8}}>→</Text>
                     <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <Text style={styles.mutedSmall}>TO</Text>
                        <Text numberOfLines={1}>{allNodes.find(n => n.id === endNodeId)?.label}</Text>
                     </View>
                  </View>
                  <View style={styles.summaryStatRow}><Text style={styles.mutedSmall}>Algorithm</Text><Text style={styles.statBold}>{path.algorithm === 'astar' ? '⚡ A*' : '🔄 Dijkstra'}</Text></View>
                  <View style={styles.summaryStatRow}><Text style={styles.mutedSmall}>Distance</Text><Text style={[styles.statBold, {color: '#8b5cf6'}]}>{path.totalCost.toFixed(1)}m</Text></View>
                  <View style={styles.summaryStatRow}><Text style={styles.mutedSmall}>Est. Time</Text><Text style={[styles.statBold, {color: '#10b981'}]}>{Math.ceil(path.totalCost / 60)} min</Text></View>
               </View>

               <Text style={[styles.sectionTitle, {marginTop: 20}]}>Turn-by-Turn</Text>
               <View style={{gap: 8, marginBottom: 16}}>
                 {path.steps.map((step, i) => (
                   <View key={i} style={styles.stepItem}>
                     <Text style={{fontSize: 16, marginRight: 12}}>{step.type === 'walk' ? '🚶' : step.method === 'elevator' ? '🛗' : '🪜'}</Text>
                     <View style={{flex: 1}}>
                       <Text style={{color: '#1e293b', fontWeight: '500', fontSize: 13}}>{step.description}</Text>
                       {step.type === 'floor_change' && (
                         <View style={[styles.badge, step.method === 'elevator' ? {backgroundColor: '#dbeafe'} : {backgroundColor: '#fef3c7'}]}>
                           <Text style={{fontSize: 10, color: step.method === 'elevator' ? '#1e40af' : '#92400e', fontWeight: 'bold'}}>{step.method === 'elevator' ? 'Elevator' : 'Stairs'}</Text>
                         </View>
                       )}
                     </View>
                     <Text style={{fontSize: 11, color: '#94a3b8', fontWeight: 'bold'}}>{String(i+1).padStart(2, '0')}</Text>
                   </View>
                 ))}
                 <View style={[styles.stepItem, {borderLeftWidth: 3, borderLeftColor: '#10b981'}]}>
                   <Text style={{fontSize: 16, marginRight: 12}}>🎯</Text>
                   <Text style={{color: '#059669', fontWeight: 'bold', fontSize: 13}}>Arrived at {allNodes.find(n => n.id === endNodeId)?.label}</Text>
                 </View>
               </View>

               <Pressable style={[styles.clearBtn, {backgroundColor: '#fee2e2'}]} onPress={clearPath}>
                  <Text style={[styles.clearBtnText, {color: '#dc2626'}]}>Clear Navigation</Text>
               </Pressable>
            </View>
         )}

         {/* Emergency Panel */}
         <View style={styles.divider} />
         <Text style={styles.sectionTitle}>Inject Emergency Simulation</Text>
         <View style={styles.row}>
            <Pressable style={[styles.toggleBtn, incidentType === 'fire' && styles.toggleBtnActive]} onPress={() => setIncidentType('fire')}><Text>🔥 Fire</Text></Pressable>
            <Pressable style={[styles.toggleBtn, incidentType === 'medical' && styles.toggleBtnActive]} onPress={() => setIncidentType('medical')}><Text>🚑 Medical</Text></Pressable>
         </View>
         <PickerWrapper 
           selectedValue={incidentNodeId} 
           onValueChange={(val) => setIncidentNodeId(val)}
           building={building}
           placeholder="Select node..."
         />
         <Pressable 
           style={[styles.addBtn, !incidentNodeId && styles.disabled]} 
           onPress={() => { if(incidentNodeId) { setNodeEmergency(incidentNodeId, incidentType); setIncidentNodeId(''); } }}
         >
           <Text style={styles.addBtnText}>Add Hazard</Text>
         </Pressable>

         {incidentEntries.map(e => (
            <View key={e.nodeId} style={styles.hazardRow}>
               <Text style={{flex: 1}}>{e.type === 'fire' ? '🔥' : '🚑'} {e.node?.label}</Text>
               <Pressable onPress={() => clearNodeEmergency(e.nodeId)}><Text style={{color: '#dc2626'}}>Remove</Text></Pressable>
            </View>
         ))}

      </BottomSheetScrollView>
  );
}

function PickerWrapper({ selectedValue, onValueChange, building, placeholder }: { selectedValue: string, onValueChange: (val: string) => void, building: any, placeholder: string }) {
  // Find which floor the currently selected node belongs to
  const initialFloorId = useMemo(() => {
    if (!selectedValue) return building.floors[0]?.id || 1;
    for (const f of building.floors) {
      if (f.nodes.some((n: any) => n.id === selectedValue)) return f.id;
    }
    return building.floors[0]?.id || 1;
  }, [selectedValue, building]);

  const [localFloorId, setLocalFloorId] = useState<number>(initialFloorId);

  // Sync back to local floor if external selectedValue changes to something else
  React.useEffect(() => {
    if (selectedValue) {
      for (const f of building.floors) {
        if (f.nodes.some((n: any) => n.id === selectedValue)) {
          setLocalFloorId(f.id);
          break;
        }
      }
    }
  }, [selectedValue, building]);

  const floorNodes = building.floors.find((f: any) => f.id === localFloorId)?.nodes || [];

  return (
    <View style={{ flexDirection: 'column', gap: 8, marginBottom: 16 }}>
      <View style={{ backgroundColor: '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
        <Picker
          selectedValue={localFloorId}
          onValueChange={(itemValue) => setLocalFloorId(Number(itemValue))}
          mode="dropdown"
          style={{ height: 55, color: '#334155' }}
        >
          {building.floors.map((f: any) => (
            <Picker.Item key={f.id} label={f.name} value={f.id} />
          ))}
        </Picker>
      </View>

      <View style={{ backgroundColor: '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => onValueChange(itemValue)}
          mode="dropdown"
          style={{ height: 55 }}
        >
          <Picker.Item label={placeholder} value="" color="#94a3b8" />
          {floorNodes.map((n: any) => (
            <Picker.Item key={n.id} label={n.label} value={n.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  scrollContent: { paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#0f172a' },
  chipRow: { flexDirection: 'row', marginBottom: 16 },
  scenarioChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  activeChip: { backgroundColor: '#0f172a' },
  scenarioText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  activeText: { color: 'white' },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  label: { fontSize: 13, color: '#64748b', marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
  errorText: { color: '#dc2626', marginBottom: 12, textAlign: 'center', backgroundColor: '#fee2e2', padding: 8, borderRadius: 8 },
  computeBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
  computeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  computeBtnDisabled: { opacity: 0.5 },
  clearBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  clearBtnText: { color: '#64748b', fontWeight: 'bold' },
  toggleBtn: { flex: 1, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  toggleBtnActive: { backgroundColor: '#cbd5e1', borderWidth: 1, borderColor: '#94a3b8' },
  addBtn: { backgroundColor: '#0f172a', padding: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
  hazardRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#fee2e2', borderRadius: 8, marginTop: 12 },
  summaryBox: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  summaryTitle: { fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mutedSmall: { color: '#64748b', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 },
  summaryStatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statBold: { fontWeight: 'bold', fontSize: 12 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', borderLeftWidth: 1, borderLeftColor: '#cbd5e1', paddingLeft: 12, paddingBottom: 16, marginLeft: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }
});
