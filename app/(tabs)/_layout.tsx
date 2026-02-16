import { Tabs } from 'expo-router';
import { Bookmark, Calendar, Home, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

const TabButton = (props: any) => {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        props.style,
        {
          transform: [{ scale: pressed ? 0.9 : 1 }],
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    />
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarButton: (props) => <TabButton {...props} />,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registrations"
        options={{
          title: 'Registered',
          tabBarIcon: ({ color, size }) => <Bookmark size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
