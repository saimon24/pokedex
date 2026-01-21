import type { Pokemon, PokemonListResponse } from "@/src/types/pokemon";

const BASE_URL = "https://pokeapi.co/api/v2";
const SPRITE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export async function fetchPokemonList(
  limit = 30,
  offset = 0
): Promise<Pokemon[]> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    if (!res.ok) {
    throw new Error(`Failed to fetch Pokemon list: ${res.status}`);
  }
  const data: PokemonListResponse = await res.json();
  console.log(data);
  return data.results;
}


export function getPokemonId(url: string): string {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function getPokemonSpriteUrl(id: string): string {
  return `${SPRITE_URL}/${id}.png`;
}
