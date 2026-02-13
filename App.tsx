
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { removeSubtitlesFromImage } from './services/geminiService';
import { UploadIcon, DownloadIcon, WandIcon, ResetIcon } from './components/icons';

// --- i18n Translations ---
const translations = {
  ko: {
    title: "AI 자막 제거기",
    subtitle: "이미지를 업로드하고 AI가 마법처럼 글자를 지우는 것을 경험하세요.",
    uploadBtn: "이미지 업로드",
    uploadHint: "클릭하여 이미지를 선택하세요",
    fileTypes: "PNG, JPG, GIF 최대 10MB",
    originalTitle: "원본 이미지",
    cleanedTitle: "결과 이미지",
    processing: "처리 중...",
    readyTitle: "자막을 제거할 준비가 되셨나요?",
    readyText: "아래 버튼을 눌러 AI 작업을 시작하세요.",
    removeBtn: "자막 제거하기",
    downloadBtn: "이미지 다운로드",
    resetBtn: "다시 시작하기",
    errorValidImage: "유효한 이미지 파일(PNG, JPG 등)을 업로드해주세요.",
    errorUnknown: "알 수 없는 오류가 발생했습니다.",
    footer: "Gemini AI 제공",
    generating: "생성 중..."
  },
  en: {
    title: "AI Subtitle Remover",
    subtitle: "Upload an image and let AI magically erase the text.",
    uploadBtn: "Upload Image",
    uploadHint: "Click to upload an image",
    fileTypes: "PNG, JPG, GIF up to 10MB",
    originalTitle: "Original Image",
    cleanedTitle: "Cleaned Image",
    processing: "Processing...",
    readyTitle: "Ready to Remove Subtitles?",
    readyText: "Click the button below to start the AI process.",
    removeBtn: "Remove Subtitles",
    downloadBtn: "Download Image",
    resetBtn: "Start Over",
    errorValidImage: "Please upload a valid image file (PNG, JPG, etc.).",
    errorUnknown: "An unknown error occurred.",
    footer: "Powered by Gemini AI",
    generating: "Generating..."
  }
};

type Language = 'ko' | 'en';
type Theme = 'light' | 'dark';

// --- Components ---

