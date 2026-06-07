import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AtmosHeader, AtmosBadge, AtmosButton } from './AtmosToolsSDK';

const DEFAULT_TOOL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>pixelBento Studio</title>
    <style>
        body { margin: 0; background-color: #ffffff; color: #111111; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; height: 100vh; display: flex; }
        
        .main-workspace { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; position: relative; background: #fafafa; }
        .bento-container { width: 620px; height: 380px; border: 1px solid #eeeeee; overflow: hidden; background: #ffffff; padding: 20px; box-sizing: border-box; display: grid; transition: all 0.3s; }
        
        /* Bento Grid Presets */
        .bento-grid-preset { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); }
        .golden-preset { grid-template-columns: 2fr 1fr; grid-template-rows: 1fr; }
        .columns-preset { grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr; }
        
        .bento-item { background: #f5f5f5; border: 1px solid #e5e5e5; display: flex; flex-direction: column; justify-content: flex-end; padding: 18px; box-sizing: border-box; transition: all 0.25s; cursor: pointer; background-size: cover; background-position: center; position: relative; overflow: hidden; }
        .bento-item:hover { background-color: #eeeeee; }
        .bento-item span.lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; tracking: 0.1em; color: #111111; z-index: 2; background: #ffffff; padding: 4px 8px; border-radius: 6px; width: fit-content; border: 1px solid #eeeeee; }
        
        .control-sidepanel { width: 340px; border-left: 1px solid #eeeeee; background: #ffffff; height: 100%; display: flex; flex-direction: column; overflow-y: auto; padding: 24px; box-sizing: border-box; }
        
        h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; tracking: 0.1em; color: #888888; margin: 0 0 16px 0; }
        
        .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666666; }
        
        .grid-choices { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 20px; }
        .choice-btn { background: #f9f9f9; border: 1px solid #eeeeee; border-radius: 8px; padding: 10px 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; cursor: pointer; text-align: center; }
        .choice-btn.active { background: #111111; color: #ffffff; border-color: #111111; }
        
        .slider-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .slider-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666666; }
        .slider-header span.val { color: #111111; font-family: monospace; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 6px; background: #f0f0f0; border-radius: 3px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #111111; cursor: pointer; }
        
        .flat-btn { background: #111111; color: #ffffff; border: none; border-radius: 20px; padding: 12px; width: 100%; font-size: 12px; font-weight: 700; text-transform: uppercase; tracking: 0.05em; cursor: pointer; transition: background 0.15s; margin-top: auto; }
        .flat-btn:hover { background: #000000; }
    </style>
</head>
<body>
    <div class="main-workspace">
        <div class="bento-container bento-grid-preset" id="bento-wrapper" style="gap: 12px; border-radius: 16px;">
            <div class="bento-item" id="item1" style="grid-column: span 2; grid-row: span 1; background-image: url('https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=80'); border-radius: 12px;" onclick="swapImage(this)">
                <span class="lbl">Item #1 (Wide)</span>
            </div>
            <div class="bento-item" id="item2" style="grid-column: span 1; grid-row: span 2; background-image: url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80'); border-radius: 12px;" onclick="swapImage(this)">
                <span class="lbl">Item #2 (Tall)</span>
            </div>
            <div class="bento-item" id="item3" style="grid-column: span 1; grid-row: span 1; background-image: url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80'); border-radius: 12px;" onclick="swapImage(this)">
                <span class="lbl">Item #3 (Box)</span>
            </div>
            <div class="bento-item" id="item4" style="grid-column: span 1; grid-row: span 1; background-image: url('https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80'); border-radius: 12px;" onclick="swapImage(this)">
                <span class="lbl">Item #4 (Box)</span>
            </div>
        </div>
    </div>

    <div class="control-sidepanel">
        <h3>Grid Format</h3>
        <div class="grid-choices">
            <button class="choice-btn active" id="btn-bento" onclick="setPresetGrid('bento')">Bento</button>
            <button class="choice-btn" id="btn-columns" onclick="setPresetGrid('columns')">Columns</button>
            <button class="choice-btn" id="btn-golden" onclick="setPresetGrid('golden')">Golden</button>
        </div>

        <div class="slider-group">
            <div class="slider-header">
                <span>Cell Gaps</span>
                <span id="label-gap" class="val">12px</span>
            </div>
            <input type="range" id="slider-gap" min="0" max="32" value="12" oninput="updateLayoutStyles()">
        </div>

        <div class="slider-group">
            <div class="slider-header">
                <span>Border Radius</span>
                <span id="label-radius" class="val">12px</span>
            </div>
            <input type="range" id="slider-radius" min="0" max="32" value="12" oninput="updateLayoutStyles()">
        </div>

        <div class="slider-group">
            <div class="slider-header">
                <span>Frame Margin</span>
                <span id="label-margin" class="val">20px</span>
            </div>
            <input type="range" id="slider-margin" min="0" max="40" value="20" oninput="updateLayoutStyles()">
        </div>

        <button class="flat-btn" onclick="copyCSSGrid()">Copy CSS Grid Layout</button>
    </div>

    <script>
        const sampleImages = [
            'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'
        ];
        let imageCounter = 0;

        function swapImage(element) {
            imageCounter = (imageCounter + 1) % sampleImages.length;
            element.style.backgroundImage = 'url("' + sampleImages[imageCounter] + '")';
        }

        function setPresetGrid(preset) {
            const wrap = document.getElementById('bento-wrapper');
            wrap.classList.remove('bento-grid-preset', 'golden-preset', 'columns-preset');
            document.getElementById('btn-bento').classList.remove('active');
            document.getElementById('btn-columns').classList.remove('active');
            document.getElementById('btn-golden').classList.remove('active');

            const item1 = document.getElementById('item1');
            const item2 = document.getElementById('item2');
            const item3 = document.getElementById('item3');
            const item4 = document.getElementById('item4');

            if (preset === 'bento') {
                wrap.classList.add('bento-grid-preset');
                document.getElementById('btn-bento').classList.add('active');
                
                item1.style.display = 'flex';
                item1.style.gridColumn = 'span 2';
                item1.style.gridRow = 'span 1';
                
                item2.style.display = 'flex';
                item2.style.gridColumn = 'span 1';
                item2.style.gridRow = 'span 2';

                item3.style.display = 'flex';
                item4.style.display = 'flex';
            } else if (preset === 'columns') {
                wrap.classList.add('columns-preset');
                document.getElementById('btn-columns').classList.add('active');
                
                item1.style.gridColumn = 'span 1';
                item1.style.gridRow = 'span 1';
                item2.style.gridColumn = 'span 1';
                item2.style.gridRow = 'span 1';
                item3.style.gridColumn = 'span 1';
                item3.style.gridRow = 'span 1';
                
                item1.style.display = 'flex';
                item2.style.display = 'flex';
                item3.style.display = 'flex';
                item4.style.display = 'none';
            } else {
                wrap.classList.add('golden-preset');
                document.getElementById('btn-golden').classList.add('active');
                
                item1.style.gridColumn = 'span 1';
                item1.style.gridRow = 'span 1';
                item2.style.gridColumn = 'span 1';
                item2.style.gridRow = 'span 1';
                
                item1.style.display = 'flex';
                item2.style.display = 'flex';
                item3.style.display = 'none';
                item4.style.display = 'none';
            }
        }

        function updateLayoutStyles() {
            const gap = document.getElementById('slider-gap').value;
            const radius = document.getElementById('slider-radius').value;
            const margin = document.getElementById('slider-margin').value;

            document.getElementById('label-gap').textContent = gap + 'px';
            document.getElementById('label-radius').textContent = radius + 'px';
            document.getElementById('label-margin').textContent = margin + 'px';

            const wrap = document.getElementById('bento-wrapper');
            wrap.style.gap = gap + 'px';
            wrap.style.padding = margin + 'px';

            document.querySelectorAll('.bento-item').forEach(item => {
                item.style.borderRadius = radius + 'px';
            });
        }

        function copyCSSGrid() {
            const gap = document.getElementById('slider-gap').value;
            const margin = document.getElementById('slider-margin').value;
            const radius = document.getElementById('slider-radius').value;

            const gridCss = "/* pixelBento CSS grid config */\n" +
            ".bento-grid-container {\n" +
            "  display: grid;\n" +
            "  grid-template-columns: repeat(3, 1fr);\n" +
            "  grid-template-rows: repeat(2, 1fr);\n" +
            "  gap: " + gap + "px;\n" +
            "  padding: " + margin + "px;\n" +
            "}\n" +
            ".bento-grid-item {\n" +
            "  border-radius: " + radius + "px;\n" +
            "  border: 1px solid #eeeeee;\n" +
            "  overflow: hidden;\n" +
            "}\n";
            navigator.clipboard.writeText(gridCss);
            alert("CSS Layout Grid Config copied!");
        }
    </script>
</body>
</html>`;

export default function PixelBentoTool({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [htmlCode, setHtmlCode] = useState(DEFAULT_TOOL_HTML);

  useEffect(() => {
    const local = localStorage.getItem('atmos_pixel_bento_code_v1');
    if (local) {
      setHtmlCode(local);
    }
  }, []);

  useEffect(() => {
    if (!htmlCode) return;
    const t = setTimeout(() => {
      localStorage.setItem('atmos_pixel_bento_code_v1', htmlCode);
    }, 1000);
    return () => clearTimeout(t);
  }, [htmlCode]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden flex flex-col font-sans">
      <AtmosHeader 
        title="pixelBento"
        subtitle="Forge modular and geometric post-processing bento arrangement layouts."
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
            title="pixelBento Tool Sandbox"
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
