import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import styles from "./DefinitionsStyles";

const buttons = [
  {
    label: "Bölge Tanımla",
    icon: (
      <MaterialCommunityIcons
        name="map-marker-radius-outline"
        size={32}
        color="#fff"
      />
    ),
    nav: "RegionDefinition",
  },
  {
    label: "Araç Tanımla",
    icon: <FontAwesome5 name="truck" size={32} color="#fff" />,
    nav: "VehicleDefinition",
  },
  {
    label: "Ürün Tanımla",
    icon: <MaterialIcons name="category" size={32} color="#fff" />,
    nav: "ProductDefinition",
  },
  {
    label: "Mesaj Şablonları",
    icon: <Ionicons name="chatbox-ellipses-outline" size={32} color="#fff" />,
    nav: "MessageTemplates",
  },
];

const Definitions = ({ navigation }) => (
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

export default Definitions;
