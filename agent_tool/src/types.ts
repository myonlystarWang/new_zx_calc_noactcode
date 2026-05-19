export interface CharacterClass {
  ClassID: string;
  ClassName: string;
  Description: string;
  Race: string;
}

export interface CharacterAttributes {
  CharacterMinAttack: number;
  CharacterMaxAttack: number;
  CharacterDefense: number;
  CharacterHealth: number;
  CharacterMana: number;
  CharacterCriticalHitDamagePercent: number;
  CharacterMonsterDamageIncreasePercent: number;
}

export interface MultiHitConfig {
  HitCount: number;
  DamageMultiplierPerHit?: number;
  DamageCap?: number;
  ScalingAttribute?: keyof SkillBonusAttributes;
  ScalingStartValue?: number;
  ScalingEndValue?: number;
}

export interface SkillBonusAttributes {
  SkillAttackPercentBonus?: number;
  SkillAttackFixedBonus?: number;
  SkillDefensePercentBonus?: number;
  SkillHealthPercentBonus?: number;
  SkillManaPercentBonus?: number;
  SkillCriticalDamagePercentBonus?: number;
  SkillDamageBonus?: number;
  MultiHitConfig?: MultiHitConfig;
}

export interface Skill {
  SkillID: string;
  SkillName: string;
  RequiredClass: string;
  Faction: string;
  SkillImportanceWeight: number;
  SkillFrequency: number;
  Cooldown: number;
  CastTime: number;
  IsAOE: boolean;
  SkillBonusAttributes: SkillBonusAttributes;
}

export interface ClassSkills {
  [faction: string]: Skill[];
}

export interface AllSkills {
  [classID: string]: ClassSkills;
}

export interface MonsterAttributeModifiers {
  MonsterCriticalDamagePercentReduction: number;
  DamageCompressionPercent?: number;
  MonsterAttack?: number;
  MonsterDefense?: number;
  MonsterHealth?: number;
}

export interface Monster {
  MonsterID: string;
  MonsterName: string;
  DungeonLevel: number;
  MonsterAttributeModifiers: MonsterAttributeModifiers;
}

export interface DungeonMeta {
  DungeonID: string;
  DungeonName: string;
  Description?: string;
  difficulty?: string;
  DungeonImportanceWeight?: number;
}

export interface BuffEffects {
  BuffAttackPercentEffect?: number;
  BuffAttackFixedEffect?: number;
  BuffDefensePercentEffect?: number;
  BuffDefenseFixedEffect?: number;
  BuffHealthPercentEffect?: number;
  BuffHealthFixedEffect?: number;
  BuffManaPercentEffect?: number;
  BuffManaFixedEffect?: number;
  BuffCriticalDamagePercentEffect?: number;
  BuffFocusPercentEffect?: number;
  BuffMonsterDamageIncreaseEffect?: number;
  BuffHolyWrathPercentEffect?: number;
  BuffMonsterCriticalDamagePercentEffect?: number;
  BuffMonsterHarmedPercentEffect?: number;
}

export interface Buff {
  BuffID: string;
  BuffName: string;
  IsDefaultActive: boolean;
  IsEditable?: boolean;
  DefaultEffectValue?: number;
  BuffEffects: BuffEffects;
}

export interface GameData {
  classes: CharacterClass[];
  skills: AllSkills;
  dungeons: DungeonMeta[];
  monstersByDungeon: Record<string, Monster[]>;
  buffs: Buff[];
}

export interface AgentCalcInput {
  classId?: string;
  className?: string;
  faction?: string;
  factionName?: string;
  attributes?: Record<string, unknown>;
  buffs?: unknown;
  target?: Record<string, unknown>;
}

export interface HitDamageResult {
  hitIndex: number;
  minFinalDamage: number;
  maxFinalDamage: number;
  avgFinalDamage: number;
}

export interface DamageResult {
  minBaseDamage: number;
  maxBaseDamage: number;
  minFinalDamage: number;
  maxFinalDamage: number;
  avgFinalDamage: number;
  hits?: HitDamageResult[];
}

export interface ValidationIssue {
  field: string;
  message: string;
}
