import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { firestore } from "../../../src/firebaseConfig";
import styles from "./CompanySettingsStyles";

const CompanySettings = ({ navigation }) => {
  const [firmaAdi, setFirmaAdi] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [firmaEmail, setFirmaEmail] = useState("");
  const [firmaTelefonNumarasi, setFirmaTelefonNumarasi] = useState("");
  const [firmaAdres, setFirmaAdres] = useState("");
  const [firmaIban, setFirmaIban] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLogoUrl(result.assets[0].uri);
    }
  };

  const saveSettings = async () => {
    try {
      await firestore.collection("firmalar").add({
        firmaAdi,
        logoUrl,
        firmaEmail,
        firmaTelefonNumarasi,
        firmaAdres,
        firmaIban,
      });
      Alert.alert("Başarılı", "Firma ayarları başarıyla kaydedildi.");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Hata",
        "Firma ayarları kaydedilirken bir hata oluştu: " + error.message
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Firma Ayarları</Text>
      <TouchableOpacity style={styles.logoContainer} onPress={pickImage}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logoImage} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>Logo Seç</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.inputLabel}>Firma Adı</Text>
      <TextInput
        style={styles.input}
        placeholder="Firma Adı"
        value={firmaAdi}
        onChangeText={setFirmaAdi}
        placeholderTextColor="#888"
      />

      <Text style={styles.inputLabel}>E-posta</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={firmaEmail}
        onChangeText={setFirmaEmail}
        keyboardType="email-address"
        placeholderTextColor="#888"
      />

      <Text style={styles.inputLabel}>Telefon Numarası</Text>
      <TextInput
        style={styles.input}
        placeholder="Telefon Numarası"
        value={firmaTelefonNumarasi}
        onChangeText={setFirmaTelefonNumarasi}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />

      <Text style={styles.inputLabel}>Adres</Text>
      <TextInput
        style={styles.input}
        placeholder="Adres"
        value={firmaAdres}
        onChangeText={setFirmaAdres}
        placeholderTextColor="#888"
      />

      <Text style={styles.inputLabel}>IBAN</Text>
      <TextInput
        style={styles.input}
        placeholder="IBAN"
        value={firmaIban}
        onChangeText={setFirmaIban}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CompanySettings;
