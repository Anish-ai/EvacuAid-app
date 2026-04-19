import { useRouter } from "expo-router";
import {
    Activity,
    AlertOctagon,
    Droplet,
    Flame,
    HelpCircle,
    PowerOff,
    ShieldAlert,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useAppStore } from "../data/store";
import { IncidentSeverity, IncidentType } from "../types";

const INCIDENT_CATEGORIES: {
  type: IncidentType;
  label: string;
  icon: React.ReactNode;
  team: string;
  severity: IncidentSeverity;
}[] = [
  {
    type: "Fire",
    label: "Fire/Smoke",
    icon: <Flame color="white" />,
    team: "Fire Dept",
    severity: "critical",
  },
  {
    type: "Medical",
    label: "Medical",
    icon: <Activity color="white" />,
    team: "Medical Staff",
    severity: "high",
  },
  {
    type: "Security",
    label: "Security",
    icon: <ShieldAlert color="white" />,
    team: "Security Team",
    severity: "medium",
  },
  {
    type: "Hazmat",
    label: "Hazmat",
    icon: <Users color="white" />,
    team: "Hazmat Unit",
    severity: "critical",
  },
  {
    type: "Smoke",
    label: "Smoke Alert",
    icon: <AlertOctagon color="white" />,
    team: "Fire Dept",
    severity: "high",
  },
  {
    type: "Maintenance",
    label: "Leakage",
    icon: <Droplet color="white" />,
    team: "Maintenance",
    severity: "low",
  },
  {
    type: "IT Offline",
    label: "Power/IT",
    icon: <PowerOff color="white" />,
    team: "IT Dept",
    severity: "low",
  },
  {
    type: "Security",
    label: "Other",
    icon: <HelpCircle color="white" />,
    team: "Operations",
    severity: "medium",
  },
];

export default function ReportScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    addIncident,
    addTask,
    addNotification,
    setEmergencyMode,
    setActiveIncidentId,
  } = useAppStore();

  const handleSubmit = async () => {
    if (!selectedType || !location) {
      Alert.alert(
        "Missing Info",
        "Please select an incident type and provide a location.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const category = INCIDENT_CATEGORIES.find(
        (item) => item.type === selectedType,
      );
      if (!category) {
        throw new Error("Selected incident category is invalid.");
      }

      const newIncident = await addIncident({
        type: category.type,
        severity: category.severity,
        location,
        team: category.team,
        description: description || "No description provided",
        mapLinked: false,
      });

      await addTask({
        incidentId: newIncident.id,
        assignee: category.team,
        priority:
          category.severity === "critical" || category.severity === "high"
            ? "High"
            : "Medium",
        status: "New",
        createdAt: newIncident.time,
        description: `Respond to ${newIncident.type} at ${newIncident.location}`,
      });

      await addNotification({
        incidentId: newIncident.id,
        user: "Mobile Reporter",
        role: category.team,
        time: newIncident.time,
        opened: false,
        ack: false,
        escalated: category.severity === "critical",
        message: `[${newIncident.id}] ${newIncident.type} at ${newIncident.location} - ${newIncident.description}`,
      });

      setActiveIncidentId(newIncident.id);

      // Auto-trigger emergency mode if it's fire or medical
      if (
        selectedType === "Fire" ||
        selectedType === "Medical" ||
        selectedType === "Smoke"
      ) {
        setEmergencyMode(true);
        router.replace("/emergency");
      } else {
        Alert.alert("Report Submitted", "Responders have been notified.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Submission failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>What is the emergency?</Text>
        <View style={styles.grid}>
          {INCIDENT_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.type}
              style={[
                styles.typeCard,
                selectedType === cat.type && styles.typeCardSelected,
              ]}
              onPress={() => setSelectedType(cat.type)}
            >
              <View
                style={[
                  styles.iconWrapper,
                  selectedType === cat.type
                    ? { backgroundColor: "transparent" }
                    : null,
                ]}
              >
                {selectedType === cat.type ? (
                  <Flame color="#dc2626" />
                ) : (
                  cat.icon
                )}
              </View>
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === cat.type && styles.typeLabelSelected,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Where are you?</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., Floor 2 Corridor, Room 304"
          placeholderTextColor="#94a3b8"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Additional Details (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what you see..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Pressable
          style={[
            styles.submitBtn,
            (!selectedType || !location || isSubmitting) &&
              styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedType || !location || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Submit Report</Text>
          )}
        </Pressable>
        <Text style={styles.notice}>
          If you are in immediate life-threatening danger, prioritize your
          physical safety and EVACUATE.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 60 },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
    marginTop: 16,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  typeCard: {
    width: "48%",
    backgroundColor: "#475569",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  typeCardSelected: {
    backgroundColor: "#fee2e2",
    borderWidth: 2,
    borderColor: "#dc2626",
  },
  iconWrapper: { marginBottom: 8 },
  typeLabel: { color: "white", fontWeight: "bold", fontSize: 11 },
  typeLabelSelected: { color: "#dc2626" },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#0f172a",
  },
  textArea: { height: 120, textAlignVertical: "top" },
  submitBtn: {
    backgroundColor: "#dc2626",
    padding: 20,
    borderRadius: 16,
    marginTop: 32,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: "white", fontWeight: "900", fontSize: 16 },
  notice: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});
