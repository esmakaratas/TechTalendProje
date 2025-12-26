interface StyleOptions {
  titleFontSize?: number;
  bodyFontSize?: number;
  titleFont?: string;
  bodyFont?: string;
}

interface TemplateData {
  title: string;
  content: string;
  styles?: StyleOptions;
}

const fontMap: Record<string, string> = {
  'default': "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  'roboto': "'Roboto', sans-serif",
  'opensans': "'Open Sans', sans-serif",
  'lato': "'Lato', sans-serif",
  'montserrat': "'Montserrat', sans-serif",
  'playfair': "'Playfair Display', serif",
  'merriweather': "'Merriweather', serif",
  'times': "'Times New Roman', Times, serif",
  'georgia': "'Georgia', serif",
  'arial': "'Arial', Helvetica, sans-serif",
  'courier': "'Courier New', Courier, monospace",
};

export function getReportTemplate(data: TemplateData): string {
  const titleSize = data.styles?.titleFontSize || 22;
  const bodySize = data.styles?.bodyFontSize || 12;
  const titleFont = fontMap[data.styles?.titleFont || 'default'] || fontMap['default'];
  const bodyFont = fontMap[data.styles?.bodyFont || 'default'] || fontMap['default'];
  
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700;800&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${bodyFont};
      font-size: ${bodySize}pt;
      line-height: 1.6;
      color: #1e293b;
      background: transparent;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      padding: 0;
      page-break-after: always;
      break-after: page;
    }
    .page:last-child { page-break-after: auto; break-after: auto; }
    .safe-area { width: 100%; margin: 0 auto; }
    .doc-title {
      font-family: ${titleFont};
      font-size: ${titleSize}pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 18px;
    }
    .content {
      text-align: justify;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .content > * { page-break-inside: avoid; break-inside: avoid; }
    h1, h2, h3 {
      page-break-after: avoid;
      break-after: avoid;
      font-family: ${titleFont};
    }
    .content p { margin-bottom: 12px; }
    .content h1 { font-size: 20pt; color: #1e40af; margin: 25px 0 15px 0; }
    .content h2 { font-size: 16pt; color: #2563eb; margin: 20px 0 12px 0; }
    .content h3 { font-size: 14pt; color: #3b82f6; margin: 18px 0 10px 0; }
    .content ul, .content ol { margin: 12px 0; padding-left: 25px; }
    .content li { margin-bottom: 6px; }
    .content table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .content table th, .content table td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
    .content table th { background-color: #f1f5f9; font-weight: 600; color: #1e40af; }
    .content table tr:nth-child(even) { background-color: #f8fafc; }
    .content blockquote { border-left: 4px solid #2563eb; padding-left: 15px; margin: 15px 0; color: #475569; font-style: italic; }
    .content code { background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Consolas', 'Monaco', monospace; font-size: 10pt; }
    .content pre { background-color: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 8px; overflow-x: auto; margin: 15px 0; }
    .content pre code { background: none; padding: 0; color: inherit; }
    .content img { max-width: 100%; height: auto; margin: 15px 0; }
    .content a { color: #2563eb; text-decoration: underline; }
    .page-break { page-break-before: always; break-before: page; }
    p, h1, h2, h3, table, blockquote, ul, ol { page-break-inside: avoid; break-inside: avoid; }
    tr, td, th { page-break-inside: avoid; break-inside: avoid; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="safe-area">
      <div class="content">
        ${data.title ? `<div class="doc-title">${escapeHtml(data.title)}</div>` : ''}
        ${data.content}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char]);
}
