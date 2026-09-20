import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFormulaText} from '@/lib/formula-import';
import * as XLSX from 'xlsx';
import {extractDocumentText} from '@/lib/document-import';

test('formula import extracts names and concentrations from spreadsheet rows',()=>{
  const rows=parseFormulaText('Ingredient,Concentration\nAqua,81.9%\nGlycerin,8\nNiacinamide,5');
  assert.deepEqual(rows.map(r=>[r.name,r.concentration,r.confirmed]),[['Aqua','81.9',false],['Glycerin','8',false],['Niacinamide','5',false]]);
});
test('formula import reads pipe and PDF layout rows without confirming identity',()=>{
  const rows=parseFormulaText('Page 1\nAqua     81.9%\nGlycerin | 8%\nINCI: Squalane, Niacinamide');
  assert.deepEqual(rows.map(r=>r.name),['Aqua','Glycerin','Squalane','Niacinamide']);
  assert.equal(rows.some(r=>r.confirmed),false);
});
test('uploaded XLSX sheets are extracted into reviewable text',async()=>{
  const workbook=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['Ingredient','Concentration'],['Aqua',81.9],['Glycerin',8]]),'Formula');
  const bytes=XLSX.write(workbook,{bookType:'xlsx',type:'array'});
  const text=await extractDocumentText(new File([bytes],'formula.xlsx'));
  assert.match(text,/Sheet: Formula/); assert.match(text,/Aqua,81\.9/);
});
