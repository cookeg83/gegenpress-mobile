import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

import LeagueInputScreen from './screens/LeagueInputScreen';
import ManagerSelectionScreen from './screens/ManagerSelectionScreen';
import HomeScreen from './screens/HomeScreen';
import LoadingScreen from './screens/LoadingScreen';
import { refreshGameweeks } from './utils/GameweekStorage';

export type RootStackParamList = {
  LeagueInput: undefined;
  ManagerSelectionScreen: { leagueId: string; leagueName: string; managers: any[] };
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');

  // Refresh gameweeks during app startup
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app...');
      setLoadingMessage('Refreshing gameweek data...');
      try {
        await refreshGameweeks();
        console.log('Gameweek data refreshed.');

        const storedData = await AsyncStorage.getItem('userLeagueData');
        console.log('Stored user league data:', storedData);

        if (storedData) {
          console.log('Persistent data found:', JSON.parse(storedData));
          setInitialRoute('Home');
        } else {
          console.log('No persistent data found. Starting at LeagueInputScreen.');
          setInitialRoute('LeagueInput');
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setInitialRoute('LeagueInput');
      }
    };

    initializeApp();
  }, []);

  // Refresh gameweeks when the app comes to the foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        setLoadingMessage('Refreshing gameweek data...');
        try {
          console.log('App is in the foreground. Refreshing gameweek data.');
          await refreshGameweeks();
        } catch (error) {
          console.error('Failed to refresh gameweeks in the foreground:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    console.log('Initial route set to:', initialRoute);
  }, [initialRoute]);

  if (!initialRoute) {
    return <LoadingScreen message={loadingMessage} />;
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

      {console.log('Rendering NavigationContainer with initial route:', initialRoute)}
    </NavigationContainer>
  );
};

export default App;
