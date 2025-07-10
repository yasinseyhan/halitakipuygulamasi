// screens/Definitions/VehicleDefinition.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView, // ScrollView'i buraya ekledik
  Keyboard, // Klavye ile etkileşim için gerekli olabilir (şimdilik kalsın)
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

const VehicleDefinition = () => {
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isEditActive, setIsEditActive] = useState(true);

  useEffect(() => {
    const q = query(collection(firestore, "drivers"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const driversList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDrivers(driversList);
        setLoading(false);
      },
      (error) => {
        console.error("Sürücüler çekilirken hata oluştu:", error);
        Alert.alert("Hata", "Sürücüler yüklenirken bir sorun oluştu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddOrUpdateDriver = async () => {
    if (!driverName.trim() || !vehicleName.trim() || !vehiclePlate.trim()) {
      Alert.alert(
        "Uyarı",
        "Lütfen sürücü adı, araç adı ve araç plakası bilgilerini eksiksiz doldurun."
      );
      return;
    }

    setSubmitting(true);
    try {
      if (editingDriver) {
        const driverRef = doc(firestore, "drivers", editingDriver.id);
        await updateDoc(driverRef, {
          name: driverName.trim(),
          phone: driverPhone.trim(),
          vehicleName: vehicleName.trim(),
          vehiclePlate: vehiclePlate.trim(),
          isActive: isEditActive,
          updatedAt: serverTimestamp(),
        });
        Alert.alert(
          "Başarılı",
          `${driverName.trim()} adlı sürücü güncellendi.`
        );
      } else {
        await addDoc(collection(firestore, "drivers"), {
          name: driverName.trim(),
          phone: driverPhone.trim(),
          vehicleName: vehicleName.trim(),
          vehiclePlate: vehiclePlate.trim(),
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        Alert.alert(
          "Başarılı",
          `${driverName.trim()} adlı sürücü başarıyla eklendi.`
        );
      }
      setDriverName("");
      setDriverPhone("");
      setVehicleName("");
      setVehiclePlate("");
      setEditingDriver(null);
      setIsEditActive(true);
    } catch (error) {
      console.error("Sürücü işlemi sırasında hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Sürücü işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setDriverName(driver.name);
    setDriverPhone(driver.phone);
    setVehicleName(driver.vehicleName);
    setVehiclePlate(driver.vehiclePlate);
    setIsEditActive(driver.isActive);
  };

  const handleDeleteDriver = (driverId) => {
    Alert.alert(
      "Sürücüyü Sil",
      "Bu sürücüyü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          onPress: async () => {
            setSubmitting(true);
            try {
              await deleteDoc(doc(firestore, "drivers", driverId));
              Alert.alert("Başarılı", "Sürücü başarıyla silindi.");
              if (editingDriver && editingDriver.id === driverId) {
                setDriverName("");
                setDriverPhone("");
                setVehicleName("");
                setVehiclePlate("");
                setEditingDriver(null);
                setIsEditActive(true);
              }
            } catch (error) {
              console.error("Sürücü silinirken hata oluştu:", error);
              Alert.alert("Hata", "Sürücü silinirken bir sorun oluştu.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderDriverItem = ({ item }) => (
    <View style={styles.driverItem}>
      <View style={styles.driverInfoTextContainer}>
        <Text style={styles.driverName}>Sürücü: {item.name}</Text>
        {item.phone && (
          <Text style={styles.driverDetail}>Telefon: {item.phone}</Text>
        )}
        <Text style={styles.driverDetail}>Araç: {item.vehicleName}</Text>
        <Text style={styles.driverDetail}>Plaka: {item.vehiclePlate}</Text>
        <Text style={styles.driverDetail}>
          Durum: {item.isActive ? "Aktif" : "Pasif"}
        </Text>
      </View>
      <View style={styles.driverActions}>
        <TouchableOpacity
          onPress={() => handleEditDriver(item)}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteDriver(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // loading state'i burada kontrol edildi.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Sürücüler yükleniyor...</Text>
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
        contentContainerStyle={styles.scrollContent} // Yeni bir stil kullanabiliriz veya flatListContent'i düzenleriz
        keyboardShouldPersistTaps="always" // Bu, klavyenin ScrollView içinde açık kalmasını sağlar
      >
        {/* Form ve üst başlıklar */}
        <View style={styles.formContainer}>
          <Text style={styles.header}>
            {editingDriver ? "Sürücüyü Düzenle" : "Yeni Sürücü Tanımla"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Sürücü Adı Soyadı"
            value={driverName}
            onChangeText={setDriverName}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası (Opsiyonel)"
            value={driverPhone}
            onChangeText={setDriverPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Araç Adı (örn: Ford Transit)"
            value={vehicleName}
            onChangeText={setVehicleName}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Araç Plakası (örn: 34 ABC 123)"
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            // autoCapitalize="characters" // Bu prop'u eski haliyle bırakabiliriz eğer sorun yaratmıyorsa
            placeholderTextColor="#888"
          />

          {editingDriver && (
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Sürücü Aktif Mi?</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isEditActive ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setIsEditActive}
                value={isEditActive}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddOrUpdateDriver}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {editingDriver ? "Sürücüyü Güncelle" : "Sürücü Ekle"}
                </Text>
                <Ionicons
                  name={
                    editingDriver
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

          {editingDriver && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setEditingDriver(null);
                setDriverName("");
                setDriverPhone("");
                setVehicleName("");
                setVehiclePlate("");
                setIsEditActive(true);
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

          <Text style={styles.listHeader}>Mevcut Sürücüler</Text>
        </View>

        {/* Sürücü listesi */}
        {drivers.length === 0 ? (
          <Text style={styles.noDriversText}>
            Henüz kayıtlı sürücü bulunamadı.
          </Text>
        ) : (
          drivers.map((item) => (
            <View key={item.id}>{renderDriverItem({ item })}</View>
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
    paddingBottom: 0, // ScrollView'in kendi padding'ini kullanacağız
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
  scrollContent: {
    // ScrollView için yeni bir contentContainerStyle
    paddingBottom: 20,
    // Ekranın üst kısmındaki padding'i formContainer'dan alıyoruz
  },
  driverItem: {
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
  driverInfoTextContainer: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  driverDetail: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
  driverActions: {
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
  noDriversText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
    marginHorizontal: 20, // Kenar boşlukları burada
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#BDC3C7",
  },
  switchLabel: {
    fontSize: 16,
    color: "#34495E",
    fontWeight: "bold",
  },
});

export default VehicleDefinition;
