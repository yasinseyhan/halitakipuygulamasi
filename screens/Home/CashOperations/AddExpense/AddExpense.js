// src/screens/Home/CashOperations/AddExpense/AddExpense.js

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
import { Picker } from "@react-native-picker/picker"; // Picker için import
import DateTimePicker from "@react-native-community/datetimepicker"; // Tarih seçici için
import { Ionicons } from "@expo/vector-icons"; // İkonlar için
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Firestore işlemleri için
import { firestore } from "../../../../src/firebaseConfig"; // Firebase yapılandırmanızın yolu

const AddExpense = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Genel Gider"); // Varsayılan kategori
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Kategori seçenekleri
  const expenseCategories = [
    "Genel Gider",
    "Maaşlar",
    "Kira",
    "Fatura",
    "Yakıt",
    "Bakım",
    "Temizlik Malzemeleri",
    "Pazarlama",
    "Vergi",
    "Diğer",
  ];

  const handleAddExpense = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Hata", "Lütfen geçerli bir tutar girin.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Hata", "Lütfen bir açıklama girin.");
      return;
    }

    try {
      await addDoc(collection(firestore, "expenses"), {
        amount: parsedAmount,
        description: description.trim(),
        category: category,
        expenseDate: expenseDate, // Seçilen tarih
        createdAt: serverTimestamp(), // Kaydedilme anı
      });

      Alert.alert("Başarılı", "Gider başarıyla kaydedildi.", [
        {
          text: "Tamam",
          onPress: () => {
            // Formu temizle
            setAmount("");
            setDescription("");
            setCategory("Genel Gider");
            setExpenseDate(new Date());
            // İsterseniz burada kullanıcıyı doğrudan CashBank sayfasına yönlendirebilirsiniz
            // navigation.navigate("CashBank"); // Eğer uygunsa
          },
        },
      ]);
    } catch (error) {
      console.error("Gider kaydedilirken hata oluştu: ", error);
      Alert.alert("Hata", "Gider kaydedilemedi. Lütfen tekrar deneyin.");
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || expenseDate;
    setShowDatePicker(Platform.OS === "ios");
    setExpenseDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Yeni Gider Ekle</Text>

        {/* Tutar Alanı */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gider Tutarı (TL)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Örn: 150.75"
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
              {expenseCategories.map((cat, index) => (
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
            placeholder="Gider açıklaması (örn: Ofis kirası)"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Tarih Seçici */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gider Tarihi</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Ionicons name="calendar-outline" size={24} color="#007bff" />
            <Text style={styles.datePickerText}>
              {expenseDate.toLocaleDateString("tr-TR")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={expenseDate}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>

        {/* Gider Ekle Butonu */}
        <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Gideri Kaydet</Text>
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
    textAlignVertical: "top", // Android için metni yukarıdan başlatır
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden", // Picker kenarlarını yuvarlamak için
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
    backgroundColor: "#28A745", // Yeşil buton
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

export default AddExpense;
