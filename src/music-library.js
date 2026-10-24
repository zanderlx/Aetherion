import {durationOfFile,durationOfBuffer} from './music-duration.js';
import {assignmentTracks,formatMusicName} from '../public/music-context.js';
import {mkdir,readFile,writeFile,rename,unlink,open,stat,copyFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
const validId=id=>/^[a-f0-9-]{36}$/.test(id);
export class MusicLibrary {
  constructor(directory,builtin,seeds=[]){this.builtin=builtin;this.root=join(directory,'music');this.queue=Promise.resolve();this.ready=this.seed(seeds);}
  async seed(seeds){
    let library;try{library=JSON.parse(await readFile(join(this.root,'library.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;if(!seeds.length)return;library={version:2,tracks:[],assignments:{},fadeSeconds:2};}
    const seen=new Set(library.seededTrackIds||[]);let changed=false;
    for(const track of seeds){
      if(seen.has(track.id))continue;
      await mkdir(this.root,{recursive:true});
      await copyFile(track.source,join(this.root,track.id+'.mp3'));
      library.tracks.push({id:track.id,name:track.name,addedAt:new Date().toISOString()});
      seen.add(track.id);changed=true;
    }
    for(const track of seeds){const existing=library.tracks.find(t=>t.id===track.id);if(existing&&track.file&&existing.filename!==track.file){existing.filename=track.file;existing.name=formatMusicName(track.file);changed=true;}}
    for(const track of library.tracks){if(!Number.isFinite(track.durationSeconds)||track.durationSeconds<=0){const duration=await durationOfFile(join(this.root,track.id+'.mp3'));if(duration!==track.durationSeconds){track.durationSeconds=duration;changed=true;}}}
    for(const [context,value] of Object.entries(library.assignments||{})){
      if(context!=='default'&&assignmentTracks(value).includes('menu')){library.assignments[context]=assignmentTracks(value).filter(id=>id!=='menu');changed=true;}
    }
    if(changed){library.seededTrackIds=[...seen];await this.write(library);}
  }
  async read(){
    await this.ready;
    try{const library=JSON.parse(await readFile(join(this.root,'library.json'),'utf8'));return {...library,version:2,tracks:library.tracks.map(track=>({...track,name:formatMusicName(track.filename||track.name)})),assignments:Object.fromEntries(Object.entries(library.assignments||{}).map(([key,value])=>[key,assignmentTracks(value)]))};}
    catch(error){if(error.code!=='ENOENT')throw error;return {version:2,tracks:[],assignments:{},fadeSeconds:2};}
  }
  async write(value){
    await mkdir(this.root,{recursive:true});
    const temp=join(this.root,randomUUID()+'.tmp');
    await writeFile(temp,JSON.stringify(value,null,2)+'\n');await rename(temp,join(this.root,'library.json'));
  }
  edit(fn){const job=this.queue.then(fn);this.queue=job.catch(()=>{});return job;}
  async import(name,bytes){
    return this.edit(async()=>{
      if(typeof name!=='string'||!name.toLowerCase().endsWith('.mp3')||name.length>200)throw Error('Choose an MP3 file with a name under 200 characters.');
      // Accept ID3-tagged files or an MPEG frame header.
      if(!Buffer.isBuffer(bytes)||bytes.length<4||bytes.length>50*1024*1024||!(bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224)))throw Error('Choose a valid MP3 file (maximum 50 MB).');
      const library=await this.read(),track={id:randomUUID(),filename:name.replace(/[\x00-\x1f]/g,''),name:formatMusicName(name),durationSeconds:await durationOfBuffer(bytes),addedAt:new Date().toISOString()};
      await mkdir(this.root,{recursive:true});await writeFile(join(this.root,track.id+'.mp3'),bytes);
      try{library.tracks.push(track);await this.write(library);}catch(error){await unlink(join(this.root,track.id+'.mp3'));throw error;}
      return library;
    });
  }
  async settings(input,contexts){
    return this.edit(async()=>{
      const library=await this.read();
      if(!input||!Number.isFinite(input.fadeSeconds)||input.fadeSeconds<0||input.fadeSeconds>10||!input.assignments||typeof input.assignments!=='object'||Array.isArray(input.assignments))throw Error('Choose a fade between 0 and 10 seconds.');
      const assignments={};
      for(const [context,value] of Object.entries(input.assignments)){
        const ids=assignmentTracks(value);
        if(!contexts.includes(context)||(!Array.isArray(value)&&typeof value!=='string')||ids.length>500||ids.some(id=>typeof id!=='string'||(id!=='menu'&&!library.tracks.some(t=>t.id===id))))throw Error('Choose an existing song and location.');
        if(Array.isArray(value)||ids.length)assignments[context]=[...new Set(ids.filter(id=>context==='default'||id!=='menu'))];
      }
      await this.write({...library,assignments,fadeSeconds:input.fadeSeconds});return this.read();
    });
  }
  async fade(value){
    return this.edit(async()=>{
      if(!Number.isFinite(value)||value<0||value>10)throw Error('Crossfade must be between 0 and 10 seconds.');
      const library=await this.read();if(library.fadeSeconds===value)return library;
      library.fadeSeconds=value;await this.write(library);return library;
    });
  }
  async remove(id){
    return this.edit(async()=>{
      if(!validId(id))throw Error('Song not found.');
      const library=await this.read();if(!library.tracks.some(t=>t.id===id))throw Error('Song not found.');
      library.tracks=library.tracks.filter(t=>t.id!==id);
      library.assignments=Object.fromEntries(Object.entries(library.assignments).map(([key,value])=>[key,assignmentTracks(value).filter(value=>value!==id)]));
      await this.write(library);await unlink(join(this.root,id+'.mp3')).catch(e=>{if(e.code!=='ENOENT')throw e;});return library;
    });
  }
  async media(req,res,id){
    if(id!=='menu'&&(!validId(id)||!(await this.read()).tracks.some(t=>t.id===id))){res.writeHead(404);res.end();return;}
    const file=id==='menu'?this.builtin:join(this.root,id+'.mp3'),size=(await stat(file)).size;
    let start=0,end=size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':'bytes */'+size});res.end();return;}
      if(!match[1])start=Math.max(0,size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),size-1);}
      if(start>end||start>=size){res.writeHead(416,{'Content-Range':'bytes */'+size});res.end();return;}status=206;
    }
    res.writeHead(status,{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Length':end-start+1,...(status===206?{'Content-Range':'bytes '+start+'-'+end+'/'+size}:{})});
    if(req.method==='HEAD'){res.end();return;}
    const handle=await open(file);const stream=handle.createReadStream({start,end});
    res.once('close',()=>stream.destroy());stream.on('error',()=>res.destroy());stream.pipe(res);
  }
}
