import { PokemonDetails } from "@/src/components/PokemonDetails";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export default function PokemonDetailsModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  if (!id) return null;

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Pressable style={styles.closeButton} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </Pressable>
        <PokemonDetails id={id} showStatsButton={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
    paddingTop: 60,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: colors.surface.primary,
    borderRadius: 20,
    padding: 8,
  },
});
