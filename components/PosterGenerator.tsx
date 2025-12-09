import React, { useState, useRef } from 'react';
import { PosterMode, ArtStyle, PosterRequest } from '../types';
import { STYLE_OPTIONS } from '../constants';
import { generatePoster, blobToBase64 } from '../services/geminiService';
import { Download, Upload, Wand2, RefreshCw, X, Image as ImageIcon, LayoutTemplate, Sparkles, Users, Store, Type, FileText } from 'lucide-react';

const PosterGenerator: React.FC = () => {
  const [mode, setMode] = useState<PosterMode>(PosterMode.VIBE);
  
  // Form State
  const [restaurantName, setRestaurantName] = useState('');
  const [brandStory, setBrandStory] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.NEO_CHINESE_CHIC);
  
  // Image State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      
      if (uploadedImages.length + files.length > 4) {
        setError("最多只能上传 4 张图片");
        return;
      }

      try {
        const newBase64s = await Promise.all(files.map(blobToBase64));
        const newPreviews = files.map(file => URL.createObjectURL(file));
        
        setUploadedImages(prev => [...prev, ...newBase64s]);
        setPreviewUrls(prev => [...prev, ...newPreviews]);
        setError(null);
      } catch (err) {
        setError("无法读取图片，请重试");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!restaurantName) {
      setError("请输入餐厅名称");
      return;
    }
    if (mode === PosterMode.DISH && uploadedImages.length === 0) {
      setError("菜品模式下，请至少上传一张菜品图片");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const request: PosterRequest = {
        restaurantName,
        brandStory,
        targetAudience,
        description,
        style,
        mode,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      };

      const resultUrl = await generatePoster(request);
      setGeneratedImage(resultUrl);
    } catch (err: any) {
      setError(err.message || "生成失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${restaurantName}_poster_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto p-4 lg:p-8">
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 animate-fade-in">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-wide">
            GourmetArt <span className="text-brand-accent">AI</span>
          </h1>
          <p className="text-brand-400 text-sm">智能餐饮海报设计 - 潮流 • 艺术 • 高清</p>
        </div>

        {/* Mode Selector */}
        <div className="bg-brand-900/50 p-1 rounded-xl flex border border-brand-800">
          <button
            onClick={() => setMode(PosterMode.VIBE)}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              mode === PosterMode.VIBE
                ? 'bg-brand-800 text-white shadow-lg'
                : 'text-brand-500 hover:text-brand-300'
            }`}
          >
            <LayoutTemplate size={18} />
            <span className="font-medium">品牌氛围海报</span>
          </button>
          <button
            onClick={() => setMode(PosterMode.DISH)}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              mode === PosterMode.DISH
                ? 'bg-brand-800 text-white shadow-lg'
                : 'text-brand-500 hover:text-brand-300'
            }`}
          >
            <ImageIcon size={18} />
            <span className="font-medium">菜品创意合成</span>
          </button>
        </div>

        {/* Form Inputs */}
        <div className="bg-brand-900/40 backdrop-blur-sm p-6 rounded-2xl border border-brand-800/50 flex flex-col gap-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-brand-300 text-sm font-medium mb-2">
                <Store size={14} /> 餐厅名称 <span className="text-brand-500 text-xs ml-auto font-normal bg-brand-800/50 px-2 py-0.5 rounded text-brand-accent">已增强中文识别</span>
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="例如：兮禾酒馆"
                className="w-full bg-brand-900 border border-brand-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-brand-300 text-sm font-medium mb-2">
                <FileText size={14} /> 品牌理念 / 宣传文案
              </label>
              <textarea
                value={brandStory}
                onChange={(e) => setBrandStory(e.target.value)}
                placeholder="请粘贴您的品牌故事、宣传册文案或PDF中的文字内容。描述越详细（如：经营理念、历史渊源、装修灵感），AI 越能捕捉‘高级感’..."
                rows={4}
                className="w-full bg-brand-900 border border-brand-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-brand-300 text-sm font-medium mb-2">
                <Users size={14} /> 目标客户群体
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="例如：追求品质的中产阶级，文艺青年"
                className="w-full bg-brand-900 border border-brand-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="h-px bg-brand-800/50 my-2"></div>

          {/* Global Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-brand-300 text-sm font-medium mb-2">
               <Upload size={14} />
               {mode === PosterMode.VIBE ? "上传品牌视觉参考 (环境/菜单/宣传册)" : "上传菜品原图"}
               <span className="text-xs text-brand-500 font-normal ml-auto">
                 {mode === PosterMode.VIBE ? "AI将模仿这些图片的质感与配色" : "作为海报主体"}
               </span>
            </label>
            
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-brand-700 aspect-video">
                    <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div 
              className="border-2 border-dashed border-brand-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500 hover:bg-brand-800/30 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="text-brand-500 mb-2 group-hover:text-brand-300" size={24} />
              <p className="text-brand-400 text-xs">
                 {mode === PosterMode.VIBE ? "点击上传宣传册截图/环境图/参考图" : "点击上传高清菜品图"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Style & Specifics */}
          <div>
            <label className="block text-brand-300 text-sm font-medium mb-3">艺术风格</label>
            <div className="grid grid-cols-1 gap-3">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStyle(opt.value)}
                  className={`flex items-center p-3 rounded-xl border text-left transition-all ${
                    style === opt.value
                      ? 'border-brand-accent bg-gradient-to-r from-brand-accent/20 to-transparent text-white shadow-md'
                      : 'border-brand-800 text-brand-400 hover:border-brand-600 hover:bg-brand-800/30'
                  }`}
                >
                  <div className={`w-2 h-full mr-3 rounded-full ${style === opt.value ? 'bg-brand-accent' : 'bg-transparent'}`}></div>
                  <div>
                    <div className={`font-bold text-sm ${style === opt.value ? 'text-brand-accent-light' : 'text-brand-300'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-brand-500 mt-1 line-clamp-1">{opt.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-brand-300 text-sm font-medium mb-2">
               {mode === PosterMode.VIBE ? "画面细节描述 (补充)" : "菜品创意要求 (补充)"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={mode === PosterMode.VIBE ? "例如：需要一种静谧的氛围，灯光昏暗，有烟火气..." : "例如：让菜品周围有云雾缭绕，背景是深山..."}
              rows={2}
              className="w-full bg-brand-900 border border-brand-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div className="sticky bottom-0 bg-brand-900/80 backdrop-blur-sm pt-4 pb-2 -mx-2 px-2 border-t border-brand-800/50">
             <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${
                isLoading
                  ? 'bg-brand-800 cursor-not-allowed text-brand-500'
                  : 'bg-gradient-to-r from-brand-accent to-brand-accent-dark text-black hover:scale-[1.02] hover:shadow-brand-accent/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" /> 正在创作中...
                </>
              ) : (
                generatedImage ? (
                  <>
                    <RefreshCw size={20} /> 不满意？重新生成
                  </>
                ) : (
                  <>
                    <Wand2 size={20} /> 立即生成海报
                  </>
                )
              )}
            </button>
            <p className="text-center text-brand-600 text-[10px] mt-2">
              AI将结合您提供的所有文案与图片线索进行创作
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1 bg-black/40 border border-brand-800 rounded-2xl p-4 lg:p-8 flex items-center justify-center min-h-[500px] lg:min-h-[700px] relative overflow-hidden backdrop-blur-md">
          
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: 'radial-gradient(#5e5a56 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          {generatedImage ? (
            <div className="relative z-10 w-full h-full flex flex-col items-center animate-fade-in">
              <div className="relative group shadow-2xl shadow-black/50">
                <img 
                  src={generatedImage} 
                  alt="Generated Poster" 
                  className="max-h-[75vh] w-auto object-contain rounded-lg border-[8px] border-white/10"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                   <button 
                    onClick={handleDownload}
                    className="bg-brand-accent hover:bg-white text-black font-bold py-2 px-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                    title="下载海报"
                   >
                     <Download size={18} /> 下载高清图
                   </button>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-brand-400 text-sm font-light tracking-widest uppercase">
                  Gourmet Art AI • {style}
                </p>
                <div className="flex gap-4 text-xs text-brand-600">
                   <span>3:4 打印比例</span>
                   <span>•</span>
                   <span>AI 创意合成</span>
                   <span>•</span>
                   <span>8K 分辨率</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center z-10 opacity-50">
               {isLoading ? (
                 <div className="flex flex-col items-center">
                   <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-6"></div>
                   <p className="text-xl text-brand-200 font-light">AI 正在阅读您的品牌线索...</p>
                   <p className="text-sm text-brand-500 mt-2">正在分析视觉参考、品牌故事与菜品特性...</p>
                 </div>
               ) : (
                 <div className="flex flex-col items-center max-w-md">
                   <div className="w-24 h-24 bg-brand-800/50 rounded-full flex items-center justify-center mb-6 text-brand-600">
                     <LayoutTemplate size={48} />
                   </div>
                   <h3 className="text-2xl font-serif text-brand-200 mb-2">等待创作</h3>
                   <p className="text-brand-500 leading-relaxed">
                     建议上传 <strong>宣传册截图</strong> 或 <strong>环境照片</strong>。<br/>
                     AI 将综合分析您的品牌故事与视觉素材，<br/>
                     生成极具"高级感"的艺术海报。
                   </p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosterGenerator;