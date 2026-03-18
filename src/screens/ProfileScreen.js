import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../context/ThemeContext';

export default function ProfileScreen() {
  const [user, setUser] = useState({ name: '', avatar: null, id: '' });
  const [readCount, setReadCount] = useState(0);
  const isFocused = useIsFocused();
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
  }, [isFocused]);

  const loadUserData = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        setUser(currentUser);

        const storageKey = `books_${currentUser.id}`;
        const savedBooks = await AsyncStorage.getItem(storageKey);
        const books = savedBooks ? JSON.parse(savedBooks) : [];
        
        const count = books.filter(b => b.status === 'Прочитано').length;
        setReadCount(count);
      }
    } catch (e) {
      console.error("Помилка профілю:", e);
    }
  };

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const updatedUser = { ...user, avatar: result.assets[0].uri };
      setUser(updatedUser);
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      const allProfilesJson = await AsyncStorage.getItem('userProfiles');
      if (allProfilesJson) {
        const allProfiles = JSON.parse(allProfilesJson);
        const updatedProfiles = allProfiles.map(p => p.id === user.id ? updatedUser : p);
        await AsyncStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
      }
    }
  };

  const getRank = (count) => {
    if (count >= 10) return { title: 'Магістр Літератури', color: '#ffd700', icon: 'medal' };
    if (count >= 5) return { title: 'Книголюб', color: '#c0c0c0', icon: 'star' };
    return { title: 'Новачок', color: '#cd7f32', icon: 'book-outline' };
  };

  const rank = getRank(readCount);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: isDarkMode ? '#333' : '#eee' }]}>
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primary, borderColor: theme.card, borderWidth: 4 }]}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user.name ? user.name[0].toUpperCase() : '?'}</Text>
            )}
          </View>
          <View style={[styles.editBadge, { backgroundColor: theme.primary, borderColor: theme.card }]}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={[styles.userName, { color: theme.text, fontSize: fontSize + 6 }]}>{user.name}</Text>
        
        <View style={[styles.rankBadge, { backgroundColor: rank.color }]}>
          <Ionicons name={rank.icon} size={16} color="#fff" />
          <Text style={styles.rankText}>{rank.title}</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>{readCount}</Text>
          <Text style={[styles.statLabel, { color: theme.subText, fontSize: fontSize - 2 }]}>Книг прочитано</Text>
        </View>
        
        <View style={[styles.progressContainer, { backgroundColor: theme.card }]}>
           <Text style={[styles.progressLabel, { color: theme.subText, fontSize: fontSize - 4 }]}>
             {readCount < 5 ? `До рівня Книголюб: ${5 - readCount} книг` : 
              readCount < 10 ? `До рівня Магістр: ${10 - readCount} книг` : 'Максимальний рівень!'}
           </Text>
           <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? '#333' : '#eee' }]}>
              <View style={[styles.progressBarFill, { 
                backgroundColor: theme.primary, 
                width: `${Math.min((readCount / 10) * 100, 100)}%` 
              }]} />
           </View>
        </View>
      </View>

      <View style={[styles.quoteBox, { backgroundColor: isDarkMode ? '#1e2538' : '#eef2ff', borderLeftColor: theme.primary }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.primary} />
        <Text style={[styles.quoteText, { color: theme.text, fontSize: fontSize }]}>
          "Книги — це унікальна портативна магія."
        </Text>
        <Text style={[styles.quoteAuthor, { color: theme.primary, fontSize: fontSize - 2 }]}>— Стівен Кінг</Text>
      </View>

      {/* Відступ знизу */}
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  avatarContainer: { position: 'relative' },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  userName: { fontWeight: 'bold', marginTop: 15 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  rankText: { color: '#fff', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },
  statsSection: { padding: 20, marginTop: 10 },
  statBox: { alignItems: 'center', marginBottom: 20 },
  statNumber: { fontSize: 32, fontWeight: 'bold' },
  statLabel: { fontWeight: '500' },
  progressContainer: { padding: 18, borderRadius: 20, elevation: 2 },
  progressLabel: { marginBottom: 10, fontWeight: '500' },
  progressBarBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  quoteBox: { margin: 20, padding: 25, borderRadius: 20, borderLeftWidth: 6 },
  quoteText: { fontStyle: 'italic', marginBottom: 12, lineHeight: 22 },
  quoteAuthor: { textAlign: 'right', fontWeight: 'bold' }
});