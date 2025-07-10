// src/components/DatePickerHeader.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const DatePickerHeader = ({ selectedDate, onDateChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      onDateChange(date);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <View style={pickerStyles.dateHeader}>
      <TouchableOpacity
        onPress={goToPreviousDay}
        style={pickerStyles.arrowButton}
      >
        <Ionicons name="chevron-back-outline" size={28} color="#2C3E50" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={pickerStyles.dateDisplay}
      >
        <Text style={pickerStyles.dateText}>
          {selectedDate.toLocaleDateString("tr-TR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToNextDay} style={pickerStyles.arrowButton}>
        <Ionicons name="chevron-forward-outline" size={28} color="#2C3E50" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
  },
  arrowButton: {
    padding: 8,
  },
  dateDisplay: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
});

export default DatePickerHeader;
