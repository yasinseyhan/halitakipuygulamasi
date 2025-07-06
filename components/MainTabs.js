import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen";
import Management from "../screens/Management/Management";
import Reports from "../screens/Reports/Reports";
import Support from "../screens/Support/Support";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";

const Tab = createBottomTabNavigator();

const getHeaderTitle = (routeName) => {
  switch (routeName) {
    case "Home":
      return "DEMO HALI YIKAMA ";
    case "Management":
      return "DEMO HALI YIKAMA ";
    case "Reports":
      return "DEMO HALI YIKAMA ";
    case "Support":
      return "DEMO HALI YIKAMA ";
    default:
      return "";
  }
};

const ScreenWithHeader = (Component, title) => (props) =>
  (
    <View style={styles.container}>
      <AppHeader title={title} />
      <View style={styles.content}>
        <Component {...props} />
      </View>
    </View>
  );

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <BottomNav {...props} />}
  >
    <Tab.Screen
      name="Home"
      children={(props) =>
        ScreenWithHeader(HomeScreen, "DEMO HALI YIKAMA")(props)
      }
    />
    <Tab.Screen
      name="Management"
      children={(props) =>
        ScreenWithHeader(Management, "DEMO HALI YIKAMA ")(props)
      }
    />
    <Tab.Screen
      name="Reports"
      children={(props) =>
        ScreenWithHeader(Reports, "DEMO HALI YIKAMA ")(props)
      }
    />
    <Tab.Screen
      name="Support"
      children={(props) =>
        ScreenWithHeader(Support, "DEMO HALI YIKAMA ")(props)
      }
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEEEEE" },
  content: { flex: 1 },
});

export default MainTabs;
