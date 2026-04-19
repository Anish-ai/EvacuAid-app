import { useAppStore } from "@/data/store";
import { Camera, Flame, ShieldAlert, Wifi, WifiOff } from "lucide-react-native";
import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { RoleAccessDenied } from "../../components/shared/RoleAccessDenied";
import { Device } from "../../types";

export default function DevicesScreen() {
  const {
    role,
    hasHydrated,
    devices,
    initializeData,
    refreshData,
    setDeviceStatus,
    isSyncing,
    syncError,
  } = useAppStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Devices</Text>
          <Text style={styles.subtitle}>
            Restoring your access level and live device data...
          </Text>
        </View>
      </View>
    );
  }

  if (role !== "Staff") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Devices</Text>
          <Text style={styles.subtitle}>
            Live IoT status from EvacuAid backend.
          </Text>
        </View>
        <RoleAccessDenied message="IoT devices are restricted to staff and command roles." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Devices</Text>
        <Text style={styles.subtitle}>
          Live IoT status from EvacuAid backend.
        </Text>
      </View>

      {syncError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Data sync failed: {syncError}</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={refreshData}
            disabled={isSyncing}
          >
            <Text style={styles.retryText}>
              {isSyncing ? "Retrying..." : "Retry Sync"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <DeviceCard
            item={item}
            onSetAlert={() => setDeviceStatus(item.id, "alert")}
            onSetOnline={() => setDeviceStatus(item.id, "online")}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {isSyncing ? "Loading devices..." : "No devices found."}
          </Text>
        }
      />
    </View>
  );
}

function DeviceCard({
  item,
  onSetAlert,
  onSetOnline,
}: {
  item: Device;
  onSetAlert: () => Promise<void>;
  onSetOnline: () => Promise<void>;
}) {
  const online = item.status === "online";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>{iconForType(item.type)}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.location}</Text>
        </View>
        <View
          style={[styles.stateBadge, online ? styles.online : styles.offline]}
        >
          {online ? (
            <Wifi size={14} color="#166534" />
          ) : (
            <WifiOff size={14} color="#991b1b" />
          )}
          <Text
            style={[
              styles.stateText,
              online ? { color: "#166534" } : { color: "#991b1b" },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>ID: {item.id}</Text>
        <Text style={styles.statText}>Last ping: {item.lastPing}</Text>
        {typeof item.battery === "number" ? (
          <Text style={styles.statText}>Battery: {item.battery}%</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.btnMuted} onPress={onSetOnline}>
          <Text style={styles.btnMutedText}>Set Online</Text>
        </Pressable>
        <Pressable style={styles.btnAlert} onPress={onSetAlert}>
          <Text style={styles.btnAlertText}>Trigger Alert</Text>
        </Pressable>
      </View>
    </View>
  );
}

function iconForType(type: Device["type"]) {
  if (type === "cctv") return <Camera color="#334155" size={18} />;
  if (type === "fire") return <Flame color="#b91c1c" size={18} />;
  if (type === "smoke") return <ShieldAlert color="#ea580c" size={18} />;
  return <ShieldAlert color="#1d4ed8" size={18} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "white",
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  subtitle: { marginTop: 4, color: "#64748b" },
  content: { padding: 16, paddingBottom: 40 },
  empty: {
    textAlign: "center",
    marginTop: 48,
    color: "#94a3b8",
    fontWeight: "600",
  },
  errorBox: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "#fff1f2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecdd3",
    padding: 12,
    gap: 8,
  },
  errorText: { color: "#9f1239", lineHeight: 18 },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#be123c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: { color: "white", fontWeight: "700" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  name: { color: "#0f172a", fontWeight: "800" },
  meta: { color: "#64748b", marginTop: 2 },
  stateBadge: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  online: { backgroundColor: "#dcfce7" },
  offline: { backgroundColor: "#fee2e2" },
  stateText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  statsRow: { gap: 3, marginBottom: 12 },
  statText: { fontSize: 11, color: "#475569" },
  actions: { flexDirection: "row", gap: 8 },
  btnMuted: {
    flex: 1,
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  btnMutedText: { color: "#1e293b", fontWeight: "700" },
  btnAlert: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  btnAlertText: { color: "white", fontWeight: "700" },
});
