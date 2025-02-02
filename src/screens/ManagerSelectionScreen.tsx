import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Manager {
  player_name: string;
  id: string;
}

interface RouteParams {
  route: {
    params: {
      leagueId: string;
      leagueName: string;
      managers: Manager[];
      referralCode?: string;
    };
  };
  navigation: any;
}

const ManagerSelectionScreen: React.FC<RouteParams> = ({ route, navigation }) => {
  const { leagueId, leagueName, managers, referralCode } = route.params || {};
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [isNextEnabled, setIsNextEnabled] = useState<boolean>(false);

  // Sort managers alphabetically by `player_name`
  const sortedManagers = [...managers].sort((a, b) =>
    a.player_name.localeCompare(b.player_name)
  );

  const handleValueChange = (itemValue: string) => {
    const selected = sortedManagers.find(
      (manager) => manager.player_name === itemValue
    );
    setSelectedManager(selected || null);
    setIsNextEnabled(!!selected); // Enable the button if a valid manager is selected
  };

  const saveDataToStorage = async () => {
  if (!selectedManager) return;

  const userData = {
    leagueId,
    leagueName,
    referralCode,
    manager: selectedManager,
  };

  try {
    // Save to userLeagueData
    await AsyncStorage.setItem('userLeagueData', JSON.stringify(userData));
    console.log('User data saved successfully:', userData);

    // Update userLeagues
    const storedUserLeagues = await AsyncStorage.getItem('userLeagues');
    const userLeagues = storedUserLeagues ? JSON.parse(storedUserLeagues) : [];

    // Check if league already exists
    const existingLeagueIndex = userLeagues.findIndex(
      (league) => league.leagueId === leagueId
    );

    if (existingLeagueIndex !== -1) {
      // Update existing league
      userLeagues[existingLeagueIndex] = userData;
    } else {
      // Add new league
      userLeagues.push(userData);
    }

    await AsyncStorage.setItem('userLeagues', JSON.stringify(userLeagues));
    console.log('User leagues updated successfully:', userLeagues);
  } catch (error) {
    console.error('Error saving data:', error);
    Alert.alert('Error', 'Failed to save data. Please try again.');
  }
};


  const handleNavigateToHome = async () => {
    if (!selectedManager) {
      Alert.alert('Error', 'Please select a manager before proceeding.');
      return;
    }

    await saveDataToStorage();

    // Pass the correct referralCode and manager data to Home
    navigation.navigate('Home', {
      leagueId,
      leagueName,
      manager: selectedManager,
      referralCode: referralCode,  // Use the correct referralCode
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{leagueName}</Text>
      <Text style={styles.subtitle}>Which manager are you?</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedManager?.player_name || ''}
          onValueChange={handleValueChange}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {/* The first Picker item is disabled */}
          <Picker.Item label="Choose from list" value="" enabled={false} />
          {sortedManagers.map((manager, index) => (
            <Picker.Item
              key={manager.id || `manager-${index}`} // Ensure a unique key for each item
              label={manager.player_name}
              value={manager.player_name}
            />
          ))}
        </Picker>
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isNextEnabled ? '#007bff' : '#6c757d' },
        ]}
        disabled={!isNextEnabled}
        onPress={handleNavigateToHome}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 80,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#f9f9f9',
  },
  pickerItem: {
    color: '#333',
    fontSize: Platform.OS === 'ios' ? 22 : 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ManagerSelectionScreen;
