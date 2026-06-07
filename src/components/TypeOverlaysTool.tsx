import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AtmosHeader, AtmosBadge, AtmosButton } from './AtmosToolsSDK';

const DEFAULT_TOOL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Type Overlays Designer</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:ital,wght@0,600;1,400&family=Space+Grotesk:wght@500;700&display=swap');
        
        body { margin: 0; background-color: #ffffff; color: #111111; font-family: 'Inter', sans-serif; overflow: hidden; height: 100vh; display: flex; }
        
        .main-workspace { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; position: relative; background: #fafafa; }
        .stage-container { position: relative; width: 640px; aspect-ratio: 16/9; border: 1px solid #eeeeee; overflow: hidden; background: #000; border-radius: 16px; select-none: none; }
        
        .stage-overlay { position: absolute; inset: 0; display: flex; box-sizing: border-box; padding: 40px; z-index: 5; pointer-events: none; transition: all 0.3s; }
        .overlay-content { pointer-events: auto; max-width: 80%; display: flex; flex-direction: column; }
        
        /* Position variations */
        .stage-overlay.pos-center { justify-content: center; align-items: center; text-align: center; }
        .stage-overlay.pos-bottom-left { justify-content: flex-start; align-items: flex-end; text-align: left; }
        .stage-overlay.pos-top-right { justify-content: flex-end; align-items: flex-start; text-align: right; }
        
        /* Font pair stylings */
        .pair-editorial h1 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 600; color: #ffffff; margin: 0 0 10px 0; line-height: 1.2; }
        .pair-editorial h2 { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; uppercase: true; tracking: 0.15em; color: rgba(255, 255, 255, 0.7); margin: 0; }
        
        .pair-swiss h1 { font-family: 'Space Grotesk', sans-serif; font-size: 38px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; line-height: 1.1; text-transform: uppercase; letter-spacing: -0.02em; }
        .pair-swiss h2 { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.8); margin: 0; }
        
        .backdrop-media { position: absolute; inset: 0; z-index: 1; opacity: 0.8; }
        .backdrop-media img { width: 100%; height: 100%; object-fit: cover; }
        
        .control-sidepanel { width: 340px; border-left: 1px solid #eeeeee; background: #ffffff; height: 100%; display: flex; flex-direction: column; overflow-y: auto; padding: 24px; box-sizing: border-box; }
        
        h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; tracking: 0.1em; color: #888888; margin: 0 0 16px 0; }
        
        .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666666; }
        input[type="text"] { background: #f5f5f5; border: 1px solid #eeeeee; border-radius: 10px; padding: 10px; font-size: 13px; color: #111111; outline: none; }
        input[type="text"]:focus { border-color: #bbbbbb; background: #ffffff; }
        
        .grid-choices { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 18px; }
        .choice-btn { background: #f9f9f9; border: 1px solid #eeeeee; border-radius: 8px; padding: 8px 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; cursor: pointer; text-align: center; }
        .choice-btn.active { background: #111111; color: #ffffff; border-color: #111111; }
        
        .flat-btn { background: #111111; color: #ffffff; border: none; border-radius: 20px; padding: 12px; width: 100%; font-size: 12px; font-weight: 700; text-transform: uppercase; tracking: 0.05em; cursor: pointer; transition: background 0.15s; margin-top: auto; }
        .flat-btn:hover { background: #000000; }
        
        .safe-margins { outline: 1px dashed rgba(255, 255, 255, 0.25); outline-offset: -30px; }
    </style>
</head>
<body>
    <div class="main-workspace">
        <div class="stage-container" id="stage-card">
            <div class="backdrop-media">
                <img id="stage-bg" src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80" alt="Overlay Backdrop">
            </div>
            <div class="stage-overlay pos-center pair-swiss" id="overlay-wrapper">
                <div class="overlay-content">
                    <h1 id="out-headline">SWISS COMPOSITION V1</h1>
                    <h2 id="out-sub">02. GRID SYSTEM SPECIFICATION</h2>
                </div>
            </div>
        </div>
    </div>

    <div class="control-sidepanel">
        <h3>Typo Overlays</h3>
        
        <div class="input-group">
            <label>Headline Text</label>
            <input type="text" id="in-headline" value="SWISS COMPOSITION V1" oninput="updateText()">
        </div>
        
        <div class="input-group">
            <label>Subtitle / Caption</label>
            <input type="text" id="in-sub" value="02. GRID SYSTEM SPECIFICATION" oninput="updateText()">
        </div>

        <div class="input-group">
            <label>Typographic Pair</label>
            <div class="grid-choices" style="grid-template-columns: repeat(2, 1fr);">
                <button class="choice-btn active" id="btn-pair-swiss" onclick="setPairing('swiss')">Swiss Mono</button>
                <button class="choice-btn" id="btn-pair-edit" onclick="setPairing('editorial')">Editorial Serif</button>
            </div>
        </div>

        <div class="input-group">
            <label>Alignment Position</label>
            <div class="grid-choices">
                <button class="choice-btn active" id="btn-pos-center" onclick="setPosition('center')">Center</button>
                <button class="choice-btn" id="btn-pos-bottom" onclick="setPosition('bottom-left')">Bottom L</button>
                <button class="choice-btn" id="btn-pos-top" onclick="setPosition('top-right')">Top R</button>
            </div>
        </div>

        <div class="input-group">
            <label>Overlay Backdrop</label>
            <div class="grid-choices">
                <button class="choice-btn active" onclick="setBg('https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80')">Muted</button>
                <button class="choice-btn" onclick="setBg('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80')">Abstract</button>
                <button class="choice-btn" onclick="setBg('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80')">Foliage</button>
            </div>
        </div>

        <div class="input-group" style="flex-direction: row; justify-content: space-between; align-items: center; margin-top: 8px;">
            <label style="cursor: pointer; display: flex; items-center: center; gap: 6px;">
                <input type="checkbox" id="chk-safe" onchange="toggleSafeGuides()" style="border-radius: 4px; border: 1px solid #eeeeee;">
                <span>Show Safe Alignment Grid</span>
            </label>
        </div>

        <button class="flat-btn" onclick="copyCssTemplate()">Copy CSS Overlays</button>
    </div>

    <script>
        function updateText() {
            document.getElementById('out-headline').textContent = document.getElementById('in-headline').value;
            document.getElementById('out-sub').textContent = document.getElementById('in-sub').value;
        }

        function setPairing(pair) {
            const wrap = document.getElementById('overlay-wrapper');
            wrap.classList.remove('pair-swiss', 'pair-editorial');
            document.getElementById('btn-pair-swiss').classList.remove('active');
            document.getElementById('btn-pair-edit').classList.remove('active');
            
            if (pair === 'swiss') {
                wrap.classList.add('pair-swiss');
                document.getElementById('btn-pair-swiss').classList.add('active');
            } else {
                wrap.classList.add('pair-editorial');
                document.getElementById('btn-pair-edit').classList.add('active');
            }
        }

        function setPosition(pos) {
            const wrap = document.getElementById('overlay-wrapper');
            wrap.classList.remove('pos-center', 'pos-bottom-left', 'pos-top-right');
            document.getElementById('btn-pos-center').classList.remove('active');
            document.getElementById('btn-pos-bottom').classList.remove('active');
            document.getElementById('btn-pos-top').classList.remove('active');

            if (pos === 'center') {
                wrap.classList.add('pos-center');
                document.getElementById('btn-pos-center').classList.add('active');
            } else if (pos === 'bottom-left') {
                wrap.classList.add('pos-bottom-left');
                document.getElementById('btn-pos-bottom').classList.add('active');
            } else {
                wrap.classList.add('pos-top-right');
                document.getElementById('btn-pos-top').classList.add('active');
            }
        }

        function setBg(url) {
            document.getElementById('stage-bg').src = url;
        }

        function toggleSafeGuides() {
            const chk = document.getElementById('chk-safe');
            const wrap = document.getElementById('overlay-wrapper');
            if (chk.checked) {
                wrap.classList.add('safe-margins');
            } else {
                wrap.classList.remove('safe-margins');
            }
        }

        function copyCssTemplate() {
            const css = "/* Typo Overlays Composition CSS Template */\n" +
            "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap');\n\n" +
            ".cinematic-title-overlay {\n" +
            "  display: flex;\n" +
            "  flex-direction: column;\n" +
            "  font-family: 'Space Grotesk', sans-serif;\n" +
            "  color: #ffffff;\n" +
            "  padding: 40px;\n" +
            "}\n" +
            ".cinematic-title-overlay h1 {\n" +
            "  font-size: 38px;\n" +
            "  font-weight: 700;\n" +
            "  text-transform: uppercase;\n" +
            "  letter-spacing: -0.02em;\n" +
            "  line-height: 1.1;\n" +
            "  margin: 0 0 8px 0;\n" +
            "}\n";
            navigator.clipboard.writeText(css);
            alert("CSS Template Copied to clipboard!");
        }
    </script>
</body>
</html>`;

export default function TypeOverlaysTool({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [htmlCode, setHtmlCode] = useState(DEFAULT_TOOL_HTML);

  useEffect(() => {
    const local = localStorage.getItem('atmos_type_overlays_code_v1');
    if (local) {
      setHtmlCode(local);
    }
  }, []);

  useEffect(() => {
    if (!htmlCode) return;
    const t = setTimeout(() => {
      localStorage.setItem('atmos_type_overlays_code_v1', htmlCode);
    }, 1000);
    return () => clearTimeout(t);
  }, [htmlCode]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden flex flex-col font-sans">
      <AtmosHeader 
        title="Type Overlays"
        subtitle="Produce Swiss-style headers and aligned captions for compositions."
        onBack={onBack}
        extra={
          <div className="flex bg-[#f5f5f5] rounded-full p-1 select-none border border-gray-100">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none border-none ${viewMode === 'preview' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none border-none ${viewMode === 'code' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
            >
              Code
            </button>
          </div>
        }
      />

      <div className="flex-1 relative bg-white">
        {viewMode === 'preview' ? (
          <iframe 
            srcDoc={htmlCode}
            className="absolute inset-0 w-full h-full border-none bg-white"
            title="Type Overlays Tool Sandbox"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="absolute inset-0 bg-[#f9f9f9] border border-gray-150">
            <Editor
              height="100%"
              defaultLanguage="html"
              theme="light"
              value={htmlCode}
              onChange={(value) => setHtmlCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
                padding: { top: 20 }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
