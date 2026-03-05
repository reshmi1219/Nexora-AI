import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/auth";
import { useBusiness, BusinessProfile } from "@/context/business";

const INDUSTRIES = [
  "Retail", "Restaurant", "Healthcare", "Fitness",
  "Beauty & Wellness", "Real Estate", "Consulting", "Education",
  "Legal", "Finance", "Technology", "Other"
];

const LOGO_COLORS = [
  "#3D7BFF", "#00D4A0", "#F59E0B", "#E879A0",
  "#A855F7", "#EF4444", "#10B981", "#F97316",
];

export default function Setup() {
  const insets = useSafeAreaInsets();
  const { markBusinessSetup } = useAuth();
  const { updateProfile } = useBusiness();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    logoColor: "#3D7BFF",
  });

  const steps = [
    {
      title: "Business name",
      subtitle: "What's your business called?",
      icon: "business-outline" as const,
    },
    {
      title: "Industry",
      subtitle: "What industry are you in?",
      icon: "layers-outline" as const,
    },
    {
      title: "About your business",
      subtitle: "Tell us a bit more",
      icon: "information-circle-outline" as const,
    },
    {
      title: "Brand color",
      subtitle: "Pick your brand color",
      icon: "color-palette-outline" as const,
    },
  ];

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (step === 0 && !form.name.trim()) {
      Alert.alert("Required", "Please enter your business name.");
      return;
    }
    if (step === 1 && !form.industry) {
      Alert.alert("Required", "Please select your industry.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      setIsLoading(true);
      try {
        await updateProfile(form as BusinessProfile);
        await markBusinessSetup();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(main)");
      } catch (e) {
        Alert.alert("Error", "Failed to save. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0D0E1A", "#04040A"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[
            styles.topBar,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            },
          ]}
        >
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.stepLabel}>
            Step {step + 1} of {steps.length}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepHeader}>
            <View style={styles.stepIcon}>
              <Ionicons name={steps[step].icon} size={28} color="#3D7BFF" />
            </View>
            <Text style={styles.stepTitle}>{steps[step].title}</Text>
            <Text style={styles.stepSubtitle}>{steps[step].subtitle}</Text>
          </View>

          {step === 0 && (
            <View style={styles.fieldsGroup}>
              {[
                { key: "name", label: "Business name", placeholder: "e.g. Bloom Wellness Studio", icon: "business-outline" as const },
                { key: "phone", label: "Phone (optional)", placeholder: "+1 (555) 000-0000", icon: "call-outline" as const },
                { key: "email", label: "Business email (optional)", placeholder: "hello@yourbusiness.com", icon: "mail-outline" as const },
                { key: "address", label: "Address (optional)", placeholder: "123 Main St, City", icon: "location-outline" as const },
              ].map((field) => (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={styles.label}>{field.label}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name={field.icon} size={16} color="#55557A" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={field.placeholder}
                      placeholderTextColor="#55557A"
                      value={form[field.key as keyof typeof form]}
                      onChangeText={(v) => updateField(field.key as keyof typeof form, v)}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {step === 1 && (
            <View style={styles.industryGrid}>
              {INDUSTRIES.map((ind) => (
                <Pressable
                  key={ind}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateField("industry", ind);
                  }}
                  style={[
                    styles.industryChip,
                    form.industry === ind && styles.industryChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.industryChipText,
                      form.industry === ind && styles.industryChipTextSelected,
                    ]}
                  >
                    {ind}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {step === 2 && (
            <View style={styles.fieldsGroup}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Description</Text>
                <View style={[styles.inputWrapper, { height: 100, alignItems: "flex-start", paddingTop: 14 }]}>
                  <TextInput
                    style={[styles.input, { height: 72 }]}
                    placeholder="Tell customers what makes your business special..."
                    placeholderTextColor="#55557A"
                    value={form.description}
                    onChangeText={(v) => updateField("description", v)}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Website (optional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="globe-outline" size={16} color="#55557A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="https://yourbusiness.com"
                    placeholderTextColor="#55557A"
                    value={form.website}
                    onChangeText={(v) => updateField("website", v)}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.colorSection}>
              <View style={styles.colorPreview}>
                <View style={[styles.colorPreviewCircle, { backgroundColor: form.logoColor }]}>
                  <Text style={styles.colorPreviewInitial}>
                    {form.name.charAt(0).toUpperCase() || "A"}
                  </Text>
                </View>
                <Text style={styles.colorPreviewName}>{form.name || "Your Business"}</Text>
              </View>
              <View style={styles.colorGrid}>
                {LOGO_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateField("logoColor", color);
                    }}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      form.logoColor === color && styles.colorSwatchSelected,
                    ]}
                  >
                    {form.logoColor === color && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.btnRow}>
            {step > 0 && (
              <Pressable
                onPress={() => {
                  setStep((s) => s - 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={20} color="#8888B0" />
              </Pressable>
            )}
            <Pressable
              onPress={handleNext}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.nextBtn,
                step === 0 && styles.nextBtnFull,
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.6 },
              ]}
            >
              <LinearGradient
                colors={["#3D7BFF", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextBtnGradient}
              >
                <Text style={styles.nextBtnText}>
                  {step === steps.length - 1
                    ? isLoading ? "Setting up..." : "Launch AutoFlow"
                    : "Continue"}
                </Text>
                {step < steps.length - 1 && (
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040A" },
  topBar: {
    paddingHorizontal: 28,
    paddingBottom: 0,
    gap: 10,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#252640",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3D7BFF",
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#55557A",
    textAlign: "right",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    gap: 32,
  },
  stepHeader: { gap: 12, alignItems: "flex-start" },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#3D7BFF15",
    borderWidth: 1,
    borderColor: "#3D7BFF30",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  fieldsGroup: { gap: 16 },
  fieldGroup: { gap: 8 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#8888B0",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
  },
  industryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  industryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
  },
  industryChipSelected: {
    backgroundColor: "#3D7BFF20",
    borderColor: "#3D7BFF",
  },
  industryChipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#8888B0",
  },
  industryChipTextSelected: { color: "#3D7BFF" },
  colorSection: { gap: 28, alignItems: "center" },
  colorPreview: { alignItems: "center", gap: 12 },
  colorPreviewCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  colorPreviewInitial: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  colorPreviewName: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  colorSwatch: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  nextBtnFull: { flex: 1 },
  nextBtnGradient: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
