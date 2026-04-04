import React, { useMemo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Defs, Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, useAnimatedProps
} from 'react-native-reanimated';
import { useEditorStore } from '../../stores/editorStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { MapNode, MapEdge } from '../../lib/graph/types';

export const NODE_RADIUS = 10;
const AnimatedLine = Animated.createAnimatedComponent(Line);

function getNodeEmoji(type: string): string {
  switch (type) {
    case 'room': return '🛏️';
    case 'stair': return '🏃';
    case 'elevator': return '🛗';
    case 'entry': return '🚪';
    case 'exit': return '🚶‍♂️';
    case 'door': return '🚪';
    default: return '';
  }
}

export default function SvgMapViewer() {
  const { building } = useEditorStore();
  const { path, activeViewFloor, emergencyByNodeId } = useNavigationStore();

  const activeFloor = building.floors.find(f => f.id === activeViewFloor);

  const pathNodeSet = useMemo(() => new Set(path?.nodeIds ?? []), [path]);

  // Pan and Zoom
  const scale = useSharedValue(0.85);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const savedScale = useSharedValue(0.85);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Path Animation loop perfectly matching strokeDasharray = "12 12" (Total = 24)
  const dashOffset = useSharedValue(0);
  useEffect(() => {
    if (path) {
      dashOffset.value = 0;
      dashOffset.value = withRepeat(
        withTiming(-24, { duration: 600, easing: Easing.linear }),
        -1, false
      );
    } else {
      dashOffset.value = 0;
    }
  }, [path]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value, 
  }));

  if (!activeFloor) return null;

  const renderEdge = (edge: MapEdge, nm: Map<string, MapNode>) => {
    const f = nm.get(edge.from);
    const t = nm.get(edge.to);
    if (!f || !t) return null;

    const isBlocked = edge.blocked;
    const isDanger = edge.danger;

    let stroke = '#cbd5e1'; // Slate 300
    let strokeWidth = 8;
    let strokeDasharray = '';
    let opacity = path ? 0.3 : 1.0;

    if (isBlocked) {
      stroke = '#f87171'; // red 400
      strokeDasharray = '4 8';
      opacity = 0.6;
    } else if (isDanger) {
      stroke = '#f97316'; // amber/orange 500
      strokeDasharray = '10 5';
    }

    return (
      <Line
        key={edge.id}
        x1={f.x} y1={f.y} x2={t.x} y2={t.y}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        opacity={opacity}
        strokeLinecap="round"
      />
    );
  };

  const renderPathLines = (nm: Map<string, MapNode>) => {
    if (!path || !activeFloor) return null;
    const lines = [];
    const ids = path.nodeIds;
    for (let i = 0; i < ids.length - 1; i++) {
        const n1 = nm.get(ids[i]);
        const n2 = nm.get(ids[i+1]);
        if (n1 && n2 && n1.floorId === activeFloor.id && n2.floorId === activeFloor.id) {
            
            // 1. Solid track underneath
            lines.push(
                <Line
                    key={`path-base-${i}`}
                    x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                    stroke="#bfdbfe" // blue-200
                    strokeWidth={14}
                    strokeLinecap="round"
                    opacity={0.6}
                />
            );
            
            // 2. Brightly animated dotted line flowing OVER it
            lines.push(
                <AnimatedLine
                    key={`path-flow-${i}`}
                    x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                    stroke="#2563eb" // blue-600 
                    strokeWidth={6}
                    strokeDasharray="12 12"
                    strokeLinecap="round"
                    animatedProps={animatedProps}
                    opacity={1.0}
                />
            );
        }
    }
    return lines;
  };

  const renderNode = (node: MapNode) => {
    const isPath = pathNodeSet.has(node.id);
    const emergency = emergencyByNodeId[node.id];
    const isDanger = emergency || node.danger;
    const isCorridor = node.type === 'corridor';

    let fill = '#f8fafc';
    let stroke = '#cbd5e1';
    let labelColor = '#334155';
    let strokeWidth = 2;
    let radius = isCorridor ? 6 : NODE_RADIUS;

    if (isCorridor) {
      fill = '#e2e8f0';
      stroke = '#94a3b8';
      labelColor = '#64748b';
    } else if (node.type === 'stair') {
      fill = '#10b981';
      stroke = '#047857';
      labelColor = '#065f46';
    } else if (node.type === 'elevator') {
      fill = '#8b5cf6';
      stroke = '#6d28d9';
      labelColor = '#4c1d95';
    } else if (node.type === 'entry' || node.type === 'exit') {
      fill = '#22c55e';
      stroke = '#15803d';
      labelColor = '#14532d';
    }

    if (isDanger) {
      fill = '#ef4444';
      stroke = '#b91c1c';
      labelColor = '#7f1d1d';
      strokeWidth = 3;
      radius += 2; // Pulsing danger nodes are slightly larger
    }

    if (isPath) {
      fill = '#3b82f6';
      stroke = '#1d4ed8';
      labelColor = '#1e3a8a';
      strokeWidth = 4;
      radius = isCorridor ? 8 : NODE_RADIUS + 4;
    }

    const hazardEmoji = emergency === 'fire' ? '🔥' : emergency === 'medical' ? '🚑' : emergency === 'security' ? '🛡️' : emergency === 'smoke' ? '💨' : emergency === 'hazmat' ? '☣️' : '';
    const nodeEmoji = getNodeEmoji(node.type);

    return (
      <G key={node.id}>
        <Circle
          cx={node.x} cy={node.y} r={radius}
          fill={fill} stroke={stroke} strokeWidth={strokeWidth}
        />
        
        {/* Render Emoji nicely centered in the circle */}
        {!isCorridor && !isDanger && nodeEmoji !== '' && (
           <SvgText x={node.x} y={node.y + 4} fontSize="12" textAnchor="middle">
             {nodeEmoji}
           </SvgText>
        )}

        {/* Node Label background for readability */}
        {isCorridor ? (
           <SvgText
             x={node.x} y={node.y + 16}
             fontSize="10"
             fill={labelColor}
             textAnchor="middle"
             fontWeight="600"
          >
             {node.label}
          </SvgText>
        ) : (
           <SvgText
              x={node.x} y={node.y + 26}
              fontSize="12"
              fill={labelColor}
              fontWeight={isPath ? "bold" : "600"}
              textAnchor="middle"
           >
              {node.label}
           </SvgText>
        )}
        
        {/* Emergency Emoji Marker standing prominent above the node */}
        {emergency && (
           <SvgText
              x={node.x} y={node.y - 18}
              fontSize="28"
              textAnchor="middle"
           >
              {hazardEmoji}
           </SvgText>
        )}
      </G>
    );
  };

  const nodeMap = new Map(activeFloor.nodes.map(n => [n.id, n]));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.canvasContainer, animatedStyle]}>
          <Svg width={1200} height={800} style={styles.svg}>
            {/* Draw a subtle grid background for techy aesthetic */}
            <Defs>
              <Path id="gridPattern" d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </Defs>
            
            {/* Draw Edges first so they are under nodes */}
            {activeFloor.edges.map(e => renderEdge(e, nodeMap))}
            
            {/* Draw Path specifically ordered with Glowing UI */}
            {renderPathLines(nodeMap)}
            
            {/* Draw Nodes on top */}
            {activeFloor.nodes.map(renderNode)}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light slate-50
    overflow: 'hidden',
  },
  canvasContainer: {
    width: 1200,
    height: 800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    flex: 1,
  }
});
