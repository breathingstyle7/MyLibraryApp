import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native'; // Для оновлення даних при переході на екран

export default function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleTheme, fontSize, updateFontSize, theme } = useContext(ThemeContext);
  const [currentUser, setCurrentUser] = useState(null);
  const isFocused = useIsFocused();

  // Оновлюємо дані користувача щоразу, коли екран стає активним
  useEffect(() => {
    if (isFocused) {
      const getUser = async () => {
        try {
          const userJson = await AsyncStorage.getItem('currentUser');
          if (userJson) setCurrentUser(JSON.parse(userJson));
        } catch (e) {
          console.error("Помилка завантаження профілю в налаштуваннях", e);
        }
      };
      getUser();
    }
  }, [isFocused]);

  const handleLogout = async () => {
    Alert.alert("Вихід", "Ви впевнені, що хочете вийти?", [
      { text: "Скасувати", style: "cancel" },
      { text: "Вийти", onPress: async () => {
        await AsyncStorage.removeItem('currentUser');
        navigation.replace('Login');
      }}
    ]);
  };

  const clearLibrary = async () => {
    if (!currentUser) return;
    const storageKey = `books_${currentUser.id}`;

    Alert.alert(
      "Небезпечна зона!",
      "Видалити всі ваші книги? Цю дію неможливо скасувати.",
      [
        { text: "Скасувати", style: "cancel" },
        { text: "Видалити все", style: "destructive", onPress: async () => {
            await AsyncStorage.removeItem(storageKey);
            Alert.alert("Готово", "Ваша бібліотека тепер порожня.");
        }}
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text, fontSize: fontSize + 8 }]}>Налаштування</Text>

      {/* БЛОК ПРОФІЛЮ */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <View style={styles.row}>
          <View style={styles.iconRow}>
            <View style={[styles.avatar, { backgroundColor: theme.primary, overflow: 'hidden' }]}>
              {currentUser?.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</Text>
              )}
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={[styles.userName, { color: theme.text, fontSize: fontSize }]}>{currentUser?.name || 'Користувач'}</Text>
              <Text style={{ color: theme.subText, fontSize: fontSize - 4 }}>Ваш профіль</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={26} color="#ff4d4d" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.subText, fontSize: fontSize - 2 }]}>ВИГЛЯД</Text>

      {/* Темний режим */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={22} color={theme.primary} />
            <Text style={[styles.label, { color: theme.text, fontSize: fontSize }]}>Темний режим</Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.primary }}
          />
        </View>
      </View>

      {/* Розмір шрифту */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.text, fontSize: fontSize, marginBottom: 15, marginLeft: 0 }]}>
          Розмір тексту
        </Text>
        <View style={styles.fontSizeRow}>
          {[14, 16, 20].map(size => (
            <TouchableOpacity 
              key={size} 
              style={[
                styles.sizeBtn, 
                { borderColor: theme.subText },
                fontSize === size && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
              onPress={() => updateFontSize(size)}
            >
              <Text style={{ color: fontSize === size ? '#fff' : theme.text, fontWeight: 'bold' }}>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ПРО ДОДАТОК */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.row} onPress={() => Alert.alert("Версія", "MyLibrary App v2.1.0\nРозроблено Романом")}>
          <View style={styles.iconRow}>
            <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
            <Text style={[styles.label, { color: theme.text, fontSize: fontSize }]}>Про додаток</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.subText} />
        </TouchableOpacity>
      </View>

      {/* Небезпечна зона */}
      <Text style={[styles.dangerHeader, { fontSize: fontSize - 4 }]}>НЕБЕЗПЕЧНА ЗОНА</Text>
      <TouchableOpacity style={styles.deleteBtn} onPress={clearLibrary}>
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.deleteBtnText}>Видалити всі книги</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontWeight: 'bold', marginBottom: 25, marginTop: 10 },
  section: { padding: 18, borderRadius: 20, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle: { marginLeft: 10, marginBottom: 10, fontWeight: 'bold', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  userName: { fontWeight: 'bold' },
  label: { marginLeft: 15, fontWeight: '600' },
  fontSizeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sizeBtn: { width: '30%', paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  dangerHeader: { color: '#ff4d4d', fontWeight: 'bold', marginBottom: 10, marginLeft: 10, letterSpacing: 1 },
  deleteBtn: { backgroundColor: '#ff4d4d', flexDirection: 'row', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  deleteBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 }
});