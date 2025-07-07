import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5", // Arka plan daha açık gri
    paddingTop: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2C3E50", // Koyu mavi başlık
    textAlign: "center",
    marginBottom: 30,
    marginTop: 15,
    letterSpacing: 0.5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#555",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 19,
    color: "#E74C3C", // Kırmızı hata metni
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 16,
    color: "#7F8C8D", // Gri bilgi metni
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
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
  // Kart Ortak Stilleri
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#34495E",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  // Genel Özet Kartı Stilleri
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 6,
    borderLeftColor: "#007BFF", // Ana tema rengi
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
  // Bölüm Başlığı Stilleri (Tüm Siparişler)
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#34495E",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  // Sipariş Kartı Stilleri
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#28A745", // Sipariş kartları için vurgu rengi
    overflow: "hidden", // Animasyon için önemli
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F2F5",
  },
  orderCardTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1, // Uzun isimler için
  },
  orderSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    paddingLeft: 10, // İçeriği biraz sağa kaydır
  },
  orderSummaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  // Açılır Detaylar Stilleri
  expandedDetails: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#ECEFF1",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 15,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 15,
    color: "#34495E",
    fontWeight: "400",
    flexShrink: 1, // Uzun değerlerin satır atlaması için
  },
  productsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#ECEFF1",
  },
  productsHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: 8,
  },
  productItem: {
    marginBottom: 5,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#BDC3C7",
  },
  productName: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  productInfo: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  // Gider Kartı Stilleri
  expenseCard: {
    backgroundColor: "#FFEBEE", // Kırmızımsı arka plan
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#E74C3C", // Kırmızı sol çizgi
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0D1D6",
    paddingBottom: 5,
  },
  expenseCategory: {
    fontSize: 18,
    fontWeight: "600",
    color: "#C0392B", // Koyu kırmızı
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E74C3C", // Daha parlak kırmızı
  },
  expenseDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 5,
  },
  expenseDate: {
    fontSize: 13,
    color: "#888",
    textAlign: "right",
    marginTop: 5,
  },
  // Yeni: Gelir Kartı Stilleri
  incomeCard: {
    backgroundColor: "#E8F5E9", // Yeşilimsi arka plan
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#28A745", // Yeşil sol çizgi
  },
  incomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#CFE8D0",
    paddingBottom: 5,
  },
  incomeCategory: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B5E20", // Koyu yeşil
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28A745", // Daha parlak yeşil
  },
  incomeDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 5,
  },
  incomeDate: {
    fontSize: 13,
    color: "#888",
    textAlign: "right",
    marginTop: 5,
  },
  // Renk Stilleri
  valueText: {
    fontWeight: "bold",
    color: "#34495E",
    fontSize: 17,
  },
  valueTextGreen: {
    fontWeight: "bold",
    color: "#28A745", // Yeşil
    fontSize: 17,
  },
  valueTextRed: {
    fontWeight: "bold",
    color: "#DC3545", // Kırmızı
    fontSize: 17,
  },
  valueTextBlue: {
    fontWeight: "bold",
    color: "#007BFF", // Mavi
    fontSize: 17,
  },
  valueTextOrange: {
    fontWeight: "bold",
    color: "#FFC107", // Turuncu
    fontSize: 17,
  },
});

export default styles;
