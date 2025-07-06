import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import styles from "./AccountSettingsStyles";

const AccountSettings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSave = () => {
    Alert.alert("Başarılı", "Hesap ayarları kaydedildi.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hesap Ayarları</Text>
      <Text style={styles.label}>Ad Soyad</Text>
      <TextInput
        style={styles.input}
        placeholder="Adınızı girin"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>E-posta</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta adresiniz"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Şifre</Text>
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountSettings;
