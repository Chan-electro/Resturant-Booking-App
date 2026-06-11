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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { register } from '../lib/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email address.';
    if (!phone.trim() || phone.length < 10) return 'Please enter a valid 10-digit phone number.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), phone.trim(), password);
      setSuccess('Registration successful! Please sign in.');
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Registration failed. Please try again.';
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
          <View className="flex-1 justify-center px-6 py-10">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-full bg-maroon items-center justify-center mb-3">
                <Text className="text-gold text-3xl font-bold">B</Text>
              </View>
              <Text className="text-2xl font-bold text-maroon">
                Create Account
              </Text>
              <Text className="text-bronze text-sm mt-1">
                Join Brahma Kalasha today
              </Text>
            </View>

            {/* Card */}
            <View
              className="bg-white rounded-2xl p-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {/* Error */}
              {error ? (
                <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              ) : null}

              {/* Success */}
              {success ? (
                <View className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                  <Text className="text-green-700 text-sm">{success}</Text>
                </View>
              ) : null}

              {/* Full Name */}
              <View className="mb-4">
                <Text className="text-maroon text-sm font-medium mb-2">
                  Full Name
                </Text>
                <TextInput
                  className="bg-cream border rounded-lg px-4 py-3 text-cocoa text-base"
                  style={{ borderColor: '#E7DED7' }}
                  placeholder="Ramesh Sharma"
                  placeholderTextColor="#A86F3D"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-maroon text-sm font-medium mb-2">
                  Email Address
                </Text>
                <TextInput
                  className="bg-cream border rounded-lg px-4 py-3 text-cocoa text-base"
                  style={{ borderColor: '#E7DED7' }}
                  placeholder="you@example.com"
                  placeholderTextColor="#A86F3D"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text className="text-maroon text-sm font-medium mb-2">
                  Phone Number
                </Text>
                <TextInput
                  className="bg-cream border rounded-lg px-4 py-3 text-cocoa text-base"
                  style={{ borderColor: '#E7DED7' }}
                  placeholder="9876543210"
                  placeholderTextColor="#A86F3D"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text className="text-maroon text-sm font-medium mb-2">
                  Password
                </Text>
                <View
                  className="flex-row items-center bg-cream border rounded-lg px-4"
                  style={{ borderColor: '#E7DED7' }}
                >
                  <TextInput
                    className="flex-1 py-3 text-cocoa text-base"
                    placeholder="At least 6 characters"
                    placeholderTextColor="#A86F3D"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
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

              {/* Confirm Password */}
              <View className="mb-6">
                <Text className="text-maroon text-sm font-medium mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  className="bg-cream border rounded-lg px-4 py-3 text-cocoa text-base"
                  style={{ borderColor: '#E7DED7' }}
                  placeholder="Re-enter password"
                  placeholderTextColor="#A86F3D"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onSubmitEditing={handleRegister}
                  returnKeyType="done"
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity
                className="bg-maroon rounded-lg py-4 items-center"
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#F5F1EC" />
                ) : (
                  <Text className="text-cream text-base font-semibold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-cocoa text-sm">
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text className="text-gold text-sm font-semibold">
                    Sign In
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
