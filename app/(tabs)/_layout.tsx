import { Tabs } from 'expo-router';
import { Bookmark, Calendar, Home, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, useColorScheme, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
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
          backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: colors.border,
          height: isTablet ? 80 : 70,
          paddingBottom: isTablet ? 20 : 15,
          paddingTop: isTablet ? 15 : 10,
          marginBottom: 16,
          marginHorizontal: isTablet ? 'auto' : 16,
          width: isTablet ? 500 : 'auto',
          alignSelf: 'center',
          borderRadius: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
          position: 'absolute',
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 14 : 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Calendar size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registrations"
        options={{
          title: 'Registered',
          tabBarIcon: ({ color, size }) => <Bookmark size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={isTablet ? 28 : 24} color={color} />,
        }}
      />
    </Tabs>
  );
}
