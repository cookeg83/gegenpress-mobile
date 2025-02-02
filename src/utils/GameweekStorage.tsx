import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Gameweek type
export interface Gameweek {
  id: number;
  app_switch_time: string;
}

// Fetch gameweeks from API
export const fetchGameweeks = async (): Promise<Gameweek[]> => {
  try {
    const response = await fetch("https://gegenpress.co.uk/api/app-gameweek");
    const data = await response.json();

    if (!data || !Array.isArray(data.appGameweekTimes)) {
      throw new Error("Unexpected API response format. Expected `appGameweekTimes` array.");
    }

    // Find the current gameweek
    const currentGameweek = data.appGameweekTimes.find((gw) => gw.is_current);

    if (!currentGameweek) {
      console.warn("No current gameweek found in API data.");
      return [];
    }

    // Include the current gameweek and the next three gameweeks
    const filteredGameweeks = [currentGameweek, ...data.appGameweekTimes
      .filter((gw) => gw.id !== currentGameweek.id && new Date(gw.app_switch_time) > new Date(currentGameweek.app_switch_time))
      .sort((a, b) => new Date(a.app_switch_time).getTime() - new Date(b.app_switch_time).getTime())
    ].slice(0, 4);

    return filteredGameweeks;
  } catch (error) {
    console.error("Failed to fetch gameweeks:", error);
    return [];
  }
};




// Save gameweeks to AsyncStorage
export const saveGameweeks = async (gameweeks: Gameweek[]) => {
  try {
    await AsyncStorage.setItem("gameweekData", JSON.stringify(gameweeks));
  } catch (error) {
    console.error("Failed to save gameweeks:", error);
  }
};

// Load and validate stored gameweeks
export const loadGameweeks = async (): Promise<Gameweek[] | null> => {
  try {
    const storedData = await AsyncStorage.getItem("gameweekData");
    if (!storedData) return null;

    return JSON.parse(storedData);
  } catch (error) {
    console.error("Error loading gameweeks:", error);
    return null;
  }
};


// Refresh gameweek data
export const refreshGameweeks = async () => {
  try {
    const existingData = await loadGameweeks();

    if (existingData && existingData.length === 4) {
      return;
    }

    const newGameweeks = await fetchGameweeks();
    if (!newGameweeks || newGameweeks.length === 0) {
      console.warn("No gameweeks fetched. Retaining existing data if available.");
      return;
    }

    await saveGameweeks(newGameweeks);
  } catch (error) {
    console.error('Error refreshing gameweeks:', error);
  }
};


// Get the current active gameweek based on app_switch_time
export const getCurrentGameweek = async (): Promise<Gameweek | null> => {
  try {
    const storedData = await loadGameweeks();
    if (!storedData || storedData.length === 0) {
      console.warn('No gameweeks available in getCurrentGameweek.');
      return null;
    }

    const now = new Date();
    let mostRecentGameweek: Gameweek | null = null;

    for (const gameweek of storedData) {
      const appSwitchTime = new Date(gameweek.app_switch_time);

      if (appSwitchTime <= now) {
        if (!mostRecentGameweek || new Date(mostRecentGameweek.app_switch_time) < appSwitchTime) {
          mostRecentGameweek = gameweek;
        }
      }
    }

    if (!mostRecentGameweek) {
      // Fallback: Closest future gameweek
      mostRecentGameweek = storedData
        .filter((gw) => new Date(gw.app_switch_time) > now)
        .sort((a, b) => new Date(a.app_switch_time).getTime() - new Date(b.app_switch_time).getTime())[0] || null;
      console.warn('No past gameweek found; selecting the closest future gameweek:', mostRecentGameweek);
    }

    return mostRecentGameweek;
  } catch (error) {
    console.error('Error in getCurrentGameweek:', error);
    return null;
  }
};




// Final export block
export {
  fetchGameweeks,
  saveGameweeks,
  loadGameweeks,
  refreshGameweeks,
  getCurrentGameweek,
};
