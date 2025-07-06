import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

const dailyData = {
  income: 100200,
  expense: 18000,
  profit: 14000,
};
const regionStats = [
  { region: "Merkez", orders: 42, customers: 30 },
  { region: "Çarşı", orders: 28, customers: 20 },
  { region: "Sanayi", orders: 15, customers: 12 },
];

const screenWidth = Dimensions.get("window").width;
const size = screenWidth * 0.6;
const strokeWidth = 18;
const radius = (size - strokeWidth) / 2;
const center = size / 2;
const total = dailyData.income + dailyData.expense;
const incomePercent = dailyData.income / total;
const expensePercent = dailyData.expense / total;

// Yarım daire path hesaplama fonksiyonu
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = {
    x: cx + r * Math.cos((Math.PI * startAngle) / 180),
    y: cy + r * Math.sin((Math.PI * startAngle) / 180),
  };
  const end = {
    x: cx + r * Math.cos((Math.PI * endAngle) / 180),
    y: cy + r * Math.sin((Math.PI * endAngle) / 180),
  };
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    1,
    end.x,
    end.y,
  ].join(" ");
}

const Reports = () => (
  <ScrollView style={styles.container}>
    <Text style={styles.title}>Günlük Kar</Text>
    <View style={styles.graphWrapper}>
      <Svg width={size} height={size}>
        {/* Gelir (yeşil) üstte */}
        <Path
          d={describeArc(
            center,
            center,
            radius,
            180,
            180 + 180 * incomePercent
          )}
          stroke="#43A047"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Gider (kırmızı) altta */}
        <Path
          d={describeArc(center, center, radius, 0, 0 + 180 * expensePercent)}
          stroke="#E53935"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* İç daire (beyaz) */}
        <Circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 2 - 6}
          fill="#fff"
        />
      </Svg>
      <View style={styles.centerText}>
        <Text style={styles.profitLabel}>Kar</Text>
        <Text style={styles.profitValue}>{dailyData.profit} ₺</Text>
      </View>
    </View>
    <View style={styles.legendRow}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: "#43A047" }]} />
        <Text style={styles.legendText}>Gelir: {dailyData.income} ₺</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: "#E53935" }]} />
        <Text style={styles.legendText}>Gider: {dailyData.expense} ₺</Text>
      </View>
    </View>

    {/* Aylık Bölge Bazlı Kartı */}
    <Text style={styles.sectionTitle}>Aylık Bölge Bazlı Sipariş & Müşteri</Text>
    <View style={styles.regionCard}>
      {regionStats.map((item, idx) => (
        <View key={idx} style={styles.regionRow}>
          <Text style={styles.regionName}>{item.region}</Text>
          <Text style={styles.regionStat}>Sipariş: {item.orders}</Text>
          <Text style={styles.regionStat}>Müşteri: {item.customers}</Text>
        </View>
      ))}
    </View>

    {/* Yıllık Bölge Bazlı Kartı */}
    <Text style={styles.sectionTitle}>
      Yıllık Bölge Bazlı Sipariş & Müşteri
    </Text>
    <View style={styles.regionCard}>
      {regionStats.map((item, idx) => (
        <View key={idx} style={styles.regionRow}>
          <Text style={styles.regionName}>{item.region}</Text>
          <Text style={styles.regionStat}>Sipariş: {item.orders * 12}</Text>
          <Text style={styles.regionStat}>Müşteri: {item.customers * 12}</Text>
        </View>
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 18,
    marginTop: 8,
    textAlign: "center",
  },
  graphWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 8,
  },
  centerText: {
    position: "absolute",
    top: "42%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  profitLabel: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "600",
  },
  profitValue: {
    fontSize: 28,
    color: "#2C3E50",
    fontWeight: "bold",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 18,
    marginBottom: 8,
    textAlign: "left",
  },
  regionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  regionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  regionName: {
    fontWeight: "bold",
    color: "#2C3E50",
    width: 90,
  },
  regionStat: {
    color: "#555",
    width: 90,
    textAlign: "right",
  },
});

export default Reports;
