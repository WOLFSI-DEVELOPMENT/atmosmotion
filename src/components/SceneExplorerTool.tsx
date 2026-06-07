import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AtmosHeader, AtmosBadge, AtmosButton } from './AtmosToolsSDK';

const DEFAULT_TOOL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scene Explorer</title>
    <style>
        body { margin: 0; background-color: #ffffff; color: #111111; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; }
        .canvas-bg { position: absolute; inset: 0; z-index: 1; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s; background: #fafafa; display: flex; align-items: center; justify-content: center; }
        .canvas-bg img { width: 100%; height: 100%; object-cover: cover; transition: opacity 0.5s; object-fit: cover; }
        .container { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; z-index: 10; padding: 40px 20px; pointer-events: none; }
        .top-info { text-align: center; pointer-events: auto; background: rgba(255, 255, 255, 0.95); padding: 16px 24px; border-radius: 20px; border: 1px solid #eeeeee; max-width: 440px; margin-top: 20px; transition: transform 0.3s; }
        .top-info h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 4px 0; tracking: -0.01em; }
        .top-info p { font-size: 0.8rem; color: #666666; margin: 0; line-height: 1.4; }
        
        .explorer-controls { pointer-events: auto; display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 600px; background: rgba(255, 255, 255, 0.95); border: 1px solid #eeeeee; padding: 16px; border-radius: 24px; }
        .input-bar { display: flex; align-items: center; background: #f5f5f5; border: 1px solid #e5e5e5; padding: 4px; border-radius: 16px; width: 100%; }
        .prompt-input { flex: 1; background: transparent; border: none; color: #111111; outline: none; font-size: 13px; padding: 8px 12px; font-family: inherit; }
        .prompt-input::placeholder { color: #888888; }
        .send-btn { background: #111111; border: none; color: white; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: 0.2s; width: 34px; height: 34px; shrink-0; }
        .send-btn:hover { background: #000000; }
        .send-btn svg { stroke-width: 2.5; width: 16px; height: 16px; fill: none; stroke: white; }
        
        .view-parameters { display: flex; items-center: center; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
        .param-chip { background: #ffffff; border: 1px solid #eeeeee; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; tracking: 0.05em; padding: 6px 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 4px; whitespace: nowrap; }
        .param-chip.active { background: #111111; color: #ffffff; border-color: #111111; }
        .view-gizmo { display: flex; gap: 4px; }
        .gizmo-btn { background: #ffffff; border: 1px solid #eeeeee; border-radius: 10px; padding: 6px 10px; font-family: monospace; font-size: 11px; cursor: pointer; font-weight: 700; transition: background 0.15s; }
        .gizmo-btn:hover { background: #f5f5f5; }

        #loading { display: none; background: rgba(255, 255, 255, 0.95); border: 1px solid #eeeeee; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; text-align: center; color: #111111; }
    </style>
</head>
<body>
    <div class="canvas-bg" id="scene-host">
        <img id="scene-img" src="https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&w=1600&q=80" alt="Active Scene">
    </div>

    <div class="container">
        <div class="top-info" id="scene-card">
            <h1 id="tag-title">Modern Abstract Gallery</h1>
            <p id="tag-desc">A spacious modern art gallery setting with elegant flat walls, natural concrete ceiling layers, and clean lighting.</p>
            <div id="loading">Synthesizing explore route...</div>
        </div>

        <div class="explorer-controls">
            <div class="view-parameters">
                <button class="param-chip active" onclick="setPreset('gallery', 'Modern Abstract Gallery', 'A classic minimalist modern art gallery layer with white high walls and custom modern canvas installations.', 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&w=1600&q=80', this)">Museum</button>
                <button class="param-chip" onclick="setPreset('desert', '1960s Desert Oasis', 'Midcentury modern concrete villa in Palm Springs surrounded by saguaro cactus structures and a warm twilight lighting.', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1600&q=80', this)">Desert Oasis</button>
                <button class="param-chip" onclick="setPreset('library', 'Brutalist Concrete Library', 'Soaring waffle concrete skylight roof, massive bookshelves containing pristine white layout sheets.', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80', this)">Brutalist Library</button>
                <button class="param-chip" onclick="setPreset('cyber', 'Atmos Retro Synth Hub', 'A clean layout studio workspace with monochrome grids and digital vector wireframes.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80', this)">Grid Hub</button>
            </div>

            <div style="display: flex; gap: 8px; align-items: center; width: 100%;">
                <div class="input-bar">
                    <input type="text" id="prompt-input" class="prompt-input" placeholder="Prompt a new coordinate coordinate path to explore...">
                    <button class="send-btn" id="send-btn" onclick="exploreCustomScene()">
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                </div>
                <div class="view-gizmo">
                    <button class="gizmo-btn" onclick="panScene(-15)">&larr;</button>
                    <button class="gizmo-btn" onclick="panScene(15)">&rarr;</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let panAngle = 0;

        function panScene(degrees) {
            panAngle += degrees;
            document.getElementById('scene-img').style.transform = 'scale(1.15) rotate(' + (panAngle / 10) + 'deg) translateX(' + (panAngle) + 'px)';
        }

        function setPreset(id, title, desc, imgUrl, btnElement) {
            document.querySelectorAll('.param-chip').forEach(el => el.classList.remove('active'));
            if (btnElement) btnElement.classList.add('active');
            
            document.getElementById('tag-title').textContent = title;
            document.getElementById('tag-desc').textContent = desc;
            document.getElementById('scene-img').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('scene-img').src = imgUrl;
                document.getElementById('scene-img').style.opacity = '1';
                panAngle = 0;
                document.getElementById('scene-img').style.transform = 'scale(1.1)';
            }, 300);
        }

        async function exploreCustomScene() {
            const prompt = document.getElementById('prompt-input').value;
            if (!prompt.trim()) return;

            document.getElementById('loading').style.display = 'block';
            document.getElementById('tag-desc').style.display = 'none';

            try {
                const res = await fetch('/api/pixazo/image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt + " highly stylized minimalist aesthetic wide landscape" })
                });
                const data = await res.json();
                if (data.imageUrl) {
                    setPreset('custom', prompt.slice(0, 30) + '...', prompt, data.imageUrl, null);
                    document.getElementById('prompt-input').value = '';
                }
            } catch (err) {
                console.error(err);
                alert("Exploration synthesis failed. Try another prompt.");
            } finally {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('tag-desc').style.display = 'block';
            }
        }

        document.getElementById('prompt-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') exploreCustomScene();
        });
    </script>
</body>
</html>`;

export default function SceneExplorerTool({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [htmlCode, setHtmlCode] = useState(DEFAULT_TOOL_HTML);

  useEffect(() => {
    const local = localStorage.getItem('atmos_scene_explorer_code_v1');
    if (local) {
      setHtmlCode(local);
    }
  }, []);

  useEffect(() => {
    if (!htmlCode) return;
    const t = setTimeout(() => {
      localStorage.setItem('atmos_scene_explorer_code_v1', htmlCode);
    }, 1000);
    return () => clearTimeout(t);
  }, [htmlCode]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden flex flex-col font-sans">
      <AtmosHeader 
        title="Scene Explorer"
        subtitle="Venture and discover visual layers matching spatial guidelines."
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
            title="Scene Explorer Tool Sandbox"
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
