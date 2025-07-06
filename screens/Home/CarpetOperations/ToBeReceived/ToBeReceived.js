// src/screens/Home/OrderOperations/TeslimAlinacaklar/ToBeDelivered.js

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
import { Ionicons } from "@expo/vector-icons"; // İkonlar için
import styles from "./ToBeReceivedStyles"; // Stil dosyanızın yolu

const ToBeReceived = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sipariş Durumları Dizisi - Durum geçişleri için referansımız
  const orderStatuses = [
    "Teslim Alınacak",
    "Teslim Alındı",
    "Yıkamada",
    "Hazır",
    "Teslim Edilecek",
    "Teslim Edildi",
    "İptal Edildi",
  ];

  // Firestore'dan sadece "Teslim Alınacak" durumundaki siparişleri çek
  useEffect(() => {
    const q = query(
      collection(firestore, "orders"),
      where("status", "==", "Teslim Alınacak"), // <-- Ana filtreleme burada!
      orderBy("createdAt", "asc") // En eski siparişler üstte görünsün
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
          deliveryDate: doc.data().deliveryDate?.toDate
            ? doc.data().deliveryDate.toDate()
            : doc.data().deliveryDate,
        }));
        setOrders(orderList);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Teslim alınacak siparişler çekilirken hata oluştu: ",
          error
        );
        Alert.alert(
          "Hata",
          "Teslim alınacak siparişler yüklenirken bir sorun oluştu."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Component unmount edildiğinde dinlemeyi durdur
  }, []); // Sadece bir kere çalışsın

  // Siparişin durumunu bir sonraki adıma güncelleme fonksiyonu
  const updateOrderStatus = async (orderId, currentStatus) => {
    const currentIndex = orderStatuses.indexOf(currentStatus);
    // Eğer mevcut durum son durum ise (Teslim Edildi/İptal Edildi), daha fazla ilerletme
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
                updatedAt: serverTimestamp(), // Güncelleme zamanını kaydet
              });
              Alert.alert(
                "Başarılı",
                `Sipariş durumu "${nextStatus}" olarak güncellendi.`
              );
              // Durumu değişen sipariş, otomatik olarak bu listeden kaybolacaktır (Firestore dinlemesi sayesinde)
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
      {/* Sadece "Teslim Alınacak" durumundaki siparişler için butonu göster */}
      {item.status === "Teslim Alınacak" && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => updateOrderStatus(item.id, item.status)}
        >
          <Text style={styles.actionButtonText}>Sipariş Teslim Alındı</Text>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  // Yükleme durumu göstergesi
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>
          Teslim alınacak siparişler yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>
          Henüz teslim alınacak sipariş bulunmamaktadır.
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

// Bu stil tanımları, basit ve işlevsel bir görünüm sağlar.
// Eğer kendi stil dosyanız varsa, bu stili oraya taşıyabilirsiniz.

export default ToBeReceived;
