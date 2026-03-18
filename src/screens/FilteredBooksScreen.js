import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext'; // Імпорт контексту

export default function FilteredBooksScreen({ route, navigation }) {
  const { filterType, title } = route.params;
  const [books, setBooks] = useState([]);
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext); // Отримуємо тему та шрифт

  useEffect(() => {
    navigation.setOptions({ 
      title: title,
      headerStyle: { backgroundColor: theme.card },
      headerTintColor: theme.text,
    });
    loadFilteredBooks();
  }, []);

  const loadFilteredBooks = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) {
        console.log("Юзера не знайдено!");
        return;
      }
      
      const user = JSON.parse(userJson);
      const storageKey = `books_${user.id}`;
      
      console.log("Завантажую книги для ключа:", storageKey); // Перевір це в терміналі VS Code

      // Отримуємо дані ТІЛЬКИ за персональним ключем
      const savedBooks = await AsyncStorage.getItem(storageKey);
      
      // ЯВНО ігноруємо 'myBooks'
      let allBooks = savedBooks ? JSON.parse(savedBooks) : [];
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      let filtered = [];
      if (filterType === 'all') {
        filtered = allBooks;
      } else if (filterType === 'read') {
        filtered = allBooks.filter(b => b.status === 'Прочитано');
      } else if (filterType === 'unread') {
        filtered = allBooks.filter(b => b.status === 'В планах');
      } else if (filterType === 'week') {
        filtered = allBooks.filter(b => b.createdAt && new Date(b.createdAt) > oneWeekAgo);
      }

      setBooks(filtered);
    } catch (error) {
      console.error("Помилка:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={books}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { borderBottomColor: isDarkMode ? '#333' : '#eee' }]} 
            onPress={() => navigation.navigate('Details', { book: item })}
          >
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.img} />
            ) : (
              <View style={[styles.img, { backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center' }]}>
                 <Text style={{fontSize: 10, color: theme.subText}}>N/A</Text>
              </View>
            )}
            <View>
              <Text style={[styles.title, { color: theme.text, fontSize: fontSize }]}>{item.title}</Text>
              <Text style={[styles.author, { color: theme.subText, fontSize: fontSize - 2 }]}>{item.author}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.subText, fontSize: fontSize }]}>
            Книг не знайдено
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, alignItems: 'center' },
  img: { width: 40, height: 60, borderRadius: 4, marginRight: 15 },
  title: { fontWeight: 'bold' },
  author: { marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50 }
});