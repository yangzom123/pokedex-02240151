// src/api.js — all network calls live in this file.
const BASE_URL = 'https://pokeapi.co/api/v2';

export const getIdFromUrl = (url) => Number(url.split('/').filter(Boolean).pop());

export function getPokemonArtwork(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

async function getJson(url, message) {
  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The request took too long. Check your connection and try again.');
    }
    throw new Error('Could not connect to PokéAPI. Check your internet connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 404) throw new Error('That Pokémon could not be found.');
  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error('PokéAPI is temporarily unavailable. Please try again in a moment.');
    }
    throw new Error(`${message} (error ${response.status}). Please try again.`);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new Error('PokéAPI returned an invalid response. Please try again.');
  }
}

const toItem = (p) => ({ name: p.name, id: getIdFromUrl(p.url) });

// One page for the Pokédex list
export async function fetchPokemonPage(offset = 0, limit = 20) {
  const data = await getJson(
    `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`,
    'Unable to load Pokémon. Please check your connection and try again.'
  );
  return { results: data.results.map(toItem), next: data.next };
}

// Every Pokémon (id + name) — used by search and the game
let allCache = null;
export async function fetchAllPokemonNames() {
  if (allCache) return allCache;
  const data = await getJson(`${BASE_URL}/pokemon?limit=1025`, 'Unable to load Pokémon names.');
  allCache = data.results.map(toItem);
  return allCache;
}

// Raw details of one Pokémon
export async function fetchPokemonDetails(idOrName) {
  return getJson(
    `${BASE_URL}/pokemon/${String(idOrName).toLowerCase()}`,
    'Unable to load Pokémon details.'
  );
}

// Turn the big API response into the small object the app needs
export function normalizePokemon(raw) {
  return {
    id: raw.id,
    name: raw.name,
    types: raw.types.map((t) => t.type.name),
    height: raw.height / 10, // decimetres -> metres
    weight: raw.weight / 10, // hectograms -> kg
    stats: raw.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}

// All Pokémon of one type (own feature: type filter)
export async function fetchPokemonByType(type) {
  const data = await getJson(`${BASE_URL}/type/${type}`, `Unable to load ${type} Pokémon.`);
  return data.pokemon
    .map((p) => toItem(p.pokemon))
    .filter((p) => p.id <= 1025)
    .sort((a, b) => a.id - b.id);
}
