import React, { useMemo } from 'react';
import {
  View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useTeam } from '../context/TeamContext';
import { getPokemonArtwork } from '../api';
import StatBar from '../components/StatBar';
import { COLORS, FONTS, SPACING, RADIUS, APP } from '../themes';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function TeamScreen({ navigation }) {
  const { team, loaded, removeFromTeam } = useTeam();

  // Combined base stats of every member
  const totals = useMemo(() => {
    const sum = {};
    team.forEach((p) => p.stats.forEach((s) => { sum[s.name] = (sum[s.name] || 0) + s.value; }));
    return Object.entries(sum);
  }, [team]);

  if (!loaded) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{APP.ownerName}'s Team</Text>
        <Text style={styles.count}>{team.length}/{APP.teamMax} members</Text>
      </View>

      <FlatList
        data={team}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Your team is empty. Open a Pokémon and tap "Add to team".</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('Detail', { id: item.id })}>
            <Image source={{ uri: getPokemonArtwork(item.id) }} style={styles.img} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={styles.num}>#{String(item.id).padStart(3, '0')}</Text>
              <Text style={styles.name}>{cap(item.name)}</Text>
            </View>
            <Pressable onPress={() => removeFromTeam(item.id)} hitSlop={10} style={styles.removeBtn}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </Pressable>
        )}
        ListFooterComponent={
          team.length > 0 ? (
            <View style={styles.totals}>
              <Text style={styles.heading}>Combined base stats</Text>
              {/* Bars show the team average (fits the 255 scale); numbers are the true totals */}
              {totals.map(([name, value]) => (
                <View key={name}>
                  <StatBar label={name} value={value / team.length} />
                </View>
              ))}
              <Text style={styles.totalLine}>
                Totals: {totals.map(([n, v]) => `${n} ${v}`).join(' · ')}
              </Text>
              <Text style={styles.totalLine}>
                Overall: {totals.reduce((a, [, v]) => a + v, 0)}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.primary, padding: SPACING.xl,
    borderBottomLeftRadius: RADIUS.large, borderBottomRightRadius: RADIUS.large,
  },
  title: { color: COLORS.textOnPrimary, fontSize: FONTS.screenTitle, fontWeight: FONTS.bold },
  count: { color: COLORS.accent, fontSize: FONTS.cardTitle, marginTop: 5, fontWeight: FONTS.semibold },
  list: { padding: SPACING.lg },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40, fontSize: FONTS.body },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card, padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 2, borderColor: COLORS.secondary,
  },
  img: { width: 60, height: 60 },
  num: { color: COLORS.secondary, fontSize: FONTS.caption, fontWeight: FONTS.bold },
  name: { color: COLORS.primary, fontSize: FONTS.cardTitle, fontWeight: FONTS.bold },
  removeBtn: { paddingVertical: 6, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.danger },
  removeText: { color: COLORS.danger, fontWeight: FONTS.bold, fontSize: FONTS.caption },
  totals: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.secondary, marginTop: SPACING.sm },
  heading: { fontSize: FONTS.sectionTitle, fontWeight: FONTS.bold, color: COLORS.secondary, marginBottom: SPACING.sm },
  totalLine: { color: COLORS.textSecondary, fontSize: FONTS.caption, marginTop: SPACING.sm, textTransform: 'capitalize' },
});
