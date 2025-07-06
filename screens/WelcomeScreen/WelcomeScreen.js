import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import styles from "./WelcomeScreenStyles";

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") {
        navigation.replace("MainTabs");
      }
    };
    checkLogin();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Hoş Geldiniz!</Text>
      <Text style={styles.subtitle}>
        Halı Takip Uygulaması ile işinizi kolayca yönetin.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={[styles.buttonText, { color: "#2C3E50" }]}>Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;
