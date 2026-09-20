export async function extractDocumentText(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf' || file.type === 'application/pdf') {
    const [pdfjs, worker] = await Promise.all([import('pdfjs-dist'),import('pdfjs-dist/build/pdf.worker.min.mjs?url')]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    try {
      const document = await task.promise;
      const totalPages=document.numPages; const pageCount = Math.min(totalPages, 60);
      const lines: string[] = []; let characterCount=0;
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const items = content.items.filter((item): item is typeof item & {str:string;transform:number[]} => 'str' in item && 'transform' in item && Boolean(item.str.trim()));
        const rows = new Map<number, Array<{x:number;text:string}>>();
        for (const item of items) {
          const y = Math.round(item.transform[5] / 2) * 2;
          const row = rows.get(y) ?? [];
          row.push({ x: item.transform[4] ?? 0, text: item.str.trim() });
          rows.set(y, row);
        }
        const pageLines = [...rows.entries()].sort((a,b)=>b[0]-a[0]).map(([,row])=>row.sort((a,b)=>a.x-b.x).map(x=>x.text).join(' '));
        lines.push(`Page ${pageNumber}`, ...pageLines);
        characterCount+=pageLines.reduce((n,line)=>n+line.length+1,0);
        if (characterCount > 150_000) break;
      }
      if (totalPages > pageCount) lines.push(`[Text extraction limited to first ${pageCount} pages.]`);
      return lines.join('\n').slice(0, 150_000).trim();
    } finally {
      await task.destroy();
    }
  }
  if (extension === 'xlsx' || extension === 'xls') {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await file.arrayBuffer(), { cellText: true, cellDates: false });
    return workbook.SheetNames.map(name => `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name]!)}`).join('\n\n').slice(0,150_000).trim();
  }
  return await file.text();
}
