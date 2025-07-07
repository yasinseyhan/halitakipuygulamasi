import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig"; // Firebase yapılandırmanızın yolu

const AddIncome = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Ek İşler"); // Varsayılan kategori
  const [incomeDate, setIncomeDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Kategori seçenekleri
  const incomeCategories = [
    "Ek İşler",
    "Komisyon",
    "Danışmanlık",
    "Hizmet Ücreti",
    "Geri Ödeme",
    "Diğer",
  ];

  const handleAddIncome = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Hata", "Lütfen geçerli bir gelir tutarı girin.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Hata", "Lütfen bir açıklama girin.");
      return;
    }

    try {
      await addDoc(collection(firestore, "incomes"), {
        // "incomes" koleksiyonuna kaydediyoruz
        amount: parsedAmount,
        description: description.trim(),
        category: category,
        incomeDate: incomeDate, // Seçilen tarih
        createdAt: serverTimestamp(), // Kaydedilme anı
      });

      Alert.alert("Başarılı", "Gelir başarıyla kaydedildi.", [
        {
          text: "Tamam",
          onPress: () => {
            // Formu temizle
            setAmount("");
            setDescription("");
            setCategory("Ek İşler");
            setIncomeDate(new Date());
            // İsterseniz burada kullanıcıyı doğrudan CashBank sayfasına yönlendirebilirsiniz
            // navigation.navigate("CashBank");
          },
        },
      ]);
    } catch (error) {
      console.error("Gelir kaydedilirken hata oluştu: ", error);
      Alert.alert("Hata", "Gelir kaydedilemedi. Lütfen tekrar deneyin.");
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || incomeDate;
    setShowDatePicker(Platform.OS === "ios");
    setIncomeDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Yeni Gelir Ekle</Text>

        {/* Tutar Alanı */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gelir Tutarı (TL)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Örn: 500.00"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Kategori Seçimi */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue, itemIndex) => setCategory(itemValue)}
              style={styles.picker}
            >
              {incomeCategories.map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Açıklama Alanı */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Gelir açıklaması (örn: Hafta sonu ek iş)"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Tarih Seçici */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gelir Tarihi</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Ionicons name="calendar-outline" size={24} color="#28A745" />
            <Text style={styles.datePickerText}>
              {incomeDate.toLocaleDateString("tr-TR")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={incomeDate}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>

        {/* Gelir Ekle Butonu */}
        <TouchableOpacity style={styles.button} onPress={handleAddIncome}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Geliri Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F0F2F5",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#34495E",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007BFF", // Mavi buton (gelir için farklı bir renk)
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default AddIncome;
