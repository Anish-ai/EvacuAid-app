import { Bot, Send, User } from "lucide-react-native";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { sendAiChat } from "../services/appApi";
import { ChatMessage } from "../types";

const QUICK_PROMPTS = [
  "Where is the nearest safe stairwell?",
  "Someone is trapped.",
  "Show me the current incident summary.",
];

export default function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "I am the EvacuAid AI Command Node. I can guide you to safety, summarize active incidents, and help with route decisions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (value?: string | unknown) => {
    const content =
      typeof value === "string" ? value.trim() : String(input).trim();
    if (!content || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const chatHistory = [...messages, userMsg].map((item) => ({
        role: item.role,
        content: item.content,
      }));
      const aiResponseText = await sendAiChat(chatHistory);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponseText,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      Alert.alert(
        "Assistant unavailable",
        error instanceof Error
          ? error.message
          : "Unable to reach AI service. Check API configuration.",
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        <View style={styles.quickPromptRow}>
          {QUICK_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt}
              style={styles.quickPromptBtn}
              onPress={() => sendMessage(prompt)}
              disabled={isTyping}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.role === "user" ? styles.messageRowUser : styles.messageRowAi,
            ]}
          >
            {msg.role === "assistant" && (
              <View style={styles.avatarAi}>
                <Bot color="white" size={16} />
              </View>
            )}
            <View
              style={[
                styles.bubble,
                msg.role === "user" ? styles.bubbleUser : styles.bubbleAi,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.role === "user"
                    ? styles.messageTextUser
                    : styles.messageTextAi,
                ]}
              >
                {msg.content}
              </Text>
            </View>
            {msg.role === "user" && (
              <View style={styles.avatarUser}>
                <User color="white" size={16} />
              </View>
            )}
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageRow, styles.messageRowAi]}>
            <View style={styles.avatarAi}>
              <Bot color="white" size={16} />
            </View>
            <View
              style={[
                styles.bubble,
                styles.bubbleAi,
                { paddingHorizontal: 16 },
              ]}
            >
              <ActivityIndicator color="#64748b" size="small" />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask for guidance or report..."
          placeholderTextColor="#94a3b8"
          onSubmitEditing={() => sendMessage()}
        />
        <Pressable
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim()}
        >
          <Send color="white" size={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  chatList: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  quickPromptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  quickPromptBtn: {
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickPromptText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "600",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
    maxWidth: "85%",
  },
  messageRowUser: { alignSelf: "flex-end", justifyContent: "flex-end" },
  messageRowAi: { alignSelf: "flex-start" },
  avatarAi: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  bubble: { padding: 12, borderRadius: 16, flexShrink: 1 },
  bubbleUser: { backgroundColor: "#2563eb", borderBottomRightRadius: 4 },
  bubbleAi: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 13, lineHeight: 22 },
  messageTextUser: { color: "white" },
  messageTextAi: { color: "#334155" },

  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    paddingBottom: 30,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#f1f5f9",
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0f172a",
    marginRight: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#cbd5e1" },
});
