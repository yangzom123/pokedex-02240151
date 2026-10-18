import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP } from '../themes';

const STORAGE_KEY = 'pokedex_team_v1';
const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // 1) Load the saved team once when the app starts
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTeam(JSON.parse(raw));
      } catch (e) {
        console.warn('Could not load team', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // 2) Save whenever the team changes (not before the first load finishes,
  //    otherwise an empty team would overwrite the saved one)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(team)).catch((e) =>
      console.warn('Could not save team', e)
    );
  }, [team, loaded]);

  const isInTeam = useCallback((id) => team.some((p) => p.id === id), [team]);
  const isFull = team.length >= APP.teamMax;

  const addToTeam = useCallback((pokemon) => {
    setTeam((prev) =>
      prev.length >= APP.teamMax || prev.some((p) => p.id === pokemon.id)
        ? prev
        : [...prev, pokemon]
    );
  }, []);

  const removeFromTeam = useCallback((id) => {
    setTeam((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <TeamContext.Provider value={{ team, loaded, isFull, isInTeam, addToTeam, removeFromTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);
