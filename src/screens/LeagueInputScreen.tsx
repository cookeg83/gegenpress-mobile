import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface LeagueInputScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

const LeagueInputScreen: React.FC<LeagueInputScreenProps> = ({ navigation }) => {
  const [leagueId, setLeagueId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleValidateLeague = useCallback(async () => {
    if (!leagueId.trim() || leagueId.length < 5 || leagueId.length > 7) {
      Alert.alert('Validation Error', 'Please enter a valid League ID (5-7 digits).');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `https://www.gegenpress.co.uk/api/referrals-data/${leagueId}`
      );
      const leagueData = response.data;

      if (leagueData?.leagueId) {
        console.log('League data fetched:', leagueData);

        // Get existing leagues from AsyncStorage
        const storedLeagues = await AsyncStorage.getItem('userLeagues');
        const leaguesArray = storedLeagues ? JSON.parse(storedLeagues) : [];

        // Check if league is already added
        const isDuplicate = leaguesArray.some(
          (league: { leagueId: string }) => league.leagueId === leagueData.leagueId
        );

        if (!isDuplicate) {
          // Add the new league to the list
          const updatedLeagues = [
            ...leaguesArray,
            { leagueId: leagueData.leagueId, leagueName: leagueData.leagueName },
          ];
          await AsyncStorage.setItem('userLeagues', JSON.stringify(updatedLeagues));
          console.log('Updated userLeagues:', updatedLeagues);

          // Set the new league as selected
          await AsyncStorage.setItem('selectedLeague', JSON.stringify({
            leagueId: leagueData.leagueId,
            leagueName: leagueData.leagueName,
          }));

          // Store the managers (with player_name) in AsyncStorage
          await AsyncStorage.setItem('managers', JSON.stringify(leagueData.managers));

          // Navigate to ManagerSelectionScreen
navigation.navigate('ManagerSelectionScreen', {
  leagueId: leagueData.leagueId,
  leagueName: leagueData.leagueName,
  managers: leagueData.managers,
  referralCode: leagueData.referralCode, // Make sure referralCode is passed
});
        } else {
          Alert.alert('Duplicate League', 'This league has already been added.');
        }
      } else {
        Alert.alert('Invalid League ID', 'This League ID does not exist.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Unable to validate league.');
    } finally {
      setLoading(false);
    }
  }, [leagueId, navigation]);

  const isButtonEnabled = leagueId.length >= 5 && leagueId.length <= 7;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is your League ID?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter League ID (5-7 digits)"
        value={leagueId}
        onChangeText={(text) => setLeagueId(text.replace(/[^0-9]/g, ''))} // Allow only numbers
        keyboardType="number-pad"
        maxLength={7}
        autoFocus
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isButtonEnabled ? '#007bff' : '#6c757d' },
          ]}
          disabled={!isButtonEnabled}
          onPress={handleValidateLeague}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => Alert.alert('Redirect', 'Redirecting to the website for sign-up.')}
      >
        <Text style={styles.linkText}>Sign Up</Text>
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
    marginBottom: 40,
    textAlign: 'center',
    marginTop: 80,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LeagueInputScreen;
