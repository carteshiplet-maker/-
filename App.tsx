import React from 'react';
import PosterGenerator from './components/PosterGenerator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-brand-50 relative overflow-x-hidden selection:bg-brand-accent selection:text-black">
      
      {/* Abstract Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-brand-accent/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-brand-800/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[0%] left-[20%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[80px]"></div>
      </div>

      <header className="relative z-10 border-b border-brand-900/50 bg-[#121212]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-accent to-brand-accent-dark rounded-md flex items-center justify-center text-black font-bold font-serif">
              G
            </div>
            <span className="font-serif text-brand-100 font-bold tracking-wide">GourmetArt</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-brand-400">
             <a href="#" className="hover:text-brand-accent transition-colors">设计画廊</a>
             <a href="#" className="hover:text-brand-accent transition-colors">打印服务</a>
             <a href="#" className="text-brand-accent">AI 创作台</a>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center">
        <PosterGenerator />
      </main>

      <footer className="relative z-10 border-t border-brand-900/50 mt-12 bg-[#0a0a0a] text-center py-8">
        <p className="text-brand-600 text-sm">
          © {new Date().getFullYear()} GourmetArt AI. Empowering Restaurants with Generative Design.
        </p>
        <p className="text-brand-700 text-xs mt-2">
          Powered by Gemini 2.5 Flash Image Model. High Definition Output.
        </p>
      </footer>
    </div>
  );
};

export default App;
