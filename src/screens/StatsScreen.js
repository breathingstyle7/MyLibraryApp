import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit'; // Імпорт діаграми
import { ThemeContext } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen({ navigation }) {
  const [stats, setStats] = useState({ total: 0, read: 0, unread: 0, lastWeek: 0 });
  const isFocused = useIsFocused();
  const { theme, fontSize, isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (isFocused) {
      calculateStats();
    }
  }, [isFocused]);

  const calculateStats = async () => {
    try {
      // 1. Дістаємо поточного користувача
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) return;

      const user = JSON.parse(userJson);
      const storageKey = `books_${user.id}`;

      // 2. Завантажуємо книги саме цього користувача
      const savedBooks = await AsyncStorage.getItem(storageKey);
      const books = savedBooks ? JSON.parse(savedBooks) : [];
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 3. Рахуємо цифри
      setStats({
        total: books.length,
        read: books.filter(b => b.status === 'Прочитано').length,
        unread: books.filter(b => b.status === 'В планах').length,
        lastWeek: books.filter(b => b.createdAt && new Date(b.createdAt) > oneWeekAgo).length
      });
    } catch (e) {
      console.error("Помилка розрахунку статистики:", e);
    }
  };

  // Дані для діаграми
  const chartData = [
    {
      name: 'Прочитано',
      population: stats.read,
      color: '#28a745',
      legendFontColor: theme.text,
      legendFontSize: fontSize - 2,
    },
    {
      name: 'В планах',
      population: stats.unread,
      color: '#ffc107',
      legendFontColor: theme.text,
      legendFontSize: fontSize - 2,
    },
  ];

  const chartConfig = {
    color: (opacity = 1) => theme.text,
    labelColor: (opacity = 1) => theme.text,
  };

  const StatCard = ({ title, value, icon, color, filterType }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.card, borderLeftColor: color }]}
      onPress={() => navigation.navigate('FilteredBooks', { filterType, title })}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={30} color={color} />
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: theme.subText, fontSize: fontSize - 2 }]}>{title}</Text>
        <Text style={[styles.cardValue, { color: theme.text, fontSize: fontSize + 10 }]}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.subText} style={{marginLeft: 'auto'}} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text, fontSize: fontSize + 12 }]}>Аналітика бібліотеки</Text>
      
      {/* Секція з діаграмою */}
      <View style={[styles.chartBox, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text, fontSize: fontSize }]}>Розподіл книг</Text>
        {stats.total > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute // Показує числа замість %
          />
        ) : (
          <View style={styles.emptyChart}>
            <Ionicons name="pie-chart-outline" size={50} color={theme.subText} />
            <Text style={{ color: theme.subText, marginTop: 10 }}>Додай книги, щоб побачити прогрес</Text>
          </View>
        )}
      </View>

      <StatCard title="Всього книг" value={stats.total} icon="library" color="#2e64e5" filterType="all" />
      <StatCard title="Прочитано" value={stats.read} icon="checkmark-circle" color="#28a745" filterType="read" />
      <StatCard title="В планах" value={stats.unread} icon="time" color="#ffc107" filterType="unread" />
      <StatCard title="Нові за тиждень" value={stats.lastWeek} icon="calendar" color="#17a2b8" filterType="week" />
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontWeight: 'bold', marginBottom: 25, marginTop: 10 },
  chartBox: { 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 20, 
    alignItems: 'center',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5 
  },
  chartTitle: { alignSelf: 'flex-start', fontWeight: 'bold', marginLeft: 10, marginBottom: 10 },
  emptyChart: { height: 180, justifyContent: 'center', alignItems: 'center' },
  card: { 
    padding: 20, borderRadius: 16, marginBottom: 15, 
    flexDirection: 'row', alignItems: 'center', borderLeftWidth: 6,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, shadowRadius: 4
  },
  cardText: { marginLeft: 20 },
  cardTitle: { fontWeight: '600' },
  cardValue: { fontWeight: 'bold', marginTop: 2 }
});