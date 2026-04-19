import { useAppStore } from "@/data/store";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Incident } from "../../types";

export default function AlertsScreen() {
  const { incidents, initializeData } = useAppStore();
  const [filter, setFilter] = useState<"All" | "Active" | "Resolved">("All");

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const filteredIncidents = incidents.filter((i) => {
    if (filter === "All") return true;
    if (filter === "Active") return i.status !== "Resolved";
    if (filter === "Resolved") return i.status === "Resolved";
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Incident Center</Text>
      </View>

      <View style={styles.filterRow}>
        <FilterChip
          label="All"
          active={filter === "All"}
          onPress={() => setFilter("All")}
        />
        <FilterChip
          label="Active"
          active={filter === "Active"}
          onPress={() => setFilter("Active")}
        />
        <FilterChip
          label="Resolved"
          active={filter === "Resolved"}
          onPress={() => setFilter("Resolved")}
        />
      </View>

      <FlatList
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => <IncidentCard incident={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ShieldAlert size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              No alerts found for this filter.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const isActive = incident.status !== "Resolved";
  const isHighSeverity =
    incident.severity === "high" || incident.severity === "critical";

  return (
    <View
      style={[
        styles.card,
        {
          borderLeftColor: isActive ? "#dc2626" : "#94a3b8",
          borderLeftWidth: 4,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeRow}>
          {isActive ? (
            <AlertTriangle size={16} color="#dc2626" />
          ) : (
            <CheckCircle size={16} color="#16a34a" />
          )}
          <Text style={styles.typeText}>{incident.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.timeText}>
          <Clock size={12} color="#94a3b8" style={{ marginRight: 4 }} />{" "}
          {incident.time}
        </Text>
      </View>

      <Text style={styles.location}>{incident.location}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {incident.description}
      </Text>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.badge,
            { backgroundColor: isHighSeverity ? "#fee2e2" : "#fef3c7" },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isHighSeverity ? "#991b1b" : "#92400e" },
            ]}
          >
            {incident.severity}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: isActive ? "#fee2e2" : "#dcfce3" },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isActive ? "#dc2626" : "#16a34a" },
            ]}
          >
            {incident.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 20, paddingTop: 10, backgroundColor: "white" },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  filterRow: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "white",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: "#0f172a" },
  filterText: { color: "#64748b", fontWeight: "bold" },
  filterTextActive: { color: "white" },
  listContainer: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  typeText: { fontWeight: "800", color: "#0f172a" },
  timeText: { color: "#94a3b8", fontSize: 11 },
  location: { fontWeight: "600", color: "#334155", marginBottom: 6 },
  description: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: { flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: { color: "#94a3b8", marginTop: 16, fontWeight: "600" },
});
