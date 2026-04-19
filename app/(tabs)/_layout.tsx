import { useColorScheme } from "@/components/useColorScheme";
import { useAppStore } from "@/data/store";
import { Tabs } from "expo-router";
import {
    Bell,
    Cpu,
    Home,
    ListTodo,
    Map as MapIcon,
    Phone,
} from "lucide-react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Home>["name"];
  color: string;
}) {
  // We can just pass the icon component directly, or use a switch inside Tabs.Screen
  return null;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const role = useAppStore((state) => state.role);
  const isStaff = role === "Staff";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#dc2626", // Red branding
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <MapIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => <Bell color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => <Bell color={color} size={24} />,
          href: isStaff ? "/(tabs)/notifications" : null,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <ListTodo color={color} size={24} />,
          href: isStaff ? "/(tabs)/tasks" : null,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
          tabBarIcon: ({ color }) => <Cpu color={color} size={24} />,
          href: isStaff ? "/(tabs)/devices" : null,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color }) => <Phone color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
