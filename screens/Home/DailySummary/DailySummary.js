// src/screens/Home/DailySummary/DailySummary.js

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  sum,
} from "firebase/firestore";
import { firestore } from "../../../src/firebaseConfig"; // Firestore yapılandırmanızın doğru yolu
import DatePickerHeader from "../../../components/DatePickerHeader"; // DatePickerHeader'ın doğru yolu
import { useFocusEffect } from "@react-navigation/native"; // Ekran odaklandığında yenilemek için
import { Ionicons } from "@expo/vector-icons";

const DailySummary = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summaryData, setSummaryData] = useState({
    takenOrdersCount: 0,
    deliveredOrdersCount: 0,
    totalCollectedAmount: 0,
    remainingAmountForDelivered: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDailySummary = async (date) => {
    setLoading(true);
    setSummaryData({
      // Veriler çekilmeden önce sıfırla
      takenOrdersCount: 0,
      deliveredOrdersCount: 0,
      totalCollectedAmount: 0,
      remainingAmountForDelivered: 0,
    });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    let takenOrders = 0;
    let deliveredOrders = 0;
    let collectedAmount = 0;
    let deliveredRemainingAmount = 0;

    try {
      // 1. Günlük Alınan Sipariş Sayısı (Teslim Alındı statüsü ve pickupDate'i bugüne ait)
      const qTaken = query(
        collection(firestore, "orders"),
        where("status", "==", "Teslim Alındı"),
        where("pickupDate", ">=", startTimestamp),
        where("pickupDate", "<=", endTimestamp)
      );
      const unsubscribeTaken = onSnapshot(
        qTaken,
        (snapshot) => {
          takenOrders = snapshot.size;
          setSummaryData((prev) => ({
            ...prev,
            takenOrdersCount: takenOrders,
          }));
        },
        (error) => console.error("Alınan siparişler çekilirken hata:", error)
      );

      // 2. Günlük Teslim Edilen Sipariş Sayısı ve Kalan Bakiye (Teslim Edildi statüsü ve deliveryDate'i bugüne ait)
      const qDelivered = query(
        collection(firestore, "orders"),
        where("status", "==", "Teslim Edildi"),
        where("deliveryDate", ">=", startTimestamp),
        where("deliveryDate", "<=", endTimestamp)
      );
      const unsubscribeDelivered = onSnapshot(
        qDelivered,
        (snapshot) => {
          deliveredOrders = snapshot.size;
          deliveredRemainingAmount = snapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().remainingAmount || 0),
            0
          );
          setSummaryData((prev) => ({
            ...prev,
            deliveredOrdersCount: deliveredOrders,
            remainingAmountForDelivered: deliveredRemainingAmount,
          }));
        },
        (error) =>
          console.error("Teslim edilen siparişler çekilirken hata:", error)
      );

      const qDeliveredPayments = query(
        collection(firestore, "orders"),
        where("status", "==", "Teslim Edildi"),
        where("deliveryDate", ">=", startTimestamp), // Teslimatın yapıldığı gün
        where("deliveryDate", "<=", endTimestamp)
      );
      const unsubscribeDeliveredPayments = onSnapshot(
        qDeliveredPayments,
        (snapshot) => {
          collectedAmount = snapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().paidAmount || 0),
            0
          );
          setSummaryData((prev) => ({
            ...prev,
            totalCollectedAmount: collectedAmount,
          }));
        },
        (error) =>
          console.error("Teslim edilen ödemeler çekilirken hata:", error)
      );

      // Tüm unsubscribe fonksiyonlarını bir diziye koyup dönmek iyi bir yaklaşımdır.
      return () => {
        unsubscribeTaken();
        unsubscribeDelivered();
        unsubscribeDeliveredPayments(); // veya qPayments için olan
      };
    } catch (error) {
      console.error("Günlük özet verileri çekilirken hata oluştu: ", error);
      Alert.alert("Hata", "Günlük özet verileri yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Ekran odaklandığında veya tarih değiştiğinde verileri çek
  useEffect(() => {
    fetchDailySummary(selectedDate);
  }, [selectedDate]);

  // Ekran her odaklandığında veriyi yenile (refresh control ile manuel yenilemeyi de destekler)
  useFocusEffect(
    useCallback(() => {
      fetchDailySummary(selectedDate);
    }, [selectedDate])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDailySummary(selectedDate);
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <DatePickerHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2C3E50" />
          <Text style={styles.loadingText}>Günlük özet yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.summaryTitle}>
            {selectedDate.toLocaleDateString("tr-TR")} Tarihli Gün Özeti
          </Text>

          {/* Kart: Günlük Alınan Siparişler */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Alınan Siparişler</Text>
            <View style={styles.metricRow}>
              <Ionicons name="archive-outline" size={30} color="#3498DB" />
              <Text style={styles.metricValue}>
                {summaryData.takenOrdersCount}
              </Text>
              <Text style={styles.metricLabel}>Adet</Text>
            </View>
            <Text style={styles.cardDescription}>
              Bugün müşterilerden teslim alınan toplam sipariş sayısı.
            </Text>
          </View>

          {/* Kart: Günlük Teslim Edilen Siparişler */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Teslim Edilen Siparişler</Text>
            <View style={styles.metricRow}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={30}
                color="#28A745"
              />
              <Text style={styles.metricValue}>
                {summaryData.deliveredOrdersCount}
              </Text>
              <Text style={styles.metricLabel}>Adet</Text>
            </View>
            <Text style={styles.cardDescription}>
              Bugün müşterilere başarıyla teslim edilen toplam sipariş sayısı.
            </Text>
          </View>

          {/* Kart: Günlük Tahsil Edilen Tutar */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tahsil Edilen Toplam Tutar</Text>
            <View style={styles.metricRow}>
              <Ionicons name="wallet-outline" size={30} color="#FFC107" />
              <Text style={styles.metricValue}>
                {summaryData.totalCollectedAmount.toFixed(2)}
              </Text>
              <Text style={styles.metricLabel}>TL</Text>
            </View>
            <Text style={styles.cardDescription}>
              Bugün yapılan tüm ödemelerden elde edilen toplam gelir.
            </Text>
          </View>

          {/* Kart: Teslim Edilen Siparişlerden Kalan Bakiye */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kalan Bakiye (Teslim Edilen)</Text>
            <View style={styles.metricRow}>
              <Ionicons name="warning-outline" size={30} color="#E74C3C" />
              <Text style={styles.metricValue}>
                {summaryData.remainingAmountForDelivered.toFixed(2)}
              </Text>
              <Text style={styles.metricLabel}>TL</Text>
            </View>
            <Text style={styles.cardDescription}>
              Bugün teslim edilen siparişlerden henüz tahsil edilmemiş kalan
              toplam bakiye.
            </Text>
          </View>

          {summaryData.takenOrdersCount === 0 &&
            summaryData.deliveredOrdersCount === 0 && (
              <Text style={styles.noSummaryText}>
                {selectedDate.toLocaleDateString("tr-TR")} tarihi için herhangi
                bir özet verisi bulunmamaktadır.
              </Text>
            )}
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: 10,
    textAlign: "center",
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 10,
    marginRight: 5,
  },
  metricLabel: {
    fontSize: 18,
    color: "#555",
  },
  cardDescription: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 5,
    fontStyle: "italic",
  },
  noSummaryText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
    fontWeight: "bold",
  },
});

export default DailySummary;
