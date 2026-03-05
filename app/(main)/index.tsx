import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/auth";
import { useBusiness } from "@/context/business";

const { width } = Dimensions.get("window");

function StatCard({
  label,
  value,
  change,
  icon,
  color,
}: {
  label: string;
  value: string;
  change: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: color + "20" }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statChange, { color: "#00D4A0" }]}>{change}</Text>
    </View>
  );
}

function ToolCard({
  title,
  subtitle,
  icon,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [styles.toolCard, pressed && { opacity: 0.85 }]}
    >
      <LinearGradient
        colors={[color + "18", color + "08"]}
        style={styles.toolCardGradient}
      >
        <View style={[styles.toolIcon, { backgroundColor: color + "22", borderColor: color + "30" }]}>
          <Ionicons name={icon} size={26} color={color} />
        </View>
        <View style={styles.toolText}>
          <Text style={styles.toolTitle}>{title}</Text>
          <Text style={styles.toolSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={22} color={color + "80"} />
      </LinearGradient>
    </Pressable>
  );
}

function ActivityItem({
  icon,
  color,
  text,
  time,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  text: string;
  time: string;
}) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.activityText} numberOfLines={1}>{text}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile, analytics, appointments } = useBusiness();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const upcomingCount = appointments.filter((a) => a.status === "confirmed").length;

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
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>
          <View style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#8888B0" />
          </View>
        </View>

        {profile && (
          <LinearGradient
            colors={[profile.logoColor + "22", profile.logoColor + "08"]}
            style={[styles.businessBanner, { borderColor: profile.logoColor + "30" }]}
          >
            <View style={[styles.businessLogo, { backgroundColor: profile.logoColor }]}>
              <Text style={styles.businessLogoText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.businessInfo}>
              <Text style={styles.businessName} numberOfLines={1}>{profile.name}</Text>
              <Text style={styles.businessIndustry}>{profile.industry}</Text>
            </View>
            <View style={[styles.statusBadge]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Live</Text>
            </View>
          </LinearGradient>
        )}

        <Text style={styles.sectionTitle}>Analytics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Visitors"
            value={analytics.visitors.toLocaleString()}
            change="+12.4%"
            icon="eye-outline"
            color="#3D7BFF"
          />
          <StatCard
            label="Revenue"
            value={`$${analytics.revenue.toLocaleString()}`}
            change="+14.2%"
            icon="trending-up-outline"
            color="#00D4A0"
          />
          <StatCard
            label="Bookings"
            value={`${analytics.bookings + upcomingCount}`}
            change="+8.1%"
            icon="calendar-outline"
            color="#F59E0B"
          />
          <StatCard
            label="Messages"
            value={analytics.messages.toLocaleString()}
            change="+21.7%"
            icon="chatbubble-outline"
            color="#E879A0"
          />
        </View>

        <Text style={styles.sectionTitle}>AI Tools</Text>
        <View style={styles.toolsList}>
          <ToolCard
            title="AI Chatbot"
            subtitle="Manage your customer chatbot"
            icon="chatbubbles-outline"
            color="#3D7BFF"
            onPress={() => router.push("/chatbot")}
          />
          <ToolCard
            title="Website Builder"
            subtitle="Build your business website"
            icon="globe-outline"
            color="#00D4A0"
            onPress={() => router.push("/website")}
          />
          <ToolCard
            title="Social Media"
            subtitle="Generate content for all platforms"
            icon="share-social-outline"
            color="#E879A0"
            onPress={() => router.push("/social")}
          />
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <ActivityItem
            icon="chatbubble-outline"
            color="#3D7BFF"
            text="New customer inquiry received"
            time="2m ago"
          />
          <ActivityItem
            icon="calendar-outline"
            color="#F59E0B"
            text="Appointment booked — Sarah M."
            time="15m ago"
          />
          <ActivityItem
            icon="share-social-outline"
            color="#E879A0"
            text="Instagram post published"
            time="1h ago"
          />
          <ActivityItem
            icon="person-add-outline"
            color="#00D4A0"
            text="New lead captured via chatbot"
            time="2h ago"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 28 * 2 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040A" },
  scroll: { paddingHorizontal: 24, gap: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: { gap: 2 },
  greeting: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  greetingName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
    letterSpacing: -0.3,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    alignItems: "center",
    justifyContent: "center",
  },
  businessBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  businessLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  businessLogoText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  businessInfo: { flex: 1, gap: 2 },
  businessName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  businessIndustry: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#00D4A015",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00D4A0",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#00D4A0",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
    letterSpacing: -0.2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  statChange: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  toolsList: { gap: 10 },
  toolCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#252640",
  },
  toolCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toolText: { flex: 1, gap: 3 },
  toolTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  toolSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  activityList: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 16,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F35",
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
  },
  activityTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
});
