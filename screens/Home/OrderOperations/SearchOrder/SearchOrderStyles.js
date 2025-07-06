import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
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
  searchInput: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flexShrink: 1, // Uzun isimlerin taşmasını engeller
  },
  orderStatus: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50", // Mavi tonu
    backgroundColor: "#E6F0F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 10,
  },
  customerPhone: {
    fontSize: 15,
    color: "#555",
    marginBottom: 3,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28A745", // Yeşil tonu
    marginTop: 5,
  },
  remainingAmount: {
    fontSize: 15,
    color: "#E74C3C", // Kırmızı tonu
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 13,
    color: "#888",
    marginTop: 5,
  },
  deliveryDate: {
    fontSize: 13,
    color: "#888",
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});

export default styles;
