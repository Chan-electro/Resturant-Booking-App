import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Phone, Mail, LogOut, Edit2, ChevronRight, MapPin } from 'lucide-react-native';
import { getUser, logout } from '../../lib/auth';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-3 border-b border-ivory">
      <View className="w-8 items-center mr-3">{icon}</View>
      <View className="flex-1">
        <Text className="text-bronze text-xs">{label}</Text>
        <Text className="text-cocoa text-sm font-medium mt-0.5">{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="bg-maroon px-5 pt-4 pb-5">
        <Text className="text-gold text-xl font-bold">My Profile</Text>
        <Text className="text-cream text-sm opacity-80 mt-0.5">
          Manage your account
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4B0F16" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Card */}
          <View
            className="bg-white rounded-xl p-5 mb-4 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View className="w-20 h-20 rounded-full bg-maroon items-center justify-center mb-3">
              <Text className="text-gold text-3xl font-bold">{initials}</Text>
            </View>
            <Text className="text-cocoa text-xl font-bold">{user?.name || 'User'}</Text>
            <View className="bg-gold-light rounded-full px-3 py-1 mt-1">
              <Text className="text-maroon text-xs font-semibold">
                {user?.role || 'CUSTOMER'}
              </Text>
            </View>
          </View>

          {/* Contact Info */}
          <View
            className="bg-white rounded-xl px-4 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text className="text-cocoa font-semibold pt-4 pb-2">
              Account Information
            </Text>
            <InfoRow
              icon={<User size={16} color="#4B0F16" />}
              label="Full Name"
              value={user?.name || '—'}
            />
            <InfoRow
              icon={<Mail size={16} color="#4B0F16" />}
              label="Email Address"
              value={user?.email || '—'}
            />
            <InfoRow
              icon={<Phone size={16} color="#4B0F16" />}
              label="Phone Number"
              value={user?.phone || '—'}
            />
            <View className="pb-2" />
          </View>

          {/* Quick Actions */}
          <View
            className="bg-white rounded-xl px-4 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text className="text-cocoa font-semibold pt-4 pb-2">Quick Actions</Text>

            <TouchableOpacity
              className="flex-row items-center py-3 border-b border-ivory"
              activeOpacity={0.7}
            >
              <MapPin size={16} color="#4B0F16" />
              <Text className="text-cocoa text-sm font-medium flex-1 ml-3">
                My Addresses
              </Text>
              <ChevronRight size={16} color="#C89B63" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={() => router.push('/(customer)/orders')}
              activeOpacity={0.7}
            >
              <Edit2 size={16} color="#4B0F16" />
              <Text className="text-cocoa text-sm font-medium flex-1 ml-3">
                Order History
              </Text>
              <ChevronRight size={16} color="#C89B63" />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity
            className="bg-white rounded-xl px-4 py-4 flex-row items-center"
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.7}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <LogOut size={18} color="#DC2626" />
            )}
            <Text className="text-red-600 text-sm font-semibold ml-3">
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text className="text-center text-bronze text-xs mt-6">
            Brahma Kalasha v1.0.0
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
