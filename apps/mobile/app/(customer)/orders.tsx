import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react-native';
import api from '../../lib/api';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
  items?: Array<{ name: string; quantity: number }>;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PLACED:             { label: 'Placed',           bg: '#EFF6FF', text: '#1D4ED8' },
  CONFIRMED:          { label: 'Confirmed',         bg: '#F0FDF4', text: '#15803D' },
  PREPARING:          { label: 'Preparing',         bg: '#FFFBEB', text: '#B45309' },
  READY:              { label: 'Ready',             bg: '#F0FDF4', text: '#15803D' },
  OUT_FOR_DELIVERY:   { label: 'On the Way',        bg: '#EFF6FF', text: '#1D4ED8' },
  DELIVERED:          { label: 'Delivered',         bg: '#F0FDF4', text: '#15803D' },
  CANCELLED:          { label: 'Cancelled',         bg: '#FEF2F2', text: '#DC2626' },
};

function OrderCard({ order }: { order: Order }) {
  const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, bg: '#F5F1EC', text: '#2A1A1C' };
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity
      className="bg-white rounded-xl mb-3 p-4"
      onPress={() => router.push(`/(customer)/order/${order.id}`)}
      activeOpacity={0.8}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-cocoa font-semibold">#{order.orderNumber}</Text>
          <Text className="text-bronze text-xs mt-0.5">{date}</Text>
        </View>
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: statusConfig.bg }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: statusConfig.text }}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Items preview */}
      {order.items && order.items.length > 0 && (
        <Text className="text-bronze text-sm mb-2" numberOfLines={1}>
          {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
        </Text>
      )}

      <View className="flex-row items-center justify-between border-t border-ivory pt-2">
        <Text className="text-bronze text-xs">
          {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-maroon font-bold">₹{order.total?.toFixed(0)}</Text>
          <ChevronRight size={16} color="#C89B63" className="ml-1" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const {
    data: orders,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return data.data as Order[];
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="bg-maroon px-5 pt-4 pb-5">
        <Text className="text-gold text-xl font-bold">My Orders</Text>
        <Text className="text-cream text-sm opacity-80 mt-0.5">
          Track your deliveries
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4B0F16" />
          <Text className="text-bronze text-sm mt-3">Loading orders...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl mb-3">📦</Text>
          <Text className="text-cocoa font-semibold mb-1">Couldn't Load Orders</Text>
          <Text className="text-bronze text-sm text-center mb-4">
            Please check your connection and try again.
          </Text>
          <TouchableOpacity
            className="bg-maroon rounded-lg px-6 py-3"
            onPress={() => refetch()}
          >
            <Text className="text-cream font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !orders || orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🍱</Text>
          <Text className="text-cocoa text-xl font-semibold mb-2">No Orders Yet</Text>
          <Text className="text-bronze text-sm text-center mb-6">
            You haven't placed any orders. Start by browsing our menu!
          </Text>
          <TouchableOpacity
            className="bg-maroon rounded-lg px-8 py-3"
            onPress={() => router.push('/(customer)')}
          >
            <Text className="text-cream font-semibold">Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#4B0F16"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
