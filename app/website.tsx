import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBusiness } from "@/context/business";

const { width } = Dimensions.get("window");

const TEMPLATES = [
  { id: "modern", name: "Modern", color: "#3D7BFF", desc: "Clean, minimal" },
  { id: "bold", name: "Bold", color: "#E879A0", desc: "High impact" },
  { id: "professional", name: "Professional", color: "#F59E0B", desc: "Corporate trust" },
  { id: "creative", name: "Creative", color: "#00D4A0", desc: "Standout design" },
];

function WebPreview({
  template,
  profile,
  sections,
}: {
  template: (typeof TEMPLATES)[0];
  profile: { name: string; description: string; logoColor: string; industry: string } | null;
  sections: { hero: string; about: string; services: string };
}) {
  const biz = profile ?? { name: "Your Business", description: "Tagline here", logoColor: "#3D7BFF", industry: "Services" };

  return (
    <View style={[styles.preview, { borderColor: template.color + "30" }]}>
      <View style={[styles.previewNav, { backgroundColor: "#0D0E1A", borderBottomColor: template.color + "20" }]}>
        <View style={[styles.previewLogo, { backgroundColor: biz.logoColor }]}>
          <Text style={styles.previewLogoText}>{biz.name.charAt(0)}</Text>
        </View>
        <Text style={[styles.previewBizName, { color: "#E8E8F8" }]} numberOfLines={1}>
          {biz.name}
        </Text>
        <View style={styles.previewNavLinks}>
          {["Home", "About", "Contact"].map((l) => (
            <View key={l} style={styles.previewNavLink}>
              <Text style={styles.previewNavLinkText}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <LinearGradient
        colors={[template.color + "30", "#04040A"]}
        style={styles.previewHero}
      >
        <View style={[styles.previewHeroBadge, { backgroundColor: template.color + "20", borderColor: template.color + "40" }]}>
          <Text style={[styles.previewHeroBadgeText, { color: template.color }]}>{biz.industry}</Text>
        </View>
        <Text style={styles.previewHeroTitle}>{sections.hero || biz.name}</Text>
        <Text style={styles.previewHeroSub} numberOfLines={2}>
          {biz.description || "Professional services for your needs"}
        </Text>
        <View style={[styles.previewBtn, { backgroundColor: template.color }]}>
          <Text style={styles.previewBtnText}>Get Started</Text>
        </View>
      </LinearGradient>

      <View style={styles.previewSection}>
        <Text style={[styles.previewSectionTitle, { color: template.color }]}>About Us</Text>
        <Text style={styles.previewSectionText} numberOfLines={3}>
          {sections.about || `Welcome to ${biz.name}. We provide exceptional ${biz.industry.toLowerCase()} services tailored to your needs.`}
        </Text>
      </View>

      <View style={styles.previewServicesSection}>
        <Text style={[styles.previewSectionTitle, { color: template.color }]}>Our Services</Text>
        <Text style={styles.previewSectionText} numberOfLines={2}>
          {sections.services || "Professional consultation · Premium services · Expert support"}
        </Text>
        <View style={styles.previewServiceCards}>
          {["Service 1", "Service 2", "Service 3"].map((s) => (
            <View key={s} style={[styles.previewServiceCard, { borderColor: template.color + "30" }]}>
              <View style={[styles.previewServiceIcon, { backgroundColor: template.color + "20" }]} />
              <Text style={styles.previewServiceText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.previewFooter, { borderTopColor: "#252640" }]}>
        <Text style={styles.previewFooterText}>© 2025 {biz.name}</Text>
      </View>
    </View>
  );
}

export default function Website() {
  const insets = useSafeAreaInsets();
  const { profile } = useBusiness();
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [sections, setSections] = useState({
    hero: "",
    about: "",
    services: "",
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16 },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#8888B0" />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Ionicons name="globe-outline" size={20} color="#00D4A0" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Website Builder</Text>
            <Text style={styles.headerSub}>AI-powered site generator</Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          style={({ pressed }) => [styles.publishBtn, pressed && { opacity: 0.85 }]}
        >
          <LinearGradient colors={["#00D4A0", "#059669"]} style={styles.publishBtnGradient}>
            <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
            <Text style={styles.publishBtnText}>Publish</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {(["preview", "edit"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              setActiveTab(t);
              Haptics.selectionAsync();
            }}
            style={[styles.tab, activeTab === t && styles.tabActive]}
          >
            <Ionicons
              name={t === "preview" ? "eye-outline" : "create-outline"}
              size={16}
              color={activeTab === t ? "#00D4A0" : "#55557A"}
            />
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === "preview" ? "Preview" : "Edit"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 },
        ]}
      >
        {activeTab === "preview" ? (
          <>
            <View style={styles.templatePicker}>
              <Text style={styles.pickerLabel}>Template</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateList}>
                {TEMPLATES.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedTemplate(t);
                    }}
                    style={[
                      styles.templateChip,
                      selectedTemplate.id === t.id && {
                        borderColor: t.color,
                        backgroundColor: t.color + "15",
                      },
                    ]}
                  >
                    <View style={[styles.templateDot, { backgroundColor: t.color }]} />
                    <View>
                      <Text style={[styles.templateName, selectedTemplate.id === t.id && { color: t.color }]}>
                        {t.name}
                      </Text>
                      <Text style={styles.templateDesc}>{t.desc}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <WebPreview
              template={selectedTemplate}
              profile={profile}
              sections={sections}
            />
          </>
        ) : (
          <View style={styles.editor}>
            <Text style={styles.editorTitle}>Customize Sections</Text>

            {[
              {
                key: "hero",
                label: "Hero headline",
                placeholder: 'e.g. "Transform Your Business With AI"',
                icon: "text-outline" as const,
                multiline: false,
              },
              {
                key: "about",
                label: "About section",
                placeholder: "Write about your business, mission, and values...",
                icon: "information-circle-outline" as const,
                multiline: true,
              },
              {
                key: "services",
                label: "Services description",
                placeholder: "List your main services or offerings...",
                icon: "list-outline" as const,
                multiline: true,
              },
            ].map((f) => (
              <View key={f.key} style={styles.editorField}>
                <View style={styles.editorFieldHeader}>
                  <Ionicons name={f.icon} size={15} color="#8888B0" />
                  <Text style={styles.editorLabel}>{f.label}</Text>
                </View>
                <View style={[styles.editorInput, f.multiline && { height: 90, alignItems: "flex-start", paddingTop: 12 }]}>
                  <TextInput
                    style={[styles.editorInputText, f.multiline && { height: 66 }]}
                    value={sections[f.key as keyof typeof sections]}
                    onChangeText={(v) => setSections((p) => ({ ...p, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor="#55557A"
                    multiline={!!f.multiline}
                  />
                </View>
              </View>
            ))}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setActiveTab("preview");
              }}
              style={({ pressed }) => [styles.previewBtn, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.previewBtnInner}>
                <Ionicons name="eye-outline" size={18} color="#00D4A0" />
                <Text style={styles.previewBtnText2}>Preview changes</Text>
              </View>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F35",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#151628",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#00D4A018",
    borderWidth: 1,
    borderColor: "#00D4A030",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
  publishBtn: { borderRadius: 10, overflow: "hidden" },
  publishBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  publishBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#0D0E1A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F35",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#00D4A0" },
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#55557A" },
  tabTextActive: { color: "#00D4A0", fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 20, gap: 20 },
  templatePicker: { gap: 10 },
  pickerLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#8888B0",
  },
  templateList: { gap: 10, paddingBottom: 4 },
  templateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
  },
  templateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  templateName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  templateDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
  preview: {
    backgroundColor: "#0A0A14",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  previewNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  previewLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  previewLogoText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  previewBizName: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  previewNavLinks: { flexDirection: "row", gap: 8 },
  previewNavLink: {},
  previewNavLinkText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  previewHero: {
    padding: 20,
    gap: 10,
    alignItems: "flex-start",
  },
  previewHeroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  previewHeroBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  previewHeroTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
    lineHeight: 26,
  },
  previewHeroSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
    lineHeight: 18,
  },
  previewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  previewBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  previewSection: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#1A1B26",
  },
  previewSectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  previewSectionText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
    lineHeight: 16,
  },
  previewServicesSection: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#1A1B26",
  },
  previewServiceCards: { flexDirection: "row", gap: 8 },
  previewServiceCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 6,
    alignItems: "center",
  },
  previewServiceIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  previewServiceText: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: "#8888B0",
    textAlign: "center",
  },
  previewFooter: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: "center",
  },
  previewFooterText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
  editor: { gap: 16 },
  editorTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  editorField: { gap: 8 },
  editorFieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editorLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#8888B0",
  },
  editorInput: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: "center",
  },
  editorInputText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
  },
  previewBtn: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#00D4A030",
    backgroundColor: "#00D4A015",
  },
  previewBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  previewBtnText2: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#00D4A0",
  },
});
