import { Router } from 'express';
import { generatePdf } from '../controllers/pdfController';

const router = Router();

// POST /api/pdf/generate - PDF oluşturma endpoint'i
router.post('/generate', generatePdf);

export default router;








