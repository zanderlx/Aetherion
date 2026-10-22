export function horseGenderIcon(gender) {
  const female = gender === 'Female';
  return `<svg class="icon gender-symbol ${female ? 'gender-female' : 'gender-male'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${female ? '<circle cx="12" cy="8" r="5"/><path d="M12 13v9m-4-4h8"/>' : '<circle cx="9" cy="15" r="5"/><path d="m13 11 8-8m-6 0h6v6"/>'}</svg>`;
}
