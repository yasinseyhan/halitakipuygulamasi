import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import styles from "./SmsSettingsStyles";

const SmsSettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [sender, setSender] = useState("");

  const handleSave = () => {
    Alert.alert("Başarılı", "SMS ayarları kaydedildi.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SMS Ayarları</Text>
      <Text style={styles.label}>API Anahtarı</Text>
      <TextInput
        style={styles.input}
        placeholder="API anahtarınızı girin"
        value={apiKey}
        onChangeText={setApiKey}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Gönderici Adı</Text>
      <TextInput
        style={styles.input}
        placeholder="Gönderici adı"
        value={sender}
        onChangeText={setSender}
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SmsSettings;
