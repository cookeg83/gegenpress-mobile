import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import axios from 'axios';
import TabNavigator from '../components/TabNavigator';
import LeagueManagement from '../components/LeagueManagement'; // Updated import

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

const HomeScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserLeagueData | null>(null);
  const [tabsData, setTabsData] = useState<TabsData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCategory, setCurrentCategory] = useState<string>('previews');
  const hardcodedGameweek = 21;
  const categories = ['previews'];
    // const categories = ['previews', 'predictions', 'planner'];


  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userLeagueData');
        if (storedData) {
          const parsedData: UserLeagueData = JSON.parse(storedData);
          setUserData(parsedData);
          console.log('Loaded user data:', parsedData);
        } else {
          console.warn('No user data found. Redirecting to selection flow.');
          Alert.alert('Error', 'Please select a league and manager first.');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const fetchTabsData = async () => {
      if (!userData) return;

      setLoading(true);
      const newTabsData: TabsData = {};
      try {
        for (const category of categories) {
          const endpoint = `https://www.gegenpress.co.uk/api/fantasy/images/${userData.leagueId}?gameweek=21&category=${category}`;
          console.log('API Endpoint:', endpoint);
          const response = await axios.get(endpoint);
          newTabsData[category] = response.data.images || [];
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
  }, [userData]);

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

  if (!userData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Replace + Add another league link with LeagueManagement */}
            <LeagueManagement navigation={null} /> 
            <Text style={styles.managerName}>{userData.manager.player_name}</Text>
          </View>
          <Text style={styles.headerTitle}>{userData.leagueName}</Text>
          <Text style={styles.headerSubtitle}>Gameweek {hardcodedGameweek}</Text>
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

        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>SHARE IN WHATSAPP</Text>
        </TouchableOpacity>
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
    paddingVertical: 20,
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    paddingVertical: 10,
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
