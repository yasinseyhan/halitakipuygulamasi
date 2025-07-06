// src/screens/Home/OrderOperations/ToBeDelivered/ToBeDelivered.js
// Bu dosya Teslim Edilecek (yani müşteriye götürülen) siparişleri listeler.

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
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig"; // Firestore yapılandırmanızın doğru yolu
import { Ionicons } from "@expo/vector-icons";

const ToBeDelivered = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sipariş Durumları Dizisi - Geçişler için referansımız
  const orderStatuses = [
    "Teslim Alınacak",
    "Teslim Alındı",
    "Yıkamada",
    "Hazır",
    "Teslim Edilecek", // Mevcut durum
    "Teslim Edildi", // Sonraki durum
    "İptal Edildi",
  ];

  useEffect(() => {
    // Sadece "Teslim Edilecek" durumundaki siparişleri dinle
    const q = query(
      collection(firestore, "orders"),
      where("status", "==", "Teslim Edilecek"), // Ana filtreleme burada!
      orderBy("createdAt", "asc") // En eski siparişler üstte görünsün
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
          "Teslim edilecek (yolda olan) siparişler çekilirken hata oluştu: ",
          error
        );
        Alert.alert(
          "Hata",
          "Teslim edilecek siparişler yüklenirken bir sorun oluştu."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Siparişin durumunu bir sonraki adıma güncelleme fonksiyonu
  const updateOrderStatus = async (orderId, currentStatus) => {
    const currentIndex = orderStatuses.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= orderStatuses.length - 1) {
      Alert.alert("Bilgi", "Bu sipariş daha fazla ileri taşınamaz.");
      return;
    }

    const nextStatus = orderStatuses[currentIndex + 1]; // Bir sonraki durumu al

    Alert.alert(
      "Durumu Güncelle",
      `Siparişin durumunu "${currentStatus}" konumundan "${nextStatus}" konumuna ilerletmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            try {
              const orderRef = doc(firestore, "orders", orderId);
              await updateDoc(orderRef, {
                status: nextStatus,
                // Sipariş Teslim Edildiğinde teslimat tarihini de güncelleyelim
                deliveryDate:
                  nextStatus === "Teslim Edildi"
                    ? serverTimestamp()
                    : item.deliveryDate, // item yok, o yüzden sadece serverTimestamp() koyalım
                updatedAt: serverTimestamp(),
              });
              Alert.alert(
                "Başarılı",
                `Sipariş durumu "${nextStatus}" olarak güncellendi.`
              );
            } catch (error) {
              console.error(
                "Sipariş durumu güncellenirken hata oluştu: ",
                error
              );
              Alert.alert(
                "Hata",
                "Sipariş durumu güncellenirken bir sorun oluştu."
              );
            }
          },
        },
      ]
    );
  };

  // Her bir sipariş öğesini render eden fonksiyon
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardContent}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.customerPhone}>Tel: {item.customerPhone}</Text>
        <Text style={styles.orderDate}>
          Sipariş Tarihi:{" "}
          {item.orderDate
            ? new Date(item.orderDate).toLocaleDateString("tr-TR")
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
        {item.remainingAmount > 0 && (
          <Text style={styles.remainingAmount}>
            Kalan: {item.remainingAmount.toFixed(2)} TL
          </Text>
        )}
      </View>
      {/* Sadece "Teslim Edilecek" durumundaki siparişler için butonu göster */}
      {item.status === "Teslim Edilecek" && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => updateOrderStatus(item.id, item.status)}
        >
          <Text style={styles.actionButtonText}>Sipariş Teslim Edildi</Text>
          <Ionicons
            name="checkmark-done-outline"
            size={20}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>
          Teslim edilecek siparişler yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>
          Henüz teslim edilecek sipariş bulunmamaktadır.
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
    flexDirection: "column",
  },
  cardContent: {
    marginBottom: 10,
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
  remainingAmount: {
    fontSize: 15,
    color: "#E74C3C",
    fontWeight: "bold",
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});

export default ToBeDelivered;
