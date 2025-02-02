import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface League {
  leagueId: string;
  leagueName: string;
}

interface LeagueManagementProps {
  onLeagueSelect: (league: League) => void;
  navigation: any;
}

const LeagueManagement: React.FC<LeagueManagementProps> = ({ onLeagueSelect, navigation }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const storedLeagues = await AsyncStorage.getItem('userLeagues');
        if (storedLeagues) {
          const parsedLeagues = JSON.parse(storedLeagues);
          setLeagues(parsedLeagues);
        } else {
          setLeagues([]);
        }

        const storedSelectedLeague = await AsyncStorage.getItem('selectedLeague');
        if (storedSelectedLeague) {
          const selectedLeague = JSON.parse(storedSelectedLeague);
          setSelectedLeagueId(selectedLeague.leagueId);
        }
      } catch (error) {
        console.error('Error loading leagues:', error);
      }
    };

    loadLeagues();
  }, []);

  const handleAddLeague = () => {
    navigation.navigate('LeagueInputScreen');
  };

  const handleRemoveLeague = (leagueId: string) => {
    Alert.alert('Remove League', 'Are you sure you want to remove this league?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updatedLeagues = leagues.filter((league) => league.leagueId !== leagueId);
          setLeagues(updatedLeagues);
          await AsyncStorage.setItem('userLeagues', JSON.stringify(updatedLeagues));
        },
      },
    ]);
  };

  const handleSelectLeague = (league: League) => {
    setSelectedLeagueId(league.leagueId);
    onLeagueSelect(league);
    setMenuVisible(false);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuTrigger}
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <Text style={styles.menuTriggerText}>My Leagues</Text>
      </TouchableOpacity>

      {menuVisible && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay}>
            <View style={styles.menu}>
              <FlatList
                data={leagues}
                keyExtractor={(item) => item.leagueId}
                renderItem={({ item }) => (
                  <View style={styles.menuItem}>
                    <TouchableOpacity onPress={() => handleSelectLeague(item)}>
                      <Text
                        style={[
                          styles.menuItemText,
                          item.leagueId === selectedLeagueId && styles.selectedLeague,
                        ]}
                      >
                        {item.leagueName}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeIconWrapper}
                      onPress={() => handleRemoveLeague(item.leagueId)}
                    >
                      <Ionicons name="remove-circle" size={20} color="#ff0000" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              <TouchableOpacity style={styles.addLeagueButton} onPress={handleAddLeague}>
                <Text style={styles.addLeagueButtonText}>+ Add Another League</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000, // Ensure this container stays on top of other elements
  },
  menuTrigger: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'ffffff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTriggerText: {
    fontSize: 14,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)', // Dimmed background
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    top: 40, // Adjust to appear just below the button
    left: 10, // Align with the button
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: 250,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'left',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1, // Allow text to take remaining space
    flexWrap: 'wrap', // Allow wrapping
    marginRight: 25, // Add some space between text and the icon
  },
  selectedLeague: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  removeIconWrapper: {
    alignItems: 'right',
    marginLeft: 0,
  },
  addLeagueButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    marginTop: 10,
  },
  addLeagueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LeagueManagement;
