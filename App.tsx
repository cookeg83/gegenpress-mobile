import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LeagueInputScreen from './screens/LeagueInputScreen';
import ManagerSelectionScreen from './screens/ManagerSelectionScreen';
import HomeScreen from './screens/HomeScreen';
import LeagueManagement from './components/LeagueManagement';

const Stack = createStackNavigator();

export type RootStackParamList = {
  LeagueInput: undefined;
  ManagerSelectionScreen: { leagueId: string; leagueName: string; managers: any[] };
  Home: undefined;
  LeagueManagement: undefined;
};

const SideMenu: React.FC<{ visible: boolean; onClose: () => void; navigation: any }> = ({
  visible,
  onClose,
  navigation,
}) => {
  const menuItems = [
    { name: 'Home', route: 'Home' },
    { name: 'Manage Leagues', route: 'LeagueManagement' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.sideMenuContainer}>
        <View style={styles.sideMenuHeader}>
          <Text style={styles.sideMenuTitle}>Fantasy App</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.route}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate(item.route);
                onClose();
              }}
            >
              <Text style={styles.menuItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="LeagueInput">
      <Stack.Screen
        name="LeagueInput"
        component={LeagueInputScreen}
        options={{ title: 'Enter League ID' }}
      />
      <Stack.Screen
        name="ManagerSelectionScreen"
        component={ManagerSelectionScreen}
        options={{ title: 'Select Manager' }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }} // Disable header for Home
      />
      <Stack.Screen
        name="LeagueManagement"
        component={LeagueManagement}
        options={{ title: 'Manage Leagues' }}
      />
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuButtonText}>Menu</Text>
        </TouchableOpacity>
        <SideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          navigation={React.useRef().current}
        />
        <StackNavigator />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sideMenuContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 50,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sideMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  closeButton: {
    fontSize: 16,
    color: '#007bff',
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuItemText: {
    fontSize: 18,
    color: '#555',
  },
});

export default App;
