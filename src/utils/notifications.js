// src/utils/notifications.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native"; // Alert'i import ettik
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // setDoc ve serverTimestamp'ı import ettik
import { firestore } from "../../src/firebaseConfig"; // Firebase config dosyanızın yolu

// Uygulama ön plandayken bildirimlerin nasıl davranacağını ayarlar
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Bildirim uyarısı gösterilsin mi?
    shouldPlaySound: false, // Ses çalsın mı?
    shouldSetBadge: false, // Uygulama ikonunda bildirim sayısı gösterilsin mi?
  }),
});

/**
 * Cihazın push token'ını kaydetmek ve Firestore'daki belirtilen kullanıcı belgesine eklemek/güncellemek için fonksiyon.
 * @param {string} userId - Bildirim token'ının kaydedileceği kullanıcının ID'si (Firebase Auth UID'si veya sabit bir ID).
 */
export async function registerForPushNotificationsAsync(userId) {
  let token;

  // Sadece fiziksel bir cihazda push bildirimleri çalışır (simülatörlerde çalışmaz)
  if (Device.isDevice) {
    // Mevcut bildirim izin durumunu kontrol et
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Eğer izin verilmemişse, izin iste
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Hala izin yoksa uyarı ver
    if (finalStatus !== "granted") {
      Alert.alert(
        "Bildirim İzni Gerekli",
        "Uygulamanın size bildirim göndermesi için bildirim izni vermeniz gerekiyor."
      );
      return;
    }

    // Expo Push Token'ını al
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);

    // Android için bildirim kanalı ayarla (Android 8.0+ için zorunlu)
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX, // Maksimum önem (sesli, titreşimli)
        vibrationPattern: [0, 250, 250, 250], // Titreşim deseni
        lightColor: "#FF231F7C", // Bildirim ışığı rengi
      });
    }

    // Eğer bir userId varsa, token'ı Firestore'daki ilgili kullanıcı belgesine kaydet
    // setDoc kullanılarak belge yoksa oluşturulur, varsa güncellenir.
    if (userId && token) {
      try {
        const userRef = doc(firestore, "users", userId); // 'users' koleksiyonunda, userId'ye sahip belge
        await setDoc(
          userRef,
          {
            expoPushToken: token,
            deviceType: Platform.OS,
            lastUpdated: serverTimestamp(), // Kaydın veya güncellemenin zaman damgası
          },
          { merge: true }
        ); // merge: true, mevcut alanları korur, sadece belirtilen alanları günceller/ekler
        console.log("Expo Push Token Firestore'a başarıyla kaydedildi.");
      } catch (e) {
        console.error("Expo Push Token Firestore'a kaydedilirken hata:", e);
        Alert.alert("Hata", "Bildirim token'ı kaydedilirken bir sorun oluştu.");
      }
    }
  } else {
    // Cihaz bir simülatörse veya push bildirimlerini desteklemiyorsa
    Alert.alert(
      "Uyarı",
      "Cihazınız push bildirimlerini desteklemiyor veya simülatörde çalıştırıyorsunuz. Push bildirimleri yalnızca gerçek cihazlarda çalışır."
    );
  }

  return token;
}

// Uygulama açıkken gelen bildirimleri dinlemek için
export const setupNotificationListeners = () => {
  // Bildirim alındığında (uygulama ön plandayken)
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Uygulama açıkken bildirim alındı:", notification);
      // Burada gelen bildirime göre UI güncellemeleri veya başka işlemler yapabilirsiniz.
      // Örneğin, anlık bir mesaj gösterme.
    }
  );

  // Kullanıcı bir bildirime tıkladığında veya etkileşimde bulunduğunda
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Bildirime tıklandı/etkileşimde bulunuldu:", response);
      // Kullanıcı bildirimden uygulamanıza geldiğinde ne olacağını burada yönetebilirsiniz.
      // Örneğin, belirli bir ekrana yönlendirme:
      // const screen = response.notification.request.content.data.screen;
      // if (screen) { navigation.navigate(screen); }
    });

  // Component unmount olduğunda dinleyicileri kaldırmak için temizleme fonksiyonu döndür
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};
