export const skillNames = ['agility','strength','jump','bond','wing'];
export const skillXPRequirements = [125,400,975,2000,3600,6000,9250,13600,20300,26000,34000];

export function readHorseSkills(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !skillNames.includes(key))) throw new Error('Invalid horse skills.');
  return Object.fromEntries(skillNames.map(name => {
    const value = input[name] ?? {level:0,xp:0};
    if (!value || typeof value !== 'object' || Array.isArray(value) || !Number.isSafeInteger(value.level) || value.level < 0 || !Number.isSafeInteger(value.xp) || value.xp < 0) throw new Error('Skill levels and XP must be nonnegative whole numbers.');
    return [name,{level:value.level,xp:value.xp}];
  }));
}

export function skillProgress(value) {
  const maxed = value.level > 10 || (value.level === 10 && value.xp >= skillXPRequirements[10]);
  const xpNeeded = maxed ? null : skillXPRequirements[value.level];
  return {...value,maxed,xpNeeded,percent:maxed ? 100 : Math.min(100,value.xp/xpNeeded*100)};
}
