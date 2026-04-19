import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppStore } from "../../data/store";

export function GlobalEmergencyBanner() {
  const { emergencyMode, activeIncidentId, incidents } = useAppStore();
  const router = useRouter();

  const activeIncident = incidents.find((i) => i.id === activeIncidentId);
  const hasLiveIncident = incidents.some((i) => i.status !== "Resolved");

  if (!emergencyMode && !hasLiveIncident) return null;

  const bannerIncident =
    activeIncident ?? incidents.find((i) => i.status !== "Resolved");

  return (
    <Pressable onPress={() => router.push("/emergency")}>
      <View style={styles.banner}>
        <AlertTriangle color="white" size={24} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>EMERGENCY ALERT</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {bannerIncident
              ? `${bannerIncident.type.toUpperCase()}: ${bannerIncident.location}`
              : "Please follow evacuation procedures"}
          </Text>
        </View>
        <View style={styles.actionBtn}>
          <Text style={styles.actionText}>View</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#dc2626", // Red 600
    padding: 16,
    paddingTop: 50, // To account for safe area
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1000,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: "white",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
  subtitle: {
    color: "#fee2e2", // Red 100
    fontSize: 12,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
  },
});
