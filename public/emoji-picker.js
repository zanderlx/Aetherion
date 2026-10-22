import {escapeHTML as e,icon} from './ui.js';
const groups={
 'Faces':'😀 happy smile|😃 cheerful|😁 grin|😂 laugh joy|🥰 affection love|😍 heart eyes|😎 cool|🤓 clever nerd|🧐 curious|🤔 thinking|😴 sleepy lazy|😠 angry grumpy|😰 anxious|😈 mischievous devil|👽 alien|👻 ghost|🤖 robot|💀 skull|🤡 clown|🧟 zombie|👼 angel|🥳 party|😇 innocent|🤩 amazed|🥺 pleading',
 'Animals':'🐴 horse|🦄 unicorn|🐎 racing horse|🐶 dog|🐱 cat|🦁 lion chimera|🐯 tiger|🐺 wolf|🦊 fox|🐻 bear|🐼 panda|🐭 mouse dwarf|🐰 rabbit jump|🦘 kangaroo springy|🦣 mammoth giant|🐉 dragon|🦎 reptile|🐍 snake serpent|🦋 butterfly|🐝 bee|🐞 ladybug|🕷️ spider|🦅 eagle|🦉 owl|🐦 bird|🦚 peacock|🦢 swan|🐧 penguin|🦇 bat|🐙 octopus|🦈 shark|🐬 dolphin|🐳 whale|🦌 deer|🐐 goat|🦊 cunning',
 'Nature':'🌸 sakura blossom|🌹 rose|🥀 wilted rose infection|🌻 sunflower|🌷 tulip|🌼 daisy|🍀 luck clover|🌱 fertile seedling|🌿 herb plant|🍄 mushroom|🌲 evergreen tree|🌳 tree|🍁 maple leaf|🍂 fallen leaf|🌵 cactus|🪨 rock geode|💎 crystal diamond|❄️ frost snowflake|🔥 fire flame|💧 water dilute|🫧 bubbles|🌊 wave ocean|⚡ lightning energy|🌈 rainbow tie dye|🌪️ tornado wind|☁️ cloud|☀️ solar sun|🌙 lunar moon|🌌 astral galaxy|⭐ star|🌠 shooting star|☄️ comet|🪐 planet|🌎 earth|🕳️ void hole|🌋 volcano|🏔️ mountain',
 'Magic & Objects':'🔮 arcane magic|🪄 wand spell|🧬 mutation dna|🧠 intelligence brain|🫁 lungs breath|💪 strength muscle|🦴 bone x ray|🪽 wing double jump|💞 close bond hearts|❤️ heart love|💖 sparkling heart|🔋 stamina battery|🏆 trophy|🥇 gold medal|🪙 gilded gold coin|💡 glow light|🕯️ haunting candle|🃏 jester joker|🎭 harlequin masks|🎨 palette color|🖌️ artisan brush|🧵 lace thread|🏺 porcelain vase|🧭 north star compass|🪞 perfect twins mirror|👯 twins|🎄 festive tree|🎃 pumpkin halloween|🎁 gift|🎀 ribbon|🧸 plush teddy|🎪 carnival|🛡️ shield|⚔️ swords|🗡️ blade|🔱 trident|🪶 feather|🧿 evil eye|⚙️ gear|🔗 chain|🗝️ key|🔒 locked|👑 crown|📜 scroll|📚 knowledge books|🔬 science|🧪 potion|⏳ time|🎯 target|🎲 random dice|🩰 nimble ballet|🏃 limber runner|🕊️ arisen dove|✨ sparkle'
};
export const emojiChoices=Object.entries(groups).flatMap(([category,list])=>list.split('|').map(item=>{const [emoji,...words]=item.split(' ');return {emoji,name:words.join(' '),category};}));
export function filterEmojiChoices(query='',category='') {
 const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return emojiChoices.filter(choice=>(!category || choice.category===category) && words.every(word=>`${choice.emoji} ${choice.name} ${choice.category}`.toLowerCase().includes(word)));
}
let dialog,choose;
export function openEmojiPicker({value,onSelect}) {
 if(!dialog) {
  dialog=document.createElement('dialog');dialog.className='emoji-picker-dialog';dialog.setAttribute('aria-labelledby','emoji-picker-title');
  dialog.innerHTML=`<div class="dialog-top"><h2 id="emoji-picker-title">Choose Emoji</h2><button type="button" class="icon-button" data-emoji-close aria-label="Close emoji picker">${icon('close')}</button></div><div class="emoji-picker-content"><div class="emoji-picker-filters"><input type="search" placeholder="Search emojis..." aria-label="Search emojis"><select aria-label="Emoji category"><option value="">All Categories</option>${Object.keys(groups).map(group=>`<option>${e(group)}</option>`).join('')}</select></div><div class="emoji-picker-grid"></div><p class="emoji-picker-empty" hidden>No matching emojis.</p><label class="zone-field">Or Paste Any Emoji<input class="emoji-picker-custom" maxlength="32" aria-label="Paste any emoji"></label><button type="button" class="button secondary" data-use-custom-emoji>Use Emoji</button><p class="emoji-picker-error" role="alert"></p></div>`;
  document.body.append(dialog);
  const update=()=>{
   const results=filterEmojiChoices(dialog.querySelector('[type="search"]').value,dialog.querySelector('select').value);
   dialog.querySelector('.emoji-picker-grid').innerHTML=results.map(choice=>`<button type="button" class="emoji-choice" data-emoji-value="${e(choice.emoji)}" aria-label="${e(choice.name)}" title="${e(choice.name)}">${choice.emoji}</button>`).join('');
   dialog.querySelector('.emoji-picker-empty').hidden=results.length>0;
  };
  dialog.addEventListener('input',update);dialog.addEventListener('change',update);
  dialog.addEventListener('close',()=>{choose=null;});
  dialog.addEventListener('click',event=>{
   if(event.target.closest('[data-emoji-close]')) return dialog.close();
   if(event.target===dialog) {const box=dialog.getBoundingClientRect();if(event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom) return dialog.close();}
   let emoji=event.target.closest('[data-emoji-value]')?.dataset.emojiValue;
   if(event.target.closest('[data-use-custom-emoji]')) {
    emoji=dialog.querySelector('.emoji-picker-custom').value.trim();
    if(!/[\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(emoji)) {dialog.querySelector('.emoji-picker-error').textContent='Paste an emoji first.';return;}
   }
   if(emoji) {choose?.(emoji);dialog.close();}
  });
  dialog.refresh=update;
 }
 choose=onSelect;
 dialog.querySelector('[type="search"]').value='';dialog.querySelector('select').value='';dialog.querySelector('.emoji-picker-custom').value=value || '';
 dialog.querySelector('.emoji-picker-error').textContent='';dialog.refresh();dialog.showModal();dialog.querySelector('[type="search"]').focus();
}