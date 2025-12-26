import { useEffect, useState, useCallback, useRef, MouseEvent } from 'react';
import { generatePdf, downloadPdf } from './services/api';
import './App.css';

type ContentType = 'plain' | 'html';

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

interface MousePosition {
  x: number;
  y: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<ContentType>('plain');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [titleFontSize, setTitleFontSize] = useState(22);
  const [bodyFontSize, setBodyFontSize] = useState(12);
  const [titleFont, setTitleFont] = useState('default');
  const [bodyFont, setBodyFont] = useState('default');
  
  const debouncedTitle = useDebounce(title, 800);
  const debouncedContent = useDebounce(content, 800);
  const debouncedTitleFontSize = useDebounce(titleFontSize, 800);
  const debouncedBodyFontSize = useDebounce(bodyFontSize, 800);
  const debouncedTitleFont = useDebounce(titleFont, 800);
  const debouncedBodyFont = useDebounce(bodyFont, 800);
  
  const prevUrlRef = useRef<string | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const updatePreview = useCallback(async () => {
    if (!debouncedContent.trim()) return;

    setIsPreviewLoading(true);

    try {
      const pdfBlob = await generatePdf({
        title: debouncedTitle.trim(),
        content: debouncedContent.trim(),
        contentType,
        styles: { 
          titleFontSize: debouncedTitleFontSize, 
          bodyFontSize: debouncedBodyFontSize,
          titleFont: debouncedTitleFont,
          bodyFont: debouncedBodyFont
        }
      });

      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }

      const url = URL.createObjectURL(pdfBlob);
      prevUrlRef.current = url;
      setPreviewUrl(url);
    } catch (error) {
      console.error('PDF önizleme hatası:', error);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [debouncedTitle, debouncedContent, contentType, debouncedTitleFontSize, debouncedBodyFontSize, debouncedTitleFont, debouncedBodyFont]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setStatus({ type: 'error', text: 'Lütfen rapor içeriğini doldurun.' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const pdfBlob = await generatePdf({
        title: title.trim(),
        content: content.trim(),
        contentType,
        styles: { titleFontSize, bodyFontSize, titleFont, bodyFont }
      });

      downloadPdf(pdfBlob, title.trim() || 'rapor');
      setStatus({ type: 'success', text: 'PDF başarıyla oluşturuldu ve indirildi!' });
      triggerConfetti();
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      setStatus({ 
        type: 'error', 
        text: 'PDF oluşturulurken bir hata oluştu. Backend sunucusunun çalıştığından emin olun.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="app" 
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': `${mousePos.x}px`, '--mouse-y': `${mousePos.y}px` } as React.CSSProperties}
    >
      <div className="spotlight" />
      
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="confetti" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#d4af37', '#f4d03f', '#aa8c2c', '#ffd700', '#e8c49a'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}
      
      <header className="header">
        <div className="logo">
          <div className="logo-icon">📄</div>
          <span className="logo-text">TechTalent</span>
        </div>
        <p className="subtitle">PDF Rapor Oluşturma Sistemi</p>
      </header>

      <main className={`main-content ${showPreview ? 'has-preview' : ''}`}>
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="content-type-selector">
            <div className="type-option">
              <input
                type="radio"
                id="plain"
                name="contentType"
                value="plain"
                checked={contentType === 'plain'}
                onChange={() => setContentType('plain')}
                disabled={isLoading}
              />
              <label htmlFor="plain">
                <span className="type-icon">📝</span>
                <span className="type-label">Düz Metin</span>
                <span className="type-desc">Basit metin formatı</span>
              </label>
            </div>
            <div className="type-option">
              <input
                type="radio"
                id="html"
                name="contentType"
                value="html"
                checked={contentType === 'html'}
                onChange={() => setContentType('html')}
                disabled={isLoading}
              />
              <label htmlFor="html">
                <span className="type-icon">🌐</span>
                <span className="type-label">HTML</span>
                <span className="type-desc">Zengin içerik formatı</span>
              </label>
            </div>
          </div>

          <div className="style-controls">
            <div className="style-row">
              <div className="style-group">
                <label className="style-label">Başlık Fontu</label>
                <select
                  className="style-select"
                  value={titleFont}
                  onChange={(e) => setTitleFont(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="default">Varsayılan (Segoe UI)</option>
                  <option value="roboto">Roboto</option>
                  <option value="opensans">Open Sans</option>
                  <option value="lato">Lato</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="playfair">Playfair Display</option>
                  <option value="merriweather">Merriweather</option>
                  <option value="times">Times New Roman</option>
                  <option value="georgia">Georgia</option>
                  <option value="arial">Arial</option>
                </select>
              </div>
              <div className="style-group size-group">
                <label className="style-label">Punto</label>
                <input
                  type="number"
                  className="style-input"
                  value={titleFontSize}
                  onChange={(e) => setTitleFontSize(Number(e.target.value))}
                  min={8}
                  max={72}
                  disabled={isLoading}
                />
                <span className="style-unit">pt</span>
              </div>
            </div>
            <div className="style-row">
              <div className="style-group">
                <label className="style-label">Metin Fontu</label>
                <select
                  className="style-select"
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="default">Varsayılan (Segoe UI)</option>
                  <option value="roboto">Roboto</option>
                  <option value="opensans">Open Sans</option>
                  <option value="lato">Lato</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="playfair">Playfair Display</option>
                  <option value="merriweather">Merriweather</option>
                  <option value="times">Times New Roman</option>
                  <option value="georgia">Georgia</option>
                  <option value="arial">Arial</option>
                  <option value="courier">Courier New</option>
                </select>
              </div>
              <div className="style-group size-group">
                <label className="style-label">Punto</label>
                <input
                  type="number"
                  className="style-input"
                  value={bodyFontSize}
                  onChange={(e) => setBodyFontSize(Number(e.target.value))}
                  min={6}
                  max={48}
                  disabled={isLoading}
                />
                <span className="style-unit">pt</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="title">Rapor Başlığı (Opsiyonel)</label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="Örn: 2024 Yılı Satış Raporu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="content">
              Rapor İçeriği {contentType === 'html' ? '(HTML)' : '(Metin)'}
            </label>
            <textarea
              id="content"
              className="form-input form-textarea"
              placeholder={
                contentType === 'plain'
                  ? 'Rapor içeriğinizi buraya yazın...\n\nHer satır otomatik olarak paragraf olarak işlenecektir.'
                  : '<h2>Bölüm Başlığı</h2>\n<p>Paragraf içeriği...</p>\n<ul>\n  <li>Liste öğesi 1</li>\n  <li>Liste öğesi 2</li>\n</ul>'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="actions">
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>PDF Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">📥</span>
                  <span>PDF Oluştur ve İndir</span>
                </>
              )}
            </button>
          </div>

          {status && (
            <div className={`status-message ${status.type}`}>
              <span className="status-icon">
                {status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span>{status.text}</span>
            </div>
          )}

          <div className="info-box">
            <span className="info-icon">💡</span>
            <p className="info-text">
              {contentType === 'plain' ? (
                <>
                  Düz metin modunda her satır otomatik olarak bir paragraf olarak işlenir. 
                  Boş satırlar korunur. <strong>Önizleme otomatik güncellenir!</strong>
                </>
              ) : (
                <>
                  HTML modunda <code>&lt;h1&gt;</code>, <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>, 
                  <code>&lt;ul&gt;</code>, <code>&lt;table&gt;</code> gibi etiketler kullanabilirsiniz. 
                  Sayfa kırmak için <code>&lt;div class="page-break"&gt;&lt;/div&gt;</code> ekleyebilirsiniz.
                </>
              )}
            </p>
          </div>

          {!showPreview && (
            <button
              type="button"
              className="open-preview-btn"
              onClick={() => setShowPreview(true)}
            >
              <span>👁️ PDF Önizlemeyi Aç</span>
            </button>
          )}
        </form>

        {showPreview && (
          <div className="preview-card">
            <div className="preview-header">
              <div>
                <div className="preview-title">
                  PDF Önizleme
                  {isPreviewLoading && <span className="preview-loading">⏳</span>}
                </div>
                <div className="preview-subtitle">Anlık önizleme - yazarken otomatik güncellenir</div>
              </div>
              <div className="preview-actions">
                {previewUrl && (
                  <button
                    type="button"
                    className="secondary-btn small"
                    onClick={() => window.open(previewUrl, '_blank')}
                  >
                    <span>🔗 Yeni Sekmede Aç</span>
                  </button>
                )}
                <button
                  type="button"
                  className="close-preview-btn"
                  onClick={() => setShowPreview(false)}
                  title="Önizlemeyi Kapat"
                >
                  <span>✕</span>
                </button>
              </div>
            </div>
            {previewUrl ? (
              <iframe title="PDF Preview" className="preview-frame" src={previewUrl} />
            ) : (
              <div className="preview-placeholder">
                <div className="placeholder-icon">📄</div>
                <div className="placeholder-text">
                  İçerik girerek<br />PDF önizlemeyi başlatın
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M12 16v2"/>
              <path d="M8 11V7a4 4 0 1 1 8 0v4"/>
            </svg>
            <h3 className="feature-title">Güvenli ve Hızlı</h3>
            <p className="feature-desc">
              Verileriniz sunucuda işlenir ve PDF oluşturulduktan sonra 
              otomatik olarak temizlenir. Puppeteer ile yüksek kaliteli 
              çıktı garantisi.
            </p>
          </div>
          
          <div className="feature-card">
            <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <h3 className="feature-title">Anlık Önizleme</h3>
            <p className="feature-desc">
              Yazdığınız içerik anında PDF olarak önizlenir. HTML ve düz 
              metin desteği ile profesyonel raporlar oluşturun. Sayfa 
              düzeni otomatik ayarlanır.
            </p>
          </div>
          
          <div className="feature-card">
            <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
            <h3 className="feature-title">Antetli Kağıt Desteği</h3>
            <p className="feature-desc">
              Kurumsal antetli kağıt şablonunuz PDF'in her sayfasına 
              otomatik uygulanır. İçerik güvenli alanlarda kalır, 
              profesyonel görünüm sağlanır.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>✨ TechTalent © 2024 - Full Stack PDF Rapor Sistemi</p>
      </footer>
    </div>
  );
}

export default App;
