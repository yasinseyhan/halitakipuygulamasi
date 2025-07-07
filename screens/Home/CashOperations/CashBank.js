import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../../../src/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

import styles from "./CashBankStyles";

// Android'de LayoutAnimation'ı etkinleştir
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CashBank = () => {
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const formatNumber = (num) => {
    // num null veya tanımsız ise varsayılan değer döndür
    if (num === null || num === undefined) {
      return "0.00";
    }
    // Negatifse başında eksi işareti kalsın, abs alıp formatla sonra tekrar eksi ekle
    const isNegative = num < 0;
    const absNum = Math.abs(num);

    return (
      (isNegative ? "- " : "") +
      absNum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  };

  // Firestore'dan hem sipariş, hem gider hem de ek gelir verilerini çeken fonksiyon
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // --- Siparişleri Çekme ---
      const ordersCollectionRef = collection(firestore, "orders");
      const ordersQuery = query(
        ordersCollectionRef,
        orderBy("createdAt", "desc")
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const fetchedOrders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);

      // --- Giderleri Çekme ---
      const expensesCollectionRef = collection(firestore, "expenses");
      const expensesQuery = query(
        expensesCollectionRef,
        orderBy("createdAt", "desc")
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const fetchedExpenses = expensesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(fetchedExpenses);

      // --- Ek Gelirleri Çekme ---
      const incomesCollectionRef = collection(firestore, "incomes");
      const incomesQuery = query(
        incomesCollectionRef,
        orderBy("createdAt", "desc")
      );
      const incomesSnapshot = await getDocs(incomesQuery);
      const fetchedIncomes = incomesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncomes(fetchedIncomes); // Çekilen ek gelirleri state'e kaydet

      console.log("Firestore'dan çekilen siparişler:", fetchedOrders);
      console.log("Firestore'dan çekilen giderler:", fetchedExpenses);
      console.log("Firestore'dan çekilen ek gelirler:", fetchedIncomes); // Doğrulama için
    } catch (err) {
      console.error("Veriler çekilirken hata oluştu:", err);
      setError("Veriler yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Bileşen yüklendiğinde ve manuel yenilemede verileri çek
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manuel yenileme işlemi
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Tek bir siparişin detay görünümünü açma/kapama
  const toggleExpand = (orderId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // --- Genel Finansal Özet Hesaplamaları ---
  const totalAmountAllOrders = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  // Sadece siparişlerden gelen gelir
  const totalOrderIncome = orders.reduce(
    (sum, order) => sum + (order.discountedTotal || 0),
    0
  );

  // Ek gelirlerin toplamı (incomes koleksiyonundan)
  const totalAdditionalIncome = incomes.reduce(
    (sum, income) => sum + (income.amount || 0),
    0
  );

  // Tüm gelirlerin toplamı (Sipariş gelirleri + Ek gelirler)
  const grandTotalIncome = totalOrderIncome + totalAdditionalIncome; // <-- Burası güncellendi

  const totalPaid = orders.reduce(
    (sum, order) => sum + (order.paidAmount || 0),
    0
  );
  const totalRemaining = orders.reduce(
    (sum, order) => sum + (order.remainingAmount || 0),
    0
  );
  const totalDiscount = orders.reduce(
    (sum, order) => sum + (order.discountAmount || 0),
    0
  );

  // Tüm giderlerin toplamı
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );

  // Net Kâr = Tüm Gelirler - Tüm Giderler
  const netProfit = grandTotalIncome - totalExpense; // <-- Burası da grandTotalIncome kullanacak şekilde güncellendi

  // Net Kârın rengini belirleyen dinamik stil
  const netProfitColor =
    netProfit < 0 ? styles.valueTextRed : styles.valueTextGreen;

  // --- Render Bölümü ---

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#E74C3C" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.infoText}>Lütfen tekrar deneyin.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kasa ve Finansal Özet</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007BFF", "#28A745"]}
          />
        }
      >
        {/* Genel Finansal Özet Kartı */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Genel Kasa Durumu</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Sipariş Tutarı:</Text>
            <Text style={styles.valueText}>
              {formatNumber(totalAmountAllOrders)} TL
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam İndirimler:</Text>
            <Text style={styles.valueTextRed}>
              - {formatNumber(totalDiscount)} TL
            </Text>
          </View>
          <View style={styles.summaryRow}>
            {/* Burası güncellendi: grandTotalIncome gösteriyoruz */}
            <Text style={styles.summaryLabel}>**Tüm Gelirler (Net):**</Text>
            <Text style={styles.valueTextGreen}>
              {formatNumber(grandTotalIncome)} TL
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Tahsilat:</Text>
            <Text style={styles.valueTextBlue}>
              {formatNumber(totalPaid)} TL
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Kalan Bakiye:</Text>
            <Text style={styles.valueTextOrange}>
              {formatNumber(totalRemaining)} TL
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>**Toplam Giderler:**</Text>
            <Text style={styles.valueTextRed}>
              {formatNumber(totalExpense)} TL
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>**Net Kâr:**</Text>
            {/* Dinamik renk uygulaması */}
            <Text style={netProfitColor}>{formatNumber(netProfit)} TL</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>
          Tüm Siparişler ({orders.length})
        </Text>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color="#BDC3C7" />
            <Text style={styles.infoText}>
              Henüz kayıtlı bir sipariş bulunmamaktadır.
            </Text>
            <Text style={styles.infoText}>
              Yeni sipariş eklemek için "Sipariş Ekle" ekranını kullanın.
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderCardTitle}>
                    {item.customerName || "Bilinmeyen Müşteri"}
                  </Text>
                  <Ionicons
                    name={
                      expandedOrderId === item.id
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={24}
                    color="#555"
                  />
                </View>

                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderSummaryLabel}>Toplam:</Text>
                  <Text style={styles.valueText}>
                    {formatNumber(item.totalAmount)} TL
                  </Text>
                </View>
                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderSummaryLabel}>Gelir:</Text>
                  <Text style={styles.valueTextGreen}>
                    {formatNumber(item.discountedTotal)} TL
                  </Text>
                </View>
                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderSummaryLabel}>Tahsilat:</Text>
                  <Text style={styles.valueTextBlue}>
                    {formatNumber(item.paidAmount)} TL
                  </Text>
                </View>
                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderSummaryLabel}>Kalan:</Text>
                  <Text style={styles.valueTextOrange}>
                    {formatNumber(item.remainingAmount)} TL
                  </Text>
                </View>

                {expandedOrderId === item.id && (
                  <View style={styles.expandedDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Sipariş ID:</Text>
                      <Text style={styles.detailValue}>{item.id}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Sipariş Durumu:</Text>
                      <Text style={styles.detailValue}>
                        {item.status || "Belirtilmemiş"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Sipariş Tarihi:</Text>
                      <Text style={styles.detailValue}>
                        {item.createdAt instanceof Timestamp
                          ? new Date(
                              item.createdAt.toDate()
                            ).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Yok"}
                      </Text>
                    </View>
                    {item.items && item.items.length > 0 && (
                      <View style={styles.productsSection}>
                        <Text style={styles.productsHeader}>Ürünler:</Text>
                        {item.items.map((product, idx) => (
                          <View key={idx} style={styles.productItem}>
                            <Text style={styles.productName}>
                              - {product.productName} ({product.productCategory}
                              )
                            </Text>
                            <Text style={styles.productInfo}>
                              {product.quantityValue} {product.productUnit} x
                              {formatNumber(product.basePrice)} TL =
                              {formatNumber(product.lineTotal)} TL
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            )}
            scrollEnabled={false} // FlatList'in kendi scroll'unu kapatıyoruz, üstteki ScrollView yönetiyor
          />
        )}

        {/* Gider Listesi */}
        <Text style={[styles.sectionHeader, { marginTop: 30 }]}>
          Son Giderler ({expenses.length})
        </Text>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color="#BDC3C7" />
            <Text style={styles.infoText}>
              Henüz kayıtlı bir gider bulunmamaktadır.
            </Text>
            <Text style={styles.infoText}>
              Yeni gider eklemek için "Gider Ekle" sayfasını kullanın.
            </Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <Text style={styles.expenseCategory}>
                    {item.category || "Belirtilmemiş"}
                  </Text>
                  <Text style={styles.expenseAmount}>
                    - {formatNumber(item.amount)} TL
                  </Text>
                </View>
                <Text style={styles.expenseDescription}>
                  {item.description || "Açıklama yok."}
                </Text>
                <Text style={styles.expenseDate}>
                  Tarih:
                  {item.expenseDate instanceof Timestamp
                    ? new Date(item.expenseDate.toDate()).toLocaleDateString(
                        "tr-TR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "Yok"}
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
        )}

        {/* Yeni: Ek Gelir Listesi */}
        <Text style={[styles.sectionHeader, { marginTop: 30 }]}>
          Son Ek Gelirler ({incomes.length})
        </Text>
        {incomes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trending-up-outline" size={60} color="#BDC3C7" />
            <Text style={styles.infoText}>
              Henüz kayıtlı bir ek gelir bulunmamaktadır.
            </Text>
            <Text style={styles.infoText}>
              Yeni gelir eklemek için "Gelir Ekle" sayfasını kullanın.
            </Text>
          </View>
        ) : (
          <FlatList
            data={incomes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.incomeCard}>
                {/* Yeni stil incomeCard kullanıyoruz */}
                <View style={styles.incomeHeader}>
                  <Text style={styles.incomeCategory}>
                    {item.category || "Belirtilmemiş"}
                  </Text>
                  <Text style={styles.incomeAmount}>
                    + {formatNumber(item.amount)} TL
                  </Text>
                </View>
                <Text style={styles.incomeDescription}>
                  {item.description || "Açıklama yok."}
                </Text>
                <Text style={styles.incomeDate}>
                  Tarih:
                  {item.incomeDate instanceof Timestamp
                    ? new Date(item.incomeDate.toDate()).toLocaleDateString(
                        "tr-TR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "Yok"}
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default CashBank;
