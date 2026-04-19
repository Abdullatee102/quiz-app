import { Tabs } from "expo-router";
import { FontAwesome5, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary, 
        tabBarInactiveTintColor: "#8E8E93",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Ubuntu-Bold",
          marginBottom: 5,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: Colors.secondary,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <FontAwesome5 name="home" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quiz",
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons 
              name={focused ? "lightbulb-on" : "lightbulb-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Ranks",
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons 
              name={focused ? "trophy" : "trophy-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons 
              name={focused ? "clipboard-text" : "clipboard-text-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <FontAwesome name={focused ? "user" : "user-o"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}