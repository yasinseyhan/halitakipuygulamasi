import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

import styles from "./ToBeDeliveredStyles"; // Stil dosyanızın yolu

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
  // ...existing code...
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardContent}>
        <Text style={styles.customerName}>
          İsim: {item.customerName || "-"}
        </Text>
        <Text style={styles.customerPhone}>
          Telefon: {item.customerPhone || item.customerPhoneNumber || "-"}
        </Text>
        <Text style={styles.customerAddress}>
          Adres: {item.customerAddress || "-"}
        </Text>
        <Text style={styles.customerRegion}>
          Bölge: {item.customerRegionName || item.regionName || "-"}
        </Text>
        <Text style={styles.orderDate}>
          Sipariş Tarihi:{" "}
          {item.orderDate
            ? new Date(item.orderDate).toLocaleDateString("tr-TR")
            : "-"}
        </Text>
        <Text style={styles.itemSummary}>
          Ürünler:{" "}
          {item.items && item.items.length > 0
            ? item.items
                .map(
                  (i) =>
                    `${i.productName || i.type || "-"} (${
                      i.quantityValue || i.quantity || 0
                    } ${i.productUnit || ""})`
                )
                .join(", ")
            : "-"}
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
  // ...existing code...

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

export default ToBeDelivered;
