// A single transport shared by the browser and Electron's persistent audio window.
export function createMusicEngine({audio=new Audio(),makeAudio=()=>new Audio(),clock=()=>performance.now(),frame=requestAnimationFrame}={}){
 let active=audio,players=[audio],track=null,revision=0,volume=.35,muted=false,playing=false,error='',gains=new Map([[audio,1]]);
 const apply=()=>players.forEach(a=>{a.volume=Math.max(0,Math.min(1,(gains.get(a)||0)*volume));a.muted=muted;});
 const clean=()=>{for(const a of players)if(a!==active){a.pause();a.removeAttribute('src');a.load();gains.delete(a);}players=[active];gains.set(active,1);apply();};
 async function select(next,seconds=2){
  if(track?.id===next?.id&&track?.url===next?.url)return snapshot();
  const token=++revision,old=active;
  const incoming=makeAudio();incoming.loop=true;incoming.volume=0;incoming.muted=muted;incoming.src=next.url;gains.set(incoming,0);players.push(incoming);
  try{
   if(playing)await incoming.play();
   if(token!==revision){incoming.pause();return snapshot();}
   active=incoming;track=next;error='';
   const starts=new Map(players.map(a=>[a,gains.get(a)||0])),start=clock();
   const tick=()=>{
    if(token!==revision)return;
    const t=seconds<=0?1:Math.min(1,(clock()-start)/(seconds*1000));
    for(const a of players)gains.set(a,a===incoming?t:(starts.get(a)||0)*(1-t));
    apply();if(t<1)frame(tick);else clean();
   };tick();
  }catch(e){incoming.pause();players=players.filter(a=>a!==incoming);gains.delete(incoming);active=old;error='Music could not play. Press Play to try again.';if(!track){active=incoming;players=[incoming];gains.set(incoming,1);track=next;playing=false;}apply();}
  return snapshot();
 }
 async function command(input){
  if(input.type==='select')return select(input.track,input.fadeSeconds);
  if(input.type==='play'){try{await active.play();playing=true;error='';}catch{playing=false;error='Press Play to allow music playback.';}}
  if(input.type==='pause'){playing=false;players.forEach(a=>a.pause());}
  if(input.type==='stop'){playing=false;players.forEach(a=>a.pause());active.currentTime=0;}
  if(input.type==='seek'&&Number.isFinite(input.value)&&Number.isFinite(active.duration))active.currentTime=Math.max(0,Math.min(active.duration,input.value));
  if(input.type==='volume'&&Number.isFinite(input.value))volume=Math.max(0,Math.min(1,input.value));
  if(input.type==='mute')muted=input.value===true;
  apply();return snapshot();
 }
 function snapshot(){return {track,transitioning:players.length>1,playing:playing&&!active.paused,volume:Math.round(volume*100),muted,currentTime:active.currentTime||0,duration:Number.isFinite(active.duration)?active.duration:0,error};}
 return {command,snapshot};
}
