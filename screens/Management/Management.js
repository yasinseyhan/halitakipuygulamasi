import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";

import styles from "./ManagementStyles";

const buttons = [
  {
    label: "Firma Ayarları",
    icon: <Ionicons name="business-outline" size={32} color="#fff" />,
    nav: "CompanySettings",
  },
  {
    label: "Tanımlamalar",
    icon: <MaterialIcons name="settings" size={32} color="#fff" />,
    nav: "Definitions",
  },
  {
    label: "SMS Ayarları",
    icon: <FontAwesome5 name="sms" size={32} color="#fff" />,
    nav: "SmsSettings",
  },
  {
    label: "Hesap Ayarları",
    icon: <Feather name="user" size={32} color="#fff" />,
    nav: "AccountSettings",
  },
];

const Management = ({ navigation }) => (
  <View style={styles.container}>
    <View style={styles.grid}>
      {buttons.map((btn, i) => (
        <TouchableOpacity
          key={i}
          style={styles.squareButton}
          onPress={() => navigation.navigate(btn.nav)}
        >
          {btn.icon}
          <Text style={styles.squareButtonText}>{btn.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={styles.bottomHalf}>
      {/* Alt kısım: Dilersen buraya başka içerik ekleyebilirsin */}
    </View>
  </View>
);

export default Management;
