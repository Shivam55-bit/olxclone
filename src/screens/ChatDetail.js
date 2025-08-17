// ChatDetail.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

const ChatDetail = () => {
  const route = useRoute();
  const { name, profile } = route.params; // pass profile image url from Chat.js

  const [messages, setMessages] = useState([
    { id: "1", text: "Hey! How are you?", sender: "other" },
    { id: "2", text: "I’m good, thanks! How about you?", sender: "me" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const newMsg = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "me",
    };
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageRow,
        item.sender === "me" ? styles.myMessageRow : styles.otherMessageRow,
      ]}
    >
      {item.sender === "other" && (
        <Image source={{ uri: profile }} style={styles.avatar} />
      )}
      <View
        style={[
          styles.message,
          item.sender === "me" ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Gradient Header with Avatar */}
      <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.header}>
        {profile && (
          <Image source={{ uri: profile }} style={styles.headerAvatar} />
        )}
        <Text style={styles.headerText}>{name}</Text>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  headerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginRight: 10,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 5,
  },
  myMessageRow: { justifyContent: "flex-end" },
  otherMessageRow: { justifyContent: "flex-start" },

  message: {
    padding: 12,
    borderRadius: 20,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: "#4facfe",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  otherMessage: {
    backgroundColor: "#eaeaea",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },
  messageText: { fontSize: 15, color: "#333" },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#4facfe",
    padding: 12,
    borderRadius: 25,
    marginLeft: 8,
  },
});

export default ChatDetail;
