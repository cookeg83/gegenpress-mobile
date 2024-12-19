import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import Share from 'react-native-share';

const HomeScreen = ({ route }) => {
  const { leagueId, manager } = route.params; // Passed from previous screens
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `https://www.gegenpress.co.uk/api/fantasy/images/${leagueId}?gameweek=16&category=previews`
        );
        setImages(response.data.images || []);
      } catch (error) {
        console.error('Error fetching images:', error);
        Alert.alert('Error', 'Failed to fetch images. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [leagueId]);

  const handleShare = async () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'There are no images to share.');
      return;
    }

    try {
      await Share.open({
        urls: images.map((image) => `https://www.gegenpress.co.uk${image}`), // Full URLs
      });
    } catch (error) {
      console.error('Error sharing images:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.managerName}>{manager.player_name}</Text>
        <Text style={styles.leagueName}>{manager.leagueName}</Text>
        <Text style={styles.gameweek}>Gameweek 16</Text>
      </View>

      {/* Category Navigation */}
      <View style={styles.categories}>
        {['Previews', 'Predictions', 'Planner', 'Live Scores'].map((category) => (
          <Text key={category} style={styles.categoryText}>
            {category}
          </Text>
        ))}
      </View>

      {/* Images Grid */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `https://www.gegenpress.co.uk${item}` }}
                style={styles.image}
              />
            )}
            numColumns={3}
            contentContainerStyle={styles.imageGrid}
          />
        )}
      </View>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>SHARE IN WHATSAPP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  managerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  leagueName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameweek: {
    fontSize: 18,
    fontWeight: '400',
    marginTop: 5,
    marginBottom: 10,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007bff',
  },
  imageGrid: {
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  shareButton: {
    backgroundColor: '#25D366', // WhatsApp Green
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 20,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;
