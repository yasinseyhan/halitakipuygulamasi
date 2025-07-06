import { StyleSheet } from "react-native";

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
    marginBottom: 12,
    marginTop: 8,
  },
  info: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 6,
    fontWeight: "500",
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d0d7de",
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 24,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  contactBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d0d7de",
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 6,
  },
  contactText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 2,
    fontWeight: "bold",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },
  servicesBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d0d7de",
    marginTop: 24,
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  serviceItem: {
    fontSize: 15,
    color: "#555",
    marginBottom: 4,
    fontWeight: "600",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceIcon: {
    marginRight: 8,
  },
});

export default styles;
