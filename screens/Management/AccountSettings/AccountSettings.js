import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../../src/firebaseConfig"; // Firebase yapılandırmanızın doğru yolu
import styles from "./AccountSettingsStyles";

const AccountSettings = () => {
  const auth = getAuth();
  const user = auth.currentUser; // Giriş yapmış mevcut kullanıcı
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Mevcut şifre (yeniden kimlik doğrulama için)
  const [newPassword, setNewPassword] = useState(""); // Yeni şifre
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Firebase Auth'tan e-posta ve görünen adı al
        setEmail(user.email || "");
        setName(user.displayName || "");

        // Firestore'dan ek kullanıcı verilerini çek (varsa)
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Eğer Firestore'da daha detaylı bir isim saklıyorsan buradan alabilirsin
          setName(userData.name || user.displayName || "");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]); // Kullanıcı bilgisi değiştiğinde tekrar çek

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert(
        "Hata",
        "Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın."
      );
      return;
    }
    setIsUpdating(true);
    let changesMade = false;

    try {
      // 1. Ad Soyad Güncelleme (Firebase Auth ve Firestore)
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
        // Firestore'da da kullanıcının adını güncelle (veya ilk kez kaydet)
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { name: name }, { merge: true }); // Merge ile sadece name alanını günceller
        changesMade = true;
      }

      // 2. E-posta Güncelleme (Firebase Auth)
      if (email !== user.email) {
        // E-posta değiştirmek için genellikle mevcut şifreyle yeniden kimlik doğrulama gerekir.
        // Basitlik adına şimdilik direkt updateEmail kullandım.
        // Gerçek uygulamada: reauthenticateWithCredential kullanmalısın.
        if (currentPassword) {
          const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
          );
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, email);
          changesMade = true;
        } else {
          Alert.alert(
            "E-posta Güncelleme",
            "E-posta adresinizi değiştirmek için mevcut şifrenizi girmelisiniz."
          );
          setIsUpdating(false);
          return;
        }
      }

      if (changesMade) {
        Alert.alert("Başarılı", "Hesap bilgileriniz güncellendi.");
      } else {
        Alert.alert("Bilgi", "Herhangi bir değişiklik yapılmadı.");
      }
    } catch (error) {
      console.error("Profil güncellenirken hata:", error);
      let errorMessage = "Hesap bilgileri güncellenirken bir sorun oluştu.";
      if (error.code === "auth/requires-recent-login") {
        errorMessage =
          "Güvenlik nedeniyle, bu işlemi tamamlamak için yakın zamanda giriş yapmış olmanız gerekmektedir. Lütfen çıkış yapıp tekrar giriş yaparak tekrar deneyin.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Geçersiz e-posta formatı.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Bu e-posta adresi zaten kullanımda.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage =
          "E-postayı güncellemek için girdiğiniz mevcut şifre yanlış.";
      }
      Alert.alert("Hata", errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      Alert.alert(
        "Hata",
        "Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın."
      );
      return;
    }
    if (!currentPassword || !newPassword) {
      Alert.alert("Uyarı", "Mevcut ve yeni şifre alanlarını doldurmalısınız.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Uyarı", "Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    setIsUpdating(true);
    try {
      // Şifre değiştirmek için mevcut şifreyle yeniden kimlik doğrulama şarttır
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
      setNewPassword(""); // Yeni şifre alanını temizle
      setCurrentPassword(""); // Mevcut şifre alanını temizle
    } catch (error) {
      console.error("Şifre değiştirilirken hata:", error);
      let errorMessage = "Şifre değiştirilirken bir sorun oluştu.";
      if (error.code === "auth/wrong-password") {
        errorMessage = "Mevcut şifreniz yanlış.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage =
          "Güvenlik nedeniyle, şifrenizi değiştirmek için yakın zamanda giriş yapmış olmanız gerekmektedir. Lütfen çıkış yapıp tekrar giriş yaparak tekrar deneyin.";
      }
      Alert.alert("Hata", errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Hesap bilgileri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hesap Ayarları</Text>

      <Text style={styles.label}>Ad Soyad</Text>
      <TextInput
        style={styles.input}
        placeholder="Adınızı girin"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#888"
        editable={!isUpdating} // Güncelleme sırasında düzenlemeyi engelle
      />

      <Text style={styles.label}>E-posta</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta adresiniz"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#888"
        editable={!isUpdating}
      />

      <TouchableOpacity
        style={isUpdating ? styles.disabledButton : styles.saveButton}
        onPress={handleSaveProfile}
        disabled={isUpdating}
      >
        <Text style={styles.saveButtonText}>
          {isUpdating ? "Kaydediliyor..." : "Profili Kaydet"}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Şifreyi Değiştir</Text>
      <Text style={styles.label}>Mevcut Şifre</Text>
      <TextInput
        style={styles.input}
        placeholder="Mevcut şifreniz"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        placeholderTextColor="#888"
        editable={!isUpdating}
      />
      <Text style={styles.label}>Yeni Şifre</Text>
      <TextInput
        style={styles.input}
        placeholder="Yeni şifreniz (min 6 karakter)"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholderTextColor="#888"
        editable={!isUpdating}
      />

      <TouchableOpacity
        style={isUpdating ? styles.disabledButton : styles.saveButton}
        onPress={handleChangePassword}
        disabled={isUpdating}
      >
        <Text style={styles.saveButtonText}>
          {isUpdating ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountSettings;
