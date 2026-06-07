import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { AtmosHeader, AtmosBadge, AtmosButton } from './AtmosToolsSDK';

const DEFAULT_TOOL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bring Images to Life</title>
    <style>
        body { margin: 0; background-color: #ffffff; color: #111111; font-family: sans-serif; overflow: hidden; }
        .container { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; padding: 20px; text-align: center; pointer-events: none; }
        .icon { font-size: 3rem; margin-bottom: 20px; pointer-events: auto; }
        h1 { font-size: 2rem; margin-bottom: 10px; font-weight: 700; pointer-events: auto; tracking: -0.02em; color: #111111; }
        p { color: #555555; margin-bottom: 30px; font-size: 1rem; max-width: 400px; line-height: 1.5; pointer-events: auto; }
        .input-bar { pointer-events: auto; display: flex; align-items: center; background: #f5f5f5; border: 1px solid #e5e5e5; padding: 6px; border-radius: 16px; width: 100%; max-width: 600px; }
        .input-bar input[type="file"] { display: none; }
        .upload-btn { background: none; border: none; color: #666; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: 0.2s; }
        .upload-btn:hover { background: #e5e5e5; color: #111; }
        .upload-btn.has-file { color: #111; background: rgba(0, 0, 0, 0.05); }
        .divider { width: 1px; height: 20px; background: #e5e5e5; margin: 0 8px; }
        .prompt-input { flex: 1; background: transparent; border: none; color: #111111; outline: none; font-size: 13px; padding: 4px 8px; font-family: inherit; }
        .prompt-input::placeholder { color: #888888; }
        .send-btn { background: #111111; border: none; color: white; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 50% /* full circle */; transition: 0.2s; width: 32px; height: 32px; }
        .send-btn:hover { background: #000000; }
        .send-btn svg { stroke-width: 2.5; width: 18px; height: 18px; fill: none; stroke: white; }
        #canvas-container { position: absolute; inset: 0; z-index: 1; pointer-events: auto; }
        iframe { width: 100%; height: 100%; border: none; }
        #loading { display: none; margin-top: 20px; color: #111111; pointer-events: auto; font-size: 13px; background: #f5f5f5; padding: 8px 16px; border-radius: 20px; border: 1px solid #e5e5e5; }
        .bottom-mode { justify-content: flex-end; padding-bottom: 40px; }
        .hidden { display: none !important; }
        svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
    <div id="canvas-container"></div>
    <div class="container" id="ui-container">
        <div class="icon" id="ui-icon">✨</div>
        <h1 id="ui-title">Bring Images to Life</h1>
        <p id="ui-desc">Upload an image and ask Atmos to create a dynamic, living 3D environment out of it.</p>
        
        <div class="input-bar">
            <label class="upload-btn" title="Upload Image">
                <input type="file" id="file-input" accept="image/*">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </label>
            <div class="divider"></div>
            <input type="text" id="prompt-input" class="prompt-input" placeholder="Describe how to animate this image...">
            <button class="send-btn" id="send-btn" title="Generate">
                <svg viewBox="0 0 24 24"><path d="M12 18V6M7 11l5-5 5 5"></path></svg>
            </button>
        </div>
        <div id="loading">Reconstructing space in 3D...</div>
    </div>

    <script>
        let base64Image = null;
        let currentVisualHtml = null;
        
        document.getElementById('file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                base64Image = ev.target.result;
                document.querySelector('.upload-btn').classList.add('has-file');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('send-btn').addEventListener('click', async () => {
            const prompt = document.getElementById('prompt-input').value;
            if (!prompt && !base64Image && !currentVisualHtml) return;

            document.getElementById('loading').style.display = 'block';

            try {
                const res = await fetch('/api/generate-html', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, imageBase64: base64Image, previousHtml: currentVisualHtml })
                });
                
                const data = await res.json();
                if (data.html) {
                    currentVisualHtml = data.html;
                    const iframe = document.createElement('iframe');
                    iframe.sandbox = "allow-scripts allow-same-origin";
                    iframe.srcdoc = data.html;
                    document.getElementById('canvas-container').innerHTML = '';
                    document.getElementById('canvas-container').appendChild(iframe);
                    
                    const ui = document.getElementById('ui-container');
                    ui.classList.add('bottom-mode');
                    document.getElementById('ui-icon').classList.add('hidden');
                    document.getElementById('ui-title').classList.add('hidden');
                    document.getElementById('ui-desc').classList.add('hidden');
                    document.getElementById('prompt-input').placeholder = "Ask for edits...";
                    document.getElementById('prompt-input').value = "";
                }
            } catch (err) {
                console.error(err);
                alert("Generation failed. Check console.");
            } finally {
                document.getElementById('loading').style.display = 'none';
            }
        });
        
        document.getElementById('prompt-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('send-btn').click();
        });
    </script>
</body>
</html>`;

export default function BringToLifeTool({ onBack }: { onBack: () => void }) {
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
    const [htmlCode, setHtmlCode] = useState(DEFAULT_TOOL_HTML);

    useEffect(() => {
        // Fetch from API (from neon database via Express)
        fetch('/api/tools/bring-to-life-tool-code-v3')
            .then(res => res.json())
            .then(data => {
                if (data && data.code) {
                    setHtmlCode(data.code);
                } else {
                    const local = localStorage.getItem('bringToLifeToolCode_v3');
                    if (local) {
                        setHtmlCode(local);
                    }
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!htmlCode) return;
        
        const t = setTimeout(() => {
            localStorage.setItem('bringToLifeToolCode_v3', htmlCode);
            fetch('/api/tools/bring-to-life-tool-code-v3', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: htmlCode })
            }).catch(console.error);
        }, 1000);
        return () => clearTimeout(t);
    }, [htmlCode]);

    return (
        <div className="relative w-full h-full bg-white overflow-hidden flex flex-col font-sans">
            {/* Flat Header complying with SDK constraints */}
            <AtmosHeader 
                title="Bring Images To Life"
                subtitle="Upload an image and generate a dynamic 3D visual using AI."
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

            {/* Content Area */}
            <div className="flex-1 relative bg-white">
                {viewMode === 'preview' ? (
                    <iframe 
                        srcDoc={htmlCode}
                        className="absolute inset-0 w-full h-full border-none bg-white"
                        title="Bring to life tool"
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
