import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react-native';
import { useCart } from '../../lib/cart';

function CartTabIcon({ color }: { color: string }) {
  const { itemCount } = useCart();
  return (
    <View>
      <ShoppingCart size={24} color={color} />
      {itemCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -8,
            backgroundColor: '#4B0F16',
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ color: '#F5F1EC', fontSize: 10, fontWeight: '700' }}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4B0F16',
        tabBarInactiveTintColor: '#C89B63',
        tabBarStyle: {
          backgroundColor: '#F5F1EC',
          borderTopColor: '#E7DED7',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <CartTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
    </Tabs>
  );
}
