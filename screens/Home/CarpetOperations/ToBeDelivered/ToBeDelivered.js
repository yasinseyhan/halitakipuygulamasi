// src/screens/Home/OrderOperations/ToBeDelivered/ToBeDelivered.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet, // Eğer ToBeDeliveredStyles.js içinde tüm stilleriniz yoksa buraya da eklemelisiniz.
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

// Eğer ToBeDeliveredStyles.js içinde tüm stilleriniz yoksa buradaki StyleSheet'i kullanabilirsiniz.
// Alternatif olarak, eğer zaten tanımlıysa, sadece import etmek yeterli olacaktır.
// Varsayılan olarak ayrı bir stil dosyası kullandığınızı varsayarak sadece import'u bırakıyorum.
import styles from "./ToBeDeliveredStyles"; // Stil dosyanızın yolu

const ToBeDelivered = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Varsayılan olarak bugünün tarihi

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
    setLoading(true);
    // Seçilen günün başlangıcı ve bitişi için Timestamp objeleri oluşturma
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(firestore, "orders"),
      where("status", "==", "Teslim Edilecek"), // Ana filtreleme
      // deliveryDate'e göre filtreleme yapıyoruz
      where("deliveryDate", ">=", Timestamp.fromDate(startOfDay)),
      where("deliveryDate", "<=", Timestamp.fromDate(endOfDay)),
      orderBy("deliveryDate", "asc"), // Teslim tarihine göre sırala
      orderBy("createdAt", "asc") // Aynı teslim tarihine sahip siparişleri oluşturma tarihine göre sırala
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
  }, [selectedDate]); // selectedDate değiştiğinde useEffect tekrar çalışsın

  // Siparişin durumunu bir sonraki adıma güncelleme fonksiyonu
  const updateOrderStatus = async (orderId, currentStatus, item) => {
    // item parametresi eklendi
    const currentIndex = orderStatuses.indexOf(currentStatus);
    const isDelivering =
      currentStatus === "Teslim Edilecek" &&
      orderStatuses[currentIndex + 1] === "Teslim Edildi";
    if (currentIndex === -1 || currentIndex >= orderStatuses.length - 1) {
      Alert.alert("Bilgi", "Bu sipariş daha fazla ileri taşınamaz.");
      return;
    }

    const nextStatus = orderStatuses[currentIndex + 1]; // Bir sonraki durumu al

    if (isDelivering && item.remainingAmount > 0) {
      Alert.alert(
        "Sipariş Teslim Ediliyor",
        `Bu siparişte ${item.remainingAmount.toFixed(
          2
        )} TL kalan borç bulunmaktadır. Ne yapmak istersiniz?`,
        [
          {
            text: "Borç Ödendi",
            onPress: async () => {
              try {
                const orderRef = doc(firestore, "orders", orderId);
                // Kalan borcu 0'a çek, ödenen tutarı toplam tutara eşitle ve durumu güncelle
                await updateDoc(orderRef, {
                  status: nextStatus, // "Teslim Edildi"
                  remainingAmount: 0,
                  paidAmount: item.totalAmount, // Ödenen tutarı toplam tutara eşitle
                  deliveryDate: serverTimestamp(), // Teslim tarihini şimdiki zaman yap
                  updatedAt: serverTimestamp(),
                });
                Alert.alert(
                  "Başarılı",
                  `Sipariş durumu "${nextStatus}" olarak güncellendi ve borç kapatıldı.`
                );
              } catch (error) {
                console.error(
                  "Sipariş durumu güncellenirken hata oluştu:",
                  error
                );
                Alert.alert(
                  "Hata",
                  "Sipariş durumu güncellenirken bir sorun oluştu."
                );
              }
            },
          },
          {
            text: "Veresiye Defterine Ekle",
            onPress: async () => {
              try {
                const orderRef = doc(firestore, "orders", orderId);
                // Durumu "Teslim Edildi" yap, kalan borcu koru, veresiye işaretini ekle
                await updateDoc(orderRef, {
                  status: nextStatus, // "Teslim Edildi"
                  // remainingAmount ve paidAmount değişmiyor
                  isCreditDebt: true, // Yeni alan: Bu sipariş veresiye defterine eklendi
                  deliveryDate: serverTimestamp(), // Teslim tarihini şimdiki zaman yap
                  updatedAt: serverTimestamp(),
                });
                Alert.alert(
                  "Başarılı",
                  `Sipariş "${nextStatus}" olarak güncellendi ve veresiye defterine eklendi.`
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
          { text: "İptal", style: "cancel" }, // Kullanıcının işlemi iptal etme seçeneği
        ]
      );
    } else {
      // Kalan borç yoksa veya başka bir durum değişikliğiyse mevcut akışı devam ettir
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
                const updateData = {
                  status: nextStatus,
                  updatedAt: serverTimestamp(),
                };
                // Eğer "Teslim Edildi" durumuna geçiş yapılıyorsa teslim tarihini güncelle
                if (nextStatus === "Teslim Edildi") {
                  updateData.deliveryDate = serverTimestamp();
                }
                await updateDoc(orderRef, updateData);
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
    }
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
      {item.status === "Teslim Edilecek" && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => updateOrderStatus(item.id, item.status, item)} // item'ı da updateOrderStatus'a gönderiyoruz
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
    </TouchableOpacity>
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
      <DatePickerHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>
          {selectedDate.toLocaleDateString("tr-TR")} tarihi için teslim edilecek
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

export default ToBeDelivered;
