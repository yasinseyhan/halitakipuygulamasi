import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const buttonSize = (width - 24 * 2) / 2 - 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    padding: 24,
    justifyContent: "flex-start",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  squareButton: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: "#2196F3",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    margin: 6,
    elevation: 3,
  },
  squareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  bottomHalf: {
    flex: 1,
    // Alt kısım için stil ekleyebilirsin
  },
});

export default styles;
