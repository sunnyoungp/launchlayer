export type FormulaRow = {name:string;concentration:string;confirmed:boolean};

export function parseFormulaText(text: string): FormulaRow[] {
  const output: FormulaRow[] = [];
  const seen = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/^[-*•\d.)\s]+/, '');
    if (!line || /^(page\s+\d+|sheet:|ingredients?\s*(?:,|$)|inci\s+(?:name|declaration)|raw material|material\s+name)/i.test(line)) continue;
    let name = '', concentration = '';
    const delimiter = line.includes('|')?'\u007c':line.includes('\t')?'\t':line.includes(',')?',':'';
    const cells = delimiter?line.split(delimiter).map(x=>x.trim().replace(/^"|"$/g,'')).filter(Boolean):[line];
    if (cells.length >= 2 && /^\d+(?:[.,]\d+)?\s*%?$/.test(cells.at(-1)!)) {
      name = cells.slice(0,-1).join(' ').replace(/\b(?:INCI|ingredient)\s*:?/i,'').trim();
      concentration = cells.at(-1)!.replace('%','').replace(',','.');
    } else {
      const match = line.match(/^(.{2,80}?)\s{1,}(\d+(?:[.,]\d+)?)\s*%?$/);
      if (match) { name=match[1]!.replace(/\b(?:INCI|ingredient)\s*:?/i,'').trim(); concentration=match[2]!.replace(',','.'); }
    }
    if (!name && /^(?:ingredients?|inci)\s*:/i.test(line)) {
      const list=line.replace(/^(?:ingredients?|inci)\s*:/i,'').split(/[,;]/).map(x=>x.trim()).filter(x=>/^[\p{L}][\p{L}\p{M}\d ()'-]{1,60}$/u.test(x));
      for (const item of list) {const key=item.toLowerCase();if(!seen.has(key)){seen.add(key);output.push({name:item,concentration:'',confirmed:false});}}
      continue;
    }
    if (name && /[\p{L}]/u.test(name) && name.length <= 80 && !/^(?:total|formula|composition|product name|batch|lot|date|percentage|concentration)$/i.test(name)) {
      const key=name.toLowerCase(); if(!seen.has(key)){seen.add(key);output.push({name,concentration,confirmed:false});}
    }
  }
  return output;
}
