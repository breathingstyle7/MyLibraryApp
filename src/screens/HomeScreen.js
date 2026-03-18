import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const [allBooks, setAllBooks] = useState([]); // Повний список книг
  const [filteredBooks, setFilteredBooks] = useState([]); // Список для відображення
  const [searchQuery, setSearchQuery] = useState('');
  const [isAscending, setIsAscending] = useState(true); // Сортування
  
  const isFocused = useIsFocused();
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext);

  const loadBooks = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        const storageKey = `books_${user.id}`;
        const savedBooks = await AsyncStorage.getItem(storageKey);
        
        if (savedBooks !== null) {
          const parsedBooks = JSON.parse(savedBooks);
          setAllBooks(parsedBooks);
          applyFilters(searchQuery, parsedBooks, isAscending);
        } else {
          setAllBooks([]);
          setFilteredBooks([]);
        }
      }
    } catch (error) {
      console.error("Помилка завантаження книг користувача", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadBooks();
    }
  }, [isFocused]);

  const applyFilters = (query, booksList, ascending) => {
    let updatedList = [...booksList];

    if (query) {
      updatedList = updatedList.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (ascending) {
      updatedList.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      updatedList.sort((a, b) => b.id.localeCompare(a.id)); 
    }

    setFilteredBooks(updatedList);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(text, allBooks, isAscending);
  };

  const toggleSort = () => {
    const nextSort = !isAscending;
    setIsAscending(nextSort);
    applyFilters(searchQuery, allBooks, nextSort);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.card,
          shadowColor: isDarkMode ? '#000' : '#999' 
        }
      ]}
      onPress={() => navigation.navigate('Details', { book: item })}
      activeOpacity={0.7}
    >
      <View style={styles.bookInfo}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.noImage, { backgroundColor: isDarkMode ? '#2c2c2c' : '#f0f0f0', borderColor: theme.subText }]}>
              <Ionicons name="book-outline" size={24} color={theme.subText} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 2 }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.author, { color: theme.subText, fontSize: fontSize - 1 }]}>
            {item.author}
          </Text>
          
          {/* ВІДОБРАЖЕННЯ РЕЙТИНГУ (ЗІРОЧОК) */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star} 
                name={star <= (item.rating || 0) ? "star" : "star-outline"} 
                size={14} 
                color={star <= (item.rating || 0) ? "#FFD700" : "#ccc"} 
                style={{ marginRight: 2 }}
              />
            ))}
          </View>

          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'Прочитано' ? '#4caf5020' : theme.primary + '20' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.status === 'Прочитано' ? '#4caf50' : theme.primary, fontSize: fontSize - 5 }
            ]}>
              {item.status || 'В планах'}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.subText} style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={[styles.searchHeader, { backgroundColor: theme.card }]}>
        <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? '#2c2c2c' : '#f0f0f0' }]}>
          <Ionicons name="search" size={20} color={theme.subText} style={{ marginLeft: 10 }} />
          <TextInput
            placeholder="Пошук..."
            placeholderTextColor={theme.subText}
            style={[styles.searchInput, { color: theme.text, fontSize: fontSize - 2 }]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={theme.subText} style={{ marginRight: 10 }} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={[styles.sortBtn, { backgroundColor: theme.primary }]} onPress={toggleSort}>
          <Ionicons name={isAscending ? "list" : "time-outline"} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          filteredBooks.length > 0 && (
            <Text style={[styles.resultsCount, { color: theme.subText, fontSize: fontSize - 4 }]}>
              Знайдено книг: {filteredBooks.length}
            </Text>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name={searchQuery ? "search-outline" : "library-outline"} size={100} color={theme.subText} />
            <Text style={[styles.emptyText, { color: theme.subText, fontSize: fontSize + 2 }]}>
              {searchQuery ? "Нічого не знайдено" : "Бібліотека порожня"}
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
        onPress={() => navigation.navigate('AddBook')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={35} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    height: '100%',
  },
  sortBtn: {
    width: 45,
    height: 45,
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsCount: { marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  list: { padding: 16, paddingBottom: 100 },
  card: { 
    padding: 15, borderRadius: 16, marginBottom: 15, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  bookInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  thumbnail: { width: 60, height: 85, borderRadius: 8, marginRight: 15, backgroundColor: '#ccc' },
  noImage: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  textContainer: { flex: 1, justifyContent: 'center' },
  title: { fontWeight: 'bold', marginBottom: 2 },
  author: { marginBottom: 4 },
  ratingRow: { flexDirection: 'row', marginBottom: 6 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontWeight: 'bold', textTransform: 'uppercase' },
  chevron: { marginLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  fab: { 
    position: 'absolute', right: 25, bottom: 25, 
    width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', 
    elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
});