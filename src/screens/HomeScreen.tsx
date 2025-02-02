import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import axios from 'axios';
import TabNavigator from '../components/TabNavigator';
import LeagueManagement from '../components/LeagueManagement';
import { getCurrentGameweek } from '../utils/GameweekStorage';

interface Manager {
  player_name: string;
  id: string;
}

interface UserLeagueData {
  leagueId: string;
  leagueName: string;
  manager: Manager;
}

interface TabsData {
  [key: string]: string[];
}

// Analytics helper function
const logEvent = async (eventName: string, eventData: object) => {
  try {
    await axios.post('https://www.gegenpress.co.uk/api/log-event', {
      eventName,
      eventData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to log event:', error.message);
  }
};

const HomeScreen: React.FC = ({ navigation }) => {
  const [userData, setUserData] = useState<UserLeagueData | null>(null);
  const [tabsData, setTabsData] = useState<TabsData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCategory, setCurrentCategory] = useState<string>('previews');
  const [currentGameweekId, setCurrentGameweekId] = useState<number | null>(null);
  const categories = ['previews', 'predictions', 'planner'];

  // Initialize the app and fetch user data
  useEffect(() => {
    const initialize = async () => {
      try {
        const storedSelectedLeague = await AsyncStorage.getItem('selectedLeague');
        const storedUserLeagues = await AsyncStorage.getItem('userLeagues');

        if (storedSelectedLeague && storedUserLeagues) {
          const selectedLeague = JSON.parse(storedSelectedLeague);
          const userLeagues = JSON.parse(storedUserLeagues);

          if (userLeagues.length === 0) {
            navigation.navigate('LeagueInputScreen');
            return;
          }

          const matchingLeague = userLeagues.find(
            (league: UserLeagueData) => league.leagueId === selectedLeague.leagueId
          );

          if (!matchingLeague) {
            navigation.navigate('LeagueInputScreen');
            return;
          }

          setUserData({
            leagueId: selectedLeague.leagueId,
            leagueName: selectedLeague.leagueName,
            manager: matchingLeague.manager || { player_name: 'Unknown Manager', id: '0' },
          });

          const currentGameweek = await getCurrentGameweek();
          setCurrentGameweekId(currentGameweek?.id || null);

          // Track app initialization
          await logEvent('App Initialized', {
            leagueId: selectedLeague.leagueId,
            leagueName: selectedLeague.leagueName,
            managerName: matchingLeague.manager?.player_name,
          });
        } else {
          navigation.navigate('LeagueInputScreen');
        }
      } catch (error) {
        console.error('Error initializing HomeScreen:', error);
      }
    };

    initialize();
  }, [navigation]);

  // Fetch tab data based on the current gameweek and user league
  useEffect(() => {
    const fetchTabsData = async () => {
      if (!userData || currentGameweekId === null) {
        return;
      }

      setLoading(true);
      const newTabsData: TabsData = categories.reduce((acc, category) => {
        acc[category] = [];
        return acc;
      }, {} as TabsData);

      try {
        for (const category of categories) {
          const endpoint = `https://www.gegenpress.co.uk/api/fantasy/images/${userData.leagueId}?gameweek=${currentGameweekId}&category=${category}`;

          try {
            const response = await axios.get(endpoint);

            if (response.data.images && Array.isArray(response.data.images)) {
              newTabsData[category] = response.data.images;
            }

            // Track successful image fetch
            await logEvent('Images Fetched', {
              leagueId: userData.leagueId,
              gameweekId: currentGameweekId,
              category,
              imageCount: response.data.images?.length || 0,
            });
          } catch (categoryError) {
            console.warn(`Failed to fetch data for category ${category}:`, categoryError.message);
          }
        }

        setTabsData(newTabsData);
      } catch (error) {
        console.error('Error fetching tab data:', error);
        Alert.alert('Error', 'Failed to fetch images. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTabsData();
  }, [userData, currentGameweekId]);

  // Handle league switching
  const handleSwitchLeague = async (newSelectedLeague: UserLeagueData) => {
    try {
      await AsyncStorage.setItem('selectedLeague', JSON.stringify(newSelectedLeague));
      const storedUserLeagues = await AsyncStorage.getItem('userLeagues');
      const userLeagues = storedUserLeagues ? JSON.parse(storedUserLeagues) : [];
      const matchingLeague = userLeagues.find(
        (league: UserLeagueData) => league.leagueId === newSelectedLeague.leagueId
      );

      setTabsData({});
      setUserData({
        leagueId: newSelectedLeague.leagueId,
        leagueName: newSelectedLeague.leagueName,
        manager: matchingLeague?.manager || { player_name: 'Example Manager', id: '123' },
      });

      const currentGameweek = await getCurrentGameweek();
      setCurrentGameweekId(currentGameweek?.id || null);

      // Track league switching
      await logEvent('League Switched', {
        newLeagueId: newSelectedLeague.leagueId,
        newLeagueName: newSelectedLeague.leagueName,
        managerName: matchingLeague?.manager?.player_name,
      });
    } catch (error) {
      console.error('Error switching league:', error);
      Alert.alert('Error', 'Failed to switch league.');
    }
  };

  // Share images functionality
  const handleShare = async () => {
    const images = tabsData[currentCategory] || [];
    if (images.length === 0) {
      Alert.alert('No Images', 'There are no images to share.');
      return;
    }

    const localImagePaths: string[] = [];
    try {
      for (const image of images) {
        const fileUrl = `https://www.gegenpress.co.uk${image}`;
        const filePath = `${RNFS.DocumentDirectoryPath}/${image.split('/').pop()}`;
        await RNFS.downloadFile({ fromUrl: fileUrl, toFile: filePath }).promise;
        localImagePaths.push(filePath);
      }

      await Share.open({ urls: localImagePaths });

      // Track sharing
      await logEvent('Images Shared', {
        category: currentCategory,
        imageCount: images.length,
      });

      for (const path of localImagePaths) {
        await RNFS.unlink(path).catch((error) =>
          console.error('Error deleting file:', error)
        );
      }
    } catch (error) {
      console.error('Error sharing images:', error);
      Alert.alert('Error', 'Failed to share images. Please try again.');
    }
  };

// Render the UI
if (!userData || currentGameweekId === null) {
  console.warn('Missing data:', { userData, currentGameweekId });
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.errorText}>Loading...</Text>
    </SafeAreaView>
  );
}

const currentCategoryImages = tabsData[currentCategory] || [];
const hasImagesToShare = currentCategoryImages.length > 0;

return (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <LeagueManagement navigation={navigation} onLeagueSelect={handleSwitchLeague} />
          <Text style={styles.managerName}>
            {userData?.manager?.player_name || ''}
          </Text>
        </View>
        <Text style={styles.headerTitle}>{userData.leagueName}</Text>
        <Text style={styles.headerSubtitle}>
          Gameweek {currentGameweekId || 'Loading...'}
        </Text>
      </View>
      <View style={styles.separator} />

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <TabNavigator
            tabsData={tabsData}
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
          />
        )}
      </View>

      {/* Only show the button if there are images to share */}
      {hasImagesToShare && (
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>SHARE IN WHATSAPP</Text>
        </TouchableOpacity>
      )}
    </View>
  </SafeAreaView>
);

};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  managerName: {
    fontSize: 14,
    color: '#333',
    position: 'absolute',
    top: 20,
    right: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 20,
    color: '#555',
  },
  separator: {
    height: 0,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#25D366',
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default HomeScreen;
