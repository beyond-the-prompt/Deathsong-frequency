/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
// 1. Import your local image here
import localBackground from './background.jpg'; 

// The hidden URL that can only be edited here in the code
const GENERATE_API_URL = 'https://image.pollinations.ai/prompt';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImageUrl(null); 
    setErrorInfo(null); 
    
    const targetUrl = `${GENERATE_API_URL}/${encodeURIComponent(prompt)}?width=1080&height=1920&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error(`Server returned error: ${response.status}`);
      const blob = await response.blob();
      if (blob.type.includes('text/html')) throw new Error('Received error page instead of image');
      
      const objectUrl = URL.createObjectURL(blob);
      setGeneratedImageUrl(objectUrl);
    } catch (error: any) {
      console.error('Error loading image:', error);
      setErrorInfo(error?.message?.includes('429') 
        ? "The frequency is overloaded. Please wait a moment." 
        : "We couldn't generate your vision. Please try tweaking your description.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `vision-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sharedElementStyle = {
    padding: '14px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'white',
    fontSize: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      // 2. Updated to use the imported local image
      backgroundImage: `url(${localBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'sans-serif',
      margin: 0,
      padding: '40px 20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <motion.input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your sick vulgar vision..."
            whileFocus={{ scale: 1.02, boxShadow: '0 0 0 2px rgba(255,255,255,0.5)' }}
            style={{ 
              ...sharedElementStyle,
              width: '100%',
              outline: 'none',
              color: '#1a1a1a',
              fontWeight: 500,
            }}
          />
        </motion.div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', zIndex: 5, padding: '20px 0' }}>
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              style={{ textAlign: 'center', color: 'white' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ display: 'inline-block', marginBottom: '15px' }}
              >
                <Loader2 size={48} />
              </motion.div>
              <div style={{ fontWeight: 900, letterSpacing: '0.2em', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
               IGNITING DEATHSONG FREQUENCY...
              </div>
            </motion.div>
          ) : errorInfo ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                textAlign: 'center',
                color: '#ff8a8a',
                backgroundColor: 'rgba(50,0,0,0.8)',
                padding: '30px 40px',
                borderRadius: '16px',
                border: '1px solid rgba(255,100,100,0.3)',
                maxWidth: '80%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <AlertTriangle size={48} style={{ margin: '0 auto 15px auto', color: '#ff4444' }} />
              <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '0.1em', marginBottom: '10px' }}>
                GENERATION FAILED
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.5', opacity: 0.9, maxWidth: '350px', margin: '0 auto' }}>
                {errorInfo}
              </div>
            </motion.div>
          ) : generatedImageUrl ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{ 
                maxWidth: '90%', 
                maxHeight: '60vh', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                border: '4px solid white',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }}
            >
              <img 
                src={generatedImageUrl} 
                alt="Generated Vision" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
          <motion.button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              ...sharedElementStyle,
              flex: 1,
              backgroundColor: '#1a1a1a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontWeight: 'bold',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1
            }}
          >
            <Sparkles size={18} />
            {isGenerating ? 'IGNITING...' : 'GENERATE'}
          </motion.button>

          {generatedImageUrl && (
            <motion.button 
              onClick={handleSave}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                ...sharedElementStyle,
                backgroundColor: 'white',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Download size={20} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
