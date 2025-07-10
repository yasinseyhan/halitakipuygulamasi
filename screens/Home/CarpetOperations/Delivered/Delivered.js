// src/screens/Home/OrderOperations/Delivered/Delivered.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp, // Firestore Timestamp'i import etmeyi unutmayın!
} from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig"; // Firestore yapılandırmanızın doğru yolu
import { Ionicons } from "@expo/vector-icons";
import DatePickerHeader from "../../../../components/DatePickerHeader"; // DatePickerHeader'ın doğru yolu

const Delivered = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Varsayılan olarak bugünün tarihi

  useEffect(() => {
    setLoading(true);
    // Seçilen günün başlangıcı ve bitişi için Timestamp objeleri oluşturma
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(firestore, "orders"),
      where("status", "==", "Teslim Edildi"), // Ana filtreleme burada!
      // deliveryDate'e göre filtreleme yapıyoruz
      where("deliveryDate", ">=", Timestamp.fromDate(startOfDay)),
      where("deliveryDate", "<=", Timestamp.fromDate(endOfDay)),
      orderBy("deliveryDate", "desc"), // En son teslim edilenler üstte görünsün
      orderBy("createdAt", "desc") // deliveryDate aynıysa createdAt'e göre sırala
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Firestore Timestamp'leri Date objelerine çevir
          orderDate: doc.data().orderDate?.toDate
            ? doc.data().orderDate.toDate()
            : doc.data().orderDate,
          pickupDate: doc.data().pickupDate?.toDate
            ? doc.data().pickupDate.toDate()
            : doc.data().pickupDate,
          deliveryDate: doc.data().deliveryDate?.toDate
            ? doc.data().deliveryDate.toDate()
            : doc.data().deliveryDate,
        }));
        setOrders(orderList);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Teslim edilmiş siparişler çekilirken hata oluştu: ",
          error
        );
        Alert.alert(
          "Hata",
          "Teslim edilmiş siparişler yüklenirken bir sorun oluştu."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedDate]); // selectedDate değiştiğinde useEffect tekrar çalışsın

  // Her bir sipariş öğesini render eden fonksiyon
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("OrderDetail", { order: item })}
      style={styles.orderCard}
    >
      <View style={styles.cardContent}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.customerPhone}>Tel: {item.customerPhone}</Text>
        <Text style={styles.customerAddress}>
          Adres: {item.customerAddress}
        </Text>
        <Text style={styles.orderDate}>
          Alış Tarihi:
          {item.pickupDate
            ? new Date(item.pickupDate).toLocaleDateString("tr-TR")
            : "Belirtilmemiş"}
        </Text>
        <Text style={styles.deliveryDate}>
          Teslimat Tarihi:
          {item.deliveryDate
            ? new Date(item.deliveryDate).toLocaleDateString("tr-TR")
            : "Belirtilmemiş"}
        </Text>
        <Text style={styles.itemSummary}>
          Ürünler:
          {item.items
            ? item.items
                .map(
                  (i) => `${i.quantityValue} ${i.productUnit} ${i.productName}`
                )
                .join(", ")
            : "Yok"}
        </Text>
        <Text style={styles.orderAmount}>
          Toplam Tutar:
          {item.totalAmount ? item.totalAmount.toFixed(2) : "0.00"} TL
        </Text>
        {item.discountAmount > 0 && (
          <Text style={styles.orderAmount}>
            İndirim: {item.discountAmount.toFixed(2)} TL
          </Text>
        )}
        <Text style={styles.paidAmount}>
          Ödenen: {item.paidAmount ? item.paidAmount.toFixed(2) : "0.00"} TL
        </Text>
        {item.remainingAmount > 0 && (
          <Text style={styles.remainingAmount}>
            Kalan: {item.remainingAmount.toFixed(2)} TL
          </Text>
        )}
      </View>
      <View style={styles.arrowIcon}>
        <Ionicons name="chevron-forward-outline" size={24} color="#888" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>
          Teslim edilmiş siparişler yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DatePickerHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>
          {selectedDate.toLocaleDateString("tr-TR")} tarihi için teslim edilmiş
          sipariş bulunmamaktadır.
        </Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

// Önceki ekranlarla aynı veya benzer stil tanımları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA", // Daha açık bir arka plan
    paddingTop: 10,
  },
  centered: {
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
  listContent: {
    paddingHorizontal: 10, // Kenar boşlukları
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row", // Ok ikonu için yatay düzen
    justifyContent: "space-between", // İçeriği ve oku ayır
    alignItems: "center", // Dikeyde ortala
  },
  cardContent: {
    flex: 1, // İçeriğin genişlemesini sağla
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  customerPhone: {
    fontSize: 15,
    color: "#555",
    marginBottom: 3,
  },
  customerAddress: {
    fontSize: 14,
    color: "#777",
    marginBottom: 3,
  },
  orderDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 3,
  },
  deliveryDate: {
    // Teslim tarihi bu ekranda ana vurgu
    fontSize: 14,
    color: "#28A745", // Başarılı teslimat için yeşil tonu
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemSummary: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 5,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27AE60",
    marginTop: 5,
  },
  paidAmount: {
    fontSize: 15,
    color: "#4CAF50", // Yeşil tonu
    marginTop: 3,
  },
  remainingAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E74C3C",
    marginTop: 3,
  },
  arrowIcon: {
    marginLeft: 10,
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#555",
    fontWeight: "bold",
  },
});

export default Delivered;
