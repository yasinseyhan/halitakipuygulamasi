import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  // FlatList'i kaldırdık
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView, // ScrollView'i import ettik
} from "react-native";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const MessageTemplates = () => {
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    const q = query(
      collection(firestore, "messageTemplates"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const templatesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessageTemplates(templatesList);
        setLoading(false);
      },
      (error) => {
        console.error("Mesaj şablonları çekilirken hata oluştu:", error);
        Alert.alert("Hata", "Mesaj şablonları yüklenirken bir sorun oluştu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddOrUpdateTemplate = async () => {
    if (!templateTitle.trim() || !templateContent.trim()) {
      Alert.alert(
        "Uyarı",
        "Lütfen şablon başlığı ve içeriği bilgilerini eksiksiz doldurun."
      );
      return;
    }

    setSubmitting(true);
    try {
      if (editingTemplate) {
        const templateRef = doc(
          firestore,
          "messageTemplates",
          editingTemplate.id
        );
        await updateDoc(templateRef, {
          title: templateTitle.trim(),
          content: templateContent.trim(),
          updatedAt: serverTimestamp(),
        });
        Alert.alert(
          "Başarılı",
          `"${templateTitle.trim()}" şablonu güncellendi.`
        );
      } else {
        await addDoc(collection(firestore, "messageTemplates"), {
          title: templateTitle.trim(),
          content: templateContent.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        Alert.alert(
          "Başarılı",
          `"${templateTitle.trim()}" şablonu başarıyla eklendi.`
        );
      }
      setTemplateTitle("");
      setTemplateContent("");
      setEditingTemplate(null);
    } catch (error) {
      console.error("Şablon işlemi sırasında hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Şablon işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateTitle(template.title);
    setTemplateContent(template.content);
  };

  const handleDeleteTemplate = (templateId) => {
    Alert.alert(
      "Şablonu Sil",
      "Bu mesaj şablonunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          onPress: async () => {
            setSubmitting(true);
            try {
              await deleteDoc(doc(firestore, "messageTemplates", templateId));
              Alert.alert("Başarılı", "Şablon başarıyla silindi.");
              if (editingTemplate && editingTemplate.id === templateId) {
                setTemplateTitle("");
                setTemplateContent("");
                setEditingTemplate(null);
              }
            } catch (error) {
              console.error("Şablon silinirken hata oluştu:", error);
              Alert.alert("Hata", "Şablon silinirken bir sorun oluştu.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderTemplateItem = ({ item }) => (
    <View style={styles.templateItem}>
      <View style={styles.templateInfoTextContainer}>
        <Text style={styles.templateTitle}>{item.title}</Text>
        <Text style={styles.templateContent}>{item.content}</Text>
      </View>
      <View style={styles.templateActions}>
        <TouchableOpacity
          onPress={() => handleEditTemplate(item)}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTemplate(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Şablonlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent} // Yeni bir stil kullanıyoruz
        keyboardShouldPersistTaps="always" // Bu, klavyenin ScrollView içinde açık kalmasını sağlar
      >
        {/* Form ve üst başlıklar */}
        <View style={styles.formContainer}>
          <Text style={styles.header}>
            {editingTemplate ? "Şablonu Düzenle" : "Yeni Mesaj Şablonu Tanımla"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Şablon Başlığı (örn: Geç Kalma Uyarısı)"
            value={templateTitle}
            onChangeText={setTemplateTitle}
            placeholderTextColor="#888"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mesaj İçeriği (örn: Merhaba {{driverName}}, yola çıkış saatiniz yaklaşıyor...)"
            value={templateContent}
            onChangeText={setTemplateContent}
            multiline
            numberOfLines={4}
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddOrUpdateTemplate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {editingTemplate ? "Şablonu Güncelle" : "Şablon Ekle"}
                </Text>
                <Ionicons
                  name={
                    editingTemplate
                      ? "checkmark-circle-outline"
                      : "add-circle-outline"
                  }
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>

          {editingTemplate && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setEditingTemplate(null);
                setTemplateTitle("");
                setTemplateContent("");
              }}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>İptal</Text>
              <Ionicons
                name="close-circle-outline"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          )}

          <Text style={styles.listHeader}>Mevcut Mesaj Şablonları</Text>
        </View>

        {/* Mesaj Şablonları listesi */}
        {messageTemplates.length === 0 ? (
          <Text style={styles.noTemplatesText}>
            Henüz kayıtlı mesaj şablonu bulunamadı.
          </Text>
        ) : (
          messageTemplates.map((item) => (
            <View key={item.id}>{renderTemplateItem({ item })}</View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  formContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    height: 50,
    borderColor: "#BDC3C7",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#34495E",
  },
  textArea: {
    height: 100, // Daha büyük bir alan için
    textAlignVertical: "top", // Metni üstten başlat
    paddingTop: 15,
    paddingBottom: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#FFC107",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  listHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34495E",
    marginTop: 30,
    marginBottom: 15,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#BDC3C7",
    paddingBottom: 10,
  },
  // ScrollView için yeni contentContainerStyle
  scrollContent: {
    paddingBottom: 20,
  },
  templateItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20, // Kenar boşlukları burada
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateInfoTextContainer: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  templateContent: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
  templateActions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#ECF0F1",
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#FADBD8",
  },
  noTemplatesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
    marginHorizontal: 20, // Kenar boşlukları burada
  },
});

export default MessageTemplates;
