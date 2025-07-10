import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// GİRİŞ EKRANLARI
import WelcomeScreen from "./WelcomeScreen/WelcomeScreen";
import SignUpScreen from "./SignUpScreen/SignUpScreen";
import LoginScreen from "./Login/Login";

// ANA EKRANLAR
import HomeScreen from "./Home/HomeScreen";
import Received from "./Home/CarpetOperations/Received/Received";
import ToBeReceived from "./Home/CarpetOperations/ToBeReceived/ToBeReceived";
import Ready from "./Home/CarpetOperations/Ready/Ready";
import InWashing from "./Home/CarpetOperations/InWashing/InWashing";
import ToBeDelivered from "./Home/CarpetOperations/ToBeDelivered/ToBeDelivered";
import Delivered from "./Home/CarpetOperations/Delivered/Delivered";
import AddOrder from "./Home/OrderOperations/AddOrder/AddOrder";
import SearchOrder from "./Home/OrderOperations/SearchOrder/SearchOrder";
import AddCustomer from "./Home/CustomerOperations/AddCustomer/AddCustomer";
import SearchCustomer from "./Home/CustomerOperations/SearchCustomer/SearchCustomer";
import CashBank from "./Home/CashOperations/CashBank";
import AddIncome from "./Home/CashOperations/AddIncome/AddInCome";
import AddExpense from "./Home/CashOperations/AddExpense/AddExpense";
import DailySummary from "./Home/DailySummary/DailySummary";

// YÖNETİM EKRANLARI AYARLARI
import Management from "./Management/Management";
import CompanySettings from "./Management/CompanySettings/CompanySettings";
import SmsSettings from "./Management/SmsSettings/SmsSettings";
import AccountSettings from "./Management/AccountSettings/AccountSettings";

// TANIMLAMALAR EKRANLARI VE AYARLARI
import Definitions from "./Management/Definitions/Definitions";
import RegionDefinition from "./Management/Definitions/RegionDefinition/RegionDefinition";
import VehicleDefinition from "./Management/Definitions/VehicleDefinition/VehicleDefinition";
import ProductDefinition from "./Management/Definitions/ProductDefinition/ProductDefinition";
import MessageTemplates from "./Management/Definitions/MessageTemplates/MessageTemplates";
import Reports from "./Reports/Reports";
import Support from "./Support/Support";
import MainTabs from "../components/MainTabs";

// DİĞER EKRANLAR
import CustomerDetailScreen from "./Home/CustomerOperations/CustomerDetailScreen/CustomerDetailScreen";
import OrderDetailScreen from "./Home/OrderOperations/OrderDeatilScreen/OrderDetailScreen";
import CreditBookScreen from "./Home/OrderOperations/CreditBook/CreditBook";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs">
        {/* Giriş Ekranları */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        {/* ANA EKRANLAR */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ToBeReceived"w
          component={ToBeReceived}
          options={{
            title: "Teslim Alınacaklar",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Received"
          component={Received}
          options={{
            title: "Teslim Alınanlar",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Ready"
          component={Ready}
          options={{
            title: "Hazır Olanlar",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="InWashing"
          component={InWashing}
          options={{
            title: "Yıkanmada Olanlar",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="ToBeDelivered"
          component={ToBeDelivered}
          options={{
            title: "Teslim Edilecekler",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Delivered"
          component={Delivered}
          options={{
            title: "Teslim Edilenler",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="AddOrder"
          component={AddOrder}
          options={{
            title: "Sipariş Ekle",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="SearchOrder"
          component={SearchOrder}
          options={{
            title: "Sipariş Ara",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="AddCustomer"
          component={AddCustomer}
          options={{
            title: "Müşteri Ekle",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="SearchCustomer"
          component={SearchCustomer}
          options={{
            title: "Müşteri Listesi",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        {/* Yeni Eklenen Müşteri Detay Ekranı */}
        <Stack.Screen
          name="CustomerDetail"
          component={CustomerDetailScreen}
          options={{
            title: "Müşteri Detayı",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="CreditBook"
          component={CreditBookScreen}
          options={{ title: "Veresiye Defteri" }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{
            title: "Sipariş Detayı",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="CashBank"
          component={CashBank}
          options={{
            title: "Kasa İşlemleri",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="AddIncome" // Bu isimle sayfaya navigate edeceksiniz
          component={AddIncome}
          options={{
            title: "Yeni Gelir Ekle",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpense}
          options={{
            title: "Gider Ekle",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="DailySummary"
          component={DailySummary}
          options={{
            title: "Gün Özeti",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        {/* YÖNETİM EKRANLARI */}
        <Stack.Screen
          name="Management"
          component={Management}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompanySettings"
          component={CompanySettings}
          options={{
            title: "Firma Ayarları",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Definitions"
          component={Definitions}
          options={{
            title: "Tanımlamalar",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="RegionDefinition"
          component={RegionDefinition}
          options={{
            title: "Bölge Tanımla",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="VehicleDefinition"
          component={VehicleDefinition}
          options={{
            title: "Araç Tanımla",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="ProductDefinition"
          component={ProductDefinition}
          options={{
            title: "Ürün Tanımla",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="MessageTemplates"
          component={MessageTemplates}
          options={{
            title: "Mesaj Şablonları",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="SmsSettings"
          component={SmsSettings}
          options={{
            title: "SMS Ayarları",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettings}
          options={{
            title: "Hesap Ayarları",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        {/* RAPORLAR EKRANLARI */}
        <Stack.Screen
          name="Reports" // Bu isimle sayfaya navigate edeceksiniz
          component={Reports}
          options={{
            title: "Finansal Raporlar",
            headerStyle: { backgroundColor: "#2C3E50" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        {/* DESTEK EKRANLARI */}
        <Stack.Screen
          name="Support"
          component={Support}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
