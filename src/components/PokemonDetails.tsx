import { Ionicons } from "@expo/vector-icons";
import { statLabels } from "@/src/constants/pokemon";
import { useFavorites } from "@/src/lib/favorites";
import { fetchPokemonDetails } from "@/src/lib/pokeapi";
import { colors, statColors, typeColors } from "@/src/theme/colors";
import type { PokemonDetails as PokemonDetailsType } from "@/src/types/pokemon";
import { Href, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView as RNScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

interface PokemonDetailsProps {
  id: string;
  showStatsButton?: boolean;
}

const HEADER_HEIGHT = 380;

export function PokemonDetails({ id, showStatsButton = true }: PokemonDetailsProps) {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<PokemonDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        // Header moves slower than scroll (parallax) - positive translateY counteracts scroll
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_HEIGHT],
          [0, HEADER_HEIGHT * 0.5],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const artworkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [-100, 0, HEADER_HEIGHT],
          [1.3, 1, 0.8],
          Extrapolation.CLAMP
        ),
      },
      {
        // Artwork floats up slightly as you scroll
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_HEIGHT],
          [0, -40],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const headerTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.3],
      [1, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_HEIGHT * 0.3],
          [0, -15],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // Background that extends upward for overscroll
  const overscrollBgStyle = useAnimatedStyle(() => ({
    // When pulling down (negative scroll), extend the background upward
    height: interpolate(
      scrollY.value,
      [-300, 0],
      [HEADER_HEIGHT + 300, HEADER_HEIGHT],
      Extrapolation.CLAMP
    ),
    top: interpolate(
      scrollY.value,
      [-300, 0],
      [-300, 0],
      Extrapolation.CLAMP
    ),
  }));

  useEffect(() => {
    if (!id) return;

    fetchPokemonDetails(id)
      .then(setPokemon)
      .catch((err) => setError(err.message || "Failed to load Pokemon"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <SkeletonLoader />;
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
    ?? pokemon.sprites.front_default
    ?? undefined;

  return (
    <Reanimated.ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {/* Background that extends upward for overscroll */}
      <Reanimated.View
        style={[
          styles.overscrollBackground,
          { backgroundColor },
          overscrollBgStyle,
        ]}
      />
      <Reanimated.View entering={FadeInUp.duration(400)} style={[styles.header, { backgroundColor }, headerAnimatedStyle]}>
        <Reanimated.View style={[styles.headerTop, headerTextAnimatedStyle]}>
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
        </Reanimated.View>
        <Reanimated.View style={headerTextAnimatedStyle}>
          <Text style={styles.pokemonName}>
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </Text>

          <View style={styles.typesContainer}>
            {pokemon.types.map((t, index) => (
              <Reanimated.View key={t.type.name} entering={FadeIn.delay(200 + index * 100).duration(300)} style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {t.type.name.toUpperCase()}
                </Text>
              </Reanimated.View>
            ))}
          </View>
        </Reanimated.View>

        <Reanimated.View entering={ZoomIn.delay(300).duration(400).springify()} style={artworkAnimatedStyle}>
          <Image
            source={{ uri: artworkUrl }}
            style={styles.artwork}
            resizeMode="contain"
          />
        </Reanimated.View>
      </Reanimated.View>

      <View style={styles.content}>
        <Reanimated.View entering={FadeInDown.delay(400).duration(400)} style={styles.infoRow}>
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
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionTitle}>Base Stats</Text>
          <View style={styles.statsContainer}>
            {pokemon.stats.map((stat, index) => {
              const statName = stat.stat.name;
              const percentage = (stat.base_stat / 255) * 100;
              return (
                <Reanimated.View key={statName} entering={FadeInDown.delay(550 + index * 50).duration(300)} style={styles.statRow}>
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
                </Reanimated.View>
              );
            })}
          </View>
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.delay(850).duration(400)}>
          <Text style={styles.sectionTitle}>Abilities</Text>
          <View style={styles.abilitiesContainer}>
            {pokemon.abilities.map((a, index) => (
              <Reanimated.View key={a.ability.name} entering={FadeIn.delay(900 + index * 100).duration(300)} style={styles.abilityBadge}>
                <Text style={styles.abilityText}>
                  {a.ability.name
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </Text>
                {a.is_hidden && <Text style={styles.hiddenLabel}> (Hidden)</Text>}
              </Reanimated.View>
            ))}
          </View>
        </Reanimated.View>

        {showStatsButton && (
          <Reanimated.View entering={FadeInDown.delay(1000).duration(400)}>
            <Pressable
              style={[styles.statsButton, { backgroundColor }]}
              onPress={() => router.push(`/pokemon-stats-modal?id=${id}` as Href)}
            >
              <Text style={styles.statsButtonText}>View Detailed Stats</Text>
            </Pressable>
          </Reanimated.View>
        )}
      </View>
    </Reanimated.ScrollView>
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
  overscrollBackground: {
    position: "absolute",
    left: 0,
    right: 0,
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
    paddingTop: 30,
    marginTop: -30,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 500,
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

const skeletonStyles = StyleSheet.create({
  pokemonId: {
    width: 50,
    height: 20,
    borderRadius: 4,
  },
  heartIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  pokemonName: {
    width: 160,
    height: 36,
    borderRadius: 8,
    marginTop: 8,
  },
  typeBadge: {
    width: 70,
    height: 28,
    borderRadius: 20,
  },
  artwork: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginTop: 20,
  },
  infoValue: {
    width: 60,
    height: 22,
    borderRadius: 4,
  },
  infoLabel: {
    width: 50,
    height: 14,
    borderRadius: 4,
    marginTop: 6,
  },
  sectionTitle: {
    width: 100,
    height: 22,
    borderRadius: 4,
    marginBottom: 16,
  },
  statLabel: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
  statValue: {
    width: 30,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  statBar: {
    width: "60%",
    height: "100%",
    borderRadius: 3,
  },
  abilityBadge: {
    width: 100,
    height: 38,
    borderRadius: 20,
  },
  statsButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 16,
  },
});

function SkeletonBox({ style }: { style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { backgroundColor: colors.surface.secondary, opacity },
        style,
      ]}
    />
  );
}

function SkeletonLoader() {
  return (
    <RNScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.header, { backgroundColor: colors.surface.secondary }]}>
        <View style={styles.headerTop}>
          <SkeletonBox style={skeletonStyles.pokemonId} />
          <SkeletonBox style={skeletonStyles.heartIcon} />
        </View>
        <SkeletonBox style={skeletonStyles.pokemonName} />
        <View style={styles.typesContainer}>
          <SkeletonBox style={skeletonStyles.typeBadge} />
          <SkeletonBox style={skeletonStyles.typeBadge} />
        </View>
        <SkeletonBox style={skeletonStyles.artwork} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <SkeletonBox style={skeletonStyles.infoValue} />
            <SkeletonBox style={skeletonStyles.infoLabel} />
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <SkeletonBox style={skeletonStyles.infoValue} />
            <SkeletonBox style={skeletonStyles.infoLabel} />
          </View>
        </View>

        <SkeletonBox style={skeletonStyles.sectionTitle} />
        <View style={styles.statsContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.statRow}>
              <SkeletonBox style={skeletonStyles.statLabel} />
              <SkeletonBox style={skeletonStyles.statValue} />
              <View style={styles.statBarContainer}>
                <SkeletonBox style={skeletonStyles.statBar} />
              </View>
            </View>
          ))}
        </View>

        <SkeletonBox style={skeletonStyles.sectionTitle} />
        <View style={styles.abilitiesContainer}>
          <SkeletonBox style={skeletonStyles.abilityBadge} />
          <SkeletonBox style={skeletonStyles.abilityBadge} />
        </View>

        <SkeletonBox style={skeletonStyles.statsButton} />
      </View>
    </RNScrollView>
  );
}
