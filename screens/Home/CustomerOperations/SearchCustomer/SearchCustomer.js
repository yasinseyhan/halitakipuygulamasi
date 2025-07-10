import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { firestore } from "../../../../src/firebaseConfig"; // firebaseConfig dosyanızın yolunu doğru ayarlayın
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // useNavigation import edildi

import styles from "./SearchCustomerStyles"; // Stil dosyanızın yolu

const SearchCustomer = ({ route }) => {
  // navigation prop'u yerine useNavigation kullanıyoruz
  const navigation = useNavigation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const selectMode = route.params?.selectMode || false;

  useEffect(() => {
    // onSnapshot sayesinde veritabanındaki değişiklikler anında yansır
    const unsubscribe = onSnapshot(
      query(collection(firestore, "customers"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const customerList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customerList);
        setFilteredCustomers(customerList); // Başlangıçta tüm müşteriler filtrelenmiş olarak ayarlanır
        setLoading(false);
      },
      (error) => {
        console.error("Müşteriler çekilirken hata oluştu: ", error);
        setLoading(false);
        Alert.alert("Hata", "Müşteriler yüklenirken bir sorun oluştu.");
      }
    );

    return () => unsubscribe(); // Cleanup fonksiyonu
  }, []); // Sadece bir kez mount edildiğinde çalışır

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        (customer.customerName &&
          customer.customerName.toLowerCase().includes(lowerCaseQuery)) ||
        (customer.customerPhoneNumber &&
          customer.customerPhoneNumber.includes(searchQuery)) ||
        (customer.customerAddress &&
          customer.customerAddress.toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleDeleteCustomer = async (customerId, customerDisplayName) => {
    Alert.alert(
      "Müşteriyi Sil",
      `"${customerDisplayName}" müşterisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "customers", customerId));
              Alert.alert("Başarılı", "Müşteri başarıyla silindi.");
            } catch (error) {
              console.error("Müşteri silinirken hata oluştu: ", error);
              Alert.alert("Hata", "Müşteri silinirken bir sorun oluştu.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleCustomerPress = (customer) => {
    if (selectMode) {
      // Eğer selectMode açıksa, seçilen müşteriyi geri gönder
      navigation.navigate(route.params.previousScreen, {
        selectedCustomer: customer,
      });
    } else {
      // Normal modda ise müşteri detay ekranına git
      navigation.navigate("CustomerDetail", { customer: customer });
    }
  };

  // Müşteri Düzenleme Fonksiyonu
  const handleEditCustomer = (customer) => {
    // `AddCustomer` ekranına, müşterinin tüm objesini ve isEditing bayrağını gönderiyoruz.
    // `AddCustomer` ekranı bu objeden `id`'yi ve diğer bilgileri alacak.
    navigation.navigate("AddCustomer", { customer: customer, isEditing: true });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => handleCustomerPress(item)} // Tıklanınca müşteriyi seç veya detayına git
    >
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.customerPhone}>
          Tel: {item.customerPhoneNumber}
        </Text>
        {item.customerAddress && (
          <Text style={styles.customerAddress}>
            Adres: {item.customerAddress}
          </Text>
        )}
        {item.regionName && ( // Firestore'da 'regionName' olarak kaydedilen bölge adını göster
          <Text style={styles.customerRegion}>Bölge: {item.regionName}</Text>
        )}
      </View>
      <View style={styles.actions}>
        {/* Düzenleme butonu: selectMode açık değilse göster */}
        {!selectMode && (
          <TouchableOpacity
            onPress={() => handleEditCustomer(item)} // Düzenleme fonksiyonunu çağır
            style={styles.actionButton}
          >
            <Ionicons
              name="pencil-outline"
              size={24}
              color="#3498DB"
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        )}
        {/* Silme butonu: selectMode açık değilse göster */}
        {!selectMode && (
          <TouchableOpacity
            onPress={() => handleDeleteCustomer(item.id, item.customerName)} // customerName'i gönder
            style={styles.actionButton}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color="#E74C3C"
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Müşteriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Müşteri ara (Ad, Telefon, Adres)"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {filteredCustomers.length === 0 ? (
        <Text style={styles.noCustomersText}>Müşteri bulunamadı.</Text>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default SearchCustomer;
