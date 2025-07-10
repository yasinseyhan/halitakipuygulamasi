import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity, // TouchableOpacity import edildiğinden emin olun
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
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import DatePickerHeader from "../../../../components/DatePickerHeader";

// Stil tanımları buraya geliyor (değişiklik yok)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: 10,
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
    color: "#333",
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#555",
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 10,
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
    fontSize: 14,
    color: "#D35",
    marginBottom: 3,
  },
  deliveryDate: {
    fontSize: 14,
    color: "#D35400",
    fontWeight: "600",
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
    backgroundColor: "#3498DB",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
});

const ToBeReceived = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const orderStatuses = [
    "Teslim Alınacak",
    "Teslim Alındı",
    "Yıkamada",
    "Hazır",
    "Teslim Edilecek",
    "Teslim Edildi",
    "İptal Edildi",
  ];

  useEffect(() => {
    setLoading(true);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(firestore, "orders"),
      where("status", "==", "Teslim Alınacak"),
      where("pickupDate", ">=", Timestamp.fromDate(startOfDay)),
      where("pickupDate", "<=", Timestamp.fromDate(endOfDay)),
      orderBy("pickupDate", "asc"),
      orderBy("createdAt", "asc")
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

    return () => unsubscribe();
  }, [selectedDate]);

  const updateOrderStatus = async (orderId, currentStatus) => {
    const currentIndex = orderStatuses.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= orderStatuses.length - 1) {
      Alert.alert("Bilgi", "Bu sipariş daha fazla ileri taşınamaz.");
      return;
    }

    const nextStatus = orderStatuses[currentIndex + 1];

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

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      // BURADAKİ DEĞİŞİKLİK: Sadece item.id yerine TÜM item objesini gönderiyoruz
      onPress={() => navigation.navigate("OrderDetail", { order: item })}
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
      {item.status === "Teslim Alınacak" && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => updateOrderStatus(item.id, item.status)}
        >
          <Text style={styles.actionButtonText}>
            Sipariş Teslim Alındı Olarak İşaretle
          </Text>
          <Ionicons
            name="checkmark-circle-outline"
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>
          Teslim alınacak siparişler yükleniyor...
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
          {selectedDate.toLocaleDateString("tr-TR")} tarihi için teslim alınacak
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

export default ToBeReceived;
