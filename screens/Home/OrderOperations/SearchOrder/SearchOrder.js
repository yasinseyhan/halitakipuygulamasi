// src/screens/Home/OrderOperations/SearchOrder/SearchOrder.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig"; // Doğru yolu kontrol edin
import { Ionicons } from "@expo/vector-icons";

import styles from "./SearchOrderStyles"; // Stilleri ayrı bir dosyadan içe aktarın

const SearchOrder = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tüm Siparişler"); // Varsayılan filtre

  // Firestore'dan siparişleri gerçek zamanlı dinle
  useEffect(() => {
    const q = query(
      collection(firestore, "orders"),
      orderBy("createdAt", "desc")
    ); // En yeni siparişler üstte
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Firestore Timestamp objelerini Date objelerine çevir (eğer varsa)
          orderDate: doc.data().orderDate?.toDate
            ? doc.data().orderDate.toDate()
            : doc.data().orderDate,
          deliveryDate: doc.data().deliveryDate?.toDate
            ? doc.data().deliveryDate.toDate()
            : doc.data().deliveryDate,
        }));
        setOrders(orderList);
        setLoading(false);
      },
      (error) => {
        console.error("Siparişler çekilirken hata oluştu: ", error);
        Alert.alert("Hata", "Siparişler yüklenirken bir sorun oluştu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtreleme ve Arama Mantığı
  useEffect(() => {
    let currentFilteredOrders = orders;

    // Duruma göre filtrele
    if (selectedStatus !== "Tüm Siparişler") {
      currentFilteredOrders = currentFilteredOrders.filter(
        (order) => order.status === selectedStatus
      );
    }

    // Arama sorgusuna göre filtrele
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    if (lowerCaseQuery) {
      currentFilteredOrders = currentFilteredOrders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(lowerCaseQuery) ||
          order.customerPhone.includes(lowerCaseQuery) ||
          order.notes.toLowerCase().includes(lowerCaseQuery) ||
          order.id.toLowerCase().includes(lowerCaseQuery) // Sipariş ID'sine göre de arama
      );
    }

    setFilteredOrders(currentFilteredOrders);
  }, [searchQuery, selectedStatus, orders]); // Bu bağımlılıklar değiştiğinde filtrelemeyi tekrar yap

  const handleOrderPress = (order) => {
    // Sipariş detay ekranına yönlendirme
    // 'OrderDetail' ekranını daha sonra oluşturacağız.
    // Şimdilik Alert ile bilgileri gösterelim.
    Alert.alert(
      "Sipariş Detayı",
      `Müşteri: ${order.customerName}\nTelefon: ${
        order.customerPhone
      }\nDurum: ${order.status}\nToplam: ${order.totalAmount?.toFixed(2)} TL` +
        `\nKalan: ${order.remainingAmount?.toFixed(2)} TL` +
        `\nNotlar: ${order.notes || "Yok"}` +
        `\nSipariş Tarihi: ${
          order.orderDate
            ? new Date(order.orderDate).toLocaleDateString("tr-TR")
            : "N/A"
        }` +
        `\nTeslim Tarihi: ${
          order.deliveryDate
            ? new Date(order.deliveryDate).toLocaleDateString("tr-TR")
            : "N/A"
        }`
    );
    // navigation.navigate('OrderDetail', { orderId: order.id });
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderCardHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
      </View>
      <Text style={styles.customerPhone}>Tel: {item.customerPhone}</Text>
      <Text style={styles.orderAmount}>
        Toplam: {item.totalAmount ? item.totalAmount.toFixed(2) : "0.00"} TL
      </Text>
      {item.remainingAmount > 0 && (
        <Text style={styles.remainingAmount}>
          Kalan: {item.remainingAmount.toFixed(2)} TL
        </Text>
      )}
      <Text style={styles.orderDate}>
        Sipariş Tarihi:{" "}
        {item.orderDate
          ? new Date(item.orderDate).toLocaleDateString("tr-TR")
          : "Tarih Yok"}
      </Text>
      <Text style={styles.deliveryDate}>
        Teslim Tarihi:{" "}
        {item.deliveryDate
          ? new Date(item.deliveryDate).toLocaleDateString("tr-TR")
          : "Tarih Yok"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
      </View>
    );
  }

  const orderStatuses = [
    "Tüm Siparişler",
    "Teslim Alınacak",
    "Teslim Alındı",
    "Yıkamada",
    "Hazır",
    "Teslim Edilecek",
    "Teslim Edildi",
    "İptal Edildi",
  ];

  return (
    <View style={styles.container}>
      {/* Arama Çubuğu */}
      <TextInput
        style={styles.searchInput}
        placeholder="Müşteri Adı, Telefon, Not veya Sipariş ID"
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Durum Filtresi */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(itemValue, itemIndex) => setSelectedStatus(itemValue)}
          style={styles.picker}
          dropdownIconColor="#2C3E50"
        >
          {orderStatuses.map((status, index) => (
            <Picker.Item key={index} label={status} value={status} />
          ))}
        </Picker>
      </View>

      {/* Sipariş Listesi */}
      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>
          Gösterilecek sipariş bulunmamaktadır.
        </Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

// Bu stil dosyasını ayrı bir dosyaya taşıyabilirsiniz: SearchOrderStyles.js
// Veya şimdilik buraya ekleyebilirsiniz.

export default SearchOrder;
