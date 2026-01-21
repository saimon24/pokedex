import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "pokemon_favorites";

export interface FavoritePokemon {
  id: number;
  name: string;
}

async function getFavorites(): Promise<FavoritePokemon[]> {
  const data = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    console.warn("Failed to parse favorites, resetting to empty array");
    await AsyncStorage.removeItem(FAVORITES_KEY);
    return [];
  }
}

async function saveFavorites(favorites: FavoritePokemon[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getFavorites();
    setFavorites(data);
  }, []);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, []);

  const addFavorite = useCallback(async (pokemon: FavoritePokemon) => {
    const current = await getFavorites();
    if (current.some((p) => p.id === pokemon.id)) return;
    const updated = [...current, pokemon];
    await saveFavorites(updated);
    setFavorites(updated);
  }, []);

  const removeFavorite = useCallback(async (id: number) => {
    const current = await getFavorites();
    const updated = current.filter((p) => p.id !== id);
    await saveFavorites(updated);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.some((p) => p.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (pokemon: FavoritePokemon) => {
      if (isFavorite(pokemon.id)) {
        await removeFavorite(pokemon.id);
      } else {
        await addFavorite(pokemon);
      }
    },
    [isFavorite, removeFavorite, addFavorite]
  );

  return {
    favorites,
    loading,
    refresh,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}
