import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AppHeader = ({ title }) => (
  <View style={styles.header}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>LOGO</Text>
    </View>
    <Text style={styles.headerTitle}>{title || "DEMO HALI YIKAMA"}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C3E50",
    padding: 15,
    paddingTop: 36,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    color: "#2196F3",
    fontWeight: "bold",
    fontSize: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AppHeader;
