import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../../src/firebaseConfig";
import { PieChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const Reports = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState(null);
  const [expenseCategoriesData, setExpenseCategoriesData] = useState([]);
  const [monthlySummaryData, setMonthlySummaryData] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);

  const [financialSummaryChartData, setFinancialSummaryChartData] =
    useState(null);
  const [orderCountByRegionData, setOrderCountByRegionData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { label: "Tümü", value: 0 },
    { label: "Ocak", value: 1 },
    { label: "Şubat", value: 2 },
    { label: "Mart", value: 3 },
    { label: "Nisan", value: 4 },
    { label: "Mayıs", value: 5 },
    { label: "Haziran", value: 6 },
    { label: "Temmuz", value: 7 },
    { label: "Ağustos", value: 8 },
    { label: "Eylül", value: 9 },
    { label: "Ekim", value: 10 },
    { label: "Kasım", value: 11 },
    { label: "Aralık", value: 12 },
  ];

  const formatNumber = (num) => {
    if (num === null || num === undefined) {
      return "0.00";
    }
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    return (
      (isNegative ? "- " : "") +
      absNum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  };

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    setExpenseCategoriesData([]);
    setMonthlySummaryData(null);
    setTotalOrders(0);
    setFinancialSummaryChartData(null);
    setOrderCountByRegionData(null);

    let totalOrderIncome = 0;
    let totalGrossOrderIncome = 0;
    let totalDiscountAmount = 0;
    let totalAdditionalIncome = 0;
    let totalExpenses = 0;
    const expenseCategories = {};

    let totalOrdersCount = 0;
    const regionOrderCounts = {};

    try {
      let tempStartDate, tempEndDate;

      if (selectedMonth === 0) {
        // Yılın tamamı için: Yılın ilk gününün ilk milisaniyesi
        tempStartDate = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
        // Bir sonraki yılın ilk gününün ilk milisaniyesi (bu dahil değil)
        tempEndDate = new Date(selectedYear + 1, 0, 1, 0, 0, 0, 0);
      } else {
        // Belirli bir ay için: Ayın ilk gününün ilk milisaniyesi
        tempStartDate = new Date(
          selectedYear,
          selectedMonth - 1,
          1,
          0,
          0,
          0,
          0
        );
        // Bir sonraki ayın ilk gününün ilk milisaniyesi (bu dahil değil)
        tempEndDate = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);
      }

      // Tarihleri Timestamp objelerine dönüştür
      const startDate = Timestamp.fromDate(tempStartDate);
      const endDate = Timestamp.fromDate(tempEndDate);

      console.log("Rapor için Başlangıç Tarihi:", tempStartDate.toISOString());
      console.log(
        "Rapor için Bitiş Tarihi (dahil değil):",
        tempEndDate.toISOString()
      );

      // 1. Siparişleri Çek (Finansal ve Bölge Verileri İçin) - pickupDate'e göre filtreleme
      const ordersRef = collection(firestore, "orders");
      const ordersQuerySnapshot = await getDocs(
        query(
          ordersRef,
          where("pickupDate", ">=", startDate), // <<<< BURASI pickupDate olarak güncellendi
          where("pickupDate", "<", endDate) // <<<< BURASI pickupDate olarak güncellendi
        )
      );
      ordersQuerySnapshot.forEach((doc) => {
        const order = doc.data();
        totalOrderIncome += order.discountedTotal || 0;
        totalGrossOrderIncome += order.totalAmount || 0;
        totalDiscountAmount += order.discountAmount || 0;

        totalOrdersCount++;

        const regionName = order.customerRegionName || "Bilinmiyor";
        regionOrderCounts[regionName] =
          (regionOrderCounts[regionName] || 0) + 1;
      });
      setTotalOrders(totalOrdersCount);

      // Bölgelere Göre Sipariş Adedi Çubuk Grafik Verisini Hazırla
      const regionLabels = Object.keys(regionOrderCounts);
      const regionDataValues = Object.values(regionOrderCounts);

      if (regionLabels.length > 0) {
        setOrderCountByRegionData({
          labels: regionLabels,
          datasets: [
            {
              data: regionDataValues,
              color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
              label: "Sipariş Adedi",
            },
          ],
        });
      } else {
        setOrderCountByRegionData(null);
      }

      // 2. Ek Gelirleri Çek (Bu kısım zaten incomes'ın kendi tarih alanını kullanıyor, değişmedi)
      const incomesRef = collection(firestore, "incomes");
      const incomesQuerySnapshot = await getDocs(
        query(
          incomesRef,
          where("incomeDate", ">=", startDate),
          where("incomeDate", "<", endDate)
        )
      );
      incomesQuerySnapshot.forEach((doc) => {
        const income = doc.data();
        totalAdditionalIncome += income.amount || 0;
      });

      // 3. Giderleri Çek ve Kategorize Et (Bu kısım zaten expenses'ın kendi tarih alanını kullanıyor, değişmedi)
      const expensesRef = collection(firestore, "expenses");
      const expensesQuerySnapshot = await getDocs(
        query(
          expensesRef,
          where("expenseDate", ">=", startDate),
          where("expenseDate", "<", endDate)
        )
      );
      expensesQuerySnapshot.forEach((doc) => {
        const expense = doc.data();
        totalExpenses += expense.amount || 0;
        const category = expense.category || "Diğer";
        expenseCategories[category] =
          (expenseCategories[category] || 0) + expense.amount;
      });

      const grandTotalIncome = totalOrderIncome + totalAdditionalIncome;
      const netProfit = grandTotalIncome - totalExpenses;

      setReportData({
        totalGrossOrderIncome,
        totalDiscountAmount,
        totalOrderIncome,
        totalAdditionalIncome,
        grandTotalIncome,
        totalExpenses,
        netProfit,
        period:
          selectedMonth === 0
            ? `${selectedYear} Yılı`
            : `${
                months.find((m) => m.value === selectedMonth).label
              } ${selectedYear}`,
      });

      // Finansal Özet Çubuk Grafik Verilerini Hazırla
      setFinancialSummaryChartData({
        labels: ["Gelir", "Gider"],
        datasets: [
          {
            data: [
              parseFloat(grandTotalIncome.toFixed(2)),
              parseFloat(totalExpenses.toFixed(2)),
            ],
            colors: [
              (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
              (opacity = 1) => `rgba(220, 53, 69, ${opacity})`,
            ],
          },
        ],
      });

      // Pasta Grafik Verilerini Hazırla (Gider Kategorileri)
      const pieChartColors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#E7E9ED",
        "#C9CBCF",
        "#7BC8F6",
        "#F2B5D8",
      ];
      const preparedExpensePieData = Object.keys(expenseCategories).map(
        (category, index) => ({
          name: category,
          population: expenseCategories[category],
          color: pieChartColors[index % pieChartColors.length],
          legendFontColor: "#7F8C8D",
          legendFontSize: 15,
        })
      );
      setExpenseCategoriesData(preparedExpensePieData);

      // Aylık Gelir/Gider Çubuk Grafik Verilerini Hazırla (Eğer yıl seçiliyse)
      if (selectedMonth === 0) {
        const monthlyIncomes = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);

        const annualStartDate = Timestamp.fromDate(
          new Date(selectedYear, 0, 1, 0, 0, 0, 0)
        );
        const annualEndDate = Timestamp.fromDate(
          new Date(selectedYear + 1, 0, 1, 0, 0, 0, 0)
        );

        // Siparişlerin aylık gelirini hesaplarken de pickupDate kullanıldı
        const allOrdersSnapshot = await getDocs(
          query(
            ordersRef,
            where("pickupDate", ">=", annualStartDate), // <<<< BURASI da pickupDate olarak güncellendi
            where("pickupDate", "<", annualEndDate) // <<<< BURASI da pickupDate olarak güncellendi
          )
        );
        allOrdersSnapshot.forEach((doc) => {
          const order = doc.data();
          const monthIndex = order.pickupDate.toDate().getMonth(); // <<<< BURADA da pickupDate'in tarihi alındı
          monthlyIncomes[monthIndex] += order.discountedTotal || 0;
        });

        // Diğer gelirler (incomes) ve giderler (expenses) zaten kendi tarih alanlarını kullanmaya devam ediyor.
        const allIncomesSnapshot = await getDocs(
          query(
            incomesRef,
            where("incomeDate", ">=", annualStartDate),
            where("incomeDate", "<", annualEndDate)
          )
        );
        allIncomesSnapshot.forEach((doc) => {
          const income = doc.data();
          const monthIndex = income.incomeDate.toDate().getMonth();
          monthlyIncomes[monthIndex] += income.amount || 0;
        });

        const allExpensesSnapshot = await getDocs(
          query(
            expensesRef,
            where("expenseDate", ">=", annualStartDate),
            where("expenseDate", "<", annualEndDate)
          )
        );
        allExpensesSnapshot.forEach((doc) => {
          const expense = doc.data();
          const monthIndex = expense.expenseDate.toDate().getMonth();
          monthlyExpenses[monthIndex] += expense.amount || 0;
        });

        const labels = months.slice(1).map((m) => m.label.substring(0, 3));
        setMonthlySummaryData({
          labels: labels,
          datasets: [
            {
              data: monthlyIncomes.map((inc) => parseFloat(inc.toFixed(2))),
              color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
              label: "Gelir",
            },
            {
              data: monthlyExpenses.map((exp) => parseFloat(exp.toFixed(2))),
              color: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`,
              label: "Gider",
            },
          ],
        });
      } else {
        setMonthlySummaryData(null);
      }
    } catch (err) {
      console.error("Rapor oluşturulurken hata oluştu:", err);
      setError(
        "Rapor oluşturulurken bir sorun oluştu. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin."
      );
      Alert.alert("Hata", "Rapor oluşturulurken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      generateReport();
    }, [generateReport])
  );

  const netProfitColor =
    reportData?.netProfit < 0 ? styles.valueTextRed : styles.valueTextGreen;

  // GENEL CHART CONFIG
  const commonChartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontSize: 10,
      fontWeight: "bold",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#E0E0E0",
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Finansal Raporlar</Text>

      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.filterLabel}>Yıl Seç:</Text>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={String(year)} value={year} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.filterLabel}>Ay Seç:</Text>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {months.map((month) => (
              <Picker.Item
                key={month.value}
                label={month.label}
                value={month.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateReport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name="analytics-outline"
              size={22}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.generateButtonText}>Rapor Oluştur</Text>
          </>
        )}
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.reportContent}>
        {loading && !reportData ? (
          <View style={styles.centeredMessage}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Rapor hazırlanıyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredMessage}>
            <Ionicons name="alert-circle-outline" size={50} color="#E74C3C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : reportData ? (
          <>
            {/* Finansal Özet Kartı */}
            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>
                Finansal Özet - {reportData.period}
              </Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  **İndirimsiz Sipariş Geliri (Brüt):**
                </Text>
                <Text style={styles.valueText}>
                  {formatNumber(reportData.totalGrossOrderIncome)} TL
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  **Toplam Yapılan İndirim:**
                </Text>
                <Text style={styles.valueTextRed}>
                  {formatNumber(reportData.totalDiscountAmount)} TL
                </Text>
              </View>
              {/* <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Siparişlerden Gelen Gelir (Net):
                </Text>
                <Text style={styles.valueTextGreen}>
                  {formatNumber(reportData.totalOrderIncome)} TL
                </Text>
              </View> */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Diğer Ek Gelirler:</Text>
                <Text style={styles.valueTextGreen}>
                  {formatNumber(reportData.totalAdditionalIncome)} TL
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  **Tüm Gelirler (Net Toplam):**
                </Text>
                <Text style={styles.valueTextGreenStrong}>
                  {formatNumber(reportData.grandTotalIncome)} TL
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>**Toplam Giderler:**</Text>
                <Text style={styles.valueTextRedStrong}>
                  {formatNumber(reportData.totalExpenses)} TL
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.netProfitRow]}>
                <Text style={styles.summaryLabelNetProfit}>
                  **Net Kâr/Zarar:**
                </Text>
                <Text style={[styles.valueTextNetProfit, netProfitColor]}>
                  {formatNumber(reportData.netProfit)} TL
                </Text>
              </View>
            </View>

            {/* Finansal Özet Çubuk Grafiği */}
            {financialSummaryChartData && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Finansal Özet Grafiği</Text>
                <BarChart
                  data={financialSummaryChartData}
                  width={screenWidth - 60}
                  height={220}
                  yAxisLabel="TL "
                  chartConfig={{
                    ...commonChartConfig,
                    decimalPlaces: 0,
                    barPercentage: 0.8,
                    propsForLabels: {
                      fontSize: 12,
                      fontWeight: "bold",
                    },
                    propsForHorizontalLabels: {
                      dx: -15,
                      fontSize: 10,
                      textAnchor: "end",
                    },
                  }}
                  fromZero={true}
                  showValuesOnTopOfBars={true}
                />
              </View>
            )}

            {/* Gider Dağılımı Pastası */}
            {expenseCategoriesData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>
                  Gider Kategorilerine Göre Dağılım
                </Text>
                <PieChart
                  data={expenseCategoriesData}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={commonChartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[10, 0]}
                  absolute
                />
              </View>
            )}

            {/* Aylık Gelir/Gider Çubuk Grafiği (Sadece yıl seçiliyse göster) */}
            {selectedMonth === 0 && monthlySummaryData && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>
                  {selectedYear} Yılı Aylık Gelir ve Giderler
                </Text>
                <BarChart
                  data={monthlySummaryData}
                  width={screenWidth - 60}
                  height={250}
                  yAxisLabel="TL "
                  chartConfig={{
                    ...commonChartConfig,
                    propsForHorizontalLabels: {
                      dx: -15,
                      fontSize: 10,
                      textAnchor: "end",
                    },
                    propsForVerticalLabels: {
                      dy: 5,
                      fontSize: 10,
                      rotation: -30,
                      textAnchor: "end",
                    },
                    paddingRight: 30,
                    paddingLeft: 40,
                  }}
                  verticalLabelRotation={0}
                  withInnerLines={true}
                  fromZero={true}
                />
              </View>
            )}

            {/* Bölgelere Göre Sipariş Adedi Grafiği */}
            {totalOrders > 0 &&
            orderCountByRegionData &&
            orderCountByRegionData.labels.length > 0 ? (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>
                  Bölgelere Göre Sipariş Adedi
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  <BarChart
                    data={orderCountByRegionData}
                    width={Math.max(
                      screenWidth - 60,
                      orderCountByRegionData.labels.length * 120
                    )}
                    height={Math.max(
                      250,
                      orderCountByRegionData.labels.length * 50
                    )}
                    yAxisLabel=""
                    chartConfig={{
                      ...commonChartConfig,
                      decimalPlaces: 0,
                      barPercentage: 0.7,
                      propsForLabels: {
                        fontSize: 12,
                        fontWeight: "bold",
                      },
                      propsForVerticalLabels: {
                        dy: 15,
                        textAnchor: "middle",
                        fontSize: 10,
                        fontWeight: "normal",
                      },
                      paddingLeft: 40,
                      paddingRight: 40,
                    }}
                    fromZero={true}
                    showValuesOnTopOfBars={true}
                    style={{
                      marginBottom: 50,
                    }}
                  />
                </ScrollView>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="information-circle-outline"
                  size={60}
                  color="#BDC3C7"
                />
                <Text style={styles.infoText}>
                  Bu dönemde görüntülenecek sipariş bölgesi verisi
                  bulunmamaktadır.
                </Text>
                <Text style={styles.infoTextSmall}>
                  (Sipariş kaydederken müşteri adresinin ilçe/bölge bilgisini
                  girdiğinizden emin olun.)
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="information-circle-outline"
              size={60}
              color="#BDC3C7"
            />
            <Text style={styles.infoText}>
              Yukarıdaki filtreleri kullanarak rapor oluşturabilirsiniz.
            </Text>
            <Text style={styles.infoText}>
              Lütfen bir yıl ve ay seçerek "Rapor Oluştur" butonuna tıklayın.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingTop: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    fontSize: 15,
    color: "#555",
    marginBottom: 5,
    fontWeight: "600",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickerItem: {
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  reportContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#555",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 19,
    color: "#E74C3C",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  infoTextSmall: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 6,
    borderLeftColor: "#28A745",
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#34495E",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 17,
    color: "#555",
    fontWeight: "500",
  },
  summaryLabelNetProfit: {
    fontSize: 20,
    color: "#34495E",
    fontWeight: "bold",
  },
  valueText: {
    fontWeight: "bold",
    color: "#34495E",
    fontSize: 17,
  },
  valueTextGreen: {
    fontWeight: "bold",
    color: "#28A745",
    fontSize: 17,
  },
  valueTextGreenStrong: {
    fontWeight: "bold",
    color: "#198754",
    fontSize: 18,
  },
  valueTextRed: {
    fontWeight: "bold",
    color: "#DC3545",
    fontSize: 17,
  },
  valueTextRedStrong: {
    fontWeight: "bold",
    color: "#DC3545",
    fontSize: 18,
  },
  netProfitRow: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  valueTextNetProfit: {
    fontWeight: "bold",
    fontSize: 20,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#34495E",
    marginBottom: 15,
    marginTop: 5,
    textAlign: "center",
  },
});

export default Reports;
