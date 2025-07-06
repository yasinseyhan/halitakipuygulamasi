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
} from "firebase/firestore"; // updateDoc burada gerekli değil
import { firestore } from "../../../../src/firebaseConfig"; // Firestore yapılandırmanızın doğru yolu
import { Ionicons } from "@expo/vector-icons";

const Delivered = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sadece "Teslim Edildi" durumundaki siparişleri dinle
    const q = query(
      collection(firestore, "orders"),
      where("status", "==", "Teslim Edildi"), // Ana filtreleme burada!
      orderBy("deliveryDate", "desc"), // En son teslim edilenler üstte görünsün
      orderBy("createdAt", "desc") // deliveryDate aynıysa createdAt'e göre sırala
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
  }, []);

  // Teslim Edilen siparişler için durum güncelleme butonu koymuyoruz.
  // Ancak detayına gitme gibi bir fonksiyon eklenebilir.
  const navigateToOrderDetail = (orderId) => {
    // Eğer OrderDetailScreen'iniz varsa buraya yönlendirebilirsiniz
    // navigation.navigate('OrderDetail', { orderId: orderId });
    Alert.alert("Bilgi", `Sipariş Detayı İçin: ${orderId}`);
  };

  // Her bir sipariş öğesini render eden fonksiyon
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigateToOrderDetail(item.id)}
      style={styles.orderCard}
    >
      <View style={styles.cardContent}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.customerPhone}>Tel: {item.customerPhone}</Text>
        <Text style={styles.orderDate}>
          Sipariş Tarihi:{" "}
          {item.orderDate
            ? new Date(item.orderDate).toLocaleDateString("tr-TR")
            : "Yok"}
        </Text>
        <Text style={styles.deliveryDate}>
          Teslimat Tarihi:{" "}
          {item.deliveryDate
            ? new Date(item.deliveryDate).toLocaleDateString("tr-TR")
            : "Yok"}
        </Text>
        <Text style={styles.itemSummary}>
          Halılar:{" "}
          {item.items
            ? item.items.map((i) => `${i.quantity} adet ${i.type}`).join(", ")
            : "Yok"}
        </Text>
        <Text style={styles.orderAmount}>
          Toplam: {item.totalAmount ? item.totalAmount.toFixed(2) : "0.00"} TL
        </Text>
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
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>
          Henüz teslim edilmiş sipariş bulunmamaktadır.
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
    backgroundColor: "#f0f2f5",
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
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
    color: "#333",
  },
  customerPhone: {
    fontSize: 15,
    color: "#555",
    marginTop: 3,
  },
  orderDate: {
    fontSize: 13,
    color: "#888",
    marginTop: 5,
  },
  deliveryDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
    fontWeight: "bold",
  },
  itemSummary: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28A745",
    marginTop: 5,
  },
  paidAmount: {
    fontSize: 15,
    color: "#4CAF50", // Yeşil tonu
    marginTop: 3,
  },
  remainingAmount: {
    fontSize: 15,
    color: "#E74C3C",
    fontWeight: "bold",
    marginTop: 3,
  },
  arrowIcon: {
    marginLeft: 10,
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});

export default Delivered;
