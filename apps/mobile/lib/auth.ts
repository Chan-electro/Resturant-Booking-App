import * as SecureStore from 'expo-secure-store';
import api from './api';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  await SecureStore.setItemAsync('access_token', data.data.accessToken);
  await SecureStore.setItemAsync('refresh_token', data.data.refreshToken);
  await SecureStore.setItemAsync('user', JSON.stringify(data.data.user));
  return data.data;
}

export async function logout() {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
  await SecureStore.deleteItemAsync('user');
}

export async function getUser() {
  const user = await SecureStore.getItemAsync('user');
  return user ? JSON.parse(user) : null;
}

export async function register(name: string, email: string, phone: string, password: string) {
  const { data } = await api.post('/auth/register', { name, email, phone, password });
  return data.data;
}
