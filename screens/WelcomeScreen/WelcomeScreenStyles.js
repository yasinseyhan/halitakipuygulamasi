import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2C3E50",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 10,
    marginBottom: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2C3E50",
  },
});

export default styles;
