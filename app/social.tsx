import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBusiness, SocialPost } from "@/context/business";

type Platform_ = SocialPost["platform"];

const PLATFORMS: { id: Platform_; name: string; icon: keyof typeof Ionicons.glyphMap; color: string; maxChars: number }[] = [
  { id: "instagram", name: "Instagram", icon: "logo-instagram", color: "#E879A0", maxChars: 2200 },
  { id: "twitter", name: "Twitter/X", icon: "logo-twitter", color: "#3D7BFF", maxChars: 280 },
  { id: "facebook", name: "Facebook", icon: "logo-facebook", color: "#1877F2", maxChars: 63206 },
  { id: "linkedin", name: "LinkedIn", icon: "logo-linkedin", color: "#0A66C2", maxChars: 3000 },
];

const TOPICS = [
  "Product highlight", "Customer success story", "Behind the scenes",
  "Industry tip", "Promotion/offer", "Team spotlight", "Upcoming event",
  "How-to guide", "Business milestone",
];

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "witty", label: "Witty" },
  { id: "inspirational", label: "Inspirational" },
];

const AI_POSTS: Record<string, Record<Platform_, string>> = {
  "Product highlight": {
    instagram:
      "Introducing something we've been working hard on — and we couldn't be more excited to share it with you! This is built for real people, solving real problems. Tap the link in bio to learn more.\n\n#SmallBusiness #NewProduct #Innovation #BusinessGrowth",
    twitter:
      "We just launched something new and it's going to change how you work. Check it out — link in profile!",
    facebook:
      "Big news! We're thrilled to announce our latest product update. Designed with you in mind, packed with features you've been asking for. Head to our website to learn more and take it for a spin!",
    linkedin:
      "Excited to announce the launch of our latest solution! After months of development and invaluable feedback from our customers, we've built something that truly addresses the needs of modern businesses. Learn more at our website.",
  },
  "Customer success story": {
    instagram:
      '"Working with this team changed everything for us." - Sarah, founder of Bloom Studio\n\nWhen Sarah came to us, she was spending 3+ hours a day on admin. Now? 20 minutes. The rest is growth. This is why we do what we do.\n\n#CustomerStory #SmallBusiness #Success',
    twitter:
      "One of our customers cut their admin time by 80% in the first month. That's the kind of impact that keeps us going. #CustomerSuccess",
    facebook:
      "We love sharing success stories! One of our amazing customers, Sarah, transformed her business operations using our platform. She went from drowning in admin tasks to focusing on what she loves. Read her full story on our blog!",
    linkedin:
      "Client spotlight: How Bloom Studio reduced operational overhead by 80% in 30 days. When we first connected with Sarah, she was spending more time on admin than on her craft. We changed that. Read the full case study on our website.",
  },
};

