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

  const staticMessages = {
    previews: "Previews are available 24 hours before a gameweek starts",
    predictions: "Predictions are available 15 minutes before a gameweek starts",
    planner: "The planner is available 15 minutes before a gameweek starts",
  };

  const renderScene = ({ route }: { route: { key: string; title: string } }) => {
    const data = tabsData[route.key] || [];

    if (data.length === 0) {
      return (
        <View style={styles.scene}>
          <Text style={styles.placeholderText}>
            {staticMessages[route.key] || "Content is not available yet."}
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.ctaButtonText}>Notify me</Text>
          </TouchableOpacity>

          {isModalVisible && (
            <Modal
              animationType="slide"
              transparent
              visible={isModalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>Notifications will be coming soon!</Text>
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
          indicatorStyle={{ backgroundColor: '#007bff' }}
          style={{
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          }}
          labelStyle={{
            color: 'black',
            fontWeight: 'bold',
          }}
          activeColor="#007bff"
          inactiveColor="#777"
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
    paddingLeft: 30,
    paddingRight: 30,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  ctaButton: {
    padding: 12,
    backgroundColor: '#aaa',
    borderRadius: 8,
    marginTop: 0,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalText: {
    fontSize: 20,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    padding: 12,
    backgroundColor: '#25D366',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    paddingVertical: 10,
  },
});

export default TabNavigator;
