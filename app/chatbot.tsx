import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBusiness, ChatMessage } from "@/context/business";

const BOT_RESPONSES = [
  "Thanks for reaching out! I'd be happy to help. Could you tell me more about what you're looking for?",
  "Great question! Let me find the best option for you. We have several services that might fit your needs perfectly.",
  "I can definitely assist with that! Would you like me to check our availability and schedule an appointment?",
  "Of course! Our team specializes in exactly that. Let me gather a few more details to provide the best recommendation.",
  "That sounds great! We'd love to help. Can I get your contact information so we can follow up with you?",
  "Thank you for your interest! I'll connect you with the right person on our team right away.",
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isBot = message.role === "bot";
  return (
    <View style={[styles.bubbleRow, !isBot && styles.bubbleRowUser]}>
      {isBot && (
        <View style={styles.botAvatar}>
          <Ionicons name="flash" size={14} color="#3D7BFF" />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isBot ? styles.bubbleBot : styles.bubbleUser,
        ]}
      >
        <Text style={[styles.bubbleText, isBot && styles.bubbleTextBot]}>
          {message.text}
        </Text>
        <Text style={[styles.bubbleTime, isBot && styles.bubbleTimeBot]}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}

const QUICK_REPLIES = [
  "What services do you offer?",
  "Book an appointment",
  "Business hours",
  "Pricing info",
];

export default function Chatbot() {
  const insets = useSafeAreaInsets();
  const { chatMessages, addChatMessage, profile } = useBusiness();
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"test" | "config">("test");
  const [greeting, setGreeting] = useState(
    `Hi! I'm ${profile?.name ?? "your business"}'s AI assistant. How can I help you today?`
  );
  const [botName, setBotName] = useState("AutoBot");
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");
    await addChatMessage({ role: "user", text: text.trim() });

    setIsBotTyping(true);
    setTimeout(async () => {
      const response =
        BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      await addChatMessage({ role: "bot", text: response });
      setIsBotTyping(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1200 + Math.random() * 800);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#8888B0" />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.botAvatarLarge}>
            <Ionicons name="flash" size={20} color="#3D7BFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Chatbot</Text>
            <Text style={styles.headerSubtitle}>Customer-facing assistant</Text>
          </View>
        </View>
        <View style={[styles.liveIndicator]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {(["test", "config"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              setActiveTab(t);
              Haptics.selectionAsync();
            }}
            style={[styles.tab, activeTab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === "test" ? "Test Chatbot" : "Configuration"}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "test" ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.chatArea}>
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              ListHeaderComponent={
                <View style={styles.greetingBubbleRow}>
                  <View style={styles.botAvatar}>
                    <Ionicons name="flash" size={14} color="#3D7BFF" />
                  </View>
                  <View style={[styles.bubble, styles.bubbleBot]}>
                    <Text style={styles.bubbleTextBot}>{greeting}</Text>
                  </View>
                </View>
              }
              ListFooterComponent={
                isBotTyping ? (
                  <View style={styles.bubbleRow}>
                    <View style={styles.botAvatar}>
                      <Ionicons name="flash" size={14} color="#3D7BFF" />
                    </View>
                    <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                      <View style={styles.typingDots}>
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                      </View>
                    </View>
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={false}
            />

            {chatMessages.length === 0 && (
              <View style={styles.quickReplies}>
                <Text style={styles.quickRepliesLabel}>Suggested replies</Text>
                <View style={styles.quickRepliesRow}>
                  {QUICK_REPLIES.map((qr) => (
                    <Pressable
                      key={qr}
                      onPress={() => sendMessage(qr)}
                      style={styles.quickReply}
                    >
                      <Text style={styles.quickReplyText}>{qr}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View
            style={[
              styles.inputRow,
              {
                paddingBottom:
                  insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8,
              },
            ]}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#55557A"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
            </View>
            <Pressable
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isBotTyping}
              style={({ pressed }) => [
                styles.sendBtn,
                (!input.trim() || isBotTyping) && { opacity: 0.4 },
                pressed && { opacity: 0.8 },
              ]}
            >
              <LinearGradient
                colors={["#3D7BFF", "#2563EB"]}
                style={styles.sendBtnGradient}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View
          style={[
            styles.configArea,
            {
              paddingBottom:
                insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
            },
          ]}
        >
          <Text style={styles.configSection}>Bot Identity</Text>

          <View style={styles.configCard}>
            {[
              { label: "Bot name", value: botName, setter: setBotName, placeholder: "AutoBot" },
              { label: "Greeting message", value: greeting, setter: setGreeting, placeholder: "Hi! How can I help?", multiline: true },
            ].map((f) => (
              <View key={f.label} style={styles.configField}>
                <Text style={styles.configLabel}>{f.label}</Text>
                <View style={[styles.configInput, f.multiline && { height: 80, alignItems: "flex-start", paddingTop: 12 }]}>
                  <TextInput
                    style={[styles.configInputText, f.multiline && { height: 56 }]}
                    value={f.value}
                    onChangeText={f.setter}
                    placeholder={f.placeholder}
                    placeholderTextColor="#55557A"
                    multiline={!!f.multiline}
                  />
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.configSection}>Features</Text>
          <View style={styles.configCard}>
            {[
              { icon: "calendar-outline" as const, title: "Appointment booking", desc: "Let customers book directly via chat", color: "#3D7BFF", on: true },
              { icon: "help-circle-outline" as const, title: "FAQ responses", desc: "Answer common questions automatically", color: "#00D4A0", on: true },
              { icon: "person-add-outline" as const, title: "Lead capture", desc: "Collect visitor contact information", color: "#F59E0B", on: false },
            ].map((feat) => (
              <View key={feat.title} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: feat.color + "15" }]}>
                  <Ionicons name={feat.icon} size={18} color={feat.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feat.title}</Text>
                  <Text style={styles.featureDesc}>{feat.desc}</Text>
                </View>
                <View style={[styles.featureToggle, { backgroundColor: feat.on ? "#3D7BFF30" : "#252640" }]}>
                  <View style={[styles.featureToggleThumb, { backgroundColor: feat.on ? "#3D7BFF" : "#55557A", transform: [{ translateX: feat.on ? 16 : 0 }] }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
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
  botAvatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#3D7BFF18",
    borderWidth: 1,
    borderColor: "#3D7BFF30",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#00D4A015",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00D4A0",
  },
  liveText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#00D4A0",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#0D0E1A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F35",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#3D7BFF" },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#55557A",
  },
  tabTextActive: { color: "#3D7BFF", fontFamily: "Inter_600SemiBold" },
  chatArea: { flex: 1 },
  messageList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 12 },
  greetingBubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  bubbleRowUser: {
    flexDirection: "row-reverse",
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#3D7BFF18",
    borderWidth: 1,
    borderColor: "#3D7BFF30",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleBot: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: "#3D7BFF",
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#fff",
    lineHeight: 20,
  },
  bubbleTextBot: { color: "#E8E8F8" },
  bubbleTime: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    alignSelf: "flex-end",
  },
  bubbleTimeBot: { color: "#55557A" },
  typingBubble: { paddingVertical: 14, paddingHorizontal: 16 },
  typingDots: { flexDirection: "row", gap: 4, alignItems: "center" },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#55557A",
  },
  quickReplies: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  quickRepliesLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#55557A",
  },
  quickRepliesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickReply: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
  },
  quickReplyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E1F35",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
  },
  sendBtn: { borderRadius: 22, overflow: "hidden" },
  sendBtnGradient: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  configArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  configSection: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#8888B0",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  configCard: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 16,
    overflow: "hidden",
  },
  configField: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F35",
  },
  configLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#55557A",
  },
  configInput: {
    backgroundColor: "#0D0E1A",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
  },
  configInputText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F35",
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1, gap: 2 },
  featureTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#E8E8F8",
  },
  featureDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#55557A",
  },
  featureToggle: {
    width: 42,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  featureToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