function PostCard({
  post,
  onDelete,
}: {
  post: SocialPost;
  onDelete: () => void;
}) {
  const platform = PLATFORMS.find((p) => p.id === post.platform)!;
  const date = new Date(post.createdAt);

  return (
    <View style={styles.postCard}>
      <View style={styles.postCardHeader}>
        <View style={[styles.platformBadge, { backgroundColor: platform.color + "18" }]}>
          <Ionicons name={platform.icon} size={14} color={platform.color} />
          <Text style={[styles.platformBadgeText, { color: platform.color }]}>{platform.name}</Text>
        </View>
        <View style={[styles.draftBadge, post.status === "published" && styles.publishedBadge]}>
          <Text style={[styles.draftBadgeText, post.status === "published" && styles.publishedBadgeText]}>
            {post.status}
          </Text>
        </View>
        <Pressable onPress={onDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={15} color="#55557A" />
        </Pressable>
      </View>
      <Text style={styles.postText} numberOfLines={4}>{post.content}</Text>
      <Text style={styles.postDate}>{date.toLocaleDateString()}</Text>
    </View>
  );
}

export default function Social() {
  const insets = useSafeAreaInsets();
  const { socialPosts, addSocialPost, deleteSocialPost, profile } = useBusiness();
  const [activeTab, setActiveTab] = useState<"generate" | "posts">("generate");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform_>>(new Set(["instagram"]));
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [customContext, setCustomContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<Record<Platform_, string>>({} as Record<Platform_, string>);
  const [step, setStep] = useState<"form" | "results">("form");

  const togglePlatform = (id: Platform_) => {
    Haptics.selectionAsync();
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!selectedTopic) {
      Alert.alert("Select topic", "Please choose a content topic first.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);

    await new Promise((r) => setTimeout(r, 1800));

    const posts: Record<Platform_, string> = {} as Record<Platform_, string>;
    const aiTemplates = AI_POSTS[selectedTopic] ?? AI_POSTS["Product highlight"];

    selectedPlatforms.forEach((pid) => {
      let content = aiTemplates[pid] || aiTemplates.instagram;
      if (customContext) {
        content = `${content}\n\n${customContext}`;
      }
      posts[pid] = content;
    });

    setGeneratedPosts(posts);
    setIsGenerating(false);
    setStep("results");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveAll = async () => {
    for (const [pid, content] of Object.entries(generatedPosts)) {
      await addSocialPost({
        platform: pid as Platform_,
        content,
        status: "draft",
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved!", "All posts saved to your library.");
    setStep("form");
    setGeneratedPosts({} as Record<Platform_, string>);
    setActiveTab("posts");
  };

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
            <Ionicons name="share-social-outline" size={20} color="#E879A0" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Social Content</Text>
            <Text style={styles.headerSub}>AI-powered post generator</Text>
          </View>
        </View>
        <View style={styles.postCount}>
          <Text style={styles.postCountText}>{socialPosts.length} posts</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {(["generate", "posts"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              setActiveTab(t);
              setStep("form");
              Haptics.selectionAsync();
            }}
            style={[styles.tab, activeTab === t && styles.tabActive]}
          >
            <Ionicons
              name={t === "generate" ? "sparkles-outline" : "albums-outline"}
              size={16}
              color={activeTab === t ? "#E879A0" : "#55557A"}
            />
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === "generate" ? "Generate" : "My Posts"}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "generate" ? (
        step === "form" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 },
            ]}
          >
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Platforms</Text>
              <View style={styles.platformGrid}>
                {PLATFORMS.map((p) => {
                  const selected = selectedPlatforms.has(p.id);
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => togglePlatform(p.id)}
                      style={[
                        styles.platformCard,
                        selected && { borderColor: p.color, backgroundColor: p.color + "12" },
                      ]}
                    >
                      <Ionicons name={p.icon} size={22} color={selected ? p.color : "#55557A"} />
                      <Text style={[styles.platformName, selected && { color: p.color }]}>
                        {p.name}
                      </Text>
                      <Text style={styles.platformChars}>{p.maxChars} chars</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Content topic</Text>
              <View style={styles.topicGrid}>
                {TOPICS.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedTopic(t);
                    }}
                    style={[
                      styles.topicChip,
                      selectedTopic === t && styles.topicChipSelected,
                    ]}
                  >
                    <Text style={[styles.topicText, selectedTopic === t && styles.topicTextSelected]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Tone</Text>
              <View style={styles.toneRow}>
                {TONES.map((tone) => (
                  <Pressable
                    key={tone.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedTone(tone.id);
                    }}
                    style={[
                      styles.toneBtn,
                      selectedTone === tone.id && styles.toneBtnSelected,
                    ]}
                  >
                    <Text style={[styles.toneBtnText, selectedTone === tone.id && styles.toneBtnTextSelected]}>
                      {tone.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Additional context (optional)</Text>
              <View style={styles.contextInput}>
                <TextInput
                  style={styles.contextInputText}
                  placeholder="Add details, keywords, or specific instructions..."
                  placeholderTextColor="#55557A"
                  value={customContext}
                  onChangeText={setCustomContext}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <Pressable
              onPress={handleGenerate}
              disabled={isGenerating || !selectedTopic}
              style={({ pressed }) => [
                styles.generateBtn,
                pressed && { opacity: 0.85 },
                (isGenerating || !selectedTopic) && { opacity: 0.5 },
              ]}
            >
              <LinearGradient
                colors={["#E879A0", "#BE185D"]}
                style={styles.generateBtnGradient}
              >
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.generateBtnText}>
                  {isGenerating ? "Generating..." : `Generate ${selectedPlatforms.size} Post${selectedPlatforms.size > 1 ? "s" : ""}`}
                </Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 },
            ]}
          >
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Generated posts</Text>
              <Pressable
                onPress={() => {
                  setStep("form");
                  setGeneratedPosts({} as Record<Platform_, string>);
                }}
                style={styles.regenerateBtn}
              >
                <Ionicons name="refresh" size={16} color="#8888B0" />
                <Text style={styles.regenerateBtnText}>Regenerate</Text>
              </Pressable>
            </View>

            {(Object.entries(generatedPosts) as [Platform_, string][]).map(([pid, content]) => {
              const platform = PLATFORMS.find((p) => p.id === pid)!;
              return (
                <View key={pid} style={[styles.resultCard, { borderColor: platform.color + "30" }]}>
                  <View style={styles.resultCardHeader}>
                    <View style={[styles.platformBadge, { backgroundColor: platform.color + "18" }]}>
                      <Ionicons name={platform.icon} size={14} color={platform.color} />
                      <Text style={[styles.platformBadgeText, { color: platform.color }]}>{platform.name}</Text>
                    </View>
                    <Text style={styles.charCount}>{content.length} / {platform.maxChars}</Text>
                  </View>
                  <Text style={styles.resultContent}>{content}</Text>
                </View>
              );
            })}

            <Pressable
              onPress={handleSaveAll}
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={["#E879A0", "#BE185D"]}
                style={styles.saveBtnGradient}
              >
                <Ionicons name="bookmark-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save All to Library</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        )
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 },
          ]}
        >
          {socialPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="share-social-outline" size={36} color="#E879A0" />
              </View>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtitle}>
                Generate your first post using the AI generator
              </Text>
              <Pressable
                onPress={() => setActiveTab("generate")}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>Generate Post</Text>
              </Pressable>
            </View>
          ) : (
            socialPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => {
                  Alert.alert("Delete", "Remove this post?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => deleteSocialPost(post.id),
                    },
                  ]);
                }}
              />
            ))
          )}
        </ScrollView>
      )}
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
    backgroundColor: "#E879A018",
    borderWidth: 1,
    borderColor: "#E879A030",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#E8E8F8" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#55557A" },
  postCount: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#E879A015",
  },
  postCountText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#E879A0" },
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
  tabActive: { borderBottomColor: "#E879A0" },
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#55557A" },
  tabTextActive: { color: "#E879A0", fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 20, gap: 20 },
  formSection: { gap: 12 },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#8888B0",
    letterSpacing: 0.2,
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  platformCard: {
    width: "47%",
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 14,
    padding: 14,
    gap: 6,
    alignItems: "center",
  },
  platformName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  platformChars: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
  },
  topicChipSelected: { backgroundColor: "#E879A018", borderColor: "#E879A0" },
  topicText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8888B0" },
  topicTextSelected: { color: "#E879A0" },
  toneRow: { flexDirection: "row", gap: 8 },
  toneBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    alignItems: "center",
  },
  toneBtnSelected: { backgroundColor: "#E879A018", borderColor: "#E879A0" },
  toneBtnText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8888B0" },
  toneBtnTextSelected: { color: "#E879A0" },
  contextInput: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 14,
    padding: 14,
    height: 80,
    justifyContent: "flex-start",
  },
  contextInputText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
    height: 52,
  },
  generateBtn: { borderRadius: 14, overflow: "hidden" },
  generateBtnGradient: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  generateBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#E8E8F8" },
  regenerateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
  },
  regenerateBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8888B0" },
  resultCard: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  resultCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  platformBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  charCount: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#55557A" },
  resultContent: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
    lineHeight: 22,
  },
  saveBtn: { borderRadius: 14, overflow: "hidden" },
  saveBtnGradient: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 48 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#E879A015",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#E8E8F8" },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
    textAlign: "center",
    maxWidth: 260,
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E879A018",
    borderWidth: 1,
    borderColor: "#E879A040",
  },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#E879A0" },
  postCard: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  postCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  draftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#252640",
  },
  publishedBadge: { backgroundColor: "#00D4A015" },
  draftBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#8888B0" },
  publishedBadgeText: { color: "#00D4A0" },
  deleteBtn: { marginLeft: "auto", padding: 4 },
  postText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
    lineHeight: 21,
  },
  postDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#55557A" },
});
