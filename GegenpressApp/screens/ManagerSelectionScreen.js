import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Install with `npm install @react-native-picker/picker`

const TeamSelectionScreen = ({ route }) => {
  const { leagueName, managers } = route.params; // Passed from LeagueInputScreen
  const [selectedManager, setSelectedManager] = useState(managers[0]?.player_name || '');

  const handleSelectManager = () => {
    if (!selectedManager) {
      Alert.alert('Error', 'Please select your manager before proceeding.');
      return;
    }

    // Example action: Save selection or trigger next step
    Alert.alert('Manager Selected', `You selected: ${selectedManager}`);
    // Trigger next step in the wizard here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>League: {leagueName}</Text>
      <Text style={styles.subtitle}>Select your team:</Text>

      <Picker
        selectedValue={selectedManager}
        onValueChange={(itemValue) => setSelectedManager(itemValue)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        {managers.map((manager) => (
          <Picker.Item key={manager.player_name} label={manager.player_name} value={manager.player_name} />
        ))}
      </Picker>

      <Button title="Continue" onPress={handleSelectManager} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TeamSelectionScreen;
