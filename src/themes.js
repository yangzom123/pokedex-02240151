// src/themes.js — every colour, font size, spacing value and app setting lives here.

export const APP = {
  ownerName: 'Dechen',   // TODO: your first name -> header shows "YourName's Pokédex"
  startOffset: 150,          // TODO: last 3 digits of your student no. (02230123 -> 123)
  pageSize: 20,
  totalPokemon: 1025,
  teamMax: 6,
};

export const COLORS = {
  primary: '#0075BE',
  secondary: '#3B4CCA',
  accent: '#FFCC00',
  danger: '#FF0000',
  success: '#2E9E5B',
  disabled: '#B8C4D0',

  background: '#F2F7FC',
  surface: '#FFFFFF',

  textPrimary: '#222222',
  textSecondary: '#555555',
  textMuted: '#777777',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#1A1A1A',

  border: '#D9E4EF',
  pressed: '#FFF8D6',
};

export const FONTS = {
  screenTitle: 27,
  sectionTitle: 20,
  cardTitle: 16,
  body: 15,
  subtitle: 14,
  caption: 12,

  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
export const RADIUS = { small: 8, medium: 12, card: 16, large: 24, pill: 999 };

export const TYPE_COLORS = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#E5B800',
  grass: '#5FAF3A', ice: '#6FC5C1', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#C9A64A', flying: '#8E78E0', psychic: '#F95587', bug: '#8E9F10',
  rock: '#9A8727', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
  steel: '#8E8EA8', fairy: '#D685AD',
};
