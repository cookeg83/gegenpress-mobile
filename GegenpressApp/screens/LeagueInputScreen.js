import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const LeagueInputScreen = ({ navigation }) => {
  const [leagueId, setLeagueId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidateLeague = async () => {
    setLoading(true);
    try {
      // Call your API with the League ID
      const response = await axios.get(`https://www.gegenpress.co.uk/api/referrals-data/${leagueId}`);
      const leagueData = response.data;

      // Check if the league exists
      if (leagueData && leagueData.leagueId) {
        // League is valid - navigate to the next screen
        navigation.navigate('TeamSelection', {
          leagueId: leagueData.leagueId,
          leagueName: leagueData.leagueName,
          referralCode: leagueData.referralCode,
        });
      } else {
        // League does not exist
        Alert.alert('Invalid League ID', 'This League ID does not exist. Please sign up.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>What is your League ID?</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          width: '100%',
          paddingHorizontal: 10,
          marginBottom: 20,
        }}
        placeholder="Enter League ID"
        value={leagueId}
        onChangeText={setLeagueId}
        keyboardType="number-pad"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Validate" onPress={handleValidateLeague} />
      )}
      <Button
        title="Sign Up"
        onPress={() => Alert.alert('Redirect', 'Redirecting to the website for sign-up.')}
        color="gray"
      />
    </View>
  );
};

export default LeagueInputScreen;
