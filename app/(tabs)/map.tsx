import { View, StyleSheet, Text } from 'react-native';
import React, { useCallback, useRef, useMemo } from 'react';
import SvgMapViewer from '../../components/map/SvgMapViewer';
import RouteControls from '../../components/map/RouteControls';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Navigation } from 'lucide-react-native';

export default function MapScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '40%', '80%'], []);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        
        <View style={styles.header}>
            <Navigation color="#0f172a" size={24} style={{marginRight: 8}} />
            <Text style={styles.title}>Live Navigation</Text>
        </View>

        <View style={styles.mapArea}>
          <SvgMapViewer />
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={1} // Start at 40% height
        >
          <RouteControls />
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#0f172a'
  },
  mapArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});
