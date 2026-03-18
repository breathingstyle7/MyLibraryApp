import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  Image, TextInput, Alert, Modal, KeyboardAvoidingView, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext);
  const [profiles, setProfiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Поля для реєстрації
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserImage, setNewUserImage] = useState(null);

  // Поля для входу
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [checkPassword, setCheckPassword] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    // ЯКЩО ТРЕБА СКИНУТИ ВСІ СТАРІ ПРОФІЛІ, РОЗКОМЕНТУЙ РЯДОК НИЖЧЕ НА ОДИН ЗАПУСК:
    // await AsyncStorage.removeItem('userProfiles'); 

    const savedProfiles = await AsyncStorage.getItem('userProfiles');
    if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setNewUserImage(result.assets[0].uri);
  };

  const handleCreateProfile = async () => {
    if (!newUserName.trim() || !newUserPassword.trim()) {
      return Alert.alert("Помилка", "Заповніть усі поля");
    }

    const newProfile = {
      id: Date.now().toString(),
      name: newUserName,
      password: newUserPassword,
      avatar: newUserImage,
    };

    const updatedProfiles = [...profiles, newProfile];
    await AsyncStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
    
    setNewUserName('');
    setNewUserPassword('');
    setNewUserImage(null);
    setModalVisible(false);
    Alert.alert("Успіх", "Профіль створено!");
  };

  const deleteProfile = (profileId) => {
    Alert.alert(
      "Видалити профіль?",
      "Це видалить тільки картку профілю зі списку.",
      [
        { text: "Скасувати", style: "cancel" },
        { 
          text: "Видалити", 
          style: "destructive", 
          onPress: async () => {
            const updated = profiles.filter(p => p.id !== profileId);
            setProfiles(updated);
            await AsyncStorage.setItem('userProfiles', JSON.stringify(updated));
          } 
        }
      ]
    );
  };

  const onProfilePress = (profile) => {
    setSelectedProfile(profile);
    setPassModalVisible(true);
  };

  const handleLogin = async () => {
    // Якщо пароля немає (старий профіль) або він вірний
    if (!selectedProfile.password || checkPassword === selectedProfile.password) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(selectedProfile));
      setPassModalVisible(false);
      setCheckPassword('');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      Alert.alert("Помилка", "Неправильний пароль");
    }
  };

  const renderProfileItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.profileCard} 
      onPress={() => onProfilePress(item)}
      onLongPress={() => deleteProfile(item.id)}
    >
      <View style={[styles.avatarWrapper, { borderColor: theme.primary }]}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
        ) : (
          <Ionicons name="person" size={50} color={theme.subText} />
        )}
      </View>
      <Text style={[styles.profileName, { color: theme.text, fontSize: fontSize }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 8 }]}>Хто читає сьогодні?</Text>
      
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={renderProfileItem}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <View style={[styles.addCircle, { borderColor: theme.subText }]}>
              <Ionicons name="add" size={40} color={theme.subText} />
            </View>
            <Text style={[styles.profileName, { color: theme.subText, fontSize: fontSize }]}>Створити</Text>
          </TouchableOpacity>
        }
      />

      {/* Модалка реєстрації */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Реєстрація</Text>
            
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {newUserImage ? (
                <Image source={{ uri: newUserImage }} style={styles.previewImg} />
              ) : (
                <Ionicons name="camera" size={40} color={theme.primary} />
              )}
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.subText, backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9' }]}
              placeholder="Ім'я"
              placeholderTextColor={theme.subText}
              value={newUserName}
              onChangeText={setNewUserName}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.subText, backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9' }]}
              placeholder="Пароль"
              placeholderTextColor={theme.subText}
              secureTextEntry
              value={newUserPassword}
              onChangeText={setNewUserPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: 'red', marginRight: 20 }}>Скасувати</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleCreateProfile}><Text style={{ color: theme.primary, fontWeight: 'bold' }}>Створити</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Модалка пароля */}
      <Modal visible={passModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Вхід: {selectedProfile?.name}</Text>
            
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.subText, backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9' }]}
              placeholder="Введіть пароль"
              placeholderTextColor={theme.subText}
              secureTextEntry
              autoFocus
              value={checkPassword}
              onChangeText={setCheckPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => {setPassModalVisible(false); setCheckPassword('');}}><Text style={{ color: theme.subText, marginRight: 20 }}>Назад</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleLogin}><Text style={{ color: theme.primary, fontWeight: 'bold' }}>Увійти</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, alignItems: 'center' },
  title: { fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  list: { paddingBottom: 20 },
  profileCard: { alignItems: 'center', margin: 15, width: 120 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#eee' },
  avatarImg: { width: '100%', height: '100%' },
  profileName: { marginTop: 10, fontWeight: '600', textAlign: 'center' },
  addBtn: { alignItems: 'center', margin: 15 },
  addCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 25, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  imagePicker: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  input: { width: '100%', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 10 }
});