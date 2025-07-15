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
  StyleSheet,
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
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { firestore } from "../../../../src/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

import styles from "./AddOrderStyles"; // Stil dosyanızı import edin

const AddOrder = ({ navigation, route }) => {
  // Müşteri bilgileri state'leri
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerRegionName, setCustomerRegionName] = useState("");
  const [customer, setCustomer] = useState(null); // Seçilen müşteri objesi

  // Ürün kalemleri state'i (itemCount artık hesaplamaya dahil)
  const [items, setItems] = useState([
    {
      productId: "",
      productName: "",
      productCategory: "",
      productUnit: "",
      basePrice: "", // Birim fiyat (örn: m² başına fiyat)
      quantityValue: "", // Birim başına miktar (örn: 6 metrekare)
      itemCount: "1", // Kaç adet/parça olduğu (örn: 4 adet halı)
      lineTotal: 0,
      calculatedTotalQuantity: 0, // Yeni: (quantityValue * itemCount)
    },
  ]);

  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [discountAmount, setDiscountAmount] = useState("");
  const [pickupDate, setPickupDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  // Sürücü state'leri
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [driverVehiclePlate, setDriverVehiclePlate] = useState("");

  // Düzenleme modunda sipariş varsa (route.params'tan alıyoruz)
  const { order: editingOrder, isEditing } = route.params || {};

  // FORM YÜKLENİRKEN VEYA DÜZENLEME MODUNDA GELDİĞİNDE VERİLERİ YÜKLE
  useEffect(() => {
    if (isEditing && editingOrder) {
      setCustomerName(editingOrder.customerName || "");
      setCustomerPhone(editingOrder.customerPhone || "");
      setCustomerAddress(editingOrder.customerAddress || "");
      setCustomerRegionName(editingOrder.customerRegionName || "");
      setItems(
        editingOrder.items.map((item) => ({
          ...item,
          itemCount: item.itemCount ? String(item.itemCount) : "1",
          quantityValue: item.quantityValue ? String(item.quantityValue) : "",
          basePrice: item.basePrice ? String(item.basePrice) : "",
        })) || []
      );
      setTotalAmount(editingOrder.totalAmount || 0);
      setDiscountAmount(editingOrder.discountAmount?.toString() || "0");
      setPaidAmount(editingOrder.paidAmount?.toString() || "0");
      setPickupDate(
        editingOrder.pickupDate
          ? editingOrder.pickupDate.toDate
            ? editingOrder.pickupDate.toDate()
            : editingOrder.pickupDate
          : new Date()
      );
      setDeliveryDate(
        editingOrder.deliveryDate
          ? editingOrder.deliveryDate.toDate
            ? editingOrder.deliveryDate.toDate()
            : editingOrder.deliveryDate
          : new Date()
      );
      setSelectedDriverId(editingOrder.driverId || null);
      setDriverName(editingOrder.driverName || "");
      setDriverVehiclePlate(editingOrder.driverVehiclePlate || "");
      setOrderNotes(editingOrder.notes || "");

      if (editingOrder.customerId) {
        const fetchCustomer = async () => {
          try {
            const customerDoc = await getDoc(
              doc(firestore, "customers", editingOrder.customerId)
            );
            if (customerDoc.exists()) {
              setCustomer({ id: customerDoc.id, ...customerDoc.data() });
            }
          } catch (error) {
            console.error("Müşteri bilgisi çekilirken hata:", error);
          }
        };
        fetchCustomer();
      }
    }
  }, [isEditing, editingOrder]);

  // Müşteri seçimi yapıldığında bilgileri doldur
  useEffect(() => {
    if (route.params?.selectedCustomer) {
      const selectedCust = route.params.selectedCustomer;
      setCustomer(selectedCust);
      setCustomerName(
        selectedCust.name ||
          selectedCust.fullName ||
          selectedCust.adSoyad ||
          selectedCust.customerName ||
          ""
      );
      setCustomerPhone(
        selectedCust.phone || selectedCust.customerPhoneNumber || ""
      );
      setCustomerAddress(
        selectedCust.address || selectedCust.customerAddress || ""
      );
      setCustomerRegionName(
        selectedCust.regionName || selectedCust.region || ""
      );
      navigation.setParams({ selectedCustomer: undefined });
    }
  }, [route.params?.selectedCustomer]);

  // Ürünleri çekme useEffect'i
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

  // Sürücüleri çekme useEffect'i ve seçili sürücüyü ayarlama
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const driversCol = collection(firestore, "drivers");
        const driverSnapshot = await getDocs(driversCol);
        const fetchedDrivers = driverSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((driver) => driver.isActive);

        setDrivers(fetchedDrivers);

        if (isEditing && editingOrder?.driverId) {
          const foundDriver = fetchedDrivers.find(
            (d) => d.id === editingOrder.driverId
          );
          if (foundDriver) {
            setSelectedDriverId(foundDriver.id);
            setDriverName(foundDriver.name);
            setDriverVehiclePlate(foundDriver.vehiclePlate);
          }
        } else if (fetchedDrivers.length > 0) {
          setSelectedDriverId(fetchedDrivers[0].id);
          setDriverName(fetchedDrivers[0].name);
          setDriverVehiclePlate(fetchedDrivers[0].vehiclePlate);
        } else {
          setSelectedDriverId(null);
          setDriverName("");
          setDriverVehiclePlate("");
        }
      } catch (error) {
        console.error("Sürücüler çekilirken hata oluştu: ", error);
        Alert.alert("Hata", "Sürücüler yüklenirken bir sorun oluştu.");
      }
    };
    fetchDrivers();
  }, [isEditing, editingOrder]);

  const handleDriverPickerChange = (itemValue) => {
    setSelectedDriverId(itemValue);
    if (itemValue) {
      const selectedDriver = drivers.find((d) => d.id === itemValue);
      if (selectedDriver) {
        setDriverName(selectedDriver.name);
        setDriverVehiclePlate(selectedDriver.vehiclePlate);
      }
    } else {
      setDriverName("");
      setDriverVehiclePlate("");
    }
  };

  // !!! BURASI ÖNEMLİ: Toplam tutarı ve satır toplamlarını yeniden hesapla !!!
  useEffect(() => {
    let currentTotal = 0;
    const updatedItems = items.map((item) => {
      const unitValue = parseFloat(item.quantityValue) || 0; // Birim başına miktar (örn: 6 metrekare)
      const count = parseInt(item.itemCount || "1") || 1; // Kaç adet/parça (örn: 4 adet)
      const basePrice = parseFloat(item.basePrice) || 0; // Birim fiyat (örn: m² fiyatı)

      // Toplam metrekare / adet / takım vb. miktarı
      const calculatedTotalQuantity = unitValue * count;

      // Satır toplamı: (toplam miktar * birim fiyat)
      const lineTotal = calculatedTotalQuantity * basePrice;

      currentTotal += lineTotal;
      return {
        ...item,
        calculatedTotalQuantity: parseFloat(calculatedTotalQuantity.toFixed(2)),
        lineTotal: parseFloat(lineTotal.toFixed(2)),
      };
    });
    setItems(updatedItems);
    setTotalAmount(parseFloat(currentTotal.toFixed(2)));
  }, [
    items.map((i) => i.quantityValue + i.basePrice + i.itemCount).join(""), // quantityValue, basePrice VEYA itemCount değiştiğinde tetikle
  ]);

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
        itemCount: "1",
        lineTotal: 0,
        calculatedTotalQuantity: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      Alert.alert(
        "Ürünü Sil",
        "Bu ürünü siparişten kaldırmak istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Sil",
            onPress: () => {
              const newItems = items.filter((_, i) => i !== index);
              setItems(newItems);
            },
          },
        ]
      );
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
        itemCount: "1",
        lineTotal: 0,
        calculatedTotalQuantity: 0,
      };
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleClearCustomer = () => {
    setCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerRegionName("");
  };

  const handleSubmitOrder = async () => {
    if (!customer && (!customerName || !customerPhone || !customerAddress)) {
      Alert.alert(
        "Hata",
        "Müşteri bilgileri eksik olamaz veya mevcut bir müşteri seçilmelidir."
      );
      return;
    }
    if (
      items.some(
        (item) => !item.productId || !item.quantityValue || !item.basePrice
      )
    ) {
      Alert.alert("Hata", "Lütfen tüm ürün bilgilerini eksiksiz giriniz.");
      return;
    }
    if (!selectedDriverId) {
      Alert.alert("Hata", "Lütfen siparişe atanacak bir sürücü seçin.");
      return;
    }

    setLoading(true);
    try {
      let customerIdToUse = customer ? customer.id : null;
      const finalCustomerName = customerName;
      const finalCustomerPhone = customerPhone;
      const finalCustomerAddress = customerAddress;
      const finalCustomerRegionName = customerRegionName;

      if (!customerIdToUse) {
        const newCustomerRef = await addDoc(
          collection(firestore, "customers"),
          {
            name: finalCustomerName,
            phone: finalCustomerPhone,
            address: finalCustomerAddress,
            regionName: finalCustomerRegionName,
            createdAt: serverTimestamp(),
          }
        );
        customerIdToUse = newCustomerRef.id;
        Alert.alert("Bilgi", "Yeni müşteri eklendi.");
      }

      const parsedDiscount = parseFloat(discountAmount) || 0;
      const parsedPaidAmount = parseFloat(paidAmount) || 0;
      const discountedTotal = Math.max(totalAmount - parsedDiscount, 0);
      const remainingAmount = discountedTotal - parsedPaidAmount;

      const orderData = {
        customerId: customerIdToUse,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        customerAddress: finalCustomerAddress,
        customerRegionName: finalCustomerRegionName,
        pickupDate: Timestamp.fromDate(pickupDate),
        deliveryDate: Timestamp.fromDate(deliveryDate),
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productCategory: item.productCategory,
          productUnit: item.productUnit,
          basePrice: parseFloat(item.basePrice) || 0,
          quantityValue: parseFloat(item.quantityValue) || 0, // Birim başına miktar
          itemCount: parseInt(item.itemCount || "1") || 1, // Adet
          calculatedTotalQuantity: item.calculatedTotalQuantity, // Yeni eklenen, toplam miktar (örn: Toplam 24 m²)
          lineTotal: item.lineTotal,
        })),
        totalAmount: totalAmount,
        discountAmount: parsedDiscount,
        discountedTotal: discountedTotal,
        paidAmount: parsedPaidAmount,
        remainingAmount: remainingAmount,
        status: "Teslim Alınacak",
        driverId: selectedDriverId,
        driverName: driverName,
        driverVehiclePlate: driverVehiclePlate,
        notes: orderNotes,
        orderDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (isEditing && editingOrder?.id) {
        const orderRef = doc(firestore, "orders", editingOrder.id);
        await updateDoc(orderRef, orderData);
        Alert.alert("Başarılı", "Sipariş başarıyla güncellendi!", [
          { text: "Tamam", onPress: () => navigation.navigate("MainTabs") },
        ]);
      } else {
        const orderRef = await addDoc(
          collection(firestore, "orders"),
          orderData
        );
        Alert.alert("Başarılı", "Yeni sipariş başarıyla kaydedildi!", [
          {
            text: "Tamam",
            onPress: () => {
              navigation.navigate("MainTabs");
              // Formu sıfırla
              setCustomer(null);
              setCustomerName("");
              setCustomerPhone("");
              setCustomerAddress("");
              setCustomerRegionName("");
              setItems([
                {
                  productId: "",
                  productName: "",
                  productCategory: "",
                  productUnit: "",
                  basePrice: "",
                  quantityValue: "",
                  itemCount: "1",
                  lineTotal: 0,
                  calculatedTotalQuantity: 0,
                },
              ]);
              setTotalAmount(0);
              setPaidAmount("");
              setDiscountAmount("");
              setPickupDate(new Date());
              setDeliveryDate(new Date());
              setOrderNotes("");
              setSelectedDriverId(drivers.length > 0 ? drivers[0].id : null);
              setDriverName(drivers.length > 0 ? drivers[0].name : "");
              setDriverVehiclePlate(
                drivers.length > 0 ? drivers[0].vehiclePlate : ""
              );
            },
          },
        ]);
      }
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

  const renderQuantityInputPlaceholder = (productUnit) => {
    switch (productUnit) {
      case "Metre Kare":
        return "m²/ürün"; // Ürün başına metrekare
      case "Adet":
        return "Adet/ürün"; // Ürün başına adet
      case "Takım":
        return "Takım/ürün"; // Ürün başına takım
      case "Metre Tül":
        return "mtül/ürün"; // Ürün başına metre tül
      default:
        return "Miktar/ürün";
    }
  };

  // Satır toplamı metnini güncelleyen yardımcı fonksiyon
  const getLineSummaryText = (item) => {
    const unitValue = parseFloat(item.quantityValue) || 0;
    const count = parseInt(item.itemCount || "1") || 1;
    const calculatedTotalQuantity = unitValue * count;

    if (!item.productUnit) {
      return `Toplam: ${(item.lineTotal || 0).toFixed(2)} TL`;
    }

    let unitText;
    switch (item.productUnit) {
      case "Metre Kare":
        unitText = "m²";
        break;
      case "Adet":
        unitText = "Adet";
        break;
      case "Takım":
        unitText = "Takım";
        break;
      case "Metre Tül":
        unitText = "mtül";
        break;
      default:
        unitText = "";
    }

    return `${count} Adet ${unitValue} ${unitText} (Toplam ${calculatedTotalQuantity.toFixed(
      2
    )} ${unitText}) | ${item.productName || "Ürün"} | ${(
      item.lineTotal || 0
    ).toFixed(2)} TL`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
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
        <Text style={styles.header}>
          {isEditing ? "Siparişi Düzenle" : "Yeni Sipariş Ekle"}
        </Text>

        {/* Müşteri Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          <TextInput
            style={styles.input}
            placeholder="Müşteri Adı Soyadı"
            value={customerName}
            onChangeText={setCustomerName}
            editable={!customer}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Müşteri Telefon"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
            editable={!customer}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Müşteri Adres"
            value={customerAddress}
            onChangeText={setCustomerAddress}
            editable={!customer}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Müşteri Bölge Adı"
            value={customerRegionName}
            onChangeText={setCustomerRegionName}
            editable={!customer}
            placeholderTextColor="#888"
          />
          {!customer ? (
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
          ) : (
            <TouchableOpacity
              style={styles.clearCustomerButton}
              onPress={handleClearCustomer}
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

        {/* Tarih Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarih Bilgileri</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPickupPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              Alış Tarihi: {pickupDate.toLocaleDateString("tr-TR")}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#34495E" />
          </TouchableOpacity>
          {showPickupPicker && (
            <DateTimePicker
              value={pickupDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPickupPicker(false);
                if (selectedDate) setPickupDate(selectedDate);
              }}
            />
          )}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDeliveryPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              Teslim Tarihi: {deliveryDate.toLocaleDateString("tr-TR")}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#34495E" />
          </TouchableOpacity>
          {showDeliveryPicker && (
            <DateTimePicker
              value={deliveryDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDeliveryPicker(false);
                if (selectedDate) setDeliveryDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Sürücü Seçimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sipariş Arabacısı</Text>
          {drivers.length > 0 ? (
            <>
              <View style={styles.driverPickerContainer}>
                <Picker
                  selectedValue={selectedDriverId}
                  onValueChange={(itemValue) =>
                    handleDriverPickerChange(itemValue)
                  }
                  style={styles.driverPicker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Sürücü Seçin..." value={null} />
                  {drivers.map((driver) => (
                    <Picker.Item
                      key={driver.id}
                      label={`${driver.name} - ${driver.vehiclePlate}`}
                      value={driver.id}
                    />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Sürücü Adı"
                value={driverName}
                editable={false}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Sürücü Araç Plakası"
                value={driverVehiclePlate}
                editable={false}
                placeholderTextColor="#888"
              />
            </>
          ) : (
            <Text style={styles.noDriversText}>
              Hiç aktif sürücü bulunamadı. Lütfen önce sürücü tanımlayın.
            </Text>
          )}
        </View>

        {/* Ürün Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ürün Bilgileri</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRowVertical}>
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
              <View style={{ height: 8 }} />

              <View style={styles.row}>
                {/* Ürün Başına Miktar Girişi (Metrekare/ürün, Adet/ürün vb.) */}
                <TextInput
                  style={[styles.smallInput, { flex: 0.35 }]}
                  placeholder={renderQuantityInputPlaceholder(item.productUnit)}
                  value={item.quantityValue}
                  onChangeText={(text) =>
                    handleItemChange(text, index, "quantityValue")
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />

                {/* Adet Girişi */}
                <TextInput
                  style={[styles.smallInput, { flex: 0.25, marginLeft: 10 }]}
                  placeholder="Adet"
                  value={item.itemCount}
                  onChangeText={(text) =>
                    handleItemChange(text, index, "itemCount")
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />

                {/* Birim Fiyat Girişi */}
                <TextInput
                  style={[styles.smallInput, { flex: 0.2, marginLeft: 10 }]}
                  placeholder="B.Fiyat"
                  value={item.basePrice}
                  onChangeText={(text) =>
                    handleItemChange(text, index, "basePrice")
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
              </View>

              {/* Satır Özeti ve Silme Butonu */}
              <View
                style={[
                  styles.row,
                  { marginTop: 10, justifyContent: "space-between" },
                ]}
              >
                <Text style={styles.lineTotalTextSummary}>
                  {getLineSummaryText(item)}
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
            placeholder="İndirim Tutarı"
            value={discountAmount}
            onChangeText={setDiscountAmount}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          <Text style={styles.totalAmountText}>
            İndirimli Tutar:
            {Math.max(
              totalAmount - (parseFloat(discountAmount) || 0),
              0
            ).toFixed(2)}
            TL
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
            Kalan Tutar:
            {(
              Math.max(totalAmount - (parseFloat(discountAmount) || 0), 0) -
              (parseFloat(paidAmount) || 0)
            ).toFixed(2)}
            TL
          </Text>
        </View>

        {/* Sipariş Notları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sipariş Notları</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Siparişle ilgili notlar (isteğe bağlı)"
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitOrder}
        >
          <Text style={styles.submitButtonText}>
            {isEditing ? "Siparişi Güncelle" : "Siparişi Kaydet"}
          </Text>
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
