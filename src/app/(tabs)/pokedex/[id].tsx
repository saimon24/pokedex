import { Ionicons } from "@expo/vector-icons";
import { statLabels } from "@/src/constants/pokemon";
import { useFavorites } from "@/src/lib/favorites";
import { fetchPokemonDetails } from "@/src/lib/pokeapi";
import { colors, statColors, typeColors } from "@/src/theme/colors";
import type { PokemonDetails } from "@/src/types/pokemon";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PokemonDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!id) return;

    fetchPokemonDetails(id)
      .then(setPokemon)
      .catch((err) => setError(err.message || "Failed to load Pokemon"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Pokemon not found"}</Text>
      </View>
    );
  }

  const primaryType = pokemon.types[0]?.type.name || "normal";
  const backgroundColor = typeColors[primaryType] || typeColors.normal;
const artworkUrl = pokemon.sprites.other["official-artwork"].front_default 
  ?? pokemon.sprites.front_default;
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.headerTop}>
          <Text style={styles.pokemonId}>
            #{String(pokemon.id).padStart(3, "0")}
          </Text>
          <Pressable
            onPress={() => toggleFavorite({ id: pokemon.id, name: pokemon.name })}
            hitSlop={10}
          >
            <Ionicons
              name={isFavorite(pokemon.id) ? "heart" : "heart-outline"}
              size={28}
              color={colors.white}
            />
          </Pressable>
        </View>
        <Text style={styles.pokemonName}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>

        <View style={styles.typesContainer}>
          {pokemon.types.map((t) => (
            <View key={t.type.name} style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {t.type.name.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        <Image
          source={{ uri: artworkUrl }}
          style={styles.artwork}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>
              {(pokemon.weight / 10).toFixed(1)} kg
            </Text>
            <Text style={styles.infoLabel}>Weight</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>
              {(pokemon.height / 10).toFixed(1)} m
            </Text>
            <Text style={styles.infoLabel}>Height</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Base Stats</Text>
        <View style={styles.statsContainer}>
          {pokemon.stats.map((stat) => {
            const statName = stat.stat.name;
            const percentage = (stat.base_stat / 255) * 100;
            return (
              <View key={statName} style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {statLabels[statName] || statName.toUpperCase()}
                </Text>
                <Text style={styles.statValue}>{stat.base_stat}</Text>
                <View style={styles.statBarContainer}>
                  <View
                    style={[
                      styles.statBar,
                      {
                        width: `${percentage}%`,
                        backgroundColor: statColors[statName] || backgroundColor,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Abilities</Text>
        <View style={styles.abilitiesContainer}>
          {pokemon.abilities.map((a) => (
            <View key={a.ability.name} style={styles.abilityBadge}>
              <Text style={styles.abilityText}>
                {a.ability.name
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Text>
              {a.is_hidden && <Text style={styles.hiddenLabel}> (Hidden)</Text>}
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.statsButton, { backgroundColor }]}
          onPress={() => router.push(`/pokemon-stats-modal?id=${id}` as Href)}
        >
          <Text style={styles.statsButtonText}>View Detailed Stats</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: colors.text.error,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 80,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  pokemonId: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.transparent.white70,
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 4,
  },
  typesContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.transparent.white25,
  },
  typeText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 12,
  },
  artwork: {
    width: 220,
    height: 220,
    marginTop: 20,
  },
  content: {
    padding: 20,
    marginTop: -40,
  },
  infoRow: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: colors.surface.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statLabel: {
    width: 60,
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  statValue: {
    width: 35,
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    textAlign: "right",
    marginRight: 12,
  },
  statBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface.secondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    borderRadius: 3,
  },
  abilitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  abilityBadge: {
    flexDirection: "row",
    backgroundColor: colors.surface.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  abilityText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  hiddenLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  contentContainer: {
    paddingBottom: 80,
  },
  statsButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  statsButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
