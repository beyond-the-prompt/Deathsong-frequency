/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, Loader2, AlertTriangle } from 'lucide-react';

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
    setGeneratedImageUrl(null); // Clear previous image
    setErrorInfo(null); // Clear previous errors
    
    // Construct the URL with the prompt appended
    // Added specific dimensions based on the requested 9:16 aspect ratio in prior intents
    const targetUrl = `${GENERATE_API_URL}/${encodeURIComponent(prompt)}?width=1080&height=1920&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    
    try {
      // Fetch the image as a blob
      const response = await fetch(targetUrl);
      
      if (!response.ok) {
        throw new Error(`Server returned error: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Check if the response is actually an image and not an HTML error page
      if (blob.type.includes('text/html')) {
        throw new Error('Received error page instead of image');
      }
      
      const objectUrl = URL.createObjectURL(blob);
      setGeneratedImageUrl(objectUrl);
      
    } catch (error: any) {
      console.error('Error loading image:', error);
      if (error?.message?.includes('429')) {
        setErrorInfo("The frequency is overloaded. Too many requests are being made right now. Please wait a moment before igniting the frequency again.");
      } else {
        setErrorInfo("We couldn't generate your vision. The signals might be crossed or the prompt was blocked. Please try tweaking your description and trying again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImageUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = generatedImageUrl; // generatedImageUrl is already a blob URL
      link.download = `vision-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error saving image:', error);
      // Fallback: open in new tab if anything fails
      window.open(generatedImageUrl, '_blank');
    }
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
      backgroundImage: 'url("https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=2000")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'sans-serif',
      margin: 0,
      padding: '40px 20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Dark Overlay for depth */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }} />

      {/* Top Header Row for Input */}
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
            placeholder="Describe your vision..."
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

      {/* Center Display Area for the Image */}
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
                IGNITING FREQUENCY...
              </div>
            </motion.div>
          ) : errorInfo ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
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

      {/* Bottom Header Row for Generate & Actions */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
          <motion.button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              ...sharedElementStyle,
              flex: generatedImageUrl ? 1 : 2,
              backgroundColor: isGenerating ? '#e5e5e5' : 'white',
              color: '#000',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: (isGenerating || !prompt.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={18} />
            {isGenerating ? 'Processing' : 'Generate'}
          </motion.button>

          {generatedImageUrl && (
            <motion.button 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={handleSave}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                ...sharedElementStyle,
                flex: 1,
                backgroundColor: '#1a1a1a',
                color: 'white',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Download size={18} />
              Save
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}


