import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5", // Açık gri arka plan
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#fff", // Beyaz kart arka planı
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android için gölge
    flexDirection: "column",
  },
  cardContent: {
    marginBottom: 10,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  customerPhone: {
    fontSize: 15,
    color: "#555",
    marginTop: 3,
  },
  orderDate: {
    fontSize: 13,
    color: "#888",
    marginTop: 5,
  },
  itemSummary: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28A745", // Yeşil
    marginTop: 5,
  },
  remainingAmount: {
    fontSize: 15,
    color: "#E74C3C", // Kırmızı
    fontWeight: "bold",
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: "#3498DB", // Mavi buton
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-end", // Kartın sağında hizala
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});

export default styles;
