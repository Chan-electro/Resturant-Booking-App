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
import { CheckCircle, ChevronRight, MapPin, Calendar } from 'lucide-react-native';
import api from '../../lib/api';

interface DeliveryHistory {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  deliveredAt?: string;
  createdAt: string;
  customer: {
    name: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
  };
  items: Array<{ name: string; quantity: number }>;
}

function HistoryCard({ item }: { item: DeliveryHistory }) {
  const date = item.deliveredAt || item.createdAt;
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity
      className="bg-white rounded-xl mb-3 p-4"
      onPress={() => router.push(`/(delivery)/delivery/${item.id}`)}
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
          <Text className="text-cocoa font-semibold">{item.customer.name}</Text>
          <Text className="text-bronze text-xs mt-0.5">#{item.orderNumber}</Text>
        </View>
        <View className="flex-row items-center bg-green-50 rounded-full px-2.5 py-1">
          <CheckCircle size={12} color="#15803D" />
          <Text className="text-green-700 text-xs font-semibold ml-1">Delivered</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-1">
        <MapPin size={12} color="#A86F3D" />
        <Text className="text-bronze text-xs ml-1.5" numberOfLines={1}>
          {item.deliveryAddress.street}, {item.deliveryAddress.city}
        </Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Calendar size={12} color="#A86F3D" />
        <Text className="text-bronze text-xs ml-1.5">{formattedDate}</Text>
      </View>

      <View className="flex-row items-center justify-between border-t border-ivory pt-2">
        <Text className="text-bronze text-xs">
          {item.items.map((i) => `${i.name} ×${i.quantity}`).join(', ').slice(0, 40)}
          {item.items.map((i) => `${i.name} ×${i.quantity}`).join(', ').length > 40 ? '...' : ''}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-maroon font-bold text-sm">₹{item.totalAmount.toFixed(0)}</Text>
          <ChevronRight size={14} color="#C89B63" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DeliveryHistoryScreen() {
  const {
    data: history,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['delivery-history'],
    queryFn: async () => {
      const { data } = await api.get('/delivery/history');
      return data.data as DeliveryHistory[];
    },
  });

  // Stats
  const totalDeliveries = history?.length || 0;
  const totalEarnings = history?.reduce((sum, d) => sum + d.totalAmount, 0) || 0;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="bg-maroon px-5 pt-4 pb-5">
        <Text className="text-gold text-xl font-bold">Delivery History</Text>
        <Text className="text-cream text-sm opacity-80 mt-0.5">
          Your completed deliveries
        </Text>
      </View>

      {/* Stats Banner */}
      {totalDeliveries > 0 && (
        <View className="flex-row bg-white border-b border-ivory">
          <View className="flex-1 items-center py-3 border-r border-ivory">
            <Text className="text-maroon text-xl font-bold">{totalDeliveries}</Text>
            <Text className="text-bronze text-xs mt-0.5">Total Deliveries</Text>
          </View>
          <View className="flex-1 items-center py-3">
            <Text className="text-maroon text-xl font-bold">₹{totalEarnings.toFixed(0)}</Text>
            <Text className="text-bronze text-xs mt-0.5">Total Value</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4B0F16" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-cocoa font-semibold mb-2">Couldn't Load History</Text>
          <TouchableOpacity className="bg-maroon rounded-lg px-6 py-3" onPress={() => refetch()}>
            <Text className="text-cream font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !history || history.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📋</Text>
          <Text className="text-cocoa text-xl font-semibold mb-2">No History Yet</Text>
          <Text className="text-bronze text-sm text-center">
            Your completed deliveries will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryCard item={item} />}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4B0F16" />
          }
        />
      )}
    </SafeAreaView>
  );
}
