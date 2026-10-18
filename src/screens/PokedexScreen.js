import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Pressable,
  StyleSheet, SafeAreaView, TextInput, ScrollView,
} from 'react-native';

import { COLORS, FONTS, SPACING, RADIUS, TYPE_COLORS, APP } from '../themes';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonPage, fetchAllPokemonNames, fetchPokemonByType } from '../api';

const SEARCH_PAGE = 30; // how many search/filter results to show at a time
const TYPES = Object.keys(TYPE_COLORS);

export default function PokedexScreen({ navigation }) {
  // ---- Infinite scroll list ----
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [moreError, setMoreError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(APP.startOffset); // next offset to request
  const busyRef = useRef(false);             // blocks double requests

  // ---- Search (all Pokémon, debounced) ----
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [allNames, setAllNames] = useState([]);
  const [namesLoading, setNamesLoading] = useState(true);
  const [namesError, setNamesError] = useState('');
  const [visibleCount, setVisibleCount] = useState(SEARCH_PAGE);

  // ---- Type filter (own feature) ----
  const [selectedType, setSelectedType] = useState(null);
  const [typeList, setTypeList] = useState([]);
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeError, setTypeError] = useState('');
  const [typeRetry, setTypeRetry] = useState(0);

  // First page
  const loadFirstPage = useCallback(async () => {
    busyRef.current = true;
    setLoading(true);
    setError('');
    setMoreError('');
    offsetRef.current = APP.startOffset;
    try {
      const data = await fetchPokemonPage(APP.startOffset, APP.pageSize);
      setPokemon(data.results);
      offsetRef.current = APP.startOffset + data.results.length;
      setHasMore(data.next !== null);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading Pokémon.');
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, []);

  // Next pages
  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMore || error) return;
    busyRef.current = true;
    setLoadingMore(true);
    setMoreError('');
    try {
      const data = await fetchPokemonPage(offsetRef.current, APP.pageSize);
      setPokemon((current) => {
        const seen = new Set(current.map((p) => p.id));
        return [...current, ...data.results.filter((p) => !seen.has(p.id))];
      });
      offsetRef.current += data.results.length;
      setHasMore(data.next !== null);
    } catch (err) {
      setMoreError(err.message || 'Unable to load more Pokémon.');
    } finally {
      busyRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, error]);

  const loadNames = useCallback(async () => {
    setNamesLoading(true);
    setNamesError('');
    try {
      setAllNames(await fetchAllPokemonNames());
    } catch (err) {
      setNamesError(err.message || 'Could not load Pokémon names. Please try again.');
    } finally {
      setNamesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
    loadNames();
  }, [loadFirstPage, loadNames]);

  // Debounce: only update `query` 400 ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchText.trim().toLowerCase());
      setVisibleCount(SEARCH_PAGE);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Load the Pokémon of the chosen type
  useEffect(() => {
    if (!selectedType) { setTypeList([]); setTypeError(''); return; }
    let cancelled = false;
    setTypeLoading(true);
    setTypeError('');
    setTypeList([]);
    setVisibleCount(SEARCH_PAGE);
    fetchPokemonByType(selectedType)
      .then((list) => { if (!cancelled) setTypeList(list); })
      .catch((e) => { if (!cancelled) setTypeError(e.message); })
      .finally(() => { if (!cancelled) setTypeLoading(false); });
    return () => { cancelled = true; };
  }, [selectedType, typeRetry]);

  const isBrowsing = !query && !selectedType;

  // Search/filter results come from the FULL list, not only loaded pages
  const results = useMemo(() => {
    if (isBrowsing) return [];
    const source = selectedType ? typeList : allNames;
    return query ? source.filter((p) => p.name.includes(query)) : source;
  }, [isBrowsing, selectedType, typeList, allNames, query]);

  const data = isBrowsing ? pokemon : results.slice(0, visibleCount);

  const openDetails = (item) => navigation.navigate('Detail', { id: item.id });

  const onEndReached = () => {
    if (isBrowsing) loadMore();
    else if (visibleCount < results.length) setVisibleCount((c) => c + SEARCH_PAGE);
  };

  function renderEmpty() {
    if (isBrowsing) return null;
    if (typeLoading) return <ActivityIndicator style={styles.emptyPad} color={COLORS.primary} />;
    if (typeError) {
      return (
        <View style={styles.emptyPad}>
          <Text style={styles.errorText}>{typeError}</Text>
          <Pressable style={styles.retryButton} onPress={() => setTypeRetry((attempt) => attempt + 1)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (!selectedType && allNames.length === 0 && namesLoading) {
      return (
        <View style={styles.emptyPad}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.message}>Loading Pokémon search...</Text>
        </View>
      );
    }
    if (!selectedType && allNames.length === 0 && namesError) {
      return (
        <View style={styles.emptyPad}>
          <Text style={styles.errorText}>{namesError}</Text>
          <Pressable style={styles.retryButton} onPress={loadNames} disabled={namesLoading}>
            <Text style={styles.retryText}>{namesLoading ? 'Retrying...' : 'Retry'}</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <Text style={styles.noResults}>
        No Pokémon found{query ? ` for "${query}"` : ''}.
      </Text>
    );
  }

  function renderFooter() {
    if (!isBrowsing) return null;
    if (loadingMore) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />;
    if (moreError) {
      return (
        <View style={styles.footerError}>
          <Text style={styles.errorText}>{moreError}</Text>
          <Pressable style={styles.retryButton} onPress={loadMore}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{APP.ownerName}'s Pokédex</Text>
        <Text style={styles.headerSubtitle}>Discover your Pokémon world</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search all Pokémon by name..."
            placeholderTextColor={COLORS.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          <Pressable
            style={[styles.chip, !selectedType && styles.chipActive]}
            onPress={() => setSelectedType(null)}
          >
            <Text style={[styles.chipText, !selectedType && styles.chipTextActive]}>All</Text>
          </Pressable>
          {TYPES.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, selectedType === t && { backgroundColor: TYPE_COLORS[t], borderColor: TYPE_COLORS[t] }]}
              onPress={() => setSelectedType(selectedType === t ? null : t)}
            >
              <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isBrowsing && loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.message}>Loading Pokémon...</Text>
        </View>
      ) : isBrowsing && error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Oops! Something went wrong.</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadFirstPage}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => <PokemonCard pokemon={item} onPress={() => openDetails(item)} />}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {isBrowsing ? 'Pokémon Collection' : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </Text>
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS.large,
    borderBottomRightRadius: RADIUS.large,
  },
  headerTitle: { color: COLORS.textOnPrimary, fontSize: FONTS.screenTitle, fontWeight: FONTS.bold },
  headerSubtitle: { color: COLORS.accent, fontSize: FONTS.subtitle, marginTop: 5 },
  sectionTitle: {
    color: COLORS.secondary, fontSize: FONTS.sectionTitle, fontWeight: FONTS.bold,
    marginHorizontal: 7, marginTop: SPACING.xl, marginBottom: SPACING.sm,
  },
  list: { paddingHorizontal: 9, paddingBottom: SPACING.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  message: { marginTop: SPACING.md, color: COLORS.primary, fontSize: FONTS.cardTitle },
  errorTitle: { color: COLORS.danger, fontSize: 18, fontWeight: FONTS.bold, textAlign: 'center' },
  errorText: { color: COLORS.textSecondary, marginTop: 10, marginBottom: SPACING.xl, textAlign: 'center' },
  retryButton: { backgroundColor: COLORS.accent, paddingVertical: SPACING.md, paddingHorizontal: 30, borderRadius: RADIUS.medium },
  retryText: { color: COLORS.textOnAccent, fontWeight: FONTS.bold, fontSize: FONTS.cardTitle },
  footerError: { alignItems: 'center', paddingVertical: SPACING.lg },
  emptyPad: { alignItems: 'center', padding: SPACING.xxl },
  noResults: { textAlign: 'center', color: COLORS.textSecondary, fontSize: FONTS.cardTitle, marginTop: 40 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium, marginTop: 18, paddingHorizontal: SPACING.md, height: 48,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.body, paddingVertical: 10 },
  clearButton: { padding: SPACING.sm },
  clearButtonText: { color: COLORS.textSecondary, fontSize: FONTS.cardTitle, fontWeight: FONTS.bold },

  chips: { marginTop: SPACING.md },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.textOnPrimary, marginRight: SPACING.sm,
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { color: COLORS.textOnPrimary, fontSize: FONTS.caption, fontWeight: FONTS.semibold, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.textOnAccent },
});
