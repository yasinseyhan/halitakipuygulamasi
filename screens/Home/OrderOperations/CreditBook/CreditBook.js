// src/screens/Home/OrderOperations/CreditBook/CreditBookScreen.js

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
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig"; // Firestore yapılandırmanızın doğru yolu
import { Ionicons } from "@expo/vector-icons";

const CreditBookScreen = ({ navigation }) => {
  const [creditOrders, setCreditOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // isCreditDebt: true olan ve kalan borcu (remainingAmount) 0'dan büyük olan siparişleri çekiyoruz
    const q = query(
      collection(firestore, "orders"),
      where("isCreditDebt", "==", true),
      where("remainingAmount", ">", 0), // Kalan borcu olanları filtrele
      orderBy("remainingAmount", "desc"), // Borcu en yüksekten düşüğe sırala
      orderBy("customerName", "asc") // Sonra müşteri adına göre sırala
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Tarihleri Date objelerine çevir (gerekliyse)
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
        setCreditOrders(orders);
        setLoading(false);
      },
      (err) => {
        console.error("Veresiye siparişleri çekilirken hata:", err);
        setError("Veresiye defteri yüklenirken bir sorun oluştu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDebtPaid = async (orderId) => {
    Alert.alert(
      "Borcu Kapat",
      "Bu siparişin kalan borcunu sıfırlayarak kapamak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            try {
              const orderRef = doc(firestore, "orders", orderId);
              await updateDoc(orderRef, {
                remainingAmount: 0,
                isCreditDebt: false, // Borç ödendiğinde veresiye defterinden çıkar
                updatedAt: serverTimestamp(),
              });
              Alert.alert("Başarılı", "Borç başarıyla kapatıldı.");
            } catch (error) {
              console.error("Borç kapatılırken hata:", error);
              Alert.alert("Hata", "Borç kapatılırken bir sorun oluştu.");
            }
          },
        },
      ]
    );
  };

  const renderCreditOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })} // Sipariş detayına yönlendir
    >
      <View style={styles.cardContent}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.customerPhone}>Tel: {item.customerPhone}</Text>
        <Text style={styles.remainingAmount}>
          Kalan Borç: {item.remainingAmount?.toFixed(2)} TL
        </Text>
        <Text style={styles.orderDate}>
          Sipariş Tarihi:{" "}
          {item.orderDate
            ? new Date(item.orderDate).toLocaleDateString("tr-TR")
            : "Belirtilmemiş"}
        </Text>
        {/* İsteğe bağlı olarak daha fazla bilgi gösterebilirsiniz */}
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleDebtPaid(item.id)}
      >
        <Text style={styles.actionButtonText}>Borç Ödendi Olarak İşaretle</Text>
        <Ionicons
          name="cash-outline"
          size={20}
          color="#fff"
          style={{ marginLeft: 5 }}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Veresiye defteri yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Hata: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {creditOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>Veresiye kaydı bulunmamaktadır.</Text>
      ) : (
        <FlatList
          data={creditOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderCreditOrderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
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
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
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
  remainingAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E74C3C", // Kırmızı tonu
    marginTop: 5,
  },
  orderDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 3,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28A745", // Yeşil tonu
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

export default CreditBookScreen;
