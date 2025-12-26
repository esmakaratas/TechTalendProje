import { Request, Response } from 'express';
import { performance } from 'perf_hooks';
import { PdfService } from '../services/pdfService';

export const generatePdf = async (req: Request, res: Response): Promise<void> => {
  const start = performance.now();
  try {
    const { title, content, contentType, styles } = req.body;

    if (!content) {
      res.status(400).json({
        success: false,
        message: 'Rapor içeriği gereklidir.'
      });
      return;
    }

    if (!contentType || !['plain', 'html'].includes(contentType)) {
      res.status(400).json({
        success: false,
        message: 'İçerik tipi "plain" veya "html" olmalıdır.'
      });
      return;
    }

    const pdfService = new PdfService();
    const pdfBuffer = await pdfService.generateReport({
      title,
      content,
      contentType: contentType as 'plain' | 'html',
      styles
    });

    const durationMs = performance.now() - start;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.pdf"`);
    res.setHeader('X-Response-Time-ms', durationMs.toFixed(1));
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'PDF oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

