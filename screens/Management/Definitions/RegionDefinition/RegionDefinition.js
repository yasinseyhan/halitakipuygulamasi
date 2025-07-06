// src/screens/Management/Definitions/RegionDefinition/RegionDefinition.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { firestore } from "../../../../src/firebaseConfig"; // Doğru yolu kontrol edin
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons"; // İkonlar için
import styles from "./RegionDefinitionStyles"; // Stil dosyasını import et

const RegionDefinition = () => {
  const [newRegionName, setNewRegionName] = useState("");
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestore'dan bölgeleri gerçek zamanlı olarak dinle
  useEffect(() => {
    const q = query(collection(firestore, "regions"), orderBy("name", "asc")); // Alfabetik sıralama
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const regionList = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setRegions(regionList);
        setLoading(false);
      },
      (error) => {
        console.error("Bölgeler çekilirken hata oluştu: ", error);
        Alert.alert("Hata", "Bölgeler yüklenirken bir sorun oluştu.");
        setLoading(false);
      }
    );

    // Cleanup function
    return () => unsubscribe();
  }, []);

  const handleAddRegion = async () => {
    const trimmedRegionName = newRegionName.trim();
    if (!trimmedRegionName) {
      Alert.alert("Uyarı", "Bölge adı boş olamaz!");
      return;
    }

    // Aynı isimde bölge olup olmadığını kontrol et
    const existingRegion = regions.find(
      (r) => r.name.toLowerCase() === trimmedRegionName.toLowerCase()
    );
    if (existingRegion) {
      Alert.alert(
        "Uyarı",
        `'${trimmedRegionName}' adında bir bölge zaten mevcut.`
      );
      setNewRegionName(""); // Alanı temizle
      return;
    }

    try {
      await addDoc(collection(firestore, "regions"), {
        name: trimmedRegionName,
        createdAt: serverTimestamp(), // Kayıt zamanını ekle
      });
      Alert.alert(
        "Başarılı",
        `"${trimmedRegionName}" bölgesi başarıyla eklendi!`
      );
      setNewRegionName(""); // Input alanını temizle
    } catch (e) {
      console.error("Bölge eklenirken hata oluştu: ", e);
      Alert.alert("Hata", "Bölge eklenirken bir hata oluştu.");
    }
  };

  const handleDeleteRegion = async (id, name) => {
    Alert.alert(
      "Bölgeyi Sil",
      `"${name}" bölgesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "regions", id));
              Alert.alert("Başarılı", `"${name}" bölgesi başarıyla silindi.`);
            } catch (error) {
              console.error("Bölge silinirken hata oluştu: ", error);
              Alert.alert("Hata", "Bölge silinirken bir sorun oluştu.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderRegionItem = ({ item }) => (
    <View style={styles.regionItem}>
      <Text style={styles.regionName}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => handleDeleteRegion(item.id, item.name)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Bölgeler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Yeni Bölge Adı"
          value={newRegionName}
          onChangeText={setNewRegionName}
        />
        <TouchableOpacity onPress={handleAddRegion} style={styles.addButton}>
          <Text style={styles.addButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>Tanımlı Bölgeler:</Text>
      {regions.length === 0 ? (
        <Text style={styles.noRegionsText}>
          Henüz tanımlanmış bölge bulunmamaktadır.
        </Text>
      ) : (
        <FlatList
          data={regions}
          keyExtractor={(item) => item.id}
          renderItem={renderRegionItem}
          style={styles.regionList}
        />
      )}
    </View>
  );
};

export default RegionDefinition;
