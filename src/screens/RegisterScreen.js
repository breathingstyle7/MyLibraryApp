import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Створюємо схему валідації (правила для полів)
const schema = yup.object({
  name: yup.string().required('Ім\'я є обов\'язковим'),
  email: yup.string().email('Невірний формат email').required('Email є обов\'язковим'),
  password: yup.string().min(6, 'Пароль має містити мінімум 6 символів').required('Пароль є обов\'язковим'),
}).required();

export default function RegisterScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  // Функція, яка спрацює, якщо форма валідна
  const onSubmit = async (data) => {
    try {
      // Зберігаємо дані користувача локально
      await AsyncStorage.setItem('userData', JSON.stringify(data));
      Alert.alert('Успіх', 'Ви успішно зареєструвалися!');
      navigation.navigate('Login'); // Переходимо на логін
    } catch (e) {
      Alert.alert('Помилка', 'Не вдалося зберегти дані');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Створення акаунту</Text>

      {/* Поле Ім'я */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Ваше ім'я"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

      {/* Поле Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      {/* Поле Пароль */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Пароль"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      <View style={styles.buttonContainer}>
        <Button title="Зареєструватися" onPress={handleSubmit(onSubmit)} />
      </View>
      <Button title="Вже є акаунт? Увійти" onPress={() => navigation.navigate('Login')} type="clear" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', marginBottom: 10, marginTop: -5, fontSize: 12 },
  buttonContainer: { marginBottom: 15 }
});