import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import AddBookScreen from '../screens/AddBookScreen';
import DetailsScreen from '../screens/DetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StatsScreen from '../screens/StatsScreen';
import FilteredBooksScreen from '../screens/FilteredBooksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import QuotesScreen from '../screens/QuotesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  const { theme, isDarkMode } = useContext(ThemeContext);
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: theme.primary,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: isDarkMode ? '#333' : '#eee' }
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Книги', tabBarIcon: ({ color, size }) => (<Ionicons name="book" color={color} size={size} />) }} />
      <Tab.Screen name="StatsTab" component={StatsScreen} options={{ tabBarLabel: 'Статистика', tabBarIcon: ({ color, size }) => (<Ionicons name="stats-chart" color={color} size={size} />) }} />
      
      {/* ЦЕНТРАЛЬНА ВКЛАДКА */}
      <Tab.Screen name="ChallengeTab" component={ChallengeScreen} options={{ tabBarLabel: 'Виклик', tabBarIcon: ({ color, size }) => (<Ionicons name="trophy" color={color} size={size} />) }} />
      <Tab.Screen 
  name="Quotes" 
  component={QuotesScreen} 
  options={{
    title: 'Цитати',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="chatbox-ellipses-outline" size={size} color={color} />
    ),
  }} 
/>
      
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Профіль', tabBarIcon: ({ color, size }) => (<Ionicons name="person" color={color} size={size} />) }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: 'Налаштування', tabBarIcon: ({ color, size }) => (<Ionicons name="settings" color={color} size={size} />) }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useContext(ThemeContext);
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerStyle: { backgroundColor: theme.card }, headerTintColor: theme.text }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Реєстрація' }} />
      <Stack.Screen name="MainTabs" component={BottomTabs} options={{ title: 'Моя Бібліотека', headerBackVisible: false }} />
      <Stack.Screen name="FilteredBooks" component={FilteredBooksScreen} />
      <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: 'Додати книгу' }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Деталі' }} />
    </Stack.Navigator>
  );
}