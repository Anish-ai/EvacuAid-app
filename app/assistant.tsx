import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { fetchAiAssistantResponse } from '../services/MockApi';
import { Send, Bot, User } from 'lucide-react-native';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'I am the EvacuAid assistant. I can guide you to safety, locate emergency equipment, or help you report an incident. How can I assist you right now?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Fake AI Delay
    const aiResponseText = await fetchAiAssistantResponse(userMsg.text);
    
    setIsTyping(false);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText };
    setMessages(prev => [...prev, aiMsg]);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
         {messages.map(msg => (
           <View key={msg.id} style={[styles.messageRow, msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAi]}>
              {msg.sender === 'ai' && (
                 <View style={styles.avatarAi}>
                    <Bot color="white" size={16} />
                 </View>
              )}
              <View style={[styles.bubble, msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                 <Text style={[styles.messageText, msg.sender === 'user' ? styles.messageTextUser : styles.messageTextAi]}>
                    {msg.text}
                 </Text>
              </View>
              {msg.sender === 'user' && (
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
              <View style={[styles.bubble, styles.bubbleAi, { paddingHorizontal: 16 }]}>
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
           onSubmitEditing={sendMessage}
         />
         <Pressable style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim()}>
            <Send color="white" size={20} />
         </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  chatList: { padding: 16, paddingBottom: 24, flexGrow: 1, justifyContent: 'flex-end' },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', maxWidth: '85%' },
  messageRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageRowAi: { alignSelf: 'flex-start' },
  avatarAi: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarUser: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  bubble: { padding: 12, borderRadius: 16, flexShrink: 1 },
  bubbleUser: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextUser: { color: 'white' },
  messageTextAi: { color: '#334155' },

  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', paddingBottom: 30 },
  input: { flex: 1, height: 48, backgroundColor: '#f1f5f9', borderRadius: 24, paddingHorizontal: 16, fontSize: 16, color: '#0f172a', marginRight: 12 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#cbd5e1' }
});
