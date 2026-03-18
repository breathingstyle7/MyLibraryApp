import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  Image, TouchableOpacity, ScrollView, Switch 
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const schema = yup.object({
  title: yup.string().required('Назва обов\'язкова'),
  author: yup.string().required('Автор обов\'язковий'),
  year: yup.number()
    .typeError('Введіть число (рік)')
    .positive('Рік не може бути від\'ємним')
    .integer()
    .required('Рік обов\'язковий'),
}).required();

export default function AddBookScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [isRead, setIsRead] = useState(false);
  const [rating, setRating] = useState(0); 
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '', author: '', year: '' }
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Потрібен доступ до галереї!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (data) => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) {
        Alert.alert('Помилка', 'Користувача не знайдено.');
        return;
      }
      
      const user = JSON.parse(userJson);
      const storageKey = `books_${user.id}`;

      const newBook = {
        id: Date.now().toString(),
        title: data.title,
        author: data.author,
        year: data.year,
        imageUri: image,
        status: isRead ? 'Прочитано' : 'В планах',
        rating: rating, 
        createdAt: new Date().toISOString(),
      };

      const existingBooksJson = await AsyncStorage.getItem(storageKey);
      const existingBooks = existingBooksJson ? JSON.parse(existingBooksJson) : [];
      
      const updatedBooks = [newBook, ...existingBooks];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedBooks));

      Alert.alert('Успіх!', `Книгу "${data.title}" додано!`);
      
      reset();
      setImage(null);
      setIsRead(false);
      setRating(0);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти книгу');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text, fontSize: fontSize + 8 }]}>Нова книга</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.card, borderColor: isDarkMode ? '#444' : '#ddd' }]}>
            <Ionicons name="camera" size={40} color={theme.subText} />
            <Text style={[styles.imagePlaceholderText, { color: theme.subText, fontSize: fontSize - 4 }]}>Додати обкладинку</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text, fontSize: fontSize }]}>Назва книги</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput 
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: isDarkMode ? '#444' : '#ddd' }]} 
              onChangeText={onChange} 
              value={value} 
              placeholder="Назва..."
              placeholderTextColor={theme.subText}
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

        <Text style={[styles.label, { color: theme.text, fontSize: fontSize }]}>Автор</Text>
        <Controller
          control={control}
          name="author"
          render={({ field: { onChange, value } }) => (
            <TextInput 
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: isDarkMode ? '#444' : '#ddd' }]} 
              onChangeText={onChange} 
              value={value} 
              placeholder="Ім'я автора..."
              placeholderTextColor={theme.subText}
            />
          )}
        />
        {errors.author && <Text style={styles.errorText}>{errors.author.message}</Text>}

        <Text style={[styles.label, { color: theme.text, fontSize: fontSize }]}>Рік видання</Text>
        <Controller
          control={control}
          name="year"
          render={({ field: { onChange, value } }) => (
            <TextInput 
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: isDarkMode ? '#444' : '#ddd' }]} 
              onChangeText={onChange} 
              value={value} 
              placeholder="Рік..."
              placeholderTextColor={theme.subText}
              keyboardType="numeric"
            />
          )}
        />
        {errors.year && <Text style={styles.errorText}>{errors.year.message}</Text>}
      </View>

      <View style={styles.ratingSection}>
        <Text style={[styles.label, { color: theme.text, fontSize: fontSize, textAlign: 'center' }]}>Початкова оцінка</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons 
                name={star <= rating ? "star" : "star-outline"} 
                size={38} 
                color={star <= rating ? "#FFD700" : theme.subText} 
                style={{ mx: 5 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.statusContainer, { backgroundColor: theme.card }]}>
        <View style={styles.switchRow}>
          <View>
            <Text style={[styles.label, { color: theme.text, fontSize: fontSize, marginBottom: 0 }]}>Статус читання</Text>
            <Text style={{ color: isRead ? '#4caf50' : theme.primary, fontSize: fontSize - 2, fontWeight: 'bold' }}>
              {isRead ? 'Вже прочитано' : 'В планах'}
            </Text>
          </View>
          <Switch
            value={isRead}
            onValueChange={setIsRead}
            trackColor={{ false: "#767577", true: theme.primary }}
            thumbColor={isRead ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.submitBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]} 
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitBtnText}>ЗБЕРЕГТИ КНИГУ</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  header: { fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  inputContainer: { marginBottom: 10 },
  label: { fontWeight: 'bold', marginBottom: 8, marginLeft: 5 },
  input: { borderWidth: 1, padding: 15, borderRadius: 15, marginBottom: 15, fontSize: 16 },
  errorText: { color: 'red', fontSize: 12, marginTop: -12, marginBottom: 10, marginLeft: 5 },
  imagePicker: { alignSelf: 'center', marginBottom: 30 },
  imagePlaceholder: { width: 130, height: 180, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, elevation: 2 },
  imagePlaceholderText: { textAlign: 'center', marginTop: 8, fontWeight: '500' },
  image: { width: 130, height: 180, borderRadius: 15 },
  ratingSection: { marginBottom: 25, alignItems: 'center' },
  ratingRow: { flexDirection: 'row', marginTop: 10 },
  statusContainer: { padding: 18, borderRadius: 20, marginBottom: 30, elevation: 2 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submitBtn: { padding: 20, borderRadius: 18, alignItems: 'center', elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1.2 }
});