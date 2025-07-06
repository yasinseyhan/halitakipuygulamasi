import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import styles from "./SupportStyles";

const Support = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert("Uyarı", "Lütfen mesajınızı girin.");
      return;
    }
    Alert.alert("Teşekkürler", "Destek mesajınız gönderildi!");
    setMessage("");
  };

  const phoneNumber = "+905551112233";
  const whatsappMessage = "Merhaba, destek almak istiyorum.";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Destek</Text>
      <Text style={styles.info}>
        Her türlü soru ve sorununuz için bize ulaşabilirsiniz.
      </Text>
      <Text style={styles.label}>Mesajınız</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Mesajınızı buraya yazın..."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendButtonText}>Gönder</Text>
      </TouchableOpacity>
      <View style={styles.contactBox}>
        <Text style={styles.contactTitle}>İletişim Bilgileri</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:destek@halitakip.com")}
        >
          <Text
            style={[
              styles.contactText,
              { textDecorationLine: "underline", color: "#2196F3" },
            ]}
          >
            E-posta: destek@halitakip.com
          </Text>
        </TouchableOpacity>
        <View style={styles.phoneRow}>
          <Text style={styles.contactText}>
            Telefon: {phoneNumber.replace("+90", "+90 ")}
          </Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
          >
            <Ionicons name="call" size={28} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${phoneNumber.replace(
                  "+",
                  ""
                )}?text=${encodeURIComponent(whatsappMessage)}`
              )
            }
          >
            <FontAwesome name="whatsapp" size={36} color="#25D366" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.servicesBox}>
        <Text style={styles.servicesTitle}>Sunduğumuz Hizmetler</Text>
        <View style={styles.serviceRow}>
          <Ionicons
            name="globe-outline"
            size={20}
            color="#2196F3"
            style={styles.serviceIcon}
          />
          <Text style={styles.serviceItem}>
            Web sitesi tasarımı ve kurulumu
          </Text>
        </View>
        <View style={styles.serviceRow}>
          <Ionicons
            name="color-palette-outline"
            size={20}
            color="#FF9800"
            style={styles.serviceIcon}
          />
          <Text style={styles.serviceItem}>Logo tasarımı</Text>
        </View>
        <View style={styles.serviceRow}>
          <MaterialCommunityIcons
            name="google-ads"
            size={20}
            color="#43A047"
            style={styles.serviceIcon}
          />
          <Text style={styles.serviceItem}>Dijital reklam yönetimi</Text>
        </View>
        <View style={styles.serviceRow}>
          <FontAwesome
            name="instagram"
            size={20}
            color="#E1306C"
            style={styles.serviceIcon}
          />
          <Text style={styles.serviceItem}>Sosyal medya yönetimi</Text>
        </View>
      </View>
    </View>
  );
};

export default Support;
