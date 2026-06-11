import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Platform } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>🪷</Text>
          <Text style={styles.title}>Brahma Kalasha</Text>
          <Text style={styles.subtitle}>Premium Vegetarian Dining</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Login</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your email" 
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your password" 
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EC', // Soft Cream
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B0F16', // Maroon
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A86F3D', // Muted Bronze
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2A1A1C', // Dark Cocoa
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B0F16', // Maroon
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E7DED7', // Warm Ivory
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2A1A1C',
  },
  button: {
    backgroundColor: '#4B0F16', // Maroon
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#2A1A1C',
    fontSize: 14,
  },
  registerLink: {
    color: '#C89B63', // Temple Gold
    fontSize: 14,
    fontWeight: '600',
  }
});
