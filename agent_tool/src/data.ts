import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AllSkills, Buff, CharacterClass, DungeonMeta, GameData, Monster } from './types.js';

const toolDir = dirname(dirname(fileURLToPath(import.meta.url)));
const defaultDataDir = resolve(toolDir, '..', 'web_app', 'public', 'game_data');

const readJson = async <T>(path: string): Promise<T> => {
  const text = await readFile(path, 'utf8');
  return JSON.parse(text) as T;
};

export const loadGameData = async (dataDir = defaultDataDir): Promise<GameData> => {
  const [classes, skills, dungeons, monstersByDungeon, buffs] = await Promise.all([
    readJson<CharacterClass[]>(resolve(dataDir, 'classes.json')),
    readJson<AllSkills>(resolve(dataDir, 'skills.json')),
    readJson<DungeonMeta[]>(resolve(dataDir, 'dungeons.json')),
    readJson<Record<string, Monster[]>>(resolve(dataDir, 'dungeons_monsters.json')),
    readJson<Buff[]>(resolve(dataDir, 'combat_buffs.json'))
  ]);

  return {
    classes,
    skills,
    dungeons,
    monstersByDungeon,
    buffs
  };
};
