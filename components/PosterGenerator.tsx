import React, { useState, useRef } from 'react';
import { PosterMode, ArtStyle, PosterRequest, CompositionType, LightingType } from '../types';
import { STYLE_OPTIONS, COMPOSITION_OPTIONS, LIGHTING_OPTIONS } from '../constants';
import { generatePoster, blobToBase64, analyzeBrandManual } from '../services/geminiService';
import { 
  Download, Upload, Wand2, RefreshCw, X, Image as ImageIcon, 
  LayoutTemplate, Palette, Zap, SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, FileText, Loader2
} from 'lucide-react';

const PosterGenerator: React.FC = () => {
  const [mode, setMode] = useState<PosterMode>(PosterMode.VIBE);
  
  // Basic Info
  const [restaurantName, setRestaurantName] = useState('');
  const [brandStory, setBrandStory] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [description, setDescription] = useState('');
  
  // Design Settings
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.NEO_CHINESE_CHIC);
  
  // Pro Settings
  const [showProSettings, setShowProSettings] = useState(false);
  const [composition, setComposition] = useState<CompositionType>(CompositionType.MINIMAL_CENTER);
  const [lighting, setLighting] = useState<LightingType>(LightingType.NATURAL_SOFT);
  const [creativityLevel, setCreativityLevel] = useState<number>(50); // 0-100

  // Images & PDF
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  
  // State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      if (uploadedImages.length + files.length > 5) {
        setError("为了保证最佳效果，建议最多上传 5 张参考图");
        return;
      }
      try {
        const newBase64s = await Promise.all(files.map(blobToBase64));
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setUploadedImages(prev => [...prev, ...newBase64s]);
        setPreviewUrls(prev => [...prev, ...newPreviews]);
        setError(null);
      } catch (err) {
        setError("图片读取失败");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError("请上传 PDF 格式的文件");
        return;
      }

      setIsAnalyzingPdf(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const base64 = await blobToBase64(file);
        const result = await analyzeBrandManual(base64);
        
        // Auto-fill context
        if (result.restaurantName) setRestaurantName(result.restaurantName);
        if (result.brandStory) setBrandStory(result.brandStory);
        if (result.targetAudience) setTargetAudience(result.targetAudience);
        if (result.visualStyle) setDescription(prev => prev + (prev ? '\n' : '') + `[品牌视觉提取]: ${result.visualStyle}`);

        setSuccessMsg("品牌手册分析完成：已自动提取品牌 DNA");
      } catch (err: any) {
        setError(err.message || "PDF 分析失败");
      } finally {
        setIsAnalyzingPdf(false);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!restaurantName) {
      setError("请输入品牌名称以开始设计");
      return;
    }
    if (mode === PosterMode.DISH && uploadedImages.length === 0) {
      setError("菜品创意模式需要至少一张产品图片");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const request: PosterRequest = {
        restaurantName,
        brandStory,
        targetAudience,
        description,
        style,
        mode,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        composition,
        lighting,
        creativityLevel
      };

      const resultUrl = await generatePoster(request);
      setGeneratedImage(resultUrl);
    } catch (err: any) {
      setError(err.message || "设计生成中断，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `GourmetArt_${restaurantName}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
      
      {/* LEFT PANEL: DESIGN STUDIO */}
      <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 p-6 lg:p-8 flex flex-col gap-6 bg-brand-950/80 backdrop-blur-md border-r border-white/5 overflow-y-auto h-auto lg:h-[calc(100vh-80px)] custom-scrollbar">
        
        {/* Header */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-white font-serif text-2xl tracking-wide flex items-center gap-2">
            Design Studio <span className="text-[10px] bg-brand-accent text-black px-1.5 py-0.5 rounded font-sans font-bold tracking-normal uppercase">Pro</span>
          </h2>
          <p className="text-brand-500 text-xs mt-1 font-light">
            AI 驱动的高级餐饮视觉解决方案
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-black/40 p-1.5 rounded-xl flex border border-white/10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setMode(PosterMode.VIBE)}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              mode === PosterMode.VIBE
                ? 'bg-brand-800 text-brand-accent shadow-lg shadow-black/50 border border-white/5'
                : 'text-brand-600 hover:text-brand-400'
            }`}
          >
            <LayoutTemplate size={16} />
            <span className="font-medium text-sm">品牌氛围</span>
          </button>
          <button
            onClick={() => setMode(PosterMode.DISH)}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              mode === PosterMode.DISH
                ? 'bg-brand-800 text-brand-accent shadow-lg shadow-black/50 border border-white/5'
                : 'text-brand-600 hover:text-brand-400'
            }`}
          >
            <ImageIcon size={16} />
            <span className="font-medium text-sm">菜品合成</span>
          </button>
        </div>

        {/* PDF Upload (Brand DNA) */}
        <div className="animate-slide-up bg-brand-accent/5 border border-brand-accent/20 rounded-xl p-4" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} /> 品牌手册 DNA 提取 (Brand Manual)
            </label>
            {isAnalyzingPdf && <Loader2 size={14} className="animate-spin text-brand-accent" />}
          </div>
          
          <div 
            onClick={() => !isAnalyzingPdf && pdfInputRef.current?.click()}
            className={`
              border border-dashed border-brand-accent/30 rounded-lg p-3 cursor-pointer 
              hover:bg-brand-accent/10 transition-colors flex items-center justify-center gap-3 text-brand-300
              ${isAnalyzingPdf ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
             {isAnalyzingPdf ? (
               <span className="text-xs">正在分析 PDF 提取品牌调性...</span>
             ) : (
               <>
                 <Upload size={16} />
                 <span className="text-xs font-medium">上传 PDF 宣传册 (自动识别品牌调性)</span>
               </>
             )}
          </div>
          <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" disabled={isAnalyzingPdf} />
        </div>

        {/* Main Inputs */}
        <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider">品牌名称 (Brand Name)</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="请输入餐厅名称"
              className="w-full glass-input text-white text-lg px-4 py-3 rounded-xl outline-none transition-all placeholder:text-brand-700 font-serif"
            />
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold text-brand-500 uppercase tracking-wider">品牌故事 & 背景 (Context)</label>
             <textarea
                value={brandStory}
                onChange={(e) => setBrandStory(e.target.value)}
                placeholder="在此粘贴品牌故事、菜单介绍或宣传册文案。AI 将提取关键信息..."
                rows={3}
                className="w-full glass-input text-brand-100 text-sm px-4 py-3 rounded-xl outline-none transition-all resize-none placeholder:text-brand-700"
              />
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>

        {/* Global Image Upload */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-3 flex justify-between">
            <span>视觉素材 (Visual Assets)</span>
            <span className="text-[10px] font-normal text-brand-600">{uploadedImages.length}/5</span>
          </label>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
             {previewUrls.map((url, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-square">
                  <img src={url} alt="asset" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <X className="text-white" size={16} />
                  </button>
                </div>
             ))}
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all group"
             >
                <Upload size={20} className="text-brand-600 group-hover:text-brand-accent mb-1 transition-colors" />
                <span className="text-[10px] text-brand-600 uppercase">上传图片</span>
             </div>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
          <p className="text-[10px] text-brand-600">
             支持上传：环境照片、实体菜单扫描件、菜品原图。
          </p>
        </div>

        {/* Style Selection */}
        <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
           <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-3 block">艺术风格 (Art Direction)</label>
           <div className="grid grid-cols-2 gap-2">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStyle(opt.value)}
                  className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden group ${
                    style === opt.value
                      ? 'border-brand-accent/50 bg-brand-accent/10'
                      : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-0.5 h-full transition-all ${style === opt.value ? 'bg-brand-accent' : 'bg-transparent'}`}></div>
                  <div className={`font-medium text-xs mb-1 ${style === opt.value ? 'text-brand-accent' : 'text-brand-300'}`}>{opt.label}</div>
                  <div className="text-[10px] text-brand-600 line-clamp-1">{opt.description}</div>
                </button>
              ))}
           </div>
        </div>

        {/* PRO SETTINGS ACCORDION */}
        <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
           <button 
             onClick={() => setShowProSettings(!showProSettings)}
             className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
           >
              <div className="flex items-center gap-2 text-brand-300 text-sm font-medium">
                 <SlidersHorizontal size={16} className="text-brand-accent" />
                 <span>高级设计参数 (Pro Controls)</span>
              </div>
              {showProSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
           </button>

           <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showProSettings ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-5 pl-1">
                 
                 {/* Composition */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1">
                       <LayoutTemplate size={12} /> 构图方式 (Composition)
                    </label>
                    <div className="flex flex-wrap gap-2">
                       {COMPOSITION_OPTIONS.map((opt) => (
                          <button
                             key={opt.value}
                             onClick={() => setComposition(opt.value)}
                             className={`text-[10px] px-3 py-1.5 rounded-full border transition-all ${
                               composition === opt.value
                                  ? 'bg-brand-200 text-black border-brand-200 font-bold'
                                  : 'border-white/10 text-brand-500 hover:border-brand-500'
                             }`}
                          >
                             {opt.label}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Lighting */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1">
                       <Zap size={12} /> 灯光氛围 (Lighting)
                    </label>
                    <select 
                       value={lighting}
                       onChange={(e) => setLighting(e.target.value as LightingType)}
                       className="w-full bg-black/40 border border-white/10 text-brand-300 text-xs rounded-lg p-2.5 outline-none focus:border-brand-accent"
                    >
                       {LIGHTING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                 </div>

                 {/* Creativity Slider */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs text-brand-500">
                       <span className="flex items-center gap-1"><Palette size={12}/> 创意自由度 (Freedom)</span>
                       <span>{creativityLevel}%</span>
                    </div>
                    <input 
                       type="range" 
                       min="0" 
                       max="100" 
                       value={creativityLevel} 
                       onChange={(e) => setCreativityLevel(Number(e.target.value))}
                       className="w-full h-1 bg-brand-800 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                    />
                    <div className="flex justify-between text-[10px] text-brand-700">
                       <span>严谨 (Strict)</span>
                       <span>平衡 (Balanced)</span>
                       <span>放飞 (Wild)</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg text-xs animate-fade-in">
              {error}
            </div>
        )}

        {successMsg && (
            <div className="bg-green-900/20 border border-green-900/50 text-green-400 px-4 py-3 rounded-lg text-xs animate-fade-in flex items-center gap-2">
               <Sparkles size={14} /> {successMsg}
            </div>
        )}

      </div>

      {/* RIGHT PANEL: GALLERY & PREVIEW */}
      <div className="flex-1 bg-[#0a0a0a] relative flex flex-col">
         {/* Top Bar */}
         <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/90 backdrop-blur-sm z-20 sticky top-0">
            <div className="text-brand-600 text-xs tracking-widest uppercase">
               工作空间 / {mode === PosterMode.VIBE ? '品牌视觉效果' : '菜品创意合成'}
            </div>
            <div className="flex gap-4">
               {generatedImage && (
                  <button 
                     onClick={handleDownload}
                     className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors text-sm"
                  >
                     <Download size={16} /> 导出高清海报 (导出)
                  </button>
               )}
            </div>
         </div>

         {/* Canvas Area */}
         <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[150px] pointer-events-none"></div>

            {generatedImage ? (
               <div className="relative z-10 animate-fade-in group">
                  <div className="relative shadow-2xl shadow-black">
                     <img 
                        src={generatedImage} 
                        alt="Design Result" 
                        className="max-h-[75vh] w-auto object-contain rounded-sm ring-1 ring-white/10"
                     />
                     <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none rounded-sm"></div>
                  </div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-brand-600 text-[10px] tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                     GENERATED BY GOURMET ART PRO
                  </div>
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center text-center max-w-lg relative z-10 opacity-60">
                  {isLoading ? (
                     <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-8">
                           <div className="absolute inset-0 border-t-2 border-brand-accent rounded-full animate-spin"></div>
                           <div className="absolute inset-2 border-r-2 border-brand-500 rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
                           <div className="absolute inset-4 border-b-2 border-brand-800 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
                        </div>
                        <h3 className="text-xl font-serif text-brand-200 mb-2 tracking-wide">正在渲染设计...</h3>
                        <p className="text-brand-500 text-sm font-light">
                           应用风格：{style} <br/>
                           正在优化构图与光影...
                        </p>
                     </div>
                  ) : (
                     <div className="animate-float">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-brand-900 to-black border border-white/5 flex items-center justify-center shadow-2xl shadow-brand-accent/5">
                           <Sparkles className="text-brand-700" size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-brand-200 mb-3">准备就绪</h3>
                        <p className="text-brand-500 text-sm leading-relaxed max-w-xs mx-auto">
                           请在左侧上传 PDF 品牌手册或配置参数，AI 将为您生成顶级商业海报。
                        </p>
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* Floating Big Button */}
         <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-md px-4">
             <button
               onClick={handleGenerate}
               disabled={isLoading || isAnalyzingPdf}
               className={`
                  w-full group relative overflow-hidden rounded-full py-4 px-8 
                  transition-all duration-300 transform hover:scale-105
                  ${(isLoading || isAnalyzingPdf) ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                  shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)]
                  hover:shadow-[0_0_60px_-10px_rgba(234,179,8,0.5)]
               `}
             >
                {/* Button Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDE047] via-[#EAB308] to-[#A16207]"></div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-shimmer"></div>

                {/* Content */}
                <div className="relative flex items-center justify-center gap-3 text-black font-bold text-lg tracking-wide uppercase">
                   {generatedImage ? <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} /> : <Wand2 size={20} />}
                   <span>{generatedImage ? "再生设计 (再生)" : "生成海报 (生成)"}</span>
                </div>
             </button>
         </div>

      </div>
    </div>
  );
};

export default PosterGenerator;
