import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView, // Kaydırma özelliği eklemek için
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Picker bileşenini import et
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"; // addDoc ve serverTimestamp import edildi
import { firestore } from "../../../../src/firebaseConfig"; // firestore import edildi

import styles from "./AddCustomerStyles"; // Stil dosyasını import et

const AddCustomer = ({ navigation }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState(null); // Seçilen bölgenin ID'si
  const [regions, setRegions] = useState([]); // Firestore'dan gelen bölgeler
  const [loadingRegions, setLoadingRegions] = useState(true); // Bölgelerin yüklenmesini takip et

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "regions"));
        const fetchedRegions = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name, // Bölge adını 'name' alanı olarak varsayıyoruz
          // Diğer bölge alanlarını da ekleyebilirsiniz
        }));
        setRegions(fetchedRegions);
        if (fetchedRegions.length > 0) {
          setSelectedRegionId(fetchedRegions[0].id); // İlk bölgeyi varsayılan olarak seç
        }
      } catch (error) {
        console.error("Bölgeler çekilirken hata oluştu: ", error);
        Alert.alert("Hata", "Bölgeler yüklenirken bir sorun oluştu.");
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  const handleAddCustomer = async () => {
    // Hata kontrolleri düzeltildi
    if (!customerName.trim()) {
      // .trim() ile boşlukları da kontrol et
      Alert.alert("Uyarı", "Müşteri adı boş olamaz!");
      return;
    }
    if (!customerPhoneNumber.trim()) {
      Alert.alert("Uyarı", "Müşteri telefon numarası boş olamaz!");
      return;
    }
    // Adres boş bırakılabilir mi? Tasarımınıza göre değişir.
    // Şu anki kodunuzda zorunlu, isterseniz kaldırabilirsiniz.
    if (!customerAddress.trim()) {
      Alert.alert("Uyarı", "Müşteri adresi boş olamaz!");
      return;
    }
    if (!selectedRegionId) {
      // ID üzerinden kontrol
      Alert.alert("Uyarı", "Lütfen bir bölge seçin!");
      return;
    }

    try {
      const selectedRegion = regions.find((r) => r.id === selectedRegionId);
      if (!selectedRegion) {
        Alert.alert("Hata", "Seçilen bölge bulunamadı. Lütfen tekrar deneyin.");
        return;
      }

      await addDoc(collection(firestore, "customers"), {
        customerName: customerName.trim(),
        customerPhoneNumber: customerPhoneNumber.trim(),
        customerAddress: customerAddress.trim(),
        regionId: selectedRegion.id,
        regionName: selectedRegion.name, // Bölge adını da kaydedelim
        createdAt: serverTimestamp(), // Kayıt zamanını ekle
      });

      Alert.alert("Başarılı", "Müşteri başarıyla eklendi!");
      // Formu temizle
      setCustomerName("");
      setCustomerPhoneNumber("");
      setCustomerAddress("");
      // Bölge seçimini ilkine döndür veya boşalt
      setSelectedRegionId(regions.length > 0 ? regions[0].id : null);
    } catch (e) {
      console.error("Müşteri eklenirken hata oluştu: ", e); // Hatayı konsola da yazdır
      Alert.alert(
        "Hata",
        "Müşteri eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Müşteri Adı:</Text>
      <TextInput
        style={styles.input}
        placeholder="Adı Soyadı"
        value={customerName}
        onChangeText={setCustomerName}
      />

      <Text style={styles.label}>Müşteri Telefon Numarası:</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 5xx xxx xx xx"
        value={customerPhoneNumber}
        onChangeText={setCustomerPhoneNumber}
        keyboardType="phone-pad" // Telefon numarası için klavye tipi
      />

      <Text style={styles.label}>Müşteri Adresi:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Adres"
        value={customerAddress}
        onChangeText={setCustomerAddress}
        multiline // Çok satırlı giriş için
        numberOfLines={4} // Başlangıç satır sayısı
      />

      <Text style={styles.label}>Bölge:</Text>
      {loadingRegions ? (
        <ActivityIndicator size="small" color="#2C3E50" />
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedRegionId}
            onValueChange={(itemValue) => setSelectedRegionId(itemValue)}
            style={styles.picker}
            dropdownIconColor="#2C3E50" // Ok rengi
          >
            {regions.length === 0 ? (
              <Picker.Item label="Bölge bulunamadı" value={null} />
            ) : (
              regions.map((r) => (
                <Picker.Item key={r.id} label={r.name} value={r.id} />
              ))
            )}
          </Picker>
        </View>
      )}

      <TouchableOpacity onPress={handleAddCustomer} style={styles.button}>
        <Text style={styles.buttonText}>Müşteri Ekle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddCustomer;
