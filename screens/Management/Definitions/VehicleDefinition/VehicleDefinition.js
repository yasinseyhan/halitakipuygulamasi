import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";

import styles from "./VehicleDefinitionStyles";

const VehicleDefinition = () => {
  const [aracAdi, setAracAdi] = useState("");
  const [plaka, setPlaka] = useState("");
  const [araclar, setAraclar] = useState([]);

  const handleSave = () => {
    if (aracAdi.trim() && plaka.trim()) {
      setAraclar([
        ...araclar,
        { aracAdi: aracAdi.trim(), plaka: plaka.trim() },
      ]);
      setAracAdi("");
      setPlaka("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Araç Adı</Text>
      <TextInput
        style={styles.input}
        placeholder="Araç adını giriniz"
        value={aracAdi}
        onChangeText={setAracAdi}
      />
      <Text style={styles.label}>Plaka</Text>
      <TextInput
        style={styles.input}
        placeholder="Plaka giriniz"
        value={plaka}
        onChangeText={setPlaka}
      />
      <Button
        title="Kaydet"
        onPress={handleSave}
        disabled={!aracAdi.trim() || !plaka.trim()}
      />

      <FlatList
        data={araclar}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.vehicleBox}>
            <Text style={styles.vehicleText}>
              {item.aracAdi} - {item.plaka}
            </Text>
          </View>
        )}
        style={{ marginTop: 24 }}
      />
    </View>
  );
};

export default VehicleDefinition;
