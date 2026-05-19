import type { Buff, CharacterAttributes, DamageResult, HitDamageResult, Monster, Skill } from './types.js';

export const calculateDamage = (
  character: CharacterAttributes,
  skill: Skill,
  monster: Monster,
  activeBuffs: Buff[],
  buffValues: Record<string, number> = {}
): DamageResult => {
  let buffAttackPercent = 0;
  let buffAttackFixed = 0;
  let buffDefensePercent = 0;
  let buffHealthPercent = 0;
  let buffManaPercent = 0;
  let buffCritDmg = 0;
  let buffFocus = 0;
  let buffHolyWrath = 0;
  let buffMonCritDmg = 0;
  let buffMonHarmed = 0;

  activeBuffs.forEach((buff) => {
    const effects = buff.BuffEffects;
    const overrideValue = buffValues[buff.BuffID];

    const getVal = (key: keyof typeof effects) => {
      if (effects[key] !== undefined) {
        return overrideValue !== undefined ? overrideValue : effects[key]!;
      }
      return 0;
    };

    buffAttackPercent += getVal('BuffAttackPercentEffect');
    buffAttackFixed += getVal('BuffAttackFixedEffect');
    buffDefensePercent += getVal('BuffDefensePercentEffect');
    buffHealthPercent += getVal('BuffHealthPercentEffect');
    buffManaPercent += getVal('BuffManaPercentEffect');
    buffCritDmg += getVal('BuffCriticalDamagePercentEffect');
    buffFocus += getVal('BuffFocusPercentEffect');
    buffHolyWrath += getVal('BuffHolyWrathPercentEffect');
    buffMonCritDmg += getVal('BuffMonsterCriticalDamagePercentEffect');
    buffMonHarmed += getVal('BuffMonsterHarmedPercentEffect');
  });

  const effMinAttack = character.CharacterMinAttack * (1 + buffAttackPercent / 100) + buffAttackFixed;
  const effMaxAttack = character.CharacterMaxAttack * (1 + buffAttackPercent / 100) + buffAttackFixed;
  const effHealth = character.CharacterHealth * (1 + buffHealthPercent / 100);
  const effMana = character.CharacterMana * (1 + buffManaPercent / 100);
  const effDefense = character.CharacterDefense * (1 + buffDefensePercent / 100);

  const baseSkillBonus = skill.SkillBonusAttributes;
  const multiHit = baseSkillBonus.MultiHitConfig;
  const hitCount = multiHit ? multiHit.HitCount : 1;

  let totalMinFinalDamage = 0;
  let totalMaxFinalDamage = 0;
  let totalAvgFinalDamage = 0;
  const hits: HitDamageResult[] = [];
  let firstHitMinBaseDamage = 0;
  let firstHitMaxBaseDamage = 0;

  for (let i = 1; i <= hitCount; i += 1) {
    const currentSkillBonus = { ...baseSkillBonus };
    if (
      multiHit &&
      multiHit.ScalingAttribute &&
      multiHit.ScalingStartValue !== undefined &&
      multiHit.ScalingEndValue !== undefined
    ) {
      const start = multiHit.ScalingStartValue;
      const end = multiHit.ScalingEndValue;
      const step = hitCount > 1 ? (end - start) / (hitCount - 1) : 0;
      (currentSkillBonus as Record<string, unknown>)[multiHit.ScalingAttribute] = start + step * (i - 1);
    }

    const minBaseDamage =
      effMinAttack * (1 + (currentSkillBonus.SkillAttackPercentBonus || 0) / 100) +
      (currentSkillBonus.SkillAttackFixedBonus || 0) +
      (effHealth * (currentSkillBonus.SkillHealthPercentBonus || 0)) / 100 +
      (effMana * (currentSkillBonus.SkillManaPercentBonus || 0)) / 100 +
      (effDefense * (currentSkillBonus.SkillDefensePercentBonus || 0)) / 100;

    const maxBaseDamage =
      effMaxAttack * (1 + (currentSkillBonus.SkillAttackPercentBonus || 0) / 100) +
      (currentSkillBonus.SkillAttackFixedBonus || 0) +
      (effHealth * (currentSkillBonus.SkillHealthPercentBonus || 0)) / 100 +
      (effMana * (currentSkillBonus.SkillManaPercentBonus || 0)) / 100 +
      (effDefense * (currentSkillBonus.SkillDefensePercentBonus || 0)) / 100;

    if (i === 1) {
      firstHitMinBaseDamage = minBaseDamage;
      firstHitMaxBaseDamage = maxBaseDamage;
    }

    const critDmgTotal =
      character.CharacterCriticalHitDamagePercent +
      buffCritDmg +
      buffMonCritDmg +
      (currentSkillBonus.SkillCriticalDamagePercentBonus || 0) -
      monster.MonsterAttributeModifiers.MonsterCriticalDamagePercentReduction;

    const critMultiplier = Math.max(1, critDmgTotal / 100);
    const damageBonusMultiplier =
      currentSkillBonus.SkillDamageBonus !== undefined ? currentSkillBonus.SkillDamageBonus : 1;
    const charMonDmgInc = 1 + character.CharacterMonsterDamageIncreasePercent / 100;
    const monHarmedMultiplier = 1 + buffMonHarmed / 100;
    const focusMultiplier = 1 + buffFocus / 100;
    const holyWrathMultiplier = 1 + buffHolyWrath / 100;

    const finalMultipliers =
      critMultiplier *
      damageBonusMultiplier *
      charMonDmgInc *
      monHarmedMultiplier *
      focusMultiplier *
      holyWrathMultiplier;

    let minFinal = minBaseDamage * finalMultipliers;
    let maxFinal = maxBaseDamage * finalMultipliers;

    if (multiHit && multiHit.DamageMultiplierPerHit) {
      const multiplier = Math.pow(multiHit.DamageMultiplierPerHit, i - 1);
      minFinal *= multiplier;
      maxFinal *= multiplier;
    }

    if (multiHit && multiHit.DamageCap) {
      minFinal = Math.min(minFinal, multiHit.DamageCap);
      maxFinal = Math.min(maxFinal, multiHit.DamageCap);
    }

    const avgFinal = (minFinal + maxFinal) / 2;
    totalMinFinalDamage += minFinal;
    totalMaxFinalDamage += maxFinal;
    totalAvgFinalDamage += avgFinal;

    hits.push({
      hitIndex: i,
      minFinalDamage: minFinal,
      maxFinalDamage: maxFinal,
      avgFinalDamage: avgFinal
    });
  }

  return {
    minBaseDamage: firstHitMinBaseDamage,
    maxBaseDamage: firstHitMaxBaseDamage,
    minFinalDamage: totalMinFinalDamage,
    maxFinalDamage: totalMaxFinalDamage,
    avgFinalDamage: totalAvgFinalDamage,
    hits: multiHit ? hits : undefined
  };
};
