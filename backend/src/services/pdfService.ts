import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { getReportTemplate } from '../templates/reportTemplate';

interface StyleOptions {
  titleFontSize?: number;
  bodyFontSize?: number;
  titleFont?: string;
  bodyFont?: string;
}

interface ReportData {
  title: string;
  content: string;
  contentType: 'plain' | 'html';
  styles?: StyleOptions;
}

export class PdfService {
  async generateReport(data: ReportData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();

      const processedContent = data.contentType === 'plain'
        ? this.convertPlainTextToHtml(data.content)
        : this.sanitizeHtmlContent(data.content);

      const htmlContent = getReportTemplate({
        title: data.title,
        content: processedContent,
        styles: data.styles
      });

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
      });

      const merged = await this.applyLetterhead(pdfBuffer);
      return Buffer.from(merged);
    } finally {
      await browser.close();
    }
  }

  private convertPlainTextToHtml(text: string): string {
    return text
      .split('\n')
      .map(line => `<p>${this.escapeHtml(line) || '&nbsp;'}</p>`)
      .join('');
  }

  private sanitizeHtmlContent(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'blockquote', 'code', 'pre', 'span', 'div',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'strong', 'em', 'b', 'i', 'u',
        'a', 'img', 'br', 'hr'
      ],
      allowedAttributes: {
        '*': ['class', 'style'],
        a: ['href', 'name', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height']
      },
      allowedSchemes: ['http', 'https', 'data', 'mailto'],
      allowedStyles: {
        '*': {
          'color': [/^.*$/],
          'background-color': [/^.*$/],
          'text-align': [/^.*$/],
          'font-size': [/^.*$/],
          'font-weight': [/^.*$/],
          'font-style': [/^.*$/],
          'text-decoration': [/^.*$/],
          'padding': [/^.*$/],
          'margin': [/^.*$/],
          'border': [/^.*$/],
          'border-collapse': [/^.*$/],
          'width': [/^.*$/],
          'height': [/^.*$/]
        }
      }
    });
  }

  private async applyLetterhead(pdfBuffer: Buffer): Promise<Uint8Array> {
    try {
      const letterheadPath = process.env.ANTET_PATH
        ? path.resolve(process.env.ANTET_PATH)
        : path.resolve(process.cwd(), '..', 'antetlikagit.pdf');

      if (!fs.existsSync(letterheadPath)) {
        return pdfBuffer;
      }

      const [generatedDoc, templateBytes] = await Promise.all([
        PDFDocument.load(pdfBuffer),
        fs.promises.readFile(letterheadPath)
      ]);

      const templateDoc = await PDFDocument.load(templateBytes);
      const [templatePage] = templateDoc.getPages();

      const output = await PDFDocument.create();
      const templateEmbedded = await output.embedPage(templatePage);

      const tplSize = templatePage.getSize();
      const tplWidth = tplSize.width;
      const tplHeight = tplSize.height;

      const topPad = tplHeight * 0.0717;
      const bottomPad = tplHeight * 0.1040;
      const leftPad = tplWidth * 0.1042;
      const rightPad = tplWidth * 0.1042;
      const safeWidth = tplWidth - leftPad - rightPad;
      const safeHeight = tplHeight - topPad - bottomPad;

      for (const page of generatedDoc.getPages()) {
        const embeddedPage = await output.embedPage(page);
        const newPage = output.addPage([tplWidth, tplHeight]);
        newPage.drawPage(templateEmbedded, { x: 0, y: 0, width: tplWidth, height: tplHeight });
        newPage.drawPage(embeddedPage, {
          x: leftPad,
          y: bottomPad,
          width: safeWidth,
          height: safeHeight,
        });
      }

      return output.save();
    } catch (err) {
      console.warn('Antet uygulanamadı:', err);
      return pdfBuffer;
    }
  }

  private escapeHtml(text: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => htmlEntities[char]);
  }
}
