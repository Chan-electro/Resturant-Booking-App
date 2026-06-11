import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Package, Banknote, User } from 'lucide-react-native';
import api from '../../../lib/api';

interface DeliveryDetail {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    zipCode: string;
    instructions?: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [codAmount, setCodAmount] = useState('');

  const { data: delivery, isLoading, error, refetch } = useQuery({
    queryKey: ['delivery', id],
    queryFn: async () => {
      const { data } = await api.get(`/delivery/assignments/${id}`);
      return data.data as DeliveryDetail;
    },
    enabled: !!id,
  });

  const pickupMutation = useMutation({
    mutationFn: () => api.patch(`/delivery/assignments/${id}/pickup`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['delivery-assignments'] });
    },
    onError: () => Alert.alert('Error', 'Failed to confirm pickup.'),
  });

  const deliverMutation = useMutation({
    mutationFn: () =>
      api.patch(`/delivery/assignments/${id}/deliver`, {
        codAmountCollected: delivery?.paymentMethod === 'COD' ? parseFloat(codAmount) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['delivery-assignments'] });
      Alert.alert('Success', 'Delivery confirmed!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: () => Alert.alert('Error', 'Failed to confirm delivery.'),
  });

  const openMaps = () => {
    if (!delivery) return;
    const address = encodeURIComponent(
      `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city}`
    );
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  };

  const callCustomer = () => {
    if (!delivery) return;
    Linking.openURL(`tel:${delivery.customer.phone}`);
  };

  const handleConfirmDelivery = () => {
    if (delivery?.paymentMethod === 'COD' && !codAmount) {
      Alert.alert('Enter Amount', 'Please enter the cash amount collected.');
      return;
    }
    Alert.alert(
      'Confirm Delivery',
      `Mark as delivered to ${delivery?.customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => deliverMutation.mutate() },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="bg-maroon px-5 pt-4 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#C89B63" />
        </TouchableOpacity>
        <View>
          <Text className="text-gold text-xl font-bold">Delivery Detail</Text>
          {delivery && (
            <Text className="text-cream text-sm opacity-80 mt-0.5">
              Order #{delivery.orderNumber}
            </Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4B0F16" />
        </View>
      ) : error || !delivery ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-cocoa font-semibold mb-2">Delivery not found</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="text-gold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Customer Info */}
          <View
            className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <View className="flex-row items-center mb-3">
              <User size={16} color="#4B0F16" />
              <Text className="text-cocoa font-semibold ml-2">Customer</Text>
            </View>
            <Text className="text-cocoa font-bold text-base mb-1">{delivery.customer.name}</Text>
            <Text className="text-bronze text-sm">{delivery.customer.phone}</Text>
            <Text className="text-bronze text-sm">{delivery.customer.email}</Text>

            <View className="flex-row mt-3 gap-3">
              <TouchableOpacity
                className="flex-1 bg-maroon rounded-lg py-2.5 flex-row items-center justify-center"
                onPress={callCustomer}
              >
                <Phone size={14} color="#F5F1EC" />
                <Text className="text-cream text-sm font-medium ml-1.5">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-cream border border-ivory rounded-lg py-2.5 flex-row items-center justify-center"
                onPress={openMaps}
              >
                <MapPin size={14} color="#4B0F16" />
                <Text className="text-maroon text-sm font-medium ml-1.5">Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Address */}
          <View
            className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#4B0F16" />
              <Text className="text-cocoa font-semibold ml-2">Delivery Address</Text>
            </View>
            <Text className="text-cocoa text-sm">{delivery.deliveryAddress.street}</Text>
            <Text className="text-bronze text-sm mt-0.5">
              {delivery.deliveryAddress.city} - {delivery.deliveryAddress.zipCode}
            </Text>
            {delivery.deliveryAddress.instructions && (
              <View className="bg-amber-50 rounded-lg p-2 mt-2">
                <Text className="text-amber-800 text-xs">
                  Note: {delivery.deliveryAddress.instructions}
                </Text>
              </View>
            )}
          </View>

          {/* Order Items */}
          <View
            className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <View className="flex-row items-center mb-3">
              <Package size={16} color="#4B0F16" />
              <Text className="text-cocoa font-semibold ml-2">Order Items</Text>
            </View>
            {delivery.items.map((item) => (
              <View key={item.id} className="flex-row justify-between mb-2">
                <Text className="text-cocoa text-sm flex-1 mr-2" numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <Text className="text-bronze text-sm">
                  ₹{(item.unitPrice * item.quantity).toFixed(0)}
                </Text>
              </View>
            ))}
            <View className="border-t border-ivory pt-2 mt-1">
              <View className="flex-row justify-between">
                <Text className="text-cocoa font-bold">Total</Text>
                <Text className="text-maroon font-bold">₹{delivery.totalAmount.toFixed(0)}</Text>
              </View>
            </View>
          </View>

          {/* Payment */}
          <View
            className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <View className="flex-row items-center mb-2">
              <Banknote size={16} color="#4B0F16" />
              <Text className="text-cocoa font-semibold ml-2">Payment</Text>
            </View>
            <Text className="text-bronze text-sm">Method: {delivery.paymentMethod}</Text>

            {delivery.paymentMethod === 'COD' && delivery.status === 'PICKED_UP' && (
              <View className="mt-3">
                <Text className="text-maroon text-sm font-medium mb-1">
                  Amount to Collect: ₹{delivery.totalAmount.toFixed(0)}
                </Text>
                <TextInput
                  className="bg-cream border rounded-lg px-3 py-2.5 text-cocoa text-sm"
                  style={{ borderColor: '#E7DED7' }}
                  placeholder={`Enter collected amount (₹${delivery.totalAmount.toFixed(0)})`}
                  placeholderTextColor="#A86F3D"
                  keyboardType="numeric"
                  value={codAmount}
                  onChangeText={setCodAmount}
                />
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Action Footer */}
      {delivery && delivery.status !== 'DELIVERED' && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-cream px-4 py-4 border-t border-ivory"
          style={{ paddingBottom: 16 }}
        >
          {delivery.status === 'ASSIGNED' && (
            <TouchableOpacity
              className="bg-maroon rounded-xl py-4 items-center"
              onPress={() =>
                Alert.alert('Confirm Pickup', 'Have you picked up the order from kitchen?', [
                  { text: 'Not Yet', style: 'cancel' },
                  { text: 'Confirm Pickup', onPress: () => pickupMutation.mutate() },
                ])
              }
              disabled={pickupMutation.isPending}
              activeOpacity={0.9}
            >
              {pickupMutation.isPending ? (
                <ActivityIndicator color="#F5F1EC" />
              ) : (
                <Text className="text-cream font-semibold text-base">Confirm Pickup</Text>
              )}
            </TouchableOpacity>
          )}

          {delivery.status === 'PICKED_UP' && (
            <TouchableOpacity
              className="bg-green-700 rounded-xl py-4 items-center"
              onPress={handleConfirmDelivery}
              disabled={deliverMutation.isPending}
              activeOpacity={0.9}
            >
              {deliverMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">Confirm Delivery</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
