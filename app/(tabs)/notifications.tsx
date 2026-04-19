import { useAppStore } from "@/data/store";
import { CheckCircle2, Circle, TriangleAlert } from "lucide-react-native";
import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { RoleAccessDenied } from "../../components/shared/RoleAccessDenied";
import { Notification } from "../../types";

export default function NotificationsScreen() {
  const {
    role,
    hasHydrated,
    notifications,
    initializeData,
    refreshData,
    markNotificationRead,
    acknowledgeNotification,
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
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            Restoring your access level and live inbox data...
          </Text>
        </View>
      </View>
    );
  }

  if (role !== "Staff") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            Operational alerts from EvacuAid command.
          </Text>
        </View>
        <RoleAccessDenied message="Inbox notifications are limited to staff and command roles." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Operational alerts from EvacuAid command.
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
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            onRead={() => markNotificationRead(item.id)}
            onAck={() => acknowledgeNotification(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isSyncing
              ? "Loading notifications..."
              : "No notifications available."}
          </Text>
        }
      />
    </View>
  );
}

function NotificationCard({
  item,
  onRead,
  onAck,
}: {
  item: Notification;
  onRead: () => Promise<void>;
  onAck: () => Promise<void>;
}) {
  return (
    <View style={[styles.card, !item.opened && styles.cardUnread]}>
      <View style={styles.cardTop}>
        <Text style={styles.role}>{item.role}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      <Text style={styles.message}>{item.message}</Text>

      <View style={styles.statusRow}>
        <StatusChip
          label={item.opened ? "Read" : "Unread"}
          active={item.opened}
        />
        <StatusChip
          label={item.ack ? "Acknowledged" : "Pending Ack"}
          active={item.ack}
        />
        {item.escalated ? (
          <View style={styles.escalatedTag}>
            <TriangleAlert color="#991b1b" size={14} />
            <Text style={styles.escalatedText}>Escalated</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={onRead}>
          <Circle color="#2563eb" size={14} />
          <Text style={styles.actionText}>Mark Read</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.primaryBtn]}
          onPress={onAck}
        >
          <CheckCircle2 color="white" size={14} />
          <Text style={styles.primaryText}>Acknowledge</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StatusChip({ label, active }: { label: string; active: boolean }) {
  return (
    <View
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text
        style={[
          styles.chipText,
          active ? styles.chipTextActive : styles.chipTextInactive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  subtitle: { marginTop: 4, color: "#64748b", fontWeight: "500" },
  listContent: { padding: 16, paddingBottom: 48 },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 40,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 12,
  },
  cardUnread: { borderColor: "#93c5fd", backgroundColor: "#f8fbff" },
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
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  role: { color: "#0f172a", fontWeight: "800" },
  time: { color: "#64748b", fontSize: 11, fontWeight: "600" },
  message: { color: "#334155", lineHeight: 20, marginBottom: 10 },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  chip: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  chipActive: { backgroundColor: "#dcfce7" },
  chipInactive: { backgroundColor: "#f1f5f9" },
  chipText: { fontSize: 11, fontWeight: "700" },
  chipTextActive: { color: "#166534" },
  chipTextInactive: { color: "#475569" },
  escalatedTag: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  escalatedText: { color: "#991b1b", fontSize: 11, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionText: { color: "#1e293b", fontWeight: "700" },
  primaryBtn: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  primaryText: { color: "white", fontWeight: "700" },
});
