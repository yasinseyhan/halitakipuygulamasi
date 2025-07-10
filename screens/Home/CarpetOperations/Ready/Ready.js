// src/screens/Home/OrderOperations/Ready/Ready.js

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
  Timestamp, // Firestore Timestamp'i import etmeyi unutmayın!
} from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig"; // Firestore yapılandırmanızın doğru yolu
import { Ionicons } from "@expo/vector-icons";
import DatePickerHeader from "../../../../components/DatePickerHeader"; // DatePickerHeader'ın doğru yolu

const Ready = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Varsayılan olarak bugünün tarihi

  // Sipariş Durumları Dizisi - Geçişler için referansımız
  const orderStatuses = [
    "Teslim Alınacak",
    "Teslim Alındı",
    "Yıkamada",
    "Hazır", // Mevcut durum
    "Teslim Edilecek", // Sonraki durum
    "Teslim Edildi",
    "İptal Edildi",
  ];

  useEffect(() => {
    setLoading(true);
    // Seçilen günün başlangıcı ve bitişi için Timestamp objeleri oluşturma
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(firestore, "orders"),
      where("status", "==", "Hazır"), // Ana filtreleme burada!
      // pickupDate'e göre filtreleme yapıyoruz
      where("pickupDate", ">=", Timestamp.fromDate(startOfDay)),
      where("pickupDate", "<=", Timestamp.fromDate(endOfDay)),
      orderBy("pickupDate", "asc"), // Alış tarihine göre sırala
      orderBy("createdAt", "asc") // Aynı alış tarihine sahip siparişleri oluşturma tarihine göre sırala
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
        console.error("Hazır siparişler çekilirken hata oluştu: ", error);
        Alert.alert("Hata", "Hazır siparişler yüklenirken bir sorun oluştu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedDate]); // selectedDate değiştiğinde useEffect tekrar çalışsın

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
                updatedAt: serverTimestamp(),
              });
              Alert.alert(
                "Başarılı",
                `Sipariş durumu "${nextStatus}" olarak güncellendi.`
              );
              // Durumu değişen sipariş, otomatik olarak bu listeden kaybolacaktır
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
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate("OrderDetail", { order: item })} // Detay sayfasına yönlendirme örneği
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
          Teslim Tarihi:
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
        <Text style={styles.orderAmount}>
          Ödenen: {item.paidAmount ? item.paidAmount.toFixed(2) : "0.00"} TL
        </Text>
        {item.remainingAmount > 0 && (
          <Text style={styles.remainingAmount}>
            Kalan: {item.remainingAmount.toFixed(2)} TL
          </Text>
        )}
      </View>
      {item.status === "Hazır" && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => updateOrderStatus(item.id, item.status)}
        >
          <Text style={styles.actionButtonText}>Teslimata Çıkar</Text>
          <Ionicons
            name="car-outline" // Araba ikonu uygun
            size={20}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Hazır siparişler yükleniyor...</Text>
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
          {selectedDate.toLocaleDateString("tr-TR")} tarihi için teslimata hazır
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

// Ortak veya benzer stilleri kullanmaya devam edelim
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
  },
  cardContent: {
    marginBottom: 10,
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
    // Alış tarihi için
    fontSize: 14,
    color: "#777",
    marginBottom: 3,
  },
  deliveryDate: {
    // Teslim tarihi için (bu ekranda çok vurgulu olmasına gerek yok)
    fontSize: 14,
    color: "#777", // Daha nötr bir renk
    fontWeight: "normal",
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
  remainingAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E74C3C",
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFC107", // Sarımsı bir ton, "Hazır" durumu için dikkat çekici
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    color: "#FFFFFF", // Beyaz metin
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#555",
    fontWeight: "bold",
  },
});

export default Ready;
