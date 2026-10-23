// Mix at most 5% toward white or black: the base hue stays recognizable.
export function varyPalette(palette,rng) {
  const result=structuredClone(palette);
  const tone=(rng()-.5)*.06;
  result.colors=Object.fromEntries(Object.entries(palette.colors).map(([region,hex])=>{
    const shift=Math.max(-.05,Math.min(.05,tone+(rng()-.5)*.04));
    const channels=hex.slice(1).match(/../g).map(part=>parseInt(part,16));
    const varied=channels.map(channel=>Math.round(channel+(shift>=0 ? 255-channel : channel)*shift));
    return [region,'#'+varied.map(channel=>channel.toString(16).padStart(2,'0')).join('').toUpperCase()];
  }));
  result.colorVariation={baseColors:structuredClone(palette.colors)};
  return result;
}
