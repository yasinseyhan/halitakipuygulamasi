import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 2, backgroundColor: "#f0f2f5" },
  listContent: { padding: 12 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    padding: 160,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: { marginBottom: 10 },
  customerName: { fontWeight: "bold", fontSize: 16, color: "#2C3E50" },
  customerPhone: { fontSize: 15, color: "#34495E", marginTop: 2 },
  customerAddress: { fontSize: 14, color: "#555", marginTop: 2 },
  customerRegion: { fontSize: 14, color: "#888", marginTop: 2 },
  orderDate: { fontSize: 13, color: "#888", marginTop: 2 },
  itemSummary: { fontSize: 14, color: "#333", marginTop: 6 },
  orderAmount: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#28A745",
    marginTop: 6,
  },
  remainingAmount: { fontSize: 14, color: "#E74C3C", marginTop: 2 },
  actionButton: {
    backgroundColor: "#2C3E50",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  actionButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  noOrdersText: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
    fontSize: 16,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#555" },
});

export default styles;
