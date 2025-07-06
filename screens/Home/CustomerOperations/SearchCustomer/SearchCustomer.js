// src/screens/Home/CustomerOperations/SearchCustomer/SearchCustomer.js
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

import styles from "./SearchCustomerStyles";

const SearchCustomer = ({ navigation, route }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // `selectMode` parametresi, bu ekranın bir müşteri seçmek için mi açıldığını belirler.
  // Örneğin, AddOrder ekranından buraya "selectMode: true" ile geleceğiz.
  const selectMode = route.params?.selectMode || false;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(firestore, "customers"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const customerList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customerList);
        setFilteredCustomers(customerList);
        setLoading(false);
      },
      (error) => {
        console.error("Müşteriler çekilirken hata oluştu: ", error);
        setLoading(false);
        Alert.alert("Hata", "Müşteriler yüklenirken bir sorun oluştu.");
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(lowerCaseQuery) || // 'name' yerine 'customerName' kullandığınızı varsaydım
        customer.customerPhoneNumber.includes(searchQuery) ||
        (customer.customerAddress &&
          customer.customerAddress.toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleDeleteCustomer = async (customerId, customerName) => {
    Alert.alert(
      "Müşteriyi Sil",
      `"${customerName}" müşterisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
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
      // Normal modda ise müşteri detay ekranına git (bu ekranı daha sonra oluşturacağız)
      // navigation.navigate('CustomerDetail', { customerId: customer.id });
      Alert.alert(
        "Müşteri Detayı",
        `Müşteri Adı: ${customer.customerName}\nTelefon: ${
          customer.customerPhoneNumber
        }\nAdres: ${customer.customerAddress}\nBölge: ${
          customer.regionName || "Belirtilmemiş"
        }`
      );
      // Şimdilik Alert kullanıyorum, daha sonra CustomerDetail ekranına geçiş yapabiliriz.
    }
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
        {item.regionName && (
          <Text style={styles.customerRegion}>Bölge: {item.regionName}</Text>
        )}
      </View>
      <View style={styles.actions}>
        {/* Düzenleme butonu (isteğe bağlı, sonra eklenebilir) */}
        {/* <TouchableOpacity onPress={() => navigation.navigate('EditCustomer', { customerId: item.id })}>
          <Ionicons name="create-outline" size={24} color="#3498DB" style={styles.actionIcon} />
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => handleDeleteCustomer(item.id, item.customerName)}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color="#E74C3C"
            style={styles.actionIcon}
          />
        </TouchableOpacity>
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
