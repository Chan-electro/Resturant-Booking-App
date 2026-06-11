import { Tabs } from 'expo-router';
import { Truck, History, User } from 'lucide-react-native';

export default function DeliveryLayout() {
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
          title: 'Deliveries',
          tabBarIcon: ({ color }) => <Truck size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
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
      <Tabs.Screen name="delivery/[id]" options={{ href: null }} />
    </Tabs>
  );
}
