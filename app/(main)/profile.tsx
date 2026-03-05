import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Switch,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAuth } from "@/context/auth";
import { useBusiness } from "@/context/business";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "Free forever",
    features: ["1 AI chatbot", "10 appointments/month", "Basic analytics"],
    color: "#8888B0",
    current: true,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$29",
    period: "per month",
    features: [
      "3 AI chatbots",
      "Unlimited appointments",
      "Social media generator",
      "Priority support",
    ],
    color: "#3D7BFF",
    current: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    period: "per month",
    features: [
      "Unlimited chatbots",
      "Website builder",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated support",
    ],
    color: "#F59E0B",
    current: false,
  },
];

function PlanCard({ plan }: { plan: (typeof PLANS)[0] }) {
  return (
    <View
      style={[
        styles.planCard,
        plan.current && styles.planCardCurrent,
        plan.current && { borderColor: plan.color + "60" },
      ]}
    >
      {plan.current && (
        <View style={[styles.planBadge, { backgroundColor: plan.color + "20" }]}>
          <Text style={[styles.planBadgeText, { color: plan.color }]}>Current plan</Text>
        </View>
      )}
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.planPriceRow}>
          <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
          <Text style={styles.planPeriod}>{plan.period}</Text>
        </View>
      </View>
      <View style={styles.planFeatures}>
        {plan.features.map((f) => (
          <View key={f} style={styles.planFeature}>
            <Ionicons name="checkmark-circle" size={16} color={plan.color} />
            <Text style={styles.planFeatureText}>{f}</Text>
          </View>
        ))}
      </View>
      {!plan.current && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert("Upgrade", `Upgrade to ${plan.name} for ${plan.price}/month?`, [
              { text: "Cancel", style: "cancel" },
              { text: "Upgrade", onPress: () => Alert.alert("Coming Soon", "Payment integration coming soon!") },
            ]);
          }}
          style={({ pressed }) => [styles.upgradeBtn, pressed && { opacity: 0.85 }]}
        >
          <LinearGradient
            colors={[plan.color, plan.color + "CC"]}
            style={styles.upgradeBtnGradient}
          >
            <Text style={styles.upgradeBtnText}>Upgrade to {plan.name}</Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  toggle,
  dangerous,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  dangerous?: boolean;
}) {
  const [enabled, setEnabled] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        pressed && onPress && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.settingIcon, dangerous && { backgroundColor: "#EF444415" }]}>
        <Ionicons
          name={icon}
          size={18}
          color={dangerous ? "#EF4444" : "#8888B0"}
        />
      </View>
      <Text style={[styles.settingLabel, dangerous && { color: "#EF4444" }]}>{label}</Text>
      {toggle ? (
        <Switch
          value={enabled}
          onValueChange={(v) => {
            setEnabled(v);
            Haptics.selectionAsync();
          }}
          trackColor={{ false: "#252640", true: "#3D7BFF40" }}
          thumbColor={enabled ? "#3D7BFF" : "#55557A"}
        />
      ) : value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color="#55557A" />
      ) : null}
    </Pressable>
  );
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { profile } = useBusiness();

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Platform.OS !== "web" ? insets.top + 24 : 67 + 24,
            paddingBottom: Platform.OS === "web" ? 34 + 100 : 100,
          },
        ]}
      >
        <Text style={styles.pageTitle}>Profile</Text>

        <LinearGradient
          colors={["#151628", "#0D0E1A"]}
          style={styles.profileCard}
        >
          <View style={[styles.avatar, { backgroundColor: profile?.logoColor ?? "#3D7BFF" }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? "User"}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          {profile && (
            <View style={styles.businessTag}>
              <Text style={styles.businessTagText} numberOfLines={1}>{profile.name}</Text>
            </View>
          )}
        </LinearGradient>

        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.planList}>
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsList}>
          <SettingRow
            icon="notifications-outline"
            label="Push notifications"
            toggle
          />
          <SettingRow
            icon="moon-outline"
            label="Dark mode"
            value="Auto"
          />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            onPress={() => Alert.alert("Privacy", "Privacy settings coming soon!")}
          />
          <SettingRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Alert.alert("Support", "support@autoflow.app")}
          />
          <SettingRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => Alert.alert("Terms", "Terms of service coming soon!")}
          />
          <SettingRow
            icon="information-circle-outline"
            label="Version"
            value="1.0.0"
          />
        </View>

        <View style={styles.settingsList}>
          <SettingRow
            icon="log-out-outline"
            label="Sign out"
            onPress={handleLogout}
            dangerous
          />
        </View>

        <Text style={styles.footer}>AutoFlow · Built for small businesses</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040A" },
  scroll: { paddingHorizontal: 24, gap: 20 },
  pageTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
    letterSpacing: -0.3,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "#252640",
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  profileInfo: { alignItems: "center", gap: 4 },
  profileName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  businessTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#3D7BFF15",
    borderWidth: 1,
    borderColor: "#3D7BFF30",
  },
  businessTagText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#3D7BFF",
    maxWidth: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
    letterSpacing: -0.2,
  },
  planList: { gap: 12 },
  planCard: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  planCardCurrent: { borderWidth: 1.5 },
  planBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  planHeader: { gap: 4 },
  planName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
  },
  planPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  planPrice: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  planPeriod: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  planFeatures: { gap: 8 },
  planFeature: { flexDirection: "row", alignItems: "center", gap: 8 },
  planFeatureText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  upgradeBtn: { borderRadius: 12, overflow: "hidden" },
  upgradeBtnGradient: {
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  settingsList: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F35",
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#0D0E1A",
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
  },
  settingValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
    paddingBottom: 8,
  },
});
