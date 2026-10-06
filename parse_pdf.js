const fs = require('fs');
const path = require('path');
const pdf = require(path.join(__dirname, 'node_modules', 'pdf-parse'));

async function parseLaMensaPdf() {
  const pdfUrl = 'https://jode.blr1.digitaloceanspaces.com/jod-e-documents/1760614319185jod-e.pdf';
  console.log('Downloading PDF from:', pdfUrl);
  
  const res = await fetch(pdfUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(__dirname, 'data', 'lamensa_menu.pdf'), buffer);
  console.log('PDF saved, size:', buffer.length);

  const data = await pdf(buffer);
  console.log('Total pages:', data.numpages);
  console.log('--- Extracted Text ---');
  fs.writeFileSync(path.join(__dirname, 'data', 'lamensa_extracted_text.txt'), data.text);
  console.log('Saved extracted text to data/lamensa_extracted_text.txt');
  console.log(data.text.slice(0, 3000));
}

parseLaMensaPdf().catch(console.error);
