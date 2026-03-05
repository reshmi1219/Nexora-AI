import { Redirect } from "expo-router";
import { useAuth } from "@/context/auth";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#04040A", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#3D7BFF" />
      </View>
    );
  }

  if (!user) return <Redirect href="/onboarding" />;
  if (!user.hasSetupBusiness) return <Redirect href="/setup" />;
  return <Redirect href="/(main)" />;
}
