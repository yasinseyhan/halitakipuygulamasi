import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig"; // Firestore yapılandırmanızın doğru yolu
import { Ionicons } from "@expo/vector-icons";

const ProductDefinition = () => {
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [unit, setUnit] = useState("Metre Kare");
  const [price, setPrice] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const unitOptions = ["Adet", "Metre Kare", "Takım", "Metre Tül"];
  const categoryOptions = ["Halı", "Koltuk", "Perde", "Diğer"];

  useEffect(() => {
    const q = query(
      collection(firestore, "products"),
      orderBy("category", "asc"),
      orderBy("name", "asc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
        setLoading(false);
      },
      (error) => {
        console.error("Ürünler çekilirken hata oluştu: ", error);
        Alert.alert("Hata", "Ürünler yüklenirken bir sorun oluştu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSaveOrUpdateProduct = async () => {
    if (!category || !productName.trim() || !unit || !price.trim()) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurunuz.");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Uyarı", "Lütfen geçerli bir fiyat giriniz.");
      return;
    }

    try {
      if (isEditing) {
        const productRef = doc(firestore, "products", currentProductId);
        await updateDoc(productRef, {
          category: category,
          name: productName.trim(),
          unit: unit,
          price: parsedPrice,
          updatedAt: serverTimestamp(),
        });
        Alert.alert("Başarılı", "Ürün güncellendi.");
      } else {
        await addDoc(collection(firestore, "products"), {
          category: category,
          name: productName.trim(),
          unit: unit,
          price: parsedPrice,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        Alert.alert("Başarılı", "Yeni ürün eklendi.");
      }
      setCategory("");
      setProductName("");
      setUnit("Metre Kare");
      setPrice("");
      setIsEditing(false);
      setCurrentProductId(null);
    } catch (error) {
      console.error("Ürün eklenirken/güncellenirken hata oluştu: ", error);
      Alert.alert("Hata", "İşlem sırasında bir sorun oluştu.");
    }
  };

  const handleDeleteProduct = async (id) => {
    Alert.alert(
      "Onay",
      "Bu ürünü silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "products", id));
              Alert.alert("Başarılı", "Ürün silindi.");
            } catch (error) {
              console.error("Ürün silinirken hata oluştu: ", error);
              Alert.alert("Hata", "Silme işlemi sırasında bir sorun oluştu.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProduct = (item) => {
    setCategory(item.category);
    setProductName(item.name);
    setUnit(item.unit);
    setPrice(item.price.toString());
    setIsEditing(true);
    setCurrentProductId(item.id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>Kategori: {item.category}</Text>
        <Text style={styles.cardDetail}>
          Fiyat: {item.price.toFixed(2)} ₺ / {item.unit}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => handleEditProduct(item)}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteProduct(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <Text style={styles.title}>Ürün Tanımlama</Text>
      <View style={styles.inputContainer}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Kategori Seçin" value="" />
            {categoryOptions.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ürün Adı (örn: Makine Halısı, 3'lü Koltuk, Tül Perde)"
          value={productName}
          onChangeText={setProductName}
          placeholderTextColor="#888"
        />

        <View style={styles.row}>
          <View style={styles.pickerWrapperHalf}>
            <Picker
              selectedValue={unit}
              onValueChange={(itemValue) => setUnit(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {unitOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          <TextInput
            style={[styles.input, styles.halfWidthInput]}
            placeholder="Fiyat"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveOrUpdateProduct}
        >
          <Text style={styles.buttonText}>
            {isEditing ? "Güncelle" : "Kaydet"}
          </Text>
          <Ionicons
            name={isEditing ? "save-outline" : "add-circle-outline"}
            size={20}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
        {isEditing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setCategory("");
              setProductName("");
              setUnit("Metre Kare");
              setPrice("");
              setIsEditing(false);
              setCurrentProductId(null);
            }}
          >
            <Text style={styles.buttonText}>İptal</Text>
            <Ionicons
              name="close-circle-outline"
              size={20}
              color="#fff"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>Tanımlı Ürünler</Text>
      {products.length === 0 && !loading ? (
        <Text style={styles.noItemsText}>
          Henüz tanımlı ürün bulunmamaktadır.
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34495E",
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  halfWidthInput: {
    flex: 1,
    marginLeft: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
    height: 50,
    justifyContent: "center",
  },
  pickerWrapperHalf: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginRight: 5,
    height: 50,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: 50,
  },
  pickerItem: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#DC3545",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  cardDetail: {
    fontSize: 15,
    color: "#666",
    marginTop: 5,
  },
  cardActions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: "#DC3545",
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  noItemsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default ProductDefinition;
