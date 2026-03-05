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

export default function Signup() {
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/setup");
    } catch (e: any) {
      Alert.alert("Signup failed", e.message || "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 32,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#8888B0" />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start automating your business today</Text>
          </View>

          <View style={styles.form}>
            {[
              {
                label: "Full name",
                value: name,
                setter: setName,
                placeholder: "Jane Smith",
                icon: "person-outline" as const,
                focused: nameFocused,
                setFocused: setNameFocused,
                keyboardType: "default" as const,
                autoCapitalize: "words" as const,
                secure: false,
              },
              {
                label: "Email",
                value: email,
                setter: setEmail,
                placeholder: "you@business.com",
                icon: "mail-outline" as const,
                focused: emailFocused,
                setFocused: setEmailFocused,
                keyboardType: "email-address" as const,
                autoCapitalize: "none" as const,
                secure: false,
              },
            ].map((field) => (
              <View key={field.label} style={styles.fieldGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    field.focused && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name={field.icon}
                    size={18}
                    color={field.focused ? "#3D7BFF" : "#55557A"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="#55557A"
                    value={field.value}
                    onChangeText={field.setter}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize}
                    onFocus={() => field.setFocused(true)}
                    onBlur={() => field.setFocused(false)}
                  />
                </View>
              </View>
            ))}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={passwordFocused ? "#3D7BFF" : "#55557A"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#55557A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#55557A"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleSignup}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.6 },
              ]}
            >
              <LinearGradient
                colors={["#3D7BFF", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.googleBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (name) handleSignup();
              }}
            >
              <Ionicons name="logo-google" size={20} color="#E8E8F8" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.footerLink}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040A" },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    gap: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  header: { gap: 8 },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  form: { gap: 20 },
  fieldGroup: { gap: 8 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#8888B0",
    letterSpacing: 0.2,
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
  inputFocused: { borderColor: "#3D7BFF" },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
  },
  eyeBtn: { padding: 4 },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryBtnGradient: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#252640" },
  dividerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#252640",
    backgroundColor: "#151628",
  },
  googleBtnText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#E8E8F8",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  footerLink: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#3D7BFF",
  },
});
