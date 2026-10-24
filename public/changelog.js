export const changelogCategories=['Added','Changed','Deprecated','Removed','Fixed','Security'];
const versionPattern=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export function parseChangelog(source){
  if(typeof source!=='string')throw new Error('Changelog must be text.');
  const entries=[];let entry,section;
  for(const raw of source.split(/\r?\n/)){
    const line=raw.trim();
    const heading=/^## \[([^\]]+)\] - (?:(.+) - )?(\S+)$/.exec(line);
    if(heading){
      const [,version,title,date]=heading;
      if(!versionPattern.test(version)||entries.some(e=>e.version===version))throw new Error('Invalid or duplicate changelog version.');
      if(date!=='Unreleased' && (!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))throw new Error('Invalid changelog date.');
      entry={version,title:title || null,date,summary:[],sections:[]};entries.push(entry);section=null;continue;
    }
    if(!entry || !line)continue;
    if(line.startsWith('### ')){
      const name=line.slice(4);
      if(!changelogCategories.includes(name)||entry.sections.some(s=>s.name===name))throw new Error('Invalid or duplicate changelog section.');
      section={name,items:[]};entry.sections.push(section);continue;
    }
    if(line.startsWith('- ')){
      if(!section)throw new Error('Changes need a category.');
      section.items.push(line.slice(2));continue;
    }
    if(line.startsWith('#'))throw new Error('Invalid changelog heading.');
    if(section)throw new Error('Use one bullet per change.');
    entry.summary.push(line);
  }
  if(!entries.length)throw new Error('No changelog entries.');
  for(const value of entries)if((!value.title && !value.summary.length)||!value.sections.some(s=>s.items.length))throw new Error('Each release needs a summary and changes.');
  return entries;
}
export function releaseMarkdown(entry,date=entry.date){
  return '## ['+entry.version+'] - '+(entry.title?entry.title+' - ':'')+date+'\n\n'+(entry.summary.length?entry.summary.join('\n\n')+'\n\n':'')+entry.sections.filter(s=>s.items.length).map(s=>'### '+s.name+'\n\n'+s.items.map(text=>'- '+text).join('\n')).join('\n\n')+'\n';
}
export function releaseTitle(entry){
  return 'Gallorin v'+entry.version+' — '+(entry.title || entry.summary[0]);
}
