import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import LeagueInputScreen from './screens/LeagueInputScreen';
import ManagerSelectionScreen from './screens/ManagerSelectionScreen';
import HomeScreen from './screens/HomeScreen';

export type RootStackParamList = {
  LeagueInput: undefined;
  ManagerSelectionScreen: { leagueId: string; leagueName: string; managers: any[] };
  Home: undefined; // No params since data will be loaded from AsyncStorage
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkPersistentData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userLeagueData');
        if (storedData) {
          console.log('Persistent data found:', JSON.parse(storedData));
          setInitialRoute('Home'); // Navigate directly to HomeScreen
        } else {
          console.log('No persistent data found. Starting at LeagueInputScreen.');
          setInitialRoute('LeagueInput'); // Start at LeagueInputScreen
        }
      } catch (error) {
        console.error('Error checking persistent data:', error);
        setInitialRoute('LeagueInput'); // Default to LeagueInputScreen on error
      }
    };

    checkPersistentData();
  }, []);

  if (!initialRoute) {
    // Display a loading indicator while determining the initial route
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="LeagueInput" component={LeagueInputScreen} />
        <Stack.Screen name="ManagerSelectionScreen" component={ManagerSelectionScreen} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});

export default App;