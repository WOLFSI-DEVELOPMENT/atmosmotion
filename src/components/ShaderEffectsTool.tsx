import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AtmosHeader, AtmosBadge, AtmosButton } from './AtmosToolsSDK';

const DEFAULT_TOOL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shader Effects Studio</title>
    <style>
        body { margin: 0; background-color: #ffffff; color: #111111; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; height: 100vh; display: flex; }
        
        .main-workspace { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; position: relative; background: #fafafa; }
        .canvas-container { position: relative; max-width: 90%; max-height: 70%; border: 1px solid #eeeeee; overflow: hidden; background: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        canvas { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
        
        .control-sidepanel { width: 340px; border-left: 1px solid #eeeeee; background: #ffffff; height: 100%; display: flex; flex-direction: column; overflow-y: auto; padding: 24px; box-sizing: border-box; }
        
        h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; tracking: 0.1em; color: #888888; margin: 0 0 16px 0; }
        
        .filter-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 24px; }
        .filter-btn { background: #ffffff; border: 1px solid #eeeeee; border-radius: 12px; padding: 12px; font-size: 12px; font-weight: 600; cursor: pointer; text-align: left; transition: all 0.2s; display: flex; flex-direction: column; gap: 4px; }
        .filter-btn.active { border-color: #111111; background: #fdfdfd; }
        .filter-btn span.tag { font-size: 9px; font-weight: 700; uppercase: true; tracking: 0.05em; color: #999999; }
        .filter-btn.active span.tag { color: #111111; }
        
        .param-sliders { display: flex; flex-direction: column; gap: 18px; border-top: 1px solid #eeeeee; padding-top: 24px; margin-bottom: 24px; }
        .slider-group { display: flex; flex-direction: column; gap: 8px; }
        .slider-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666666; }
        .slider-header span.val { color: #111111; font-family: monospace; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 6px; background: #f0f0f0; border-radius: 3px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #111111; cursor: pointer; }
        
        .flat-btn { background: #111111; color: #ffffff; border: none; border-radius: 20px; padding: 12px; width: 100%; font-size: 12px; font-weight: 700; text-transform: uppercase; tracking: 0.05em; cursor: pointer; transition: background 0.15s; margin-top: auto; }
        .flat-btn:hover { background: #000000; }
        
        .upload-trigger { background: #ffffff; border: 1px dashed #cccccc; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; font-size: 12px; font-weight: 600; color: #555555; }
        .upload-trigger:hover { background: #fafafa; }
        input[type="file"] { display: none; }
    </style>
</head>
<body>
    <div class="main-workspace">
        <div class="canvas-container" id="canvas-card">
            <canvas id="main-canvas"></canvas>
            <div id="upload-placeholder" class="upload-trigger" onclick="document.getElementById('file-loader').click()">
                Select Custom Image Asset to Preview Shaders
            </div>
            <input type="file" id="file-loader" accept="image/*">
        </div>
    </div>

    <div class="control-sidepanel">
        <h3>Shader Mode</h3>
        <div class="filter-grid">
            <button class="filter-btn active" onclick="setPreset('none')">
                <span class="tag">001</span>
                <span>Bypass</span>
            </button>
            <button class="filter-btn" onclick="setPreset('monochrome')">
                <span class="tag">002</span>
                <span>Grayscale</span>
            </button>
            <button class="filter-btn" onclick="setPreset('gameboy')">
                <span class="tag">003</span>
                <span>Retro Game</span>
            </button>
            <button class="filter-btn" onclick="setPreset('scanlines')">
                <span class="tag">004</span>
                <span>Scanlines</span>
            </button>
        </div>

        <div class="param-sliders">
            <div class="slider-group">
                <div class="slider-header">
                    <span>Brightness</span>
                    <span id="label-bright" class="val">100%</span>
                </div>
                <input type="range" id="slider-bright" min="50" max="150" value="100" oninput="updateSliders()">
            </div>
            <div class="slider-group">
                <div class="slider-header">
                    <span>Contrast</span>
                    <span id="label-contrast" class="val">100%</span>
                </div>
                <input type="range" id="slider-contrast" min="50" max="150" value="100" oninput="updateSliders()">
            </div>
            <div class="slider-group">
                <div class="slider-header">
                    <span>Noise Grain</span>
                    <span id="label-grain" class="val">0%</span>
                </div>
                <input type="range" id="slider-grain" min="0" max="100" value="0" oninput="updateSliders()">
            </div>
        </div>

        <button class="flat-btn" onclick="exportFrame()">Export Flat Output</button>
    </div>

    <script>
        const canvas = document.getElementById('main-canvas');
        const ctx = canvas.getContext('2d');
        let currentImage = new Image();
        let selectedPreset = 'none';

        // Load default image
        currentImage.onload = () => {
            document.getElementById('upload-placeholder').style.display = 'none';
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            applyShader();
        };
        currentImage.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80';

        document.getElementById('file-loader').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                currentImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });

        function setPreset(preset) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');
            selectedPreset = preset;
            applyShader();
        }

        function updateSliders() {
            document.getElementById('label-bright').textContent = document.getElementById('slider-bright').value + '%';
            document.getElementById('label-contrast').textContent = document.getElementById('slider-contrast').value + '%';
            document.getElementById('label-grain').textContent = document.getElementById('slider-grain').value + '%';
            applyShader();
        }

        function applyShader() {
            if (!currentImage.src) return;
            ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
            
            const bValue = parseFloat(document.getElementById('slider-bright').value) / 100;
            const cValue = parseFloat(document.getElementById('slider-contrast').value) / 100;
            const gValue = parseFloat(document.getElementById('slider-grain').value) / 100;

            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imgData.data;

            // Apply global CSS-style filters manually on canvas
            for (let i = 0; i < data.length; i += 4) {
                // Brightness
                data[i] = Math.min(255, data[i] * bValue);
                data[i+1] = Math.min(255, data[i+1] * bValue);
                data[i+2] = Math.min(255, data[i+2] * bValue);

                // Contrast
                data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * cValue + 0.5) * 255));
                data[i+1] = Math.min(255, Math.max(0, ((data[i+1] / 255 - 0.5) * cValue + 0.5) * 255));
                data[i+2] = Math.min(255, Math.max(0, ((data[i+2] / 255 - 0.5) * cValue + 0.5) * 255));

                // Presets
                if (selectedPreset === 'monochrome') {
                    let avg = 0.3 * data[i] + 0.59 * data[i+1] + 0.11 * data[i+2];
                    data[i] = avg;
                    data[i+1] = avg;
                    data[i+2] = avg;
                } else if (selectedPreset === 'gameboy') {
                    let avg = 0.3 * data[i] + 0.59 * data[i+1] + 0.11 * data[i+2];
                    // Quantize into 4 channels
                    let quantized = Math.floor(avg / 64) * 64;
                    // Tint to retro greenish
                    data[i] = quantized * 0.4;
                    data[i+1] = quantized * 0.75;
                    data[i+2] = quantized * 0.3;
                }

                // Grain Noise
                if (gValue > 0) {
                    let noise = (Math.random() - 0.5) * gValue * 128;
                    data[i] = Math.min(255, Math.max(0, data[i] + noise));
                    data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
                    data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
                }
            }

            ctx.putImageData(imgData, 0, 0);

            // Scanlines over-drawn
            if (selectedPreset === 'scanlines') {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.lineWidth = 1.5;
                for (let y = 0; y < canvas.height; y += 4) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y);
                    ctx.stroke();
                }
            }
        }

        function exportFrame() {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'atmos_shader_output.png';
            link.href = dataUrl;
            link.click();
        }
    </script>
</body>
</html>`;

export default function ShaderEffectsTool({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [htmlCode, setHtmlCode] = useState(DEFAULT_TOOL_HTML);

  useEffect(() => {
    const local = localStorage.getItem('atmos_shader_effects_code_v1');
    if (local) {
      setHtmlCode(local);
    }
  }, []);

  useEffect(() => {
    if (!htmlCode) return;
    const t = setTimeout(() => {
      localStorage.setItem('atmos_shader_effects_code_v1', htmlCode);
    }, 1000);
    return () => clearTimeout(t);
  }, [htmlCode]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden flex flex-col font-sans">
      <AtmosHeader 
        title="Shader Effects"
        subtitle="Apply post-processing algorithms on assets directly."
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
            title="Shader Effects Tool Sandbox"
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
