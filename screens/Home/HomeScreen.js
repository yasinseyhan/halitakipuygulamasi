import { Text, View, TouchableOpacity, ScrollView } from "react-native";

import styles from "./HomeScreenStyles";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <MenuBox
            title="Teslim Alınacaklar"
            icon="📋"
            borderColor="#2196F3"
            onPress={() => navigation.navigate("ToBeReceived")}
          />
          <MenuBox
            title="Hazır Olanlar"
            icon="✔️"
            borderColor="#8BC34A"
            onPress={() => navigation.navigate("Ready")}
          />
        </View>

        <View style={styles.row}>
          <MenuBox
            title="Teslim Alınanlar"
            icon="🗃️"
            borderColor="#FFC107"
            onPress={() => navigation.navigate("Received")}
          />
          <MenuBox
            title="Teslim Edilecekler"
            icon="🚚"
            borderColor="#9E9E9E"
            onPress={() => navigation.navigate("ToBeDelivered")}
          />
        </View>
        <View style={styles.row}>
          <MenuBox
            title="Yıkamada Olanlar"
            icon="🧺"
            borderColor="#03A9F4"
            onPress={() => navigation.navigate("InWashing")}
          />
          <MenuBox
            title="Teslim Edilenler"
            icon="⚙️"
            borderColor="#FF9800"
            onPress={() => navigation.navigate("Delivered")}
          />
        </View>
        <View style={styles.row}>
          <BigButton
            title="Sipariş Ara"
            color="#03A9F4"
            icon="🔍"
            onPress={() => navigation.navigate("SearchOrder")}
          />
          <BigButton
            title="Sipariş Ekle"
            color="#2196F3"
            icon="➕"
            onPress={() => navigation.navigate("AddOrder")}
          />
        </View>
        <View style={styles.row}>
          <BigButton
            title="Müşteri Ekle"
            color="#4CAF50"
            icon="➕"
            onPress={() => navigation.navigate("AddCustomer")}
          />
          <BigButton
            title="Müşteri Listesi"
            color="#8BC34A"
            icon="🔍"
            onPress={() => navigation.navigate("SearchCustomer")}
          />
        </View>
        <View style={styles.row}>
          <MenuBox
            title="Kasa İşlemleri"
            icon="🧾"
            borderColor="#4CAF50"
            onPress={() => navigation.navigate("CashBank")}
          />
          <MenuBox
            title="Gün Özeti"
            icon="📄"
            borderColor="#9E9E9E"
            onPress={() => navigation.navigate("DailySummary")}
          />
        </View>
        <View style={styles.row}>
          <MenuBox
            title="Gelir Ekle"
            icon="₺"
            borderColor="#2196F3"
            onPress={() => navigation.navigate("AddIncome")}
          />
          <MenuBox
            title="Gider Ekle"
            icon="👜"
            borderColor="#F44336"
            onPress={() => navigation.navigate("AddExpense")}
          />
        </View>
        <View style={styles.row}>
          <MenuBox
            title="Veresiye Defteri"
            icon="📝" // Kalem veya defter ikonu, uygun bir emoji seçebiliriz.
            borderColor="#FF9800" // Turuncu tonu, diğerlerine uyumlu
            onPress={() => navigation.navigate("CreditBook")} // 'CreditBook' olarak tanımladığımız ekran adı
          />
          {/* İstersen buraya başka bir MenuBox ekleyebilir veya boş bırakabilirsin */}
          <MenuBox
            title="Hesap Ayarları" // Buton başlığını da AccountSettings'e uygun yapabiliriz
            icon="⚙️"
            borderColor="#607D8B"
            onPress={() => navigation.navigate("AccountSettings")} // AccountSettings sayfasına yönlendir
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Menu kutusu
function MenuBox({ title, color, icon, borderColor, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.menuBox, { borderRightColor: borderColor }]}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
      <View style={[styles.menuSideBar, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

// Büyük buton
function BigButton({ title, color, icon, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.bigButton, { borderColor: color }]}
      onPress={onPress}
    >
      <Text style={[styles.bigButtonIcon, { color }]}>{icon}</Text>
      <Text style={[styles.bigButtonText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default HomeScreen;
