import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, CreditCard, Banknote } from 'lucide-react-native';
import api from '../../lib/api';
import { useCart } from '../../lib/cart';

const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;

type PaymentMethod = 'COD' | 'ONLINE';

export default function CheckoutScreen() {
  const { items, total, itemCount, clearCart } = useCart();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tax = total * TAX_RATE;
  const grandTotal = total + tax + DELIVERY_FEE;

  const handlePlaceOrder = async () => {
    if (!street.trim()) { setError('Please enter your street address.'); return; }
    if (!city.trim()) { setError('Please enter your city.'); return; }
    if (!zip.trim()) { setError('Please enter your ZIP code.'); return; }

    setError('');
    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        deliveryAddress: {
          street: street.trim(),
          city: city.trim(),
          zipCode: zip.trim(),
          instructions: instructions.trim(),
        },
        paymentMethod,
        subtotal: total,
        tax,
        deliveryFee: DELIVERY_FEE,
        total: grandTotal,
      };

      await api.post('/orders', orderPayload);
      clearCart();
      router.replace('/(customer)/orders');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center" edges={['top']}>
        <Text className="text-cocoa text-base">Your cart is empty.</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.replace('/(customer)')}>
          <Text className="text-gold font-semibold">Browse Menu</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-maroon px-5 pt-4 pb-5 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={22} color="#C89B63" />
          </TouchableOpacity>
          <View>
            <Text className="text-gold text-xl font-bold">Checkout</Text>
            <Text className="text-cream text-sm opacity-80 mt-0.5">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Error */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Delivery Address */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <View className="flex-row items-center mb-4">
              <MapPin size={18} color="#4B0F16" />
              <Text className="text-cocoa font-semibold ml-2">Delivery Address</Text>
            </View>

            <View className="mb-3">
              <Text className="text-maroon text-xs font-medium mb-1">Street Address *</Text>
              <TextInput
                className="bg-cream border rounded-lg px-3 py-2.5 text-cocoa text-sm"
                style={{ borderColor: '#E7DED7' }}
                placeholder="123 Temple Street"
                placeholderTextColor="#A86F3D"
                value={street}
                onChangeText={setStreet}
              />
            </View>

            <View className="flex-row mb-3 gap-3">
              <View className="flex-1">
                <Text className="text-maroon text-xs font-medium mb-1">City *</Text>
                <TextInput
                  className="bg-cream border rounded-lg px-3 py-2.5 text-cocoa text-sm"
                  style={{ borderColor: '#E7DED7' }}
                  placeholder="Mumbai"
                  placeholderTextColor="#A86F3D"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View className="w-28">
                <Text className="text-maroon text-xs font-medium mb-1">ZIP Code *</Text>
                <TextInput
                  className="bg-cream border rounded-lg px-3 py-2.5 text-cocoa text-sm"
                  style={{ borderColor: '#E7DED7' }}
                  placeholder="400001"
                  placeholderTextColor="#A86F3D"
                  keyboardType="number-pad"
                  value={zip}
                  onChangeText={setZip}
                />
              </View>
            </View>

            <View>
              <Text className="text-maroon text-xs font-medium mb-1">
                Delivery Instructions (optional)
              </Text>
              <TextInput
                className="bg-cream border rounded-lg px-3 py-2.5 text-cocoa text-sm"
                style={{ borderColor: '#E7DED7' }}
                placeholder="Gate code, landmark, etc."
                placeholderTextColor="#A86F3D"
                multiline
                numberOfLines={2}
                value={instructions}
                onChangeText={setInstructions}
              />
            </View>
          </View>

          {/* Payment Method */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <View className="flex-row items-center mb-4">
              <CreditCard size={18} color="#4B0F16" />
              <Text className="text-cocoa font-semibold ml-2">Payment Method</Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 border-2 rounded-xl p-3 items-center ${
                  paymentMethod === 'COD' ? 'border-maroon bg-red-50' : 'border-ivory bg-cream'
                }`}
                onPress={() => setPaymentMethod('COD')}
                activeOpacity={0.8}
              >
                <Banknote size={24} color={paymentMethod === 'COD' ? '#4B0F16' : '#A86F3D'} />
                <Text
                  className={`text-sm font-semibold mt-1 ${
                    paymentMethod === 'COD' ? 'text-maroon' : 'text-bronze'
                  }`}
                >
                  Cash on Delivery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 border-2 rounded-xl p-3 items-center ${
                  paymentMethod === 'ONLINE' ? 'border-maroon bg-red-50' : 'border-ivory bg-cream'
                }`}
                onPress={() => setPaymentMethod('ONLINE')}
                activeOpacity={0.8}
              >
                <CreditCard size={24} color={paymentMethod === 'ONLINE' ? '#4B0F16' : '#A86F3D'} />
                <Text
                  className={`text-sm font-semibold mt-1 ${
                    paymentMethod === 'ONLINE' ? 'text-maroon' : 'text-bronze'
                  }`}
                >
                  Online Payment
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Summary */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <Text className="text-cocoa font-semibold mb-3">Order Summary</Text>

            {items.map((item) => (
              <View key={item.id} className="flex-row justify-between mb-1.5">
                <Text className="text-bronze text-sm flex-1 mr-2" numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <Text className="text-cocoa text-sm">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </Text>
              </View>
            ))}

            <View className="border-t border-ivory mt-2 pt-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-bronze text-sm">Subtotal</Text>
                <Text className="text-cocoa text-sm">₹{total.toFixed(0)}</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-bronze text-sm">Tax (5%)</Text>
                <Text className="text-cocoa text-sm">₹{tax.toFixed(0)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-bronze text-sm">Delivery Fee</Text>
                <Text className="text-cocoa text-sm">₹{DELIVERY_FEE}</Text>
              </View>
              <View className="flex-row justify-between border-t border-ivory pt-2">
                <Text className="text-cocoa font-bold">Total</Text>
                <Text className="text-maroon font-bold text-base">
                  ₹{grandTotal.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-cream px-4 py-4 border-t border-ivory"
          style={{ paddingBottom: Platform.OS === 'ios' ? 28 : 16 }}
        >
          <TouchableOpacity
            className="bg-maroon rounded-xl py-4 items-center"
            onPress={handlePlaceOrder}
            disabled={loading}
            activeOpacity={0.9}
            style={{
              shadowColor: '#4B0F16',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#F5F1EC" />
            ) : (
              <Text className="text-cream font-semibold text-base">
                Place Order · ₹{grandTotal.toFixed(0)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
