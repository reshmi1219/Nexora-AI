import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    icon: "flash" as const,
    iconColor: "#3D7BFF",
    title: "Automate Your\nBusiness",
    subtitle:
      "Save hours every week by automating customer messaging, bookings, and content creation with AI.",
    gradient: ["#0D0E1A", "#04040A"] as [string, string],
    accent: "#3D7BFF",
  },
  {
    id: "2",
    icon: "chatbubbles" as const,
    iconColor: "#00D4A0",
    title: "AI Chatbot\nFor Customers",
    subtitle:
      "Deploy a smart chatbot that handles inquiries, qualifies leads, and books appointments 24/7.",
    gradient: ["#0A1410", "#04040A"] as [string, string],
    accent: "#00D4A0",
  },
  {
    id: "3",
    icon: "calendar" as const,
    iconColor: "#F59E0B",
    title: "Smart Booking\nManagement",
    subtitle:
      "Let clients self-schedule appointments. Get reminders, manage your calendar with zero friction.",
    gradient: ["#140F04", "#04040A"] as [string, string],
    accent: "#F59E0B",
  },
  {
    id: "4",
    icon: "share-social" as const,
    iconColor: "#E879A0",
    title: "Social Content\nOn Autopilot",
    subtitle:
      "Generate engaging posts for Instagram, Twitter, Facebook and LinkedIn in seconds using AI.",
    gradient: ["#140A10", "#04040A"] as [string, string],
    accent: "#E879A0",
  },
];

function OnboardingSlide({
  item,
}: {
  item: (typeof slides)[0];
}) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={item.gradient}
      style={[styles.slide, { width }]}
    >
      <View style={[styles.slideContent, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={[styles.iconCircle, { borderColor: item.accent + "40", backgroundColor: item.accent + "15" }]}>
          <View style={[styles.iconInner, { backgroundColor: item.accent + "25" }]}>
            <Ionicons name={item.icon} size={48} color={item.accent} />
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < slides.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else {
      router.push("/login");
    }
  };

  const handleSkip = () => {
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
      />

      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
          },
        ]}
      >
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.dotActive,
                i === activeIndex && { backgroundColor: slides[activeIndex].accent },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: slides[activeIndex].accent },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons
            name={activeIndex === slides.length - 1 ? "checkmark" : "arrow-forward"}
            size={22}
            color="#fff"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#04040A",
  },
  slide: {
    flex: 1,
    height,
  },
  slideContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 40,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    alignItems: "center",
    gap: 16,
  },
  slideTitle: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
    textAlign: "center",
    lineHeight: 44,
  },
  slideSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 300,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#55557A",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#252640",
  },
  dotActive: {
    width: 20,
    borderRadius: 3,
  },
  nextBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
});
