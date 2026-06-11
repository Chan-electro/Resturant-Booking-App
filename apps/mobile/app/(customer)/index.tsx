import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Clock, ChevronRight } from 'lucide-react-native';
import api from '../../lib/api';
import { useCart } from '../../lib/cart';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  isAvailable?: boolean;
}

interface Category {
  id: string;
  name: string;
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(21, 0, 0, 0);
      if (now >= cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const diff = cutoff.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.id === item.id);
  const qty = cartItem?.quantity || 0;

  return (
    <View
      className="bg-white rounded-xl mb-3 overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row">
        {/* Image */}
        <View className="w-28 h-28 bg-ivory">
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-ivory">
              <Text className="text-3xl">🍱</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 p-3">
          <Text className="text-cocoa text-sm font-semibold" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-bronze text-xs mt-0.5" numberOfLines={2}>
            {item.description}
          </Text>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-1 gap-1">
              {item.tags.slice(0, 2).map((tag) => (
                <View key={tag} className="bg-gold-light rounded-full px-2 py-0.5">
                  <Text className="text-maroon text-xs">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Price + Add */}
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-maroon text-sm font-bold">
              ₹{item.price.toFixed(0)}
            </Text>

            {qty === 0 ? (
              <TouchableOpacity
                className="bg-maroon rounded-lg px-3 py-1.5"
                onPress={() =>
                  addItem({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    category: item.category,
                  })
                }
                activeOpacity={0.8}
              >
                <Text className="text-cream text-xs font-semibold">+ Add</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center bg-maroon rounded-lg overflow-hidden">
                <TouchableOpacity
                  className="px-3 py-1.5"
                  onPress={() => updateQuantity(item.id, qty - 1)}
                >
                  <Text className="text-cream text-sm font-bold">−</Text>
                </TouchableOpacity>
                <Text className="text-cream text-sm font-bold min-w-[20px] text-center">
                  {qty}
                </Text>
                <TouchableOpacity
                  className="px-3 py-1.5"
                  onPress={() => updateQuantity(item.id, qty + 1)}
                >
                  <Text className="text-cream text-sm font-bold">+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View className="bg-white rounded-xl mb-3 overflow-hidden h-28 flex-row">
      <View className="w-28 h-28 bg-ivory" />
      <View className="flex-1 p-3">
        <View className="h-4 bg-ivory rounded w-3/4 mb-2" />
        <View className="h-3 bg-ivory rounded w-full mb-1" />
        <View className="h-3 bg-ivory rounded w-2/3" />
      </View>
    </View>
  );
}

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const { itemCount, total } = useCart();
  const countdown = useCountdown();

  const {
    data: menuData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['daily-menu'],
    queryFn: async () => {
      const { data } = await api.get('/menu/daily');
      return data.data as MenuItem[];
    },
    retry: 2,
  });

  const {
    data: categoriesData,
  } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const { data } = await api.get('/menu/categories');
      return data.data as Category[];
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const categories = [{ id: 'ALL', name: 'All' }, ...(categoriesData || [])];

  const filteredItems =
    selectedCategory === 'ALL'
      ? menuData || []
      : (menuData || []).filter((item) => item.category === selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="bg-maroon px-5 pt-4 pb-5">
        <Text className="text-gold text-xl font-bold">Brahma Kalasha</Text>
        <Text className="text-cream text-sm mt-0.5 opacity-90">
          Premium Vegetarian Dining
        </Text>

        {/* Countdown */}
        <View className="flex-row items-center mt-3 bg-maroon-light rounded-lg px-3 py-2">
          <Clock size={14} color="#C89B63" />
          <Text className="text-gold text-xs ml-2 font-medium">
            Order cutoff (9 PM):
          </Text>
          <Text className="text-cream text-sm font-bold ml-2" style={{ fontVariant: ['tabular-nums'] }}>
            {countdown}
          </Text>
        </View>
      </View>

      {/* Tomorrow's Menu Label */}
      <View className="px-5 py-3 border-b border-ivory">
        <Text className="text-maroon font-semibold text-base">
          Tomorrow's Menu
        </Text>
        {menuData && (
          <Text className="text-bronze text-xs mt-0.5">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
          </Text>
        )}
      </View>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-grow-0 bg-white border-b border-ivory"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className={`mr-2 px-4 py-1.5 rounded-full ${
                selectedCategory === cat.id
                  ? 'bg-maroon'
                  : 'bg-cream border border-ivory'
              }`}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat.id ? 'text-cream' : 'text-cocoa'
                }`}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Menu List */}
      {isLoading ? (
        <ScrollView className="flex-1 px-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </ScrollView>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl mb-3">🍽️</Text>
          <Text className="text-cocoa font-semibold text-base mb-1">
            Menu Unavailable
          </Text>
          <Text className="text-bronze text-sm text-center mb-4">
            We couldn't load the menu. Please check your connection.
          </Text>
          <TouchableOpacity
            className="bg-maroon rounded-lg px-6 py-3"
            onPress={() => refetch()}
          >
            <Text className="text-cream font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-3xl mb-3">🍽️</Text>
          <Text className="text-cocoa font-semibold text-base">
            No items yet
          </Text>
          <Text className="text-bronze text-sm text-center mt-1">
            Today's menu is being prepared. Check back soon.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MenuItemCard item={item} />}
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: itemCount > 0 ? 100 : 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4B0F16" />
          }
        />
      )}

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <View
          className="absolute bottom-0 left-0 right-0 px-4 pb-4"
          style={{ paddingBottom: Platform.OS === 'ios' ? 16 : 8 }}
        >
          <TouchableOpacity
            className="bg-maroon rounded-xl px-5 py-4 flex-row items-center justify-between"
            onPress={() => router.push('/(customer)/cart')}
            activeOpacity={0.9}
            style={{
              shadowColor: '#4B0F16',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-maroon-light rounded-lg w-8 h-8 items-center justify-center mr-3">
                <Text className="text-cream font-bold text-sm">{itemCount}</Text>
              </View>
              <Text className="text-cream font-semibold">View Cart</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gold font-bold mr-2">₹{total.toFixed(0)}</Text>
              <ChevronRight size={18} color="#C89B63" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
