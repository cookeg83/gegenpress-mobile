import React, { useState } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';

interface TabNavigatorProps {
  tabsData: Record<string, string[]>;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({
  tabsData,
  currentCategory,
  setCurrentCategory,
}) => {
  const [index, setIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const categories = Object.keys(tabsData);
  const routes = categories.map((category) => ({
    key: category,
    title: capitalize(category),
  }));

  const renderScene = ({ route }: { route: { key: string; title: string } }) => {
    const data = tabsData[route.key] || [];

    if (data.length === 0) {
      // Graceful fallback for unavailable tabs
      return (
        <View style={styles.scene}>
          <Text style={styles.placeholderText}>
            {route.title} content is not available yet.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.ctaButtonText}>Sign up to be notified</Text>
          </TouchableOpacity>

          {/* Modal for notification CTA */}
          {isModalVisible && (
            <Modal
              animationType="slide"
              transparent
              visible={isModalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>Notifications Coming Soon!</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          )}
        </View>
      );
    }

    // Render tab data when available
    return (
      <FlatList
        data={data}
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
    );
  };

  const onTabChange = (newIndex: number) => {
    setIndex(newIndex);
    setCurrentCategory(categories[newIndex]);
  };

  return (
    <TabView
  navigationState={{ index, routes }}
  renderScene={renderScene}
  onIndexChange={onTabChange}
  initialLayout={{ width: Dimensions.get('window').width }}
  renderTabBar={(props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#007bff' }} // Indicator color
      style={{
        backgroundColor: 'white', // Tab bar background color
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0', // Separator line
      }}
      labelStyle={{
        color: 'black', // Tab label color
        fontWeight: 'bold', // Make labels bold
      }}
      activeColor="#007bff" // Active tab label color
      inactiveColor="#777" // Inactive tab label color
    />
  )}
/>

  );
};

const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 10,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#25D366',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imageGrid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;