const Header: React.FC<{ 
  lang: Language; 
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}> = ({ lang, setLang, theme, setTheme }) => {
  const t = translations[lang];
  return (
    <header className={`p-6 border-b transition-colors duration-300 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200 bg-white'}`}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className={`text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${theme === 'dark' ? 'from-purple-400 to-cyan-400' : 'from-indigo-600 to-blue-600'}`}>
            {t.title}
          </h1>
          <p className={`mt-1 text-sm md:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className={`flex rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-slate-600' : 'border-gray-300'}`}>
            <button 
              onClick={() => setLang('ko')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${lang === 'ko' ? (theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white') : (theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500')}`}
            >
              한국어
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${lang === 'en' ? (theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white') : (theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500')}`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-yellow-400' : 'bg-gray-100 border-gray-300 text-indigo-600'}`}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

interface ImageViewerProps {
  title: string;
  imageUrl: string;
  onDownload?: () => void;
  isLoading?: boolean;
  theme: Theme;
  lang: Language;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ title, imageUrl, onDownload, isLoading = false, theme, lang }) => {
  const t = translations[lang];
  return (
    <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-xl'} rounded-2xl p-4 flex flex-col items-center animate-fade-in w-full transition-all`}>
      <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>{title}</h3>
      <div className={`relative w-full aspect-video ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'} rounded-xl overflow-hidden flex items-center justify-center border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center">
            <svg className={`animate-spin h-10 w-10 ${theme === 'dark' ? 'text-purple-400' : 'text-indigo-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className={`mt-3 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{t.generating}</span>
          </div>
        ) : (
          <img src={imageUrl} alt={title} className="object-contain max-h-full max-w-full" />
        )}
      </div>
      {onDownload && (
        <button
          onClick={onDownload}
          className={`mt-4 w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white transition-transform active:scale-95 ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          {t.downloadBtn}
        </button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ko');
  const [theme, setTheme] = useState<Theme>('dark');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  useEffect(() => {
    // Add theme class to body for global styling if needed
    document.body.className = theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50';
  }, [theme]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t.errorValidImage);
        return;
      }
      resetState();
      setOriginalImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setError(null);
    }
  }, [t]);
  
  const resetState = () => {
    setOriginalImage(null);
    setOriginalImageUrl(null);
    setProcessedImageUrl(null);
    setIsLoading(false);
    setError(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProcessImage = useCallback(async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setProcessedImageUrl(null);
    setError(null);

    try {
      const processedImageBase64 = await removeSubtitlesFromImage(originalImage);
      setProcessedImageUrl(`data:image/png;base64,${processedImageBase64}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.errorUnknown;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, t]);
  
  const handleDownload = () => {
    if (!processedImageUrl) return;
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = `cleaned-${originalImage?.name || 'image.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <Header lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
      
      <main className="container mx-auto p-4 md:p-8">
        {!originalImageUrl && (
          <div className="max-w-2xl mx-auto animate-fade-in py-12">
            <div
              className={`relative block w-full border-2 border-dashed rounded-3xl p-16 text-center focus:outline-none focus:ring-4 transition-all cursor-pointer ${theme === 'dark' ? 'border-slate-600 bg-slate-800 hover:border-purple-400 focus:ring-purple-500/20' : 'border-gray-300 bg-white shadow-xl hover:border-indigo-400 focus:ring-indigo-500/20'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`mx-auto h-20 w-20 flex items-center justify-center rounded-2xl mb-4 ${theme === 'dark' ? 'bg-slate-700 text-purple-400' : 'bg-indigo-50 text-indigo-500'}`}>
                <UploadIcon className="h-10 w-10" />
              </div>
              <span className={`mt-2 block text-xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                {t.uploadBtn}
              </span>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{t.uploadHint}</p>
              <p className={`mt-4 text-xs px-3 py-1 inline-block rounded-full ${theme === 'dark' ? 'bg-slate-700 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>
                {t.fileTypes}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}

        {error && (
            <div className={`max-w-4xl mx-auto border px-6 py-4 rounded-2xl relative my-6 animate-fade-in shadow-lg ${theme === 'dark' ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`} role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {originalImageUrl && (
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
              <ImageViewer 
                title={t.originalTitle} 
                imageUrl={originalImageUrl} 
                theme={theme} 
                lang={lang} 
              />
              { isLoading || processedImageUrl ? (
                <ImageViewer 
                    title={t.cleanedTitle} 
                    imageUrl={processedImageUrl || ''}
                    isLoading={isLoading}
                    onDownload={processedImageUrl ? handleDownload : undefined}
                    theme={theme}
                    lang={lang}
                />
              ) : (
                <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-xl'} rounded-2xl p-8 flex flex-col items-center justify-center animate-fade-in w-full min-h-[400px] text-center border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
                    <div className={`p-6 rounded-full mb-6 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-indigo-50'}`}>
                      <WandIcon className={`w-16 h-16 ${theme === 'dark' ? 'text-purple-400 opacity-60' : 'text-indigo-400'}`} />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{t.readyTitle}</h3>
                    <p className={`mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{t.readyText}</p>
                     <button
                        onClick={handleProcessImage}
                        disabled={isLoading}
                        className={`w-full max-w-xs inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                      >
                       <WandIcon className="w-6 h-6 mr-3" />
                        {isLoading ? t.processing : t.removeBtn}
                      </button>
                </div>
              )}
            </div>
            
            <button
              onClick={resetState}
              className={`inline-flex items-center justify-center px-6 py-2 border font-medium rounded-full shadow-md transition-all active:scale-95 ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <ResetIcon className="w-5 h-5 mr-2" />
              {t.resetBtn}
            </button>
          </div>
        )}
      </main>
      
      <footer className={`text-center p-8 mt-12 text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
        <p>{t.footer}</p>
      </footer>
    </div>
  );
};

export default App;
