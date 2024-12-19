import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LeagueInputScreen from './screens/LeagueInputScreen';
import TeamSelectionScreen from './screens/ManagerSelectionScreen';
import HomeScreen from './screens/HomeScreen';

export type RootStackParamList = {
  LeagueInput: undefined;
  TeamSelection: { leagueId: string };
  Home: { leagueId: string; manager: any };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LeagueInput">
        <Stack.Screen name="LeagueInput" component={LeagueInputScreen} />
        <Stack.Screen name="TeamSelection" component={TeamSelectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
