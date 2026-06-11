import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useCart, CartItem } from '../../lib/cart';

const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <View className="bg-white rounded-xl mb-3 flex-row overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* Image */}
      <View className="w-20 h-20 bg-ivory">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-2xl">🍱</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="flex-1 p-3">
        <Text className="text-cocoa font-semibold text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-bronze text-xs mt-0.5">₹{item.price.toFixed(0)} each</Text>

        <View className="flex-row items-center justify-between mt-2">
          {/* Qty stepper */}
          <View className="flex-row items-center bg-maroon rounded-lg overflow-hidden">
            <TouchableOpacity
              className="px-3 py-1.5"
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Text className="text-cream font-bold">−</Text>
            </TouchableOpacity>
            <Text className="text-cream font-bold min-w-[20px] text-center text-sm">
              {item.quantity}
            </Text>
            <TouchableOpacity
              className="px-3 py-1.5"
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Text className="text-cream font-bold">+</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <Text className="text-maroon font-bold text-sm mr-3">
              ₹{(item.price * item.quantity).toFixed(0)}
            </Text>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Trash2 size={16} color="#7A2E36" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { items, total, itemCount, clearCart } = useCart();

  const tax = total * TAX_RATE;
  const deliveryFee = total > 0 ? DELIVERY_FEE : 0;
  const grandTotal = total + tax + deliveryFee;

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
        <View className="bg-maroon px-5 pt-4 pb-5">
          <Text className="text-gold text-xl font-bold">My Cart</Text>
          <Text className="text-cream text-sm opacity-80 mt-0.5">
            Review your order
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🛒</Text>
          <Text className="text-cocoa text-xl font-semibold mb-2">
            Your cart is empty
          </Text>
          <Text className="text-bronze text-sm text-center mb-6">
            Add some delicious items from the menu to get started.
          </Text>
          <TouchableOpacity
            className="bg-maroon rounded-lg px-8 py-3"
            onPress={() => router.push('/(customer)')}
          >
            <Text className="text-cream font-semibold">Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="bg-maroon px-5 pt-4 pb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-gold text-xl font-bold">My Cart</Text>
          <Text className="text-cream text-sm opacity-80 mt-0.5">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={clearCart}>
          <Text className="text-gold-light text-sm">Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartItemRow item={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View className="mt-2">
            {/* Order Summary */}
            <View className="bg-white rounded-xl p-4 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text className="text-cocoa font-semibold mb-3">Order Summary</Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-bronze text-sm">
                  Subtotal ({itemCount} items)
                </Text>
                <Text className="text-cocoa text-sm">₹{total.toFixed(0)}</Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-bronze text-sm">Tax (5%)</Text>
                <Text className="text-cocoa text-sm">₹{tax.toFixed(0)}</Text>
              </View>

              <View className="flex-row justify-between mb-3 pb-3 border-b border-ivory">
                <Text className="text-bronze text-sm">Delivery Fee</Text>
                <Text className="text-cocoa text-sm">₹{deliveryFee.toFixed(0)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-cocoa font-bold">Total</Text>
                <Text className="text-maroon font-bold text-base">
                  ₹{grandTotal.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        }
      />

      {/* Checkout Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-cream px-4 py-4 border-t border-ivory"
        style={{ paddingBottom: Platform.OS === 'ios' ? 28 : 16 }}
      >
        <TouchableOpacity
          className="bg-maroon rounded-xl py-4 items-center"
          onPress={() => router.push('/(customer)/checkout')}
          activeOpacity={0.9}
          style={{
            shadowColor: '#4B0F16',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text className="text-cream font-semibold text-base">
            Proceed to Checkout · ₹{grandTotal.toFixed(0)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
