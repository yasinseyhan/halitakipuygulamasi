import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig";

const OrderDetailScreen = ({ route, navigation }) => {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!initialOrder || !initialOrder.id) {
      setError("Sipariş ID'si bulunamadı.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const orderRef = doc(firestore, "orders", initialOrder.id);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        // Tarih objelerini Timestamp'ten Date'e dönüştürmeyi unutmayın
        const orderData = orderSnap.data();
        setOrder({
          id: orderSnap.id,
          ...orderData,
          orderDate: orderData.orderDate?.toDate
            ? orderData.orderDate.toDate()
            : orderData.orderDate,
          pickupDate: orderData.pickupDate?.toDate
            ? orderData.pickupDate.toDate()
            : orderData.pickupDate,
          deliveryDate: orderData.deliveryDate?.toDate
            ? orderData.deliveryDate.toDate()
            : orderData.deliveryDate,
        });
      } else {
        setError("Sipariş bulunamadı.");
        Alert.alert("Hata", "Sipariş detayları bulunamadı.");
      }
    } catch (err) {
      console.error("Sipariş detayları çekilirken hata oluştu:", err);
      setError("Sipariş detayları yüklenirken bir sorun oluştu.");
      Alert.alert(
        "Hata",
        "Sipariş detayları yüklenemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }, [initialOrder]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchOrderDetails();
    });
    return unsubscribe;
  }, [navigation, fetchOrderDetails]);

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString("tr-TR");
    }
    // Eğer zaten Date objesiyse veya null/undefined ise
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("tr-TR");
    }
    return "Belirtilmemiş";
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!order || !order.id) {
      Alert.alert("Hata", "Sipariş bilgisi eksik.");
      return;
    }
    Alert.alert(
      "Durum Güncelle",
      `Sipariş durumunu "${newStatus}" olarak güncellemek istediğinizden emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Güncelle",
          onPress: async () => {
            setLoading(true);
            try {
              const orderRef = doc(firestore, "orders", order.id);
              await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: Timestamp.now(),
              });
              setOrder((prevOrder) => ({ ...prevOrder, status: newStatus }));
              Alert.alert(
                "Başarılı",
                `Sipariş durumu "${newStatus}" olarak güncellendi.`
              );
            } catch (err) {
              console.error("Sipariş durumu güncellenirken hata:", err);
              Alert.alert("Hata", "Durum güncellenirken bir sorun oluştu.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const navigateToEditOrder = () => {
    navigation.navigate("AddOrder", { order: order, isEditing: true });
  };

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Sipariş detayı bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingOverlayText}>Yükleniyor...</Text>
          </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Sipariş Bilgileri Kartı */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sipariş Detayı</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={navigateToEditOrder}
              disabled={loading}
            >
              <Ionicons name="pencil-outline" size={22} color="#007BFF" />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Sipariş No:</Text>
            <Text style={styles.value}>{order.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Durum:</Text>
            <Text style={styles.value}>{order.status || "Bilinmiyor"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Müşteri:</Text>
            <Text style={styles.value}>
              {order.customerName || "Bilinmiyor"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Telefon:</Text>
            <Text style={styles.value}>
              {order.customerPhone || "Bilinmiyor"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Adres:</Text>
            <Text style={styles.value}>
              {order.customerAddress || "Bilinmiyor"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Bölge:</Text>
            <Text style={styles.value}>
              {order.customerRegionName || "Belirtilmemiş"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Alım Tarihi:</Text>
            <Text style={styles.value}>{formatDate(order.pickupDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Teslim Tarihi:</Text>
            <Text style={styles.value}>{formatDate(order.deliveryDate)}</Text>
          </View>
          {/* Sürücü Bilgileri Eklendi */}
          {(order.driverName || order.driverVehiclePlate) && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.label}>Sürücü Adı:</Text>
                <Text style={styles.value}>
                  {order.driverName || "Belirtilmemiş"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Araç Plakası:</Text>
                <Text style={styles.value}>
                  {order.driverVehiclePlate || "Belirtilmemiş"}
                </Text>
              </View>
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.label}>Toplam Tutar:</Text>
            <Text style={styles.value}>
              {order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"} TL
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>İndirim:</Text>
            <Text style={styles.value}>
              {order.discountAmount ? order.discountAmount.toFixed(2) : "0.00"}
              TL
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Net Tutar:</Text>
            <Text style={styles.value}>
              {order.discountedTotal
                ? order.discountedTotal.toFixed(2)
                : "0.00"}
              TL
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Ödenen:</Text>
            <Text style={styles.value}>
              {order.paidAmount ? order.paidAmount.toFixed(2) : "0.00"} TL
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Kalan Bakiye:</Text>
            <Text style={styles.value}>
              {order.remainingAmount
                ? order.remainingAmount.toFixed(2)
                : "0.00"}
              TL
            </Text>
          </View>
          {order.notes && ( // Notlar varsa göster
            <View style={styles.detailRow}>
              <Text style={styles.label}>Notlar:</Text>
              <Text style={styles.value}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Sipariş Kalemleri */}
        {order.items && order.items.length > 0 && (
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Sipariş Kalemleri</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {item.productName} ({item.quantityValue} {item.productUnit})
                </Text>
                <Text style={styles.itemPrice}>
                  {item.lineTotal ? item.lineTotal.toFixed(2) : "0.00"} TL
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Durum Güncelleme Butonları (Örnek) */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.cardTitle}>Sipariş Durumunu Güncelle</Text>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: "#28A745" }]}
            onPress={() => handleUpdateStatus("Teslim Edildi")}
            disabled={loading || order.status === "Teslim Edildi"}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.statusButtonText}>
              Teslim Edildi Olarak İşaretle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: "#FFC107" }]}
            onPress={() => handleUpdateStatus("Yıkamada")}
            disabled={loading || order.status === "Yıkamada"}
          >
            <Ionicons name="water-outline" size={20} color="#333" />
            <Text style={styles.statusButtonText}>
              Yıkamada Olarak İşaretle
            </Text>
          </TouchableOpacity>
          {/* İhtiyacınıza göre daha fazla durum butonu ekleyebilirsiniz */}
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
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginVertical: 20,
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
    borderLeftColor: "#2C3E50",
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
    width: 120,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemText: {
    fontSize: 15,
    color: "#34495E",
    flex: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#28A745",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingOverlayText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
  },
  divider: {
    // Yeni ayırıcı stil
    height: 1,
    backgroundColor: "#ECEFF1",
    marginVertical: 10,
  },
});

export default OrderDetailScreen;
