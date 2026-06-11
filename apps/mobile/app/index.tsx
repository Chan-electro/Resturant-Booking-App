import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getUser } from '../lib/auth';

export default function Index() {
  useEffect(() => {
    getUser().then((user) => {
      if (user?.role === 'CUSTOMER') {
        router.replace('/(customer)');
      } else if (user?.role === 'DELIVERY') {
        router.replace('/(delivery)');
      } else {
        router.replace('/login');
      }
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-cream">
      <ActivityIndicator size="large" color="#4B0F16" />
    </View>
  );
}
