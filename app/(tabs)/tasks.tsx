import { useAppStore } from "@/data/store";
import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { RoleAccessDenied } from "../../components/shared/RoleAccessDenied";
import { Task } from "../../types";

const STATUS_FLOW: Task["status"][] = [
  "New",
  "In Progress",
  "Acknowledged",
  "Resolved",
];

export default function TasksScreen() {
  const {
    role,
    hasHydrated,
    tasks,
    initializeData,
    refreshData,
    updateTaskStatus,
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
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>
            Restoring your access level and live task data...
          </Text>
        </View>
      </View>
    );
  }

  if (role !== "Staff") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>
            Response workflow aligned to website command board.
          </Text>
        </View>
        <RoleAccessDenied message="Task board is limited to staff and command roles." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>
          Response workflow aligned to website command board.
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
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TaskCard
            item={item}
            onAdvance={() => updateTaskStatus(item.id, nextStatus(item.status))}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {isSyncing ? "Loading tasks..." : "No active tasks."}
          </Text>
        }
      />
    </View>
  );
}

function nextStatus(status: Task["status"]): Task["status"] {
  const index = STATUS_FLOW.indexOf(status);
  if (index < 0 || index === STATUS_FLOW.length - 1) return "Resolved";
  return STATUS_FLOW[index + 1];
}

function TaskCard({
  item,
  onAdvance,
}: {
  item: Task;
  onAdvance: () => Promise<void>;
}) {
  const isResolved = item.status === "Resolved";

  return (
    <View style={[styles.card, isResolved && styles.cardResolved]}>
      <View style={styles.rowBetween}>
        <Text style={styles.idText}>{item.id}</Text>
        <Text style={styles.time}>{item.createdAt}</Text>
      </View>
      <Text style={styles.assignee}>{item.assignee}</Text>
      <Text style={styles.description}>
        {item.description || "No task description provided."}
      </Text>
      <View style={styles.footer}>
        <View style={[styles.priorityChip, priorityStyle(item.priority)]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        <View style={styles.statusChip}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Pressable
        style={[styles.advanceBtn, isResolved && styles.advanceBtnDisabled]}
        onPress={onAdvance}
        disabled={isResolved}
      >
        <Text style={styles.advanceText}>
          {isResolved ? "Closed" : "Advance Status"}
        </Text>
      </Pressable>
    </View>
  );
}

function priorityStyle(priority: Task["priority"]) {
  if (priority === "High") return { backgroundColor: "#fee2e2" };
  if (priority === "Medium") return { backgroundColor: "#fef9c3" };
  return { backgroundColor: "#dcfce7" };
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
  listContent: { padding: 16, paddingBottom: 40 },
  empty: {
    textAlign: "center",
    marginTop: 40,
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
  cardResolved: { opacity: 0.7 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  idText: { fontWeight: "800", color: "#0f172a" },
  time: { color: "#64748b", fontSize: 11 },
  assignee: { fontWeight: "700", color: "#334155", marginBottom: 6 },
  description: { color: "#475569", lineHeight: 19, marginBottom: 10 },
  footer: { flexDirection: "row", gap: 8, marginBottom: 12 },
  priorityChip: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  priorityText: { fontSize: 11, fontWeight: "700", color: "#0f172a" },
  statusChip: {
    borderRadius: 99,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700", color: "#1d4ed8" },
  advanceBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  advanceBtnDisabled: { backgroundColor: "#94a3b8" },
  advanceText: { color: "white", fontWeight: "700" },
});
