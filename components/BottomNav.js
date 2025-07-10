import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const tabs = [
  { key: "Home", label: "Ana Sayfa", icon: "🏠" },
  { key: "Management", label: "Yönetim", icon: "🧑‍💼" },
  { key: "Reports", label: "Raporlar", icon: "📊" },
  { key: "Support", label: "Destek", icon: "🎧" },
];

const BottomNav = ({ state, descriptors, navigation }) => (
  <View style={styles.tabBar}>
    {state.routes.map((route, index) => {
      const isFocused = state.index === index;
      const tab = tabs.find((t) => t.key === route.name);

      return (
        <TouchableOpacity
          key={route.key}
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          onPress={() => {
            if (!isFocused) {
              console.log("Navigating to:", route.name);
              navigation.navigate(route.name);
            }
          }}
          style={[styles.tabItem, isFocused && styles.activeTab]}
        >
          <Text style={[styles.icon, isFocused && styles.activeIcon]}>
            {tab?.icon}
          </Text>
          <Text style={[styles.label, isFocused && styles.activeLabel]}>
            {tab?.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#2C3E50",
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  icon: {
    fontSize: 30,
    color: "#2196F3",
  },
  label: {
    fontSize: 13,
    color: "#FFFFFF",
  },
  activeTab: {
    backgroundColor: "#E3F2FD",
  },
  activeIcon: {
    color: "#1565C0",
  },
  activeLabel: {
    color: "#1565C0",
    fontWeight: "bold",
  },
});

export default BottomNav;
