import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, Pressable, ActivityIndicator, StyleSheet, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllPokemonNames, getPokemonArtwork } from '../api';
import { COLORS, FONTS, SPACING, RADIUS, APP } from '../themes';

const BEST_KEY = 'pokedex_best_streak';
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function GameScreen() {
  const [pool, setPool] = useState([]);      // first 151 Pokémon
  const [round, setRound] = useState(null);  // { answer, options }
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const newRound = useCallback((list) => {
    const answer = list[Math.floor(Math.random() * list.length)];
    const wrong = shuffle(list.filter((p) => p.id !== answer.id)).slice(0, 3);
    setRound({ answer, options: shuffle([answer, ...wrong]) });
    setPicked(null);
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const all = await fetchAllPokemonNames();
      const first151 = all.filter((p) => p.id <= 151);
      if (first151.length < 4) throw new Error('Not enough Pokémon loaded to start a round. Please try again.');
      setPool(first151);
      newRound(first151);
      try {
        const saved = await AsyncStorage.getItem(BEST_KEY);
        if (saved && Number.isFinite(Number(saved))) setBest(Number(saved));
      } catch (storageError) {
        // The game can still be played when local score storage is unavailable.
      }
    } catch (e) {
      setError(e.message || 'Could not start the game.');
    } finally {
      setLoading(false);
    }
  }, [newRound]);

  useEffect(() => { init(); }, [init]);

  function choose(option) {
    if (picked) return; // only one answer per round
    setPicked(option);
    if (option.id === round.answer.id) {
      const nextStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(nextStreak);
      if (nextStreak > best) {
        setBest(nextStreak);
        AsyncStorage.setItem(BEST_KEY, String(nextStreak)).catch(() => {});
      }
    } else {
      setStreak(0);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.next} onPress={init}><Text style={styles.nextText}>Retry</Text></Pressable>
      </View>
    );
  }

  const revealed = picked !== null;
  const isCorrect = revealed && picked.id === round.answer.id;

  function optionStyle(opt) {
    if (!revealed) return null;
    if (opt.id === round.answer.id) return { backgroundColor: COLORS.success, borderColor: COLORS.success };
    if (opt.id === picked.id) return { backgroundColor: COLORS.danger, borderColor: COLORS.danger };
    return { opacity: 0.5 };
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Who's That Pokémon?</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>Score {score}</Text>
          <Text style={styles.stat}>Streak {streak}</Text>
          <Text style={styles.stat}>Best {best}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Image
          source={{ uri: getPokemonArtwork(round.answer.id) }}
          // tintColor black turns the artwork into a silhouette until answered
          style={[styles.image, !revealed && { tintColor: '#000000' }]}
          resizeMode="contain"
        />
        <Text style={[styles.question, revealed && { color: isCorrect ? COLORS.success : COLORS.danger }]}>
          {!revealed ? 'Who is this?' : isCorrect ? 'Correct!' : `It's ${cap(round.answer.name)}!`}
        </Text>

        {round.options.map((opt) => (
          <Pressable key={opt.id} style={[styles.option, optionStyle(opt)]} onPress={() => choose(opt)}>
            <Text style={[styles.optionText, revealed && (opt.id === round.answer.id || opt.id === picked.id) && { color: '#FFFFFF' }]}>
              {cap(opt.name)}
            </Text>
          </Pressable>
        ))}

        {revealed && (
          <Pressable style={styles.next} onPress={() => newRound(pool)}>
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  header: {
    backgroundColor: COLORS.primary, padding: SPACING.xl,
    borderBottomLeftRadius: RADIUS.large, borderBottomRightRadius: RADIUS.large,
  },
  title: { color: COLORS.textOnPrimary, fontSize: FONTS.screenTitle, fontWeight: FONTS.bold },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md },
  stat: { color: COLORS.accent, fontWeight: FONTS.bold, fontSize: FONTS.cardTitle },
  body: { flex: 1, padding: SPACING.lg },
  image: { width: '100%', height: 210, marginBottom: SPACING.sm },
  question: { textAlign: 'center', fontSize: FONTS.sectionTitle, fontWeight: FONTS.bold, color: COLORS.secondary, marginBottom: SPACING.md },
  option: {
    padding: SPACING.md, borderRadius: RADIUS.medium, marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.secondary, alignItems: 'center',
  },
  optionText: { fontSize: FONTS.cardTitle, color: COLORS.textPrimary, fontWeight: FONTS.semibold },
  next: { backgroundColor: COLORS.accent, padding: SPACING.md, borderRadius: RADIUS.medium, alignItems: 'center', marginTop: SPACING.md, paddingHorizontal: 40 },
  nextText: { color: COLORS.textOnAccent, fontWeight: FONTS.bold, fontSize: FONTS.cardTitle },
  errorText: { color: COLORS.danger, marginBottom: SPACING.lg, textAlign: 'center' },
});
