import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f4f6fa",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 24,
    marginTop: 8,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#b0bec5",
  },
  logoPlaceholderText: {
    color: "#90a4ae",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d0d7de",
  },
  saveButton: {
    width: "100%",
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 15,
    color: "#2C3E50",
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
});

export default styles;
