import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../../../../src/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

import styles from "./AddOrderStyles";

const AddOrder = ({ navigation, route }) => {
  // Müşteri bilgileri için ayrı ayrı state'ler tutulmaya devam edilecek,
  // ancak bunlar `customer` objesi seçildiğinde otomatik doldurulacak.
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerRegionName, setCustomerRegionName] = useState(""); // Bölge adı için state

  const [items, setItems] = useState([
    {
      productId: "",
      productName: "",
      productCategory: "",
      productUnit: "",
      basePrice: "",
      quantityValue: "",
      lineTotal: 0,
    },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null); // Seçili müşteri objesini tutan state
  const [allProducts, setAllProducts] = useState([]); // Tüm ürünler (halı, koltuk, perde)

  // SearchCustomer ekranından dönen veriyi işlemek için useEffect kullanın
  useEffect(() => {
    if (route.params?.selectedCustomer) {
      const selectedCust = route.params.selectedCustomer;
      setCustomer(selectedCust); // Seçilen müşteriyi 'customer' state'ine kaydet

      // Parametreleri temizle (bu sayede ekran tekrar render edildiğinde eski müşteri tekrar gelmez)
      // Ancak burası yerine, müşteri setlendikten hemen sonra temizlemek daha mantıklı olabilir
      // Veya direkt AddOrder'ın odaklanma olayında kontrol etmek daha sağlamdır.
      // Şimdilik buradaki parametre temizlemeyi kaldırıyorum, alttaki useEffect daha iyi.
    }
  }, [route.params?.selectedCustomer]);

  // customer state'i değiştiğinde müşteri input alanlarını otomatik doldur/temizle
  useEffect(() => {
    if (customer) {
      // Eğer bir müşteri objesi varsa, alanları doldur
      // Firebase'den gelen alan adlarına dikkat edin (name, phone, address, regionName)
      setCustomerName(customer.name || "");
      setCustomerPhone(customer.phone || "");
      setCustomerAddress(customer.address || "");
      setCustomerRegionName(customer.regionName || ""); // Bölge adını da setle
    } else {
      // Müşteri seçimi sıfırlandıysa alanları temizle
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerRegionName("");
    }
    // Seçim sonrası route.params'ı temizle (çok önemli!)
    // Bu, AddOrder ekranına başka yollardan dönüldüğünde eski seçili müşterinin tekrar doldurulmasını engeller.
    if (route.params?.selectedCustomer) {
      navigation.setParams({ selectedCustomer: undefined });
    }
  }, [customer]); // customer state'i değiştiğinde bu useEffect çalışacak

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
        setAllProducts(productsList);
      },
      (error) => {
        console.error("Ürünler çekilirken hata oluştu: ", error);
        Alert.alert("Hata", "Ürünler yüklenirken bir sorun oluştu.");
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let currentTotal = 0;
    const updatedItems = items.map((item) => {
      const quantityValue = parseFloat(item.quantityValue) || 0;
      const basePrice = parseFloat(item.basePrice) || 0;
      const lineTotal = quantityValue * basePrice;
      currentTotal += lineTotal;
      return { ...item, lineTotal: lineTotal };
    });
    setItems(updatedItems);
    setTotalAmount(currentTotal);
  }, [items.map((i) => i.quantityValue + i.basePrice).join("")]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        productCategory: "",
        productUnit: "",
        basePrice: "",
        quantityValue: "",
        lineTotal: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    } else {
      Alert.alert("Uyarı", "En az bir ürün bilgisi olmalıdır.");
    }
  };

  const handleItemChange = (value, index, field) => {
    const newItems = [...items];
    if (field === "productId") {
      const selectedProduct = allProducts.find((p) => p.id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        productName: selectedProduct ? selectedProduct.name : "",
        productCategory: selectedProduct ? selectedProduct.category : "",
        productUnit: selectedProduct ? selectedProduct.unit : "",
        basePrice: selectedProduct ? selectedProduct.price.toString() : "",
        quantityValue: "",
        lineTotal: 0,
      };
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleSubmitOrder = async () => {
    // Müşteri bilgisi doğrulama: Eğer `customer` state'i null ise (yani müşteri seçilmemişse),
    // `customerName`, `customerPhone`, `customerAddress` state'lerinin dolu olup olmadığını kontrol et.
    if (!customer && (!customerName || !customerPhone || !customerAddress)) {
      Alert.alert("Hata", "Müşteri bilgileri eksik olamaz.");
      return;
    }

    // Ürün bilgileri doğrulama
    if (
      items.some(
        (item) => !item.productId || !item.quantityValue || !item.basePrice
      )
    ) {
      Alert.alert("Hata", "Lütfen tüm ürün bilgilerini eksiksiz giriniz.");
      return;
    }

    setLoading(true);
    try {
      let customerIdToUse = customer ? customer.id : null;

      // Bu değişkenlerin hiçbir zaman `undefined` olmamasını sağlıyoruz.
      // `|| ""` ekleyerek, eğer değer `null` veya `undefined` ise boş string olmasını sağlıyoruz.
      const finalCustomerName = (customer ? customer.name : customerName) || "";
      const finalCustomerPhone =
        (customer ? customer.phone : customerPhone) || "";
      const finalCustomerAddress =
        (customer ? customer.address : customerAddress) || "";
      const finalCustomerRegionName =
        (customer ? customer.regionName : customerRegionName) || "";

      if (!customerIdToUse) {
        // Müşteri seçilmemişse ve manuel olarak girildiyse yeni müşteri oluştur
        const newCustomerRef = await addDoc(
          collection(firestore, "customers"),
          {
            name: finalCustomerName,
            phone: finalCustomerPhone,
            address: finalCustomerAddress,
            regionName: finalCustomerRegionName, // Yeni müşteriye bölge adını da ekle
            createdAt: serverTimestamp(),
          }
        );
        customerIdToUse = newCustomerRef.id;
        Alert.alert("Bilgi", "Yeni müşteri eklendi.");
      }

      const parsedPaidAmount = parseFloat(paidAmount) || 0;
      const remainingAmount = totalAmount - parsedPaidAmount;

      await addDoc(collection(firestore, "orders"), {
        customerId: customerIdToUse,
        customerName: finalCustomerName, // Firebase'e gönderilecek son değer
        customerPhone: finalCustomerPhone, // Firebase'e gönderilecek son değer
        customerAddress: finalCustomerAddress, // Firebase'e gönderilecek son değer
        customerRegionName: finalCustomerRegionName, // Firebase'e gönderilecek son değer
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productCategory: item.productCategory,
          productUnit: item.productUnit,
          basePrice: parseFloat(item.basePrice) || 0,
          quantityValue: parseFloat(item.quantityValue) || 0,
          lineTotal: item.lineTotal,
        })),
        totalAmount: totalAmount,
        paidAmount: parsedPaidAmount,
        remainingAmount: remainingAmount,
        status: "Teslim Alınacak",
        orderDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Başarılı", "Sipariş başarıyla kaydedildi!");
      // Formu sıfırla
      setCustomer(null);
      // setCustomerName, setCustomerPhone, setCustomerAddress, setCustomerRegionName
      // setCustomer(null) tetiklediği useEffect ile otomatik sıfırlanacak.
      setItems([
        {
          productId: "",
          productName: "",
          productCategory: "",
          productUnit: "",
          basePrice: "",
          quantityValue: "",
          lineTotal: 0,
        },
      ]);
      setTotalAmount(0);
      setPaidAmount("");
    } catch (error) {
      console.error("Sipariş kaydedilirken hata oluştu: ", error);
      Alert.alert(
        "Hata",
        "Sipariş kaydedilirken bir sorun oluştu: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const renderQuantityInput = (item, index) => {
    switch (item.productUnit) {
      case "Metre Kare":
        return (
          <TextInput
            style={styles.smallInput}
            placeholder="m²"
            value={item.quantityValue}
            onChangeText={(text) =>
              handleItemChange(text, index, "quantityValue")
            }
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        );
      case "Adet":
        return (
          <TextInput
            style={styles.smallInput}
            placeholder="Adet"
            value={item.quantityValue}
            onChangeText={(text) =>
              handleItemChange(text, index, "quantityValue")
            }
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        );
      case "Takım":
        return (
          <TextInput
            style={styles.smallInput}
            placeholder="Takım"
            value={item.quantityValue}
            onChangeText={(text) =>
              handleItemChange(text, index, "quantityValue")
            }
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        );
      case "Metre Tül":
        return (
          <TextInput
            style={styles.smallInput}
            placeholder="mtül"
            value={item.quantityValue}
            onChangeText={(text) =>
              handleItemChange(text, index, "quantityValue")
            }
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        );
      default:
        return (
          <TextInput
            style={styles.smallInput}
            placeholder="Miktar"
            value={item.quantityValue}
            onChangeText={(text) =>
              handleItemChange(text, index, "quantityValue")
            }
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Sipariş kaydediliyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Yeni Sipariş Ekle</Text>

        {/* Müşteri Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          <TextInput
            style={styles.input}
            placeholder="Müşteri Adı Soyadı"
            value={customerName}
            onChangeText={setCustomerName}
            editable={!customer} // Müşteri seçilmişse düzenlenemez
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
            editable={!customer} // Müşteri seçilmişse düzenlenemez
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Adres"
            value={customerAddress}
            onChangeText={setCustomerAddress}
            multiline
            numberOfLines={3}
            editable={!customer} // Müşteri seçilmişse düzenlenemez
            placeholderTextColor="#888"
          />
          {/* Bölge adı için TextInput (eğer varsa) */}
          <TextInput
            style={styles.input}
            placeholder="Bölge Adı (Opsiyonel)"
            value={customerRegionName}
            onChangeText={setCustomerRegionName}
            editable={!customer} // Müşteri seçilmişse düzenlenemez
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={styles.selectCustomerButton}
            onPress={() =>
              navigation.navigate("SearchCustomer", {
                selectMode: true,
                previousScreen: "AddOrder",
              })
            }
          >
            <Text style={styles.selectCustomerButtonText}>Müşteri Seç</Text>
            <Ionicons
              name="person-add-outline"
              size={20}
              color="#fff"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
          {/* Müşteri seçildiyse temizleme butonu */}
          {customer && (
            <TouchableOpacity
              style={styles.clearCustomerButton}
              onPress={() => setCustomer(null)} // Müşteri state'ini sıfırla, bu diğer state'leri de sıfırlar
            >
              <Text style={styles.clearCustomerButtonText}>
                Müşteriyi Temizle
              </Text>
              <Ionicons
                name="close-circle-outline"
                size={20}
                color="#fff"
                style={{ marginLeft: 5 }}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Ürün Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ürün Bilgileri</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={item.productId}
                  onValueChange={(itemValue) =>
                    handleItemChange(itemValue, index, "productId")
                  }
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Ürün Seçin" value="" />
                  {allProducts.map((product) => (
                    <Picker.Item
                      key={product.id}
                      label={`${product.name} (${product.category})`}
                      value={product.id}
                    />
                  ))}
                </Picker>
              </View>

              {renderQuantityInput(item, index)}

              <TextInput
                style={styles.smallInput}
                placeholder="Birim Fiyat"
                value={item.basePrice}
                onChangeText={(text) =>
                  handleItemChange(text, index, "basePrice")
                }
                keyboardType="numeric"
                placeholderTextColor="#888"
                editable={false}
              />
              <Text style={styles.lineTotalText}>
                {(item.lineTotal || 0).toFixed(2)} TL
              </Text>
              {items.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveItem(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="remove-circle" size={24} color="#DC3545" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.addItemButton}
            onPress={handleAddItem}
          >
            <Text style={styles.addItemButtonText}>Ürün Ekle</Text>
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#fff"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>

        {/* Ödeme Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme Bilgileri</Text>
          <Text style={styles.totalAmountText}>
            Toplam Tutar: {totalAmount.toFixed(2)} TL
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ödenen Tutar"
            value={paidAmount}
            onChangeText={setPaidAmount}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          <Text style={styles.remainingAmountText}>
            Kalan Tutar:{" "}
            {(totalAmount - (parseFloat(paidAmount) || 0)).toFixed(2)} TL
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitOrder}
        >
          <Text style={styles.submitButtonText}>Siparişi Kaydet</Text>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddOrder;
