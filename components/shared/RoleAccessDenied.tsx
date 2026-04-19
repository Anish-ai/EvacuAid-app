import { ShieldAlert } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export function RoleAccessDenied({
  title = "Access Restricted",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <View style={styles.container}>
      <ShieldAlert color="#b91c1c" size={28} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9f1239",
  },
  message: {
    color: "#881337",
    lineHeight: 20,
  },
});
