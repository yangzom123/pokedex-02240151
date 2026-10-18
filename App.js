import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TeamProvider, useTeam } from './src/context/TeamContext';
import PokedexScreen from './src/screens/PokedexScreen';
import DetailScreen from './src/screens/DetailScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import { COLORS } from './src/themes';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

function Tabs() {
  const { team } = useTeam();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // each screen draws its own header
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen name="Pokédex" component={PokedexScreen} options={{ tabBarIcon: icon('📖') }} />
      <Tab.Screen
        name="My Team"
        component={TeamScreen}
        options={{ tabBarIcon: icon('⭐'), tabBarBadge: team.length > 0 ? team.length : undefined }}
      />
      <Tab.Screen name="Game" component={GameScreen} options={{ tabBarIcon: icon('🎮') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <TeamProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.textOnPrimary,
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Details' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </TeamProvider>
  );
}
