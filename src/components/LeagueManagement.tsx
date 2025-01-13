import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

interface League {
  leagueId: string;
  leagueName: string;
}

const LeagueManagement: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  // Initialize `userLeagues` in AsyncStorage if it doesn't exist
  useEffect(() => {
    const initializeLeagues = async () => {
      try {
        const storedLeagues = await AsyncStorage.getItem('userLeagues');
        if (!storedLeagues) {
          console.log('Initializing userLeagues in AsyncStorage...');
          await AsyncStorage.setItem('userLeagues', JSON.stringify([]));
        }
      } catch (error) {
        console.error('Error initializing userLeagues:', error);
      }
    };

    initializeLeagues();
  }, []);

  // Load leagues with logging for debugging
  const loadLeagues = async () => {
    try {
      const storedLeagues = await AsyncStorage.getItem('userLeagues');
      if (storedLeagues) {
        const parsedLeagues = JSON.parse(storedLeagues);
        console.log('Leagues loaded from AsyncStorage:', parsedLeagues);
        setLeagues(parsedLeagues);
      } else {
        console.log('No leagues found in AsyncStorage.');
        setLeagues([]);
      }
    } catch (error) {
      console.error('Error loading leagues:', error);
    }
  };

  // Fetch leagues when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('LeagueManagement screen is focused. Reloading leagues...');
      loadLeagues();
    }, [])
  );

  const handleAddLeague = async () => {
    console.log('Navigating to LeagueInput to add a new league.');
    setMenuVisible(false);
    navigation.navigate('LeagueInput');
  };

  const handleRemoveLeague = (leagueId: string) => {
    console.log(`Attempting to remove league with ID: ${leagueId}`);
    Alert.alert('Remove League', 'Are you sure you want to remove this league?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updatedLeagues = leagues.filter((league) => league.leagueId !== leagueId);
          console.log('Updated leagues after removal:', updatedLeagues);
          setLeagues(updatedLeagues);
          await AsyncStorage.setItem('userLeagues', JSON.stringify(updatedLeagues));
          console.log('Leagues updated in AsyncStorage after removal.');
        },
      },
    ]);
  };

  return (
    <View>
      {leagues.length <= 1 ? (
        <TouchableOpacity onPress={handleAddLeague}>
          <Text style={styles.addLeagueText}>+ Add another league</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuText}>My Leagues</Text>
        </TouchableOpacity>
      )}

      <Modal visible={menuVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Manage Leagues</Text>
          <FlatList
            data={leagues}
            keyExtractor={(item) => item.leagueId}
            renderItem={({ item }) => (
              <View style={styles.leagueItem}>
                <Text style={styles.leagueName}>{item.leagueName}</Text>
                <TouchableOpacity onPress={() => handleRemoveLeague(item.leagueId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddLeague}>
            <Text style={styles.addButtonText}>+ Add Another League</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => setMenuVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addLeagueText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 14,
  },
  menuText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  leagueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
  },
  leagueName: {
    fontSize: 16,
  },
  removeText: {
    fontSize: 14,
    color: '#ff0000',
  },
  addButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LeagueManagement;
