import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // ScrollView içeriğinin büyümesini sağlar
    padding: 20,
    backgroundColor: "#F5F7FA", // Açık gri arka plan
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D5DBE1",
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top", // Android'de metnin yukarıdan başlamasını sağlar
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D5DBE1",
    overflow: "hidden", // iOS'ta kenarlıkların taşmasını engeller
  },
  picker: {
    height: Platform.OS === "ios" ? 150 : 50, // iOS'ta daha uzun picker
    width: "100%",
    color: "#333",
  },
  button: {
    backgroundColor: "#007BFF", // Mavi buton rengi
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000", // Gölgeler
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  activityIndicator: {
    marginTop: 20,
    marginBottom: 20,
  },
});

export default styles;
