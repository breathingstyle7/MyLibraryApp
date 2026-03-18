import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

export default function DetailsScreen({ route, navigation }) {
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext);
  const { book: initialBook } = route.params;
  
  const [book, setBook] = useState(initialBook);
  const [rating, setRating] = useState(initialBook.rating || 0);
  const [quotes, setQuotes] = useState(initialBook.quotes || []);
  
  // Стани для модального вікна цитат
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newQuote, setNewQuote] = useState('');

  const getStorageKey = async () => {
    const userJson = await AsyncStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      return `books_${user.id}`;
    }
    return 'myBooks';
  };

  const saveUpdatedBook = async (updatedBook) => {
    try {
      const storageKey = await getStorageKey();
      const savedBooks = await AsyncStorage.getItem(storageKey);
      let books = savedBooks ? JSON.parse(savedBooks) : [];
      const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedBooks));
    } catch (error) {
      Alert.alert("Помилка", "Не вдалося зберегти зміни");
    }
  };

  const updateRating = (newRating) => {
    const updatedBook = { ...book, rating: newRating };
    setRating(newRating);
    setBook(updatedBook);
    saveUpdatedBook(updatedBook);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const updatedBook = { ...book, imageUri: result.assets[0].uri };
      setBook(updatedBook);
      saveUpdatedBook(updatedBook);
    }
  };

  const toggleStatus = async () => {
    const newStatus = book.status === 'Прочитано' ? 'В планах' : 'Прочитано';
    const updatedBook = { ...book, status: newStatus };
    setBook(updatedBook);
    saveUpdatedBook(updatedBook);
  };

  const deleteBook = async () => {
    Alert.alert("Видалення", "Ви точно хочете видалити цю книгу?", [
      { text: "Скасувати", style: "cancel" },
      { text: "Видалити", style: "destructive", onPress: async () => {
          const storageKey = await getStorageKey();
          const savedBooks = await AsyncStorage.getItem(storageKey);
          const books = savedBooks ? JSON.parse(savedBooks) : [];
          const filteredBooks = books.filter(b => b.id !== book.id);
          await AsyncStorage.setItem(storageKey, JSON.stringify(filteredBooks));
          navigation.goBack();
      }}
    ]);
  };

  // Функції для цитат
  const addQuote = () => {
    if (!newQuote.trim()) return;
    const updatedQuotes = [...quotes, { id: Date.now().toString(), text: newQuote }];
    const updatedBook = { ...book, quotes: updatedQuotes };
    setQuotes(updatedQuotes);
    setBook(updatedBook);
    saveUpdatedBook(updatedBook);
    setNewQuote('');
    setIsModalVisible(false);
  };

  const deleteQuote = (quoteId) => {
    const updatedQuotes = quotes.filter(q => q.id !== quoteId);
    const updatedBook = { ...book, quotes: updatedQuotes };
    setQuotes(updatedQuotes);
    setBook(updatedBook);
    saveUpdatedBook(updatedBook);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.imageContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.7} style={styles.imageWrapper}>
          {book.imageUri ? (
            <Image source={{ uri: book.imageUri }} style={styles.coverImage} />
          ) : (
            <View style={[styles.placeholder, { borderColor: theme.subText }]}>
              <Ionicons name="book" size={100} color={theme.subText} />
              <Text style={{ color: theme.subText, marginTop: 10, fontSize: fontSize - 4 }}>Додати фото</Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 8 }]}>{book.title}</Text>
        <Text style={[styles.author, { color: theme.subText, fontSize: fontSize }]}>{book.author}</Text>
        
        {/* ІНТЕРАКТИВНИЙ РЕЙТИНГ */}
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => updateRating(star)}>
              <Ionicons 
                name={star <= rating ? "star" : "star-outline"} 
                size={35} 
                color={star <= rating ? "#FFD700" : theme.subText} 
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statusLabel, { color: theme.text, fontSize: fontSize }]}>
            Рік: <Text style={{fontWeight: 'normal'}}>{book.year}</Text>
          </Text>
          <Text style={[styles.statusLabel, { color: theme.text, fontSize: fontSize, marginTop: 5 }]}>
            Статус: <Text style={{ color: book.status === 'Прочитано' ? '#4caf50' : theme.primary }}>{book.status}</Text>
          </Text>
        </View>

        {/* СЕКЦІЯ ЦИТАТ */}
        <View style={styles.quotesHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: fontSize + 2 }]}>Цитати</Text>
          <TouchableOpacity 
            style={[styles.addQuoteBtn, { backgroundColor: theme.primary }]} 
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {quotes.length === 0 ? (
          <View style={[styles.emptyQuotes, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.subText, fontStyle: 'italic' }}>Цитат поки немає...</Text>
          </View>
        ) : (
          quotes.map((q) => (
            <View key={q.id} style={[styles.quoteItem, { backgroundColor: theme.card }]}>
              <Ionicons name="quote" size={16} color={theme.primary} style={{ marginBottom: 5 }} />
              <Text style={[styles.quoteText, { color: theme.text, fontSize: fontSize - 1 }]}>{q.text}</Text>
              <TouchableOpacity style={styles.quoteDelete} onPress={() => deleteQuote(q.id)}>
                <Ionicons name="close-circle" size={18} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.primary, marginTop: 25 }]} 
          onPress={toggleStatus}
        >
          <Ionicons name="swap-horizontal" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.buttonText}>Змінити статус</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={deleteBook}>
          <Ionicons name="trash-outline" size={18} color="#ff4444" />
          <Text style={styles.deleteText}>Видалити книгу</Text>
        </TouchableOpacity>
      </View>

      {/* Модалка для додавання цитати */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Додати цитату</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.subText, backgroundColor: theme.background }]}
              multiline
              placeholder="Введіть текст цитати..."
              placeholderTextColor={theme.subText}
              value={newQuote}
              onChangeText={setNewQuote}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: '#ff4444' }}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addQuote} style={[styles.modalAdd, { backgroundColor: theme.primary }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Зберегти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { height: 320, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  imageWrapper: { width: 190, height: 260, borderRadius: 15, elevation: 15, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10 },
  coverImage: { width: '100%', height: '100%', borderRadius: 15 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderRadius: 15 },
  editBadge: { position: 'absolute', bottom: -5, right: -5, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  infoSection: { padding: 25 },
  title: { fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  author: { marginBottom: 15, textAlign: 'center', fontWeight: '500' },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  statusCard: { padding: 15, borderRadius: 15, marginBottom: 20 },
  statusLabel: { fontWeight: 'bold' },
  quotesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontWeight: 'bold' },
  addQuoteBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  emptyQuotes: { padding: 15, borderRadius: 12, alignItems: 'center' },
  quoteItem: { padding: 15, borderRadius: 12, marginBottom: 10, position: 'relative' },
  quoteText: { fontStyle: 'italic', lineHeight: 22, paddingRight: 20 },
  quoteDelete: { position: 'absolute', top: 5, right: 5 },
  actionButton: { flexDirection: 'row', padding: 16, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  deleteText: { color: '#ff4444', marginLeft: 8, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 20, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { height: 120, borderWidth: 1, borderRadius: 12, padding: 15, textAlignVertical: 'top', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancel: { padding: 12 },
  modalAdd: { padding: 12, paddingHorizontal: 30, borderRadius: 10 }
});