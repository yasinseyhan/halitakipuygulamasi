import { StyleSheet } from "react-native";

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
  customerAddress: {
    fontSize: 14,
    color: "#777",
    marginBottom: 3,
  },
  orderDate: {
    // Alış tarihi için
    fontSize: 14,
    color: "#777",
    marginBottom: 3,
  },
  deliveryDate: {
    // Teslim tarihi için (bu ekranda daha vurgulu olabilir)
    fontSize: 14,
    color: "#777",
    fontWeight: "bold", // Teslim tarihi önemli olduğu için kalın yapabiliriz
    marginBottom: 5,
  },
  itemSummary: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 5,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27AE60",
    marginTop: 5,
  },
  remainingAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E74C3C",
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF", // Mavi tonu, "Teslimata Çıktı" anlamı için
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
  noOrdersText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#555",
    fontWeight: "bold",
  },
});

export default styles;
