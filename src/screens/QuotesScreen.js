import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function QuotesScreen() {
  const [allQuotes, setAllQuotes] = useState([]);
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadAllQuotes();
    }
  }, [isFocused]);

  const loadAllQuotes = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) return;
      const user = JSON.parse(userJson);
      const storageKey = `books_${user.id}`;

      const savedBooks = await AsyncStorage.getItem(storageKey);
      if (savedBooks) {
        const books = JSON.parse(savedBooks);
        let quotesAccumulator = [];

        // Збираємо цитати з кожної книги
        books.forEach(book => {
          if (book.quotes && book.quotes.length > 0) {
            book.quotes.forEach(q => {
              quotesAccumulator.push({
                ...q,
                bookTitle: book.title,
                bookAuthor: book.author,
                bookImage: book.imageUri
              });
            });
          }
        });

        // Сортуємо: найновіші цитати вгорі
        setAllQuotes(quotesAccumulator.reverse());
      }
    } catch (e) {
      console.error("Помилка завантаження всіх цитат:", e);
    }
  };

  const renderQuote = ({ item }) => (
    <View style={[styles.quoteCard, { backgroundColor: theme.card }]}>
      <Ionicons name="chatbubble-ellipses" size={24} color={theme.primary} style={styles.quoteIcon} />      
      <Text style={[styles.quoteText, { color: theme.text, fontSize: fontSize }]}>
        {item.text}
      </Text>

      <View style={styles.bookInfoRow}>
        {item.bookImage ? (
          <Image source={{ uri: item.bookImage }} style={styles.miniCover} />
        ) : (
          <View style={[styles.miniCover, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="book" size={12} color={theme.subText} />
          </View>
        )}
        <View>
          <Text style={[styles.bookTitle, { color: theme.primary, fontSize: fontSize - 4 }]}>
            {item.bookTitle}
          </Text>
          <Text style={[styles.bookAuthor, { color: theme.subText, fontSize: fontSize - 5 }]}>
            {item.bookAuthor}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text, fontSize: fontSize + 10 }]}>Скарбниця думок 🖋️</Text>
      
      <FlatList
        data={allQuotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuote}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="reader-outline" size={80} color={theme.subText} />
            <Text style={[styles.emptyText, { color: theme.subText, fontSize: fontSize }]}>
              У вас поки немає збережених цитат. Додайте їх у деталях книги!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  list: { paddingBottom: 40 },
  quoteCard: { 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 15, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5 
  },
  quoteIcon: { marginBottom: 10 },
  quoteText: { fontStyle: 'italic', lineHeight: 24, marginBottom: 15 },
  bookInfoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(150,150,150,0.1)', 
    paddingTop: 10 
  },
  miniCover: { width: 30, height: 45, borderRadius: 4, marginRight: 10 },
  bookTitle: { fontWeight: 'bold', textTransform: 'uppercase' },
  bookAuthor: { marginTop: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, lineHeight: 22 }
});