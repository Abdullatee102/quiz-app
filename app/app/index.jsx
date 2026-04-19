import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/colors";

export default function Index() {
  const { loading, _hasHydrated, user, hasFinishedOnboarding } = useAuthStore();

  if (!_hasHydrated || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (user) return <Redirect href="/(main)" />;
  if (!hasFinishedOnboarding) return <Redirect href="/onboarding" />;
  return <Redirect href="/(auth)/sign-in" />;
}