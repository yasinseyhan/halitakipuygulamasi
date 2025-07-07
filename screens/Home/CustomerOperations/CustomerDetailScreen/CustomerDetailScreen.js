// CustomerDetailScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig"; // Firebase config dosyanızın yolunu kontrol edin

const CustomerDetailScreen = ({ route, navigation }) => {
  // SearchCustomer'dan gelen customer verisini al
  const { customer } = route.params;

  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Müşterinin siparişlerini Firestore'dan çekme fonksiyonu
  const fetchCustomerOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!customer || !customer.id) {
        throw new Error("Müşteri ID'si bulunamadı.");
      }

      const q = query(
        collection(firestore, "orders"),
        where("customerId", "==", customer.id), // Siparişlerde müşteri ID'si alanı 'customerId' olarak varsayılmıştır.
        orderBy("pickupDate", "desc") // En yeni siparişler üstte görünsün
      );

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomerOrders(orders);
    } catch (err) {
      console.error("Müşteri siparişleri çekilirken hata oluştu:", err);
      setError("Siparişler yüklenirken bir hata oluştu: " + err.message);
      Alert.alert(
        "Hata",
        "Müşterinin sipariş geçmişi yüklenemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customer]);

  useEffect(() => {
    fetchCustomerOrders();
  }, [fetchCustomerOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCustomerOrders();
  }, [fetchCustomerOrders]);

  const navigateToEditCustomer = () => {
    // Burada "AddCustomer" ekranına gidip müşteriyi düzenleme modunda açabilirsiniz.
    // "AddCustomer" ekranınızın düzenleme modunu desteklemesi gerekir.
    navigation.navigate("AddCustomer", { customer: customer, isEditing: true });
  };

  const navigateToOrderDetail = (order) => {
    // Sipariş detay ekranına yönlendirme
    navigation.navigate("OrderDetail", { order: order });
  };

  const renderOrderItem = ({ item: order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigateToOrderDetail(order)}
    >
      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>
          {order.pickupDate?.toDate().toLocaleDateString("tr-TR")}
        </Text>
        <Text style={styles.orderStatus}>
          Durum: {order.status || "Bilinmiyor"}
        </Text>
      </View>
      <Text style={styles.orderTotal}>
        {order.discountedTotal ? order.discountedTotal.toFixed(2) : "0.00"} TL
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Müşteri Bilgileri Kartı */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Müşteri Bilgileri</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={navigateToEditCustomer}
            >
              <Ionicons name="pencil-outline" size={22} color="#007BFF" />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Ad Soyad:</Text>
            <Text style={styles.value}>{customer.customerName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Telefon:</Text>
            <Text style={styles.value}>{customer.customerPhoneNumber}</Text>
          </View>
          {customer.email && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>E-posta:</Text>
              <Text style={styles.value}>{customer.email}</Text>
            </View>
          )}
          {customer.address && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Adres:</Text>
              <Text style={styles.value}>{customer.customerAddress}</Text>
            </View>
          )}
          {customer.customerRegionName && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Bölge:</Text>
              <Text style={styles.value}>{customer.regionName}</Text>
            </View>
          )}
          {customer.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Notlar:</Text>
              <Text style={styles.value}>{customer.customerNotes}</Text>
            </View>
          )}
        </View>

        {/* Sipariş Geçmişi Bölümü */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.cardTitle}>
            Sipariş Geçmişi ({customerOrders.length})
          </Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#007BFF"
              style={{ marginVertical: 20 }}
            />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : customerOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="information-circle-outline"
                size={50}
                color="#BDC3C7"
              />
              <Text style={styles.emptyText}>
                Bu müşteriye ait sipariş bulunmamaktadır.
              </Text>
            </View>
          ) : (
            <FlatList
              data={customerOrders}
              keyExtractor={(item) => item.id}
              renderItem={renderOrderItem}
              scrollEnabled={false} // ScrollView içinde olduğu için FlatList'in kendi scroll'unu kapat
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#007BFF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  editButtonText: {
    marginLeft: 5,
    color: "#007BFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    width: 90, // Etiketler için sabit genişlik
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#34495E",
  },
  orderStatus: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 3,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28A745",
    marginRight: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginTop: 10,
  },
});

export default CustomerDetailScreen;
