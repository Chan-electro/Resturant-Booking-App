import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { login } from '../lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), password);
      const role = result.user?.role;
      if (role === 'CUSTOMER') {
        router.replace('/(customer)');
      } else if (role === 'DELIVERY') {
        router.replace('/(delivery)');
      } else {
        setError('This app is for customers and delivery staff only.');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-12">
            {/* Logo / Header */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-maroon items-center justify-center mb-4">
                <Text className="text-gold text-4xl font-bold">B</Text>
              </View>
              <Text className="text-3xl font-bold text-maroon tracking-wide">
                Brahma Kalasha
              </Text>
              <Text className="text-bronze text-base mt-1">
                Premium Vegetarian Dining
              </Text>
            </View>

            {/* Card */}
            <View className="bg-white rounded-2xl p-6 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Text className="text-cocoa text-xl font-semibold text-center mb-6">
                Sign In
              </Text>

              {/* Error */}
              {error ? (
                <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              ) : null}

              {/* Email */}
              <View className="mb-4">
                <Text className="text-maroon text-sm font-medium mb-2">
                  Email Address
                </Text>
                <TextInput
                  className="bg-cream border border-ivory rounded-lg px-4 py-3 text-cocoa text-base"
                  placeholder="you@example.com"
                  placeholderTextColor="#A86F3D"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  style={{ borderColor: '#E7DED7' }}
                />
              </View>

              {/* Password */}
              <View className="mb-6">
                <Text className="text-maroon text-sm font-medium mb-2">
                  Password
                </Text>
                <View
                  className="flex-row items-center bg-cream border border-ivory rounded-lg px-4"
                  style={{ borderColor: '#E7DED7' }}
                >
                  <TextInput
                    className="flex-1 py-3 text-cocoa text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="#A86F3D"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={handleLogin}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="pl-2 py-3"
                  >
                    <Text className="text-bronze text-sm">
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                className="bg-maroon rounded-lg py-4 items-center"
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#F5F1EC" />
                ) : (
                  <Text className="text-cream text-base font-semibold">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-cocoa text-sm">
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text className="text-gold text-sm font-semibold">
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
