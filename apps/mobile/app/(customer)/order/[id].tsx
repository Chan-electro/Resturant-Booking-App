import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Circle, Clock } from 'lucide-react-native';
import api from '../../../lib/api';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  paymentMethod: string;
  createdAt: string;
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
}

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', description: 'Your order has been received' },
  { key: 'CONFIRMED', label: 'Confirmed', description: 'Order confirmed by kitchen' },
  { key: 'PREPARING', label: 'Preparing', description: 'Your food is being prepared' },
  { key: 'READY', label: 'Ready', description: 'Ready for pickup' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the Way', description: 'Out for delivery' },
  { key: 'DELIVERED', label: 'Delivered', description: 'Order delivered!' },
];

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <View className="bg-red-50 border border-red-200 rounded-xl p-4">
        <Text className="text-red-600 font-semibold text-center">Order Cancelled</Text>
      </View>
    );
  }

  return (
    <View>
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isPending = idx > currentIdx;

        return (
          <View key={step.key} className="flex-row items-start">
            {/* Icon & Line */}
            <View className="items-center mr-3">
              {isCompleted ? (
                <CheckCircle size={22} color="#15803D" />
              ) : isActive ? (
                <View className="w-5 h-5 rounded-full bg-maroon items-center justify-center">
                  <View className="w-2.5 h-2.5 rounded-full bg-cream" />
                </View>
              ) : (
                <Circle size={22} color="#E7DED7" />
              )}
              {idx < STATUS_STEPS.length - 1 && (
                <View
                  className="w-0.5 mt-0.5"
                  style={{
                    height: 28,
                    backgroundColor: isCompleted ? '#15803D' : '#E7DED7',
                  }}
                />
              )}
            </View>

            {/* Text */}
            <View className="flex-1 pb-4">
              <Text
                className={`text-sm font-semibold ${
                  isCompleted
                    ? 'text-green-700'
                    : isActive
                    ? 'text-maroon'
                    : 'text-bronze'
                }`}
              >
                {step.label}
              </Text>
              <Text
                className={`text-xs mt-0.5 ${
                  isPending ? 'text-ivory' : 'text-bronze'
                }`}
              >
                {step.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.data as OrderDetail;
    },
    enabled: !!id,
  });

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="bg-maroon px-5 pt-4 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#C89B63" />
        </TouchableOpacity>
        <View>
          <Text className="text-gold text-xl font-bold">Order Details</Text>
          {order && (
            <Text className="text-cream text-sm opacity-80 mt-0.5">
              #{order.orderNumber}
            </Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4B0F16" />
        </View>
      ) : error || !order ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-cocoa font-semibold mb-2">Order not found</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="text-gold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Date & Payment */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Clock size={14} color="#A86F3D" />
                <Text className="text-bronze text-sm ml-1">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text className="text-cocoa text-sm font-medium">{order.paymentMethod}</Text>
            </View>
          </View>

          {/* Status Timeline */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <Text className="text-cocoa font-semibold mb-4">Order Status</Text>
            <StatusTimeline currentStatus={order.status} />
          </View>

          {/* Delivery Address */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <Text className="text-cocoa font-semibold mb-2">Delivery Address</Text>
            <Text className="text-bronze text-sm">
              {order.deliveryAddress.street}
            </Text>
            <Text className="text-bronze text-sm">
              {order.deliveryAddress.city} - {order.deliveryAddress.zipCode}
            </Text>
            {order.deliveryAddress.instructions && (
              <Text className="text-bronze text-xs mt-1 italic">
                {order.deliveryAddress.instructions}
              </Text>
            )}
          </View>

          {/* Items */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
          >
            <Text className="text-cocoa font-semibold mb-3">Items Ordered</Text>
            {order.items.map((item) => (
              <View key={item.id} className="flex-row justify-between mb-2">
                <Text className="text-cocoa text-sm flex-1 mr-2" numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <Text className="text-cocoa text-sm">
                  ₹{(item.unitPrice * item.quantity).toFixed(0)}
                </Text>
              </View>
            ))}

            <View className="border-t border-ivory mt-2 pt-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-bronze text-sm">Subtotal</Text>
                <Text className="text-cocoa text-sm">₹{order.subtotal?.toFixed(0)}</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-bronze text-sm">Tax</Text>
                <Text className="text-cocoa text-sm">₹{order.tax?.toFixed(0)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-bronze text-sm">Delivery Fee</Text>
                <Text className="text-cocoa text-sm">₹{order.deliveryFee?.toFixed(0)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-cocoa font-bold">Total</Text>
                <Text className="text-maroon font-bold text-base">
                  ₹{order.total.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
