import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // İçeriğin kaydırılabilir olmasını sağlar
    padding: 20,
    backgroundColor: "#f0f2f5", // Arka plan rengi
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontWeight: "bold",
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100, // Daha fazla alan için
    textAlignVertical: "top", // Metnin üstten başlaması için
    paddingVertical: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 15,
    overflow: "hidden", // Picker'ın kenarlıklarını düzeltir
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#2C3E50", // Koyu mavi tonu
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default styles;
