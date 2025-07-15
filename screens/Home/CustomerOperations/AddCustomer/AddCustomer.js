import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";

import { firestore } from "../../../../src/firebaseConfig"; // firestore yolunu kontrol edin
import styles from "./AddCustomerStyles"; // Stil dosyasının yolunu kontrol edin

const AddCustomer = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { customer: initialCustomer, isEditing: initialIsEditing } =
    route.params || {};

  const [customerName, setCustomerName] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  // const [customerNotes, setCustomerNotes] = useState("");
  // selectedRegionId'yi null yerine boş string olarak başlatıyoruz
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [regions, setRegions] = useState([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Başlık ve düzenleme modunu ayarla
  useEffect(() => {
    if (initialIsEditing && initialCustomer?.id) {
      navigation.setOptions({ title: "Müşteri Düzenle" });
      setIsEditing(true);
    } else {
      navigation.setOptions({ title: "Yeni Müşteri Ekle" });
      setIsEditing(false);
    }
  }, [navigation, initialIsEditing, initialCustomer]);

  // Tüm verileri (bölgeler ve müşteri bilgileri) çekme
  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingForm(true); // Yükleme başlıyor
      try {
        // Bölgeleri Firebase'den çek
        const regionsSnapshot = await getDocs(collection(firestore, "regions"));
        const fetchedRegions = regionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setRegions(fetchedRegions);
        console.log("Çekilen bölgeler (fetchedRegions):", fetchedRegions);

        // Düzenleme modundaysa mevcut müşteri bilgilerini çek
        if (isEditing && initialCustomer?.id) {
          const customerRef = doc(firestore, "customers", initialCustomer.id);
          const customerSnap = await getDoc(customerRef);

          if (customerSnap.exists()) {
            const data = customerSnap.data();
            console.log("Düzenlenen müşteri verisi:", data);

            setCustomerName(data.customerName || "");
            setCustomerPhoneNumber(data.customerPhoneNumber || "");
            setCustomerAddress(data.customerAddress || "");
            // setCustomerNotes(data.customerNotes || "");
            // regionId yoksa veya null ise boş string "" olarak ayarla
            setSelectedRegionId(data.regionId || "");
          } else {
            Alert.alert("Hata", "Müşteri bilgileri bulunamadı.");
            navigation.goBack(); // Müşteri bulunamazsa geri dön
          }
        } else {
          // Yeni müşteri ekleme modundaysa form alanlarını sıfırla
          setCustomerName("");
          setCustomerPhoneNumber("");
          setCustomerAddress("");
          // setCustomerNotes("");
          setSelectedRegionId(""); // Boş string olarak ayarla
        }
      } catch (error) {
        console.error("Veri çekilirken hata oluştu: ", error);
        Alert.alert(
          "Hata",
          "Veriler yüklenirken bir sorun oluştu: " + error.message
        );
      } finally {
        setLoadingForm(false); // Yükleme tamamlandı
      }
    };
    fetchAllData();
    // useEffect'in bağımlılıkları: isEditing veya initialCustomer değiştiğinde tekrar çalışır
  }, [isEditing, initialCustomer, navigation]);

  // Müşteriyi kaydetme veya güncelleme
  const handleSaveCustomer = async () => {
    // Validasyonlar
    if (!customerName.trim()) {
      Alert.alert("Uyarı", "Müşteri adı boş olamaz!");
      return;
    }
    if (!customerPhoneNumber.trim()) {
      Alert.alert("Uyarı", "Müşteri telefon numarası boş olamaz!");
      return;
    }
    if (!customerAddress.trim()) {
      Alert.alert("Uyarı", "Müşteri adresi boş olamaz!");
      return;
    }
    // selectedRegionId boş string ise (seçili değilse)
    if (!selectedRegionId) {
      Alert.alert("Uyarı", "Lütfen bir bölge seçin!");
      return;
    }

    setLoadingForm(true); // Kaydetme işlemi başlıyor
    try {
      // Seçilen bölgeyi bul
      const selectedRegion = regions.find((r) => r.id === selectedRegionId);
      if (!selectedRegion) {
        Alert.alert(
          "Hata",
          "Seçilen bölge bulunamadı veya geçersiz. Lütfen geçerli bir bölge seçin."
        );
        setLoadingForm(false);
        return;
      }

      // Müşteri verilerini hazırla
      const customerData = {
        customerName: customerName.trim(),
        customerPhoneNumber: customerPhoneNumber.trim(),
        customerAddress: customerAddress.trim(),
        // customerNotes: customerNotes.trim(),
        regionId: selectedRegion.id,
        regionName: selectedRegion.name,
        updatedAt: serverTimestamp(), // Güncelleme zaman damgası
      };

      // Düzenleme mi yoksa yeni ekleme mi kontrol et
      if (isEditing && initialCustomer?.id) {
        await updateDoc(
          doc(firestore, "customers", initialCustomer.id),
          customerData
        );
        Alert.alert("Başarılı", "Müşteri bilgileri güncellendi!");
      } else {
        await addDoc(collection(firestore, "customers"), {
          ...customerData,
          createdAt: serverTimestamp(), // Oluşturma zaman damgası
        });
        Alert.alert("Başarılı", "Yeni müşteri başarıyla eklendi!");
      }
      navigation.goBack(); // İşlem bitince bir önceki ekrana dön
    } catch (e) {
      console.error("Müşteri kaydetme/güncelleme hatası: ", e);
      Alert.alert(
        "Hata",
        "Müşteri kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoadingForm(false); // Kaydetme işlemi tamamlandı
    }
  };

  // Form yüklenirken ActivityIndicator göster
  if (loadingForm) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>
          {isEditing ? "Müşteri bilgileri yükleniyor..." : "Form yükleniyor..."}
        </Text>
      </View>
    );
  }

  // Render öncesi state değerlerini logla (hata ayıklama için)
  console.log("RENDER ÖNCESİ - selectedRegionId:", selectedRegionId);
  console.log("RENDER ÖNCESİ - regions:", regions);

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
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Müşteri Adresi:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Adres"
        value={customerAddress}
        onChangeText={setCustomerAddress}
        multiline
        numberOfLines={4}
      />
      {/* <Text style={styles.label}>Notlar:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ek Notlar"
        value={customerNotes}
        onChangeText={setCustomerNotes}
        multiline
        numberOfLines={4}
      /> */}
      <Text style={styles.label}>Bölge:</Text>
      <View style={styles.pickerContainer}>
        {/* Picker'ı sadece loadingForm false ve regions listesi doluysa render et */}
        {!loadingForm && regions.length > 0 ? (
          <Picker
            selectedValue={selectedRegionId}
            onValueChange={(itemValue) => setSelectedRegionId(itemValue)}
            style={styles.picker}
            dropdownIconColor="#2C3E50"
            key={selectedRegionId} // selectedRegionId değiştiğinde Picker'ı yeniden oluştur
          >
            {/* İlk öğe olarak boş string value'lu "Bölge Seçin" */}
            <Picker.Item label="Bölge Seçin" value={""} />
            {regions.map((r) => (
              <Picker.Item key={r.id} label={r.name} value={r.id} />
            ))}
          </Picker>
        ) : (
          // Veriler yüklenene veya bölgeler çekilene kadar geçici bir metin göster
          <Text style={styles.loadingText}>Bölgeler yükleniyor...</Text>
        )}
      </View>
      <TouchableOpacity onPress={handleSaveCustomer} style={styles.button}>
        <Text style={styles.buttonText}>
          {isEditing ? "Müşteriyi Güncelle" : "Müşteri Ekle"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddCustomer;
