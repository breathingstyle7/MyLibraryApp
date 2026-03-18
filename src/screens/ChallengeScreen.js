import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Alert, ActivityIndicator, Image, Linking, ScrollView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';

export default function ChallengeScreen() {
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext);
  const isFocused = useIsFocused();
  
  const [target, setTarget] = useState('');
  const [savedTarget, setSavedTarget] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [randomBook, setRandomBook] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadChallengeData();
    }
  }, [isFocused]);

  const loadChallengeData = async () => {
    try {
      // 1. Отримуємо поточного користувача
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) return;
      const user = JSON.parse(userJson);

      // 2. Завантажуємо персональну ціль юзера
      const userGoalKey = `goal_${user.id}`;
      const goal = await AsyncStorage.getItem(userGoalKey);
      if (goal) setSavedTarget(parseInt(goal));
      else setSavedTarget(0); // Скидаємо, якщо ціль ще не поставлена

      // 3. Рахуємо прочитані книги саме цього користувача
      const booksKey = `books_${user.id}`;
      const savedBooks = await AsyncStorage.getItem(booksKey);
      const books = savedBooks ? JSON.parse(savedBooks) : [];
      
      const count = books.filter(b => b.status === 'Прочитано').length;
      setReadCount(count);
    } catch (e) {
      console.error("Помилка завантаження даних виклику:", e);
    }
  };

  const saveGoal = async () => {
    if (!target || isNaN(target)) return Alert.alert("Помилка", "Введіть число");
    
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) return;
      const user = JSON.parse(userJson);
      
      const userGoalKey = `goal_${user.id}`;
      await AsyncStorage.setItem(userGoalKey, target);
      
      setSavedTarget(parseInt(target));
      setTarget('');
      Alert.alert("Успіх", "Ціль на рік оновлена!");
    } catch (e) {
      Alert.alert("Помилка", "Не вдалося зберегти ціль");
    }
  };

  const fetchRandomOnlineBook = async () => {
    setLoading(true);
    setRandomBook(null);
    
    try {
      const ukrKeywords = ['художня', 'роман', 'історія', 'пригоди', 'фентезі', 'трилер', 'українська'];
      const keyword = ukrKeywords[Math.floor(Math.random() * ukrKeywords.length)];
      const randomOffset = Math.floor(Math.random() * 25);

      const url = `https://www.googleapis.com/books/v1/volumes?q=${keyword}&lr=lang_uk&langRestrict=uk&startIndex=${randomOffset}&maxResults=1&printType=books`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const bookInfo = data.items[0].volumeInfo;
        setRandomBook({
          title: bookInfo.title,
          author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Невідомий автор',
          description: bookInfo.description || 'Опис українською мовою відсутній.',
          image: bookInfo.imageLinks?.thumbnail,
          link: bookInfo.infoLink
        });
      } else {
        Alert.alert("Ой", "Не вдалося знайти книгу. Спробуйте ще раз.");
      }
    } catch (error) {
      Alert.alert("Помилка", "Перевірте підключення до мережі");
    } finally {
      setLoading(false);
    }
  };

  const progress = savedTarget > 0 ? Math.min(readCount / savedTarget, 1) : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 12 }]}>Книжковий виклик 🏆</Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#999' }]}>
        <Text style={[styles.label, { color: theme.text, fontSize: fontSize + 2 }]}>
          {savedTarget > 0 ? `Ваша ціль: ${savedTarget} книг` : "Встановіть ціль на рік"}
        </Text>
        
        <View style={[styles.progressBg, { backgroundColor: isDarkMode ? '#333' : '#eee' }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress * 100}%`, 
                backgroundColor: progress >= 1 ? '#4caf50' : theme.primary 
              }
            ]} 
          />
        </View>
        
        <View style={styles.statsRow}>
           <Text style={{ color: theme.subText, fontSize: fontSize - 2, fontWeight: 'bold' }}>
            Прочитано: {readCount} з {savedTarget}
          </Text>
          {progress >= 1 && <Ionicons name="ribbon" size={20} color="#FFD700" />}
        </View>

        <View style={styles.inputRow}>
          <TextInput 
            style={[styles.input, { color: theme.text, borderColor: isDarkMode ? '#444' : '#ddd', backgroundColor: theme.background }]}
            placeholder="Ціль..."
            placeholderTextColor={theme.subText}
            keyboardType="numeric"
            value={target}
            onChangeText={setTarget}
          />
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={saveGoal}>
            <Text style={styles.btnText}>Оновити</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.randomBtn, { borderColor: theme.primary, backgroundColor: theme.card }]} 
        onPress={fetchRandomOnlineBook}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <>
            <Ionicons name="globe-outline" size={24} color={theme.primary} />
            <Text style={[styles.randomBtnText, { color: theme.primary, fontSize: fontSize }]}>Знайти бестселер онлайн</Text>
          </>
        )}
      </TouchableOpacity>

      {randomBook && (
        <View style={[styles.apiResultCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
          <View style={styles.bookHeader}>
            {randomBook.image ? (
              <Image source={{ uri: randomBook.image }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                 <Ionicons name="image-outline" size={30} color="#ccc" />
              </View>
            )}
            <View style={styles.bookInfo}>
              <Text style={[styles.apiBookTitle, { color: theme.text, fontSize: fontSize + 2 }]} numberOfLines={2}>{randomBook.title}</Text>
              <Text style={[styles.apiBookAuthor, { color: theme.subText, fontSize: fontSize - 2 }]}>{randomBook.author}</Text>
            </View>
          </View>
          
          <View style={styles.descriptionBlock}>
            <Text style={[styles.descriptionTitle, { color: theme.text, fontSize: fontSize }]}>Про книгу:</Text>
            <Text 
              style={[styles.apiBookDescription, { color: theme.subText, fontSize: fontSize - 3 }]}
              numberOfLines={6}
            >
              {randomBook.description}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.linkBtn, { backgroundColor: theme.primary }]} 
            onPress={() => Linking.openURL(randomBook.link)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              Детальніше в Google Books
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontWeight: 'bold', marginBottom: 25, marginTop: 40, textAlign: 'center' },
  card: { padding: 25, borderRadius: 20, elevation: 6, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2 },
  label: { fontWeight: 'bold', marginBottom: 15 },
  progressBg: { height: 14, borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  inputRow: { flexDirection: 'row', marginTop: 25, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, marginRight: 10 },
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, elevation: 2 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  randomBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 18, borderRadius: 15, borderWidth: 2, marginTop: 35, borderStyle: 'dashed'
  },
  randomBtnText: { marginLeft: 10, fontWeight: 'bold' },
  apiResultCard: { marginTop: 25, padding: 20, borderRadius: 20, borderWidth: 1, borderStyle: 'solid' },
  bookHeader: { flexDirection: 'row', marginBottom: 15 },
  cover: { width: 80, height: 115, borderRadius: 10, marginRight: 15 },
  bookInfo: { flex: 1, justifyContent: 'center' },
  apiBookTitle: { fontWeight: 'bold', lineHeight: 22 },
  apiBookAuthor: { marginTop: 6 },
  descriptionBlock: { marginBottom: 20, borderTopWidth: 1, borderColor: 'rgba(150,150,150,0.1)', paddingTop: 15 },
  descriptionTitle: { fontWeight: 'bold', marginBottom: 8 },
  apiBookDescription: { lineHeight: 20 },
  linkBtn: { padding: 15, borderRadius: 12 }
});