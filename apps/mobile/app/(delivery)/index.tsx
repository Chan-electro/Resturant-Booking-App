import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, Package, ChevronRight, Banknote } from 'lucide-react-native';
import api from '../../lib/api';

interface DeliveryAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  customer: {
    name: string;
    phone: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  items: Array<{ name: string; quantity: number }>;
}

const DELIVERY_STATUS = {
  ASSIGNED: { label: 'Assigned', bg: '#EFF6FF', text: '#1D4ED8' },
  PICKED_UP: { label: 'Picked Up', bg: '#FFFBEB', text: '#B45309' },
  DELIVERED: { label: 'Delivered', bg: '#F0FDF4', text: '#15803D' },
};

function DeliveryCard({ assignment }: { assignment: DeliveryAssignment }) {
  const queryClient = useQueryClient();

  const statusConfig = DELIVERY_STATUS[assignment.status as keyof typeof DELIVERY_STATUS] || {
    label: assignment.status, bg: '#F5F1EC', text: '#2A1A1C',
  };

  const confirmPickupMutation = useMutation({
    mutationFn: () => api.patch(`/delivery/assignments/${assignment.id}/pickup`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-assignments'] }),
    onError: () => Alert.alert('Error', 'Failed to confirm pickup. Please try again.'),
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: () => api.patch(`/delivery/assignments/${assignment.id}/deliver`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-assignments'] }),
    onError: () => Alert.alert('Error', 'Failed to confirm delivery. Please try again.'),
  });

  const openMaps = () => {
    const address = encodeURIComponent(
      `${assignment.deliveryAddress.street}, ${assignment.deliveryAddress.city} ${assignment.deliveryAddress.zipCode}`
    );
    const url = `https://maps.google.com/?q=${address}`;
    Linking.openURL(url);
  };

  const callCustomer = () => {
    Linking.openURL(`tel:${assignment.customer.phone}`);
  };

  return (
    <View
      className="bg-white rounded-xl mb-3 p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Top row */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-cocoa font-bold text-base">
            {assignment.customer.name}
          </Text>
          <Text className="text-bronze text-xs mt-0.5">
            Order #{assignment.orderNumber}
          </Text>
        </View>
        <View className="flex-row items-center">
          {assignment.paymentMethod === 'COD' && (
            <View className="bg-amber-100 rounded-full px-2 py-1 mr-2 flex-row items-center">
              <Banknote size={12} color="#B45309" />
              <Text className="text-amber-700 text-xs font-semibold ml-1">COD</Text>
            </View>
          )}
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: statusConfig.bg }}
          >
            <Text className="text-xs font-semibold" style={{ color: statusConfig.text }}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Address */}
      <View className="flex-row items-start mb-2">
        <MapPin size={14} color="#A86F3D" style={{ marginTop: 2 }} />
        <Text className="text-bronze text-sm ml-1.5 flex-1">
          {assignment.deliveryAddress.street}, {assignment.deliveryAddress.city}
        </Text>
      </View>

      {/* Items */}
      <View className="flex-row items-start mb-3">
        <Package size={14} color="#A86F3D" style={{ marginTop: 2 }} />
        <Text className="text-bronze text-sm ml-1.5 flex-1" numberOfLines={1}>
          {assignment.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
        </Text>
      </View>

      {/* Amount */}
      {assignment.paymentMethod === 'COD' && (
        <View className="bg-amber-50 rounded-lg px-3 py-2 mb-3">
          <Text className="text-amber-800 text-sm">
            Collect: <Text className="font-bold">₹{assignment.totalAmount.toFixed(0)}</Text>
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View className="flex-row gap-2 mb-2">
        <TouchableOpacity
          className="flex-1 bg-cream border border-ivory rounded-lg py-2.5 items-center flex-row justify-center"
          onPress={openMaps}
          activeOpacity={0.8}
        >
          <MapPin size={14} color="#4B0F16" />
          <Text className="text-maroon text-sm font-medium ml-1">Navigate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-cream border border-ivory rounded-lg py-2.5 items-center flex-row justify-center"
          onPress={callCustomer}
          activeOpacity={0.8}
        >
          <Phone size={14} color="#4B0F16" />
          <Text className="text-maroon text-sm font-medium ml-1">Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-2.5 px-3"
          onPress={() => router.push(`/(delivery)/delivery/${assignment.id}`)}
        >
          <ChevronRight size={18} color="#C89B63" />
        </TouchableOpacity>
      </View>

      {/* Status action button */}
      {assignment.status === 'ASSIGNED' && (
        <TouchableOpacity
          className="bg-maroon rounded-lg py-3 items-center"
          onPress={() =>
            Alert.alert('Confirm Pickup', 'Have you picked up the order?', [
              { text: 'Not Yet', style: 'cancel' },
              { text: 'Yes, Picked Up', onPress: () => confirmPickupMutation.mutate() },
            ])
          }
          disabled={confirmPickupMutation.isPending}
          activeOpacity={0.85}
        >
          {confirmPickupMutation.isPending ? (
            <ActivityIndicator color="#F5F1EC" />
          ) : (
            <Text className="text-cream font-semibold">Confirm Pickup</Text>
          )}
        </TouchableOpacity>
      )}

      {assignment.status === 'PICKED_UP' && (
        <TouchableOpacity
          className="bg-green-700 rounded-lg py-3 items-center"
          onPress={() =>
            Alert.alert('Confirm Delivery', 'Has the order been delivered to the customer?', [
              { text: 'Not Yet', style: 'cancel' },
              { text: 'Yes, Delivered', onPress: () => confirmDeliveryMutation.mutate() },
            ])
          }
          disabled={confirmDeliveryMutation.isPending}
          activeOpacity={0.85}
        >
          {confirmDeliveryMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Confirm Delivery</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function TodayDeliveriesScreen() {
  const {
    data: assignments,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['delivery-assignments'],
    queryFn: async () => {
      const { data } = await api.get('/delivery/assignments');
      return data.data as DeliveryAssignment[];
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const pending = assignments?.filter((a) => a.status !== 'DELIVERED') || [];
  const completed = assignments?.filter((a) => a.status === 'DELIVERED') || [];

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="bg-maroon px-5 pt-4 pb-5">
        <Text className="text-gold text-xl font-bold">Today's Deliveries</Text>
        {assignments && (
          <Text className="text-cream text-sm opacity-80 mt-0.5">
            {pending.length} pending · {completed.length} completed
          </Text>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4B0F16" />
          <Text className="text-bronze text-sm mt-3">Loading assignments...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl mb-3">🚚</Text>
          <Text className="text-cocoa font-semibold mb-2">Couldn't Load Deliveries</Text>
          <TouchableOpacity className="bg-maroon rounded-lg px-6 py-3" onPress={() => refetch()}>
            <Text className="text-cream font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !assignments || assignments.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🎉</Text>
          <Text className="text-cocoa text-xl font-semibold mb-2">All Done!</Text>
          <Text className="text-bronze text-sm text-center">
            No pending deliveries for today. Great work!
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...pending, ...completed]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DeliveryCard assignment={item} />}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#4B0F16"
            />
          }
          ListHeaderComponent={
            pending.length > 0 && completed.length > 0 ? (
              <Text className="text-cocoa font-semibold mb-3">
                Pending ({pending.length})
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
