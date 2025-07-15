import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1, // Full ekranı kapla
    backgroundColor: "#F5F7FA", // Açık gri arka plan
  },
  scrollContent: {
    flexGrow: 1, // ScrollView içeriğinin büyümesini sağlar
    padding: 20,
    paddingBottom: 50, // Kaydırma için ekstra boşluk
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 25,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12, // Daha yuvarlak köşeler
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // Daha belirgin gölge
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Android için gölge
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
    paddingBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600", // Kalınlığı artırdık
    color: "#34495E",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F9F9FB", // Hafif farklı arka plan
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 14 : 12, // iOS'ta biraz daha yüksek
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D5DBE1",
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top", // Android'de metnin yukarıdan başlamasını sağlar
  },
  // Yeni eklenen notlar input stili
  notesInput: {
    height: 120, // Daha uzun bir not alanı için yükseklik
    paddingTop: 12, // Metnin yukarıdan başlaması için
    paddingBottom: 12,
  },
  pickerContainer: {
    backgroundColor: "#F9F9FB", // Input ile aynı arka plan
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D5DBE1",
    overflow: "hidden", // iOS'ta kenarlıkların taşmasını engeller
  },
  picker: {
    height: Platform.OS === "ios" ? 180 : 50, // iOS'ta daha uzun picker, Android'de standart yükseklik
    width: "100%",
    color: "#333",
  },
  pickerItem: {
    fontSize: 16, // Picker item yazı boyutu
    color: "#333",
  },
  button: {
    backgroundColor: "#007BFF", // Mavi buton rengi
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000", // Gölgeler
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  activityIndicator: {
    marginTop: 20,
    marginBottom: 20,
  },
  // Müşteri Seç / Temizle Butonları
  selectCustomerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28A745", // Yeşil renk
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectCustomerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearCustomerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC3545", // Kırmızı renk
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  clearCustomerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Tarih Butonları
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9FB",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D5DBE1",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  // Sürücü Picker ve Text Input'lar
  driverPickerContainer: {
    backgroundColor: "#F9F9FB",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D5DBE1",
    overflow: "hidden",
  },
  driverPicker: {
    height: Platform.OS === "ios" ? 180 : 50,
    width: "100%",
    color: "#333",
  },
  noDriversText: {
    fontSize: 15,
    color: "#DC3545",
    textAlign: "center",
    paddingVertical: 10,
  },
  // Ürün Bilgileri Satırları
  itemRowVertical: {
    backgroundColor: "#FDFDFD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap", // Küçük ekranlarda sarmalama için
  },
  smallInput: {
    flex: 1, // Esnek genişlik
    marginRight: 10, // Sağında boşluk bırak
    backgroundColor: "#F9F9FB",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D5DBE1",
    fontSize: 15,
    color: "#333",
    minWidth: 80, // Minimum genişlik
  },
  lineTotalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF", // Mavi renkte göster
    minWidth: 90, // Sabit genişlik
    textAlign: "right", // Sağa hizala
  },
  removeButton: {
    padding: 5,
    marginLeft: 10, // Solunda boşluk bırak
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17A2B8", // Turkuaz renk
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addItemButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Ödeme Bilgileri Textleri
  totalAmountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: 10,
    textAlign: "right",
  },
  remainingAmountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC3545", // Kalan tutar için kırmızı
    marginBottom: 15,
    textAlign: "right",
    marginTop: 10,
  },
  // Kaydet/Güncelle Butonu
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28A745", // Onay için yeşil
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Yükleme Ekranı Stilleri
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});

export default styles;
