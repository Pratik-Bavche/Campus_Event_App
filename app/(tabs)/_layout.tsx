import { Tabs } from 'expo-router';
import { Bookmark, Calendar, Home, User } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, useColorScheme, useWindowDimensions } from 'react-native';
import { Colors } from '../../constants/theme';

import Animated, { FadeInDown } from 'react-native-reanimated';

const TabButton = (props: any) => {
  const { index = 0 } = props;
  
  return (
    <Animated.View 
      entering={FadeInDown.delay(100 * index).springify().damping(12)}
      style={{ flex: 1 }}
    >
      <Pressable
        {...props}
        style={({ pressed }) => [
          props.style,
          {
            transform: [{ scale: pressed ? 0.9 : 1 }],
            opacity: pressed ? 0.8 : 1,
            flex: 1,
          },
        ]}
      />
    </Animated.View>
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
          ...Platform.select({
            web: {
              boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
            },
            default: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            }
          }),
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
          tabBarButton: (props) => <TabButton {...props} index={0} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Calendar size={isTablet ? 28 : 24} color={color} />,
          tabBarButton: (props) => <TabButton {...props} index={1} />,
        }}
      />
      <Tabs.Screen
        name="registrations"
        options={{
          title: 'Registered',
          tabBarIcon: ({ color, size }) => <Bookmark size={isTablet ? 28 : 24} color={color} />,
          tabBarButton: (props) => <TabButton {...props} index={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={isTablet ? 28 : 24} color={color} />,
          tabBarButton: (props) => <TabButton {...props} index={3} />,
        }}
      />
    </Tabs>
  );
}
