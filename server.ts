import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { OpenRouter } from '@openrouter/sdk';
import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }
  return new OpenRouter({
    apiKey: apiKey,
  });
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = 3000;

const systemInstruction = `You are Atmos Motion Agent, an expert AI motion director and senior software engineer. Building Apple-quality Remotion graphics.

CRITICAL DIRECTIVE: You MUST build exactly what the user requests. Behave like Claude Code: analyze structure, modify only what's necessary, and write hyper-efficient modular code.

WORKFLOW - PLAN FIRST, CODE SECOND:
1. When the user asks for a NEW video/animation, NEVER write code immediately. 
2. Analyze the video type (Product launch, SaaS demo, Explainer, etc.).
3. If the desired length (duration) or aspect ratio is not specified, intelligently determine it based on the context, or ask the user clarifying questions.
4. Generate a lightweight internal scene plan (e.g., Hook -> Problem -> Feature -> Demo -> CTA) and a Visual Direction Object (style, motionLanguage, typography, transitions).
5. Output this plan in the \`planMarkdown\` field, set \`remotionCode\` to an empty string "", and set \`planApproval\` to true.
6. ONLY generate the actual \`remotionCode\` when the user approves the plan or asks you to proceed/generate it.
7. If you genuinely lack critical context (like aspect ratio, target audience, duration), you can output a \`clarificationQuestion\` (with a question string and array of options) instead of a plan.

AGENTIC EDITING MODE (FOR REVISION REQUESTS):
If the user asks to "make it smoother", "fix timing", or "change the text":
1. Understand the existing provided code project structure.
2. Do NOT regenerate the entire project structure from scratch simply to change one thing. Re-use existing code and components verbatim.
3. Patch ONLY the necessary components/scenes that require the change. 
4. Output the full updated code in \`remotionCode\` but ensuring the unchanged logic remains untouched, mimicking a minimal code diff workflow.

APPLE MOTION PRINCIPLES (MANDATORY):
- Default Ease: \`cubic-bezier(0.22, 1, 0.36, 1)\` (e.g., \`const { easing: Easing.bezier(0.22, 1, 0.36, 1) }\`).
- NO bounce, NO overshoot, NO random rotations, NO flashy effects by default.
- Prioritize: Fade, Slide, Scale (0.98 -> 1), Blur to Sharp, Mask reveals, Staggered motion.
- Vibe: Calm, Precise, Premium, Intentional (like Apple, Stripe, Linear).

REUSABLE COMPONENT LIBRARY & SCENE TEMPLATING:
- In your generated code, create and use internal reusable blocks (e.g., \`const HeroReveal = ...\`, \`const TextReveal = ...\`, \`const DeviceFrame = ...\`).
- Assemble videos from these blocks. Do NOT output duplicate inline animation utilities/transitions over and over. Store them internally and reuse them.
- This token reduction strategy aims for 50-80% fewer output tokens.

SMART MOTION ANALYSIS:
- Before animating, silently determine \`motion_intensity\` (e.g., Apple=low, Gaming=high, SaaS=medium) and apply it consistently.

IMPORTANT REMOTION GUIDELINES:
1. Import from 'remotion' and 'react' using standard ES modules. Strict Rule: ONLY use raw SVGs. NO external icon packages.
2. Default export MUST be the main Remotion composition component.
3. Do NOT use standard <video> tags to create graphics, use Remotion primitives (<AbsoluteFill>, <Sequence>, <div>).
4. Ensure valid TSX. NEVER leave trailing inline comments that cut off variable assignments.
5. AUTO POLISH PASS: Before generating the final code payload, internally review for timing, spacing, and pacing consistency.
6. WATERMARK (MANDATORY): You MUST import the pre-made watermark end scene using \`import { WatermarkEndScene } from 'ai-studio-watermark';\` and include it at the VERY END of your video as its own Sequence. The component takes \`fps\`, \`logoSrc\`, \`title\` and \`subtitle\` optional props. Never rebuild the watermark manually. Ensure \`durationInFrames\` accommodates this scene.`;


app.post('/api/init-db', async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Database not connected' });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT false,
        used_by_email VARCHAR(255)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        pin VARCHAR(255),
        role VARCHAR(255),
        goal VARCHAR(255),
        source VARCHAR(255)
      )
    `;
    const codes = await sql`SELECT count(*) FROM invite_codes`;
    if (parseInt(codes[0].count, 10) === 0) {
      await sql`INSERT INTO invite_codes (code) VALUES ('EARLYACCESS')`;
      await sql`INSERT INTO invite_codes (code) VALUES ('BETA123')`;
    }
    res.json({ success: true });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/check-code', async (req, res) => {
  try {
    const { code } = req.body;
    if (!sql) {
      if (code === 'DEMO') return res.json({ valid: true });
      return res.status(500).json({ error: 'Database not connected and not DEMO.' });
    }
    const result = await sql`SELECT * FROM invite_codes WHERE code = ${code}`;
    if (result.length === 0) return res.json({ valid: false, message: 'Invalid code' });
    if (result[0].is_used) return res.json({ valid: false, message: 'Code already used' });
    res.json({ valid: true });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/onboard', async (req, res) => {
  try {
    const { code, name, email, pin, role, goal, source } = req.body;
    if (!sql) {
      if (code === 'DEMO') return res.json({ success: true });
      return res.status(500).json({ error: 'Database not connected' });
    }
    const codeResult = await sql`SELECT * FROM invite_codes WHERE code = ${code}`;
    if (codeResult.length === 0 || codeResult[0].is_used) {
      return res.status(400).json({ error: 'Invalid or used invite code' });
    }
    await sql`
      INSERT INTO users (name, email, pin, role, goal, source)
      VALUES (${name}, ${email}, ${pin}, ${role}, ${goal}, ${source})
    `;
    await sql`
      UPDATE invite_codes SET is_used = true, used_by_email = ${email} WHERE code = ${code}
    `;
    res.json({ success: true });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!sql) {
      if (email === 'demo@example.com' && pin === '123456') return res.json({ success: true });
      return res.status(500).json({ error: 'Database not connected' });
    }
    const result = await Promise.race([
       sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) AND pin = ${pin}`,
       new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), 10000))
    ]);
    if (result.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid email or PIN. You must sign up with an invite code first.' });
    }
  } catch(e: any) {
    console.error('Login error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate-invite', async (req, res) => {
  try {
    const { email } = req.body;
    if (!sql) {
      if (email === 'demo@example.com') return res.json({ code: 'DEMO-1234', remaining: 9 });
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Check how many they've created
    const userCodes = await sql`SELECT count(*) FROM invite_codes WHERE created_by_email = ${email}`;
    const generatedCount = parseInt(userCodes[0].count, 10);
    
    if (generatedCount >= 10) {
      return res.status(400).json({ error: 'You have reached the limit of 10 invite codes.' });
    }
    
    // generate random 6 alphanumeric
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newCode = '';
    for (let i = 0; i < 6; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    await sql`INSERT INTO invite_codes (code, created_by_email) VALUES (${newCode}, ${email})`;
    
    res.json({ code: newCode, remaining: 9 - generatedCount });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/get-invites', async (req, res) => {
  try {
    const { email } = req.body;
    if (!sql) {
      if (email === 'demo@example.com') return res.json({ remaining: 10 });
      return res.status(500).json({ error: 'Database not connected' });
    }
    const userCodes = await sql`SELECT count(*) FROM invite_codes WHERE created_by_email = ${email}`;
    const generatedCount = parseInt(userCodes[0].count, 10);
    res.json({ remaining: Math.max(0, 10 - generatedCount) });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/teach', (req, res) => {
  try {
    const { prompt, code } = req.body;
    if (!prompt || !code) return res.status(400).json({ error: 'Missing prompt or code' });
    
    let memory = [];
    if (fs.existsSync('memory.json')) {
      memory = JSON.parse(fs.readFileSync('memory.json', 'utf8'));
    }
    
    memory.push({ prompt, code, timestamp: new Date().toISOString() });
    
    // Keep only last 10 successful memories to avoid blowing up context window
    if (memory.length > 10) memory = memory.slice(-10);
    
    fs.writeFileSync('memory.json', JSON.stringify(memory, null, 2));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/optimize-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: `You are an AI prompt optimizer. The user wants to write a prompt for an AI video/animation generator. Optimize their prompt by adding rich detail, better visual phrasing, and clarity. Keep it relatively concise but highly descriptive. Output ONLY the improved prompt text, nothing else. Original prompt: "${prompt}"` }] }]
    });

    res.json({ optimizedPrompt: response.text?.trim() || prompt });
  } catch (error: any) {
    console.error('Prompt optimization error:', error);
    res.status(500).json({ error: error.message || 'Failed to optimize prompt' });
  }
});

app.post('/api/pixazo/image', async (req, res) => {
  const apiKey = process.env.PIXAZO_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "PIXAZO_API_KEY is not configured" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
     const response = await fetch("https://gateway.pixazo.ai/getImage/v1/getSDXLImage", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           "Cache-Control": "no-cache",
           "Ocp-Apim-Subscription-Key": apiKey
        },
        body: JSON.stringify({
           prompt,
           height: 1024,
           width: 1024,
           num_steps: 20,
           guidance_scale: 5
        })
     });
     if (!response.ok) {
        throw new Error(`Pixazo API error: ${response.status} ${await response.text()}`);
     }
     const data = await response.json();
     res.json({ imageUrl: data.imageUrl });
  } catch (err: any) {
     res.status(500).json({ error: err.message });
  }
});

app.post('/api/pixazo/audio/generate', async (req, res) => {
  const apiKey = process.env.PIXAZO_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "PIXAZO_API_KEY is not configured" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
     const response = await fetch("https://gateway.pixazo.ai/tracks/v1/generate", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           "Cache-Control": "no-cache",
           "Ocp-Apim-Subscription-Key": apiKey
        },
        body: JSON.stringify({
           prompt,
           instrumental: false,
           duration: 30
        })
     });
     if (!response.ok) {
        throw new Error(`Pixazo API error: ${response.status} ${await response.text()}`);
     }
     const data = await response.json();
     res.json(data);
  } catch (err: any) {
     res.status(500).json({ error: err.message });
  }
});

app.get('/api/pixazo/audio/status/:requestId', async (req, res) => {
  const apiKey = process.env.PIXAZO_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "PIXAZO_API_KEY is not configured" });

  try {
     const response = await fetch(`https://gateway.pixazo.ai/v2/requests/status/${req.params.requestId}`, {
        headers: {
           "Ocp-Apim-Subscription-Key": apiKey
        }
     });
     if (!response.ok) {
        throw new Error(`Pixazo API error: ${response.status} ${await response.text()}`);
     }
     const data = await response.json();
     res.json(data);
  } catch (err: any) {
     res.status(500).json({ error: err.message });
  }
});

app.post('/api/search-media', async (req, res) => {
  try {
    const { query, type } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const results = [];
    
    if (type === 'image' || type === 'video') {
       if (process.env.PEXELS_API_KEY) {
         const url = type === 'video' 
            ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=15`
            : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15`;
            
         const pexelsRes = await fetch(url, {
            headers: { 'Authorization': process.env.PEXELS_API_KEY }
         });
         
         const rawData = await pexelsRes.text();
         let data;
         try {
           data = JSON.parse(rawData);
         } catch(e) {
           throw new Error(rawData || `Pexels API error: ${pexelsRes.status}`);
         }
         
         if (data.photos) {
            data.photos.forEach((p: any) => results.push({ id: `px_${p.id}`, type: 'image', url: p.src.large, previewUrl: p.src.medium, name: p.alt || 'Pexels Image' }));
         } else if (data.videos) {
            data.videos.forEach((v: any) => {
               const videoFile = v.video_files.find((f: any) => f.quality === 'hd') || v.video_files[0];
               if (videoFile) results.push({ id: `px_${v.id}`, type: 'video', url: videoFile.link, previewUrl: v.image, name: 'Pexels Video' });
            });
         }
       } else {
         // Mock response if no Pexels API key
         return res.json({ 
            error: "PEXELS_API_KEY not set. Please add it in AI Studio settings to see real results.",
            results: []
         });
       }
    } else if (type === 'audio') {
       if (process.env.PIXABAY_API_KEY) {
         const url = `https://pixabay.com/api/audio/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=15`;
         const pixabayRes = await fetch(url);
         const rawData = await pixabayRes.text();
         let data;
         try {
           data = JSON.parse(rawData);
         } catch(e) {
           throw new Error(rawData || `Pixabay API error: ${pixabayRes.status}`);
         }
         
         if (data.hits) {
            data.hits.forEach((h: any) => results.push({ id: `pb_${h.id}`, type: 'audio', url: h.audio, previewUrl: '', name: h.tags || 'Music Track' }));
         }
       } else {
         // Free sound api or just error
         return res.json({ 
            error: "PIXABAY_API_KEY not set. Please add it to see real audio results.",
            results: []
         });
       }
    }

    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { history, prompt, sources, isChatOnly, activeSkills = [], mediaFiles = [], modelName = 'Plan', stream = false } = req.body;
    let fullPrompt = prompt;

    
    // Add Media Files Context
    if (mediaFiles && mediaFiles.length > 0) {
      let mediaContext = "[PROVIDED SVG MEDIA RESOURCES]:\nThe user has selected the following SVG images for this video. You can use these SVGs directly in the Remotion code (either by converting them to React components, dumping the raw SVG elements into the code, or placing them safely). Do not invent SVGs if the user provided them here.\n\n";
      mediaFiles.forEach((m: any) => {
        mediaContext += `--- MEDIA ELEMENT START (Name: @${m.name}) ---\n${m.content}\n--- MEDIA ELEMENT END ---\n\n`;
      });
      fullPrompt = mediaContext + fullPrompt;
    }
    
    // Inject Memory Context
    try {
      if (fs.existsSync('memory.json')) {
        const memory = JSON.parse(fs.readFileSync('memory.json', 'utf8'));
        if (memory.length > 0) {
           let memCtx = "\n\n[SELF-LEARNING MEMORY / PAST SUCCESSFUL EXAMPLES]\nThe user has explicitly taught you the following successful snippets in the past. Use them as references for style, structure, or when they ask for something similar:\n";
           memory.forEach((m: any, i: number) => {
             memCtx += `\nExample ${i+1}:\nUser Prompt: ${m.prompt}\nSuccessful Code:\n${m.code}\n`;
           });
           fullPrompt = memCtx + "\n\n" + fullPrompt;
        }
      }
    } catch(e) {
      console.error("Failed to load memory", e);
    }

    // Add Skill Instructions
    if (activeSkills.length > 0) {
      let skillsContext = "CRITICAL: The user has enabled the following skills. You MUST apply these guidelines to your code and logic:\n\n";
      
      if (activeSkills.includes('liquid_glass')) {
        skillsContext += `[SKILL: LIQUID GLASS (MANDATORY COMPLIANCE)]\nThe user explicitly selected the "Liquid Glass" effect. You absolutely MUST generate HTML/SVG structures corresponding to this effect in your Remotion code. Do not ignore this skill!\n
Structure required:
<div className="liquidGlass-wrapper dock">
  <div className="liquidGlass-effect"></div>
  <div ...> (tint, shine, text, etc)
</div>
<svg style={{display: 'none'}}>
  <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves={1} seed={5} result="turbulence" />
    <feComponentTransfer in="turbulence" result="mapped">
      <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
      <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
      <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
    </feComponentTransfer>
    <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
    <feSpecularLighting in="softMap" surfaceScale={5} specularConstant={1} specularExponent={100} lightingColor="white" result="specLight">
      <fePointLight x={-200} y={-200} z={300} />
    </feSpecularLighting>
    <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litImage" />
    <feDisplacementMap in="SourceGraphic" in2="softMap" scale={150} xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>
`;
      }
      
      if (activeSkills.includes('ui_design')) {
        skillsContext += `[SKILL: CLEAN UI DESIGN (MANDATORY COMPLIANCE)]\nNEVER use typical loud elements: NO gradients, NO glows, NO complex shadows. STRICTLY limit colors. Ensure perfect paddings/margins. Typography should be thin/light or very structured. Minimalism and high legibility are absolute.\n`;
      }
      
      if (activeSkills.includes('multi_scene')) {
        skillsContext += `[SKILL: MULTI-SCENE SEQUENCE (MANDATORY COMPLIANCE)]\nYou MUST build the video using Remotion's 'Sequence' components. Organize the video into multiple distinct logical scenes overlapping or placed sequentially using from / durationInFrames logic.\n`;
      }
      
      fullPrompt = skillsContext + "\n\nCRITICAL INSTRUCTION: You MUST strictly build exactly what the user requests below. You MUST apply every enabled skill. Do NOT hallucinate entirely different projects or themes.\n\nUser request: " + prompt;
    }

    const ai = getGenAI();

    let extractedSources = sources || [];
    
    // Always do research first
    if (process.env.TAVILY_API_KEY) {
      try {
        const searchCheckRes = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [{ role: 'user', parts: [{ text: `Generate a concise and highly relevant web search query to gather context, recent facts, or background information for this prompt. Return ONLY the search query, do not write anything else. Prompt: "${prompt}"` }] }]
        });
        const sq = searchCheckRes.text?.trim() || "";
        if (sq && sq !== 'NO_SEARCH') {
           console.log("Searching Tavily for:", sq);
           const t = tavily({ apiKey: process.env.TAVILY_API_KEY });
           const searchRes = await t.search(sq, { searchDepth: 'basic', includeAnswer: true, maxResults: 3 });
           if (searchRes && searchRes.results) {
              const newSources = searchRes.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content,
                  icon: `https://www.google.com/s2/favicons?domain=${new URL(r.url).hostname}&sz=64`
              }));
              extractedSources = [...extractedSources, ...newSources];
              const searchAnswers = `Tavily Search answer: ${searchRes.answer || ''}\n\nSearch results:\n` + searchRes.results.map(r => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join('\n\n');
              fullPrompt = `${fullPrompt}\n\n[Background Info from Search]:\n${searchAnswers}\n\nPlease use this information to respond.`;
           }
        }
      } catch (e) {
        console.error("Tavily search failed:", e);
      }
    }

    if (extractedSources && extractedSources.length > 0 && !isChatOnly && !process.env.TAVILY_API_KEY) {
      // Fallback if sources were provided directly without Tavily
      const sourcesText = extractedSources.map((s: any) => `Title: ${s.title}\nURL: ${s.url}\nContent: ${s.content}`).join('\n\n');
      fullPrompt = `${fullPrompt}\n\n[Background Info from Search]:\n${sourcesText}\n\nPlease use this information to create an accurate plan and video.`;
    }

    if (mediaFiles && mediaFiles.length > 0) {
      let mediaContext = `\n[ATTACHED MEDIA FILES]\n`;
      mediaFiles.forEach((m: any) => {
        mediaContext += `--- BEGIN SVG: @${m.name} ---\n${m.content}\n--- END SVG ---\n\n`;
      });
      fullPrompt += mediaContext + `(The user has attached the above SVG files you can use in your video code or brainstorming.)\n\n`;
    }
    
    if (isChatOnly) {
      fullPrompt = `[CHAT ONLY MODE]: The user just wants to chat or brainstorm about their video. Do NOT generate a plan or code. Simply reply in the textResponse field. Keep remotionCode and planMarkdown empty.\nUser message: ${fullPrompt}`;
    }
    
    const contents = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: fullPrompt }] });
    
    let modelId = 'gemini-3.5-flash';
    let isOpenRouter = false;
    
    if (modelName === 'Plan' || !modelName) modelId = 'gemini-3.5-flash';
    else if (modelName.toLowerCase().includes('3.1 flash lite')) modelId = 'gemini-3.1-flash-lite';
    else if (modelName.toLowerCase().includes('3.5')) modelId = 'gemini-3.5-flash';
    else if (modelName.toLowerCase().includes('3 flash preview')) modelId = 'gemini-3-flash-preview';
    else if (modelName.toLowerCase().includes('3 flash')) modelId = 'gemini-3.5-flash';
    else if (modelName.toLowerCase().includes('gemma-4')) modelId = 'gemma-4-31b-it';
    else if (modelName === 'Kimi 2.6') {
      modelId = 'moonshotai/kimi-k2.6:free';
      isOpenRouter = true;
    }
    else modelId = 'gemini-3.5-flash'; // fallback 

    let text = "{}";
    let jsonResponse: any = {};
    let openRouterResponse: any = null;

    if (isOpenRouter) {
      const openRouter = getOpenRouterClient();
      const openRouterMessages = [
        { 
          role: 'system', 
          content: systemInstruction + `\n\nCRITICAL: You MUST return a single valid JSON object. The JSON MUST match the following schema:
{
  "type": "object",
  "properties": {
    "textResponse": { "type": "string", "description": "Short conversational reply to the user. E.g. 'Here is the plan!' or 'I have created the animation for you!'" },
    "planMarkdown": { "type": "string", "description": "The detailed Markdown-formatted plan of the animation scene-by-scene, clean style, animations, etc., generated in Phase 1." },
    "remotionCode": { "type": "string", "description": "The raw React code using Remotion. Must contain export default." },
    "durationInFrames": { "type": "integer", "description": "Appropriate duration in frames for the entire composition based on animations." },
    "fps": { "type": "integer", "description": "Frames per second. Use 30 by default." },
    "compositionWidth": { "type": "integer", "description": "The width of the video composition in pixels. e.g. 1920 for 16:9 landscape, 1080 for 9:16 portrait, 1080 for 1:1 square." },
    "compositionHeight": { "type": "integer", "description": "The height of the video composition in pixels. e.g. 1080 for 16:9 landscape, 1920 for 9:16 portrait, 1080 for 1:1 square." },
    "planApproval": { "type": "boolean", "description": "Set to true if presenting a plan and asking for user approval." },
    "clarificationQuestion": { 
      "type": "object", 
      "properties": { 
        "question": { "type": "string" }, 
        "options": { "type": "array", "items": { "type": "string" } } 
      }
    }
  },
  "required": ["textResponse", "remotionCode", "durationInFrames", "fps", "compositionWidth", "compositionHeight"]
}`
        },
        ...history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: fullPrompt }
      ];

      const completion: any = await openRouter.chat.send({
        chatRequest: {
          model: modelId,
          messages: openRouterMessages as any,
          responseFormat: { type: 'json_object' }
        }
      });
      
      text = completion.choices?.[0]?.message?.content || "{}";
      openRouterResponse = completion;
      jsonResponse = JSON.parse(text);
    } else {
      const response = await ai.models.generateContent({
        model: modelId,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              textResponse: { 
                type: Type.STRING, 
                description: 'Short conversational reply to the user. E.g. "Here is the plan!" or "I have created the animation for you!"'
              },
              planMarkdown: {
                type: Type.STRING,
                description: 'The detailed Markdown-formatted plan of the animation scene-by-scene, clean style, animations, etc., generated in Phase 1.'
              },
              remotionCode: {
                type: Type.STRING,
                description: 'The raw React code using Remotion. Must contain export default.'
              },
              durationInFrames: {
                type: Type.INTEGER,
                description: 'Appropriate duration in frames for the entire composition based on animations.'
              },
              fps: {
                type: Type.INTEGER,
                description: 'Frames per second. Use 30 by default.'
              },
              compositionWidth: {
                type: Type.INTEGER,
                description: 'The width of the video composition in pixels. e.g. 1920 for 16:9 landscape, 1080 for 9:16 portrait, 1080 for 1:1 square.'
              },
              compositionHeight: {
                type: Type.INTEGER,
                description: 'The height of the video composition in pixels. e.g. 1080 for 16:9 landscape, 1920 for 9:16 portrait, 1080 for 1:1 square.'
              },
              planApproval: {
                type: Type.BOOLEAN,
                description: 'Set to true if presenting a plan and asking for user approval.'
              },
              clarificationQuestion: {
                type: Type.OBJECT,
                description: 'If you need to clarify something before generating a plan, ask a single multiple choice question.',
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            required: ['textResponse', 'remotionCode', 'durationInFrames', 'fps', 'compositionWidth', 'compositionHeight']
          }
        }
      });

      text = response.text || "{}";
      jsonResponse = JSON.parse(text);
      
      // Process Grounding Chunks (if we had used a googleSearch tool previously)
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const parsedSources = chunks.map((c: any) => {
          const uri = c.web?.uri;
          if (!uri) return null;
          let domain = '';
          try { domain = new URL(uri).hostname; } catch(e) {}
          return {
            title: c.web?.title || domain,
            url: uri,
            content: uri,
            icon: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : undefined
          };
        }).filter(Boolean);
        
        if (parsedSources.length > 0) {
          const existingUrls = new Set(extractedSources.map((s: any) => s.url));
          for (const s of parsedSources) {
            if (!existingUrls.has(s.url)) extractedSources.push(s);
          }
        }
      }
    }
    
    res.json({ ...jsonResponse, sources: extractedSources });

  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

app.post('/api/tools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    if (!sql) return res.json({ success: false, message: 'Database not connected' });
    
    // Check if exists
    const existing = await sql`SELECT id FROM tools WHERE id = ${id}`;
    if (existing.length > 0) {
      await sql`UPDATE tools SET code = ${code}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    } else {
      await sql`INSERT INTO tools (id, code) VALUES (${id}, ${code})`;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!sql) return res.json({ code: null });
    const result = await sql`SELECT code FROM tools WHERE id = ${id}`;
    res.json({ code: result.length > 0 ? result[0].code : null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user-data', async (req, res) => {
  try {
    const { email, data } = req.body;
    if (!sql) return res.status(500).json({ error: 'Database not connected' });
    await sql`
      INSERT INTO user_data (email, data) 
      VALUES (${email}, ${data}) 
      ON CONFLICT (email) DO UPDATE SET data = ${data}, updated_at = CURRENT_TIMESTAMP
    `;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user-data/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (!sql) return res.json({ data: null });
    const result = await sql`SELECT data FROM user_data WHERE email = ${email}`;
    res.json({ data: result.length > 0 ? result[0].data : null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate-html', async (req, res) => {
   try {
      const { prompt, imageBase64, previousHtml } = req.body;
      const ai = getGenAI();
      const parts = [];
      
      if (previousHtml) {
         parts.push({ text: `Current HTML code:\n\`\`\`html\n${previousHtml}\n\`\`\`` });
         parts.push({ text: `User edit request: ${prompt || "Make it better"}` });
      } else {
         if (prompt) parts.push({ text: prompt });
      }
      
      if (imageBase64) {
         try {
           const match = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)/);
           if (match) {
             const mime = match[1];
             const data = match[2];
             parts.push({
                inlineData: {
                   data,
                   mimeType: mime
                }
             });
           }
         } catch(e) {}
      }
      
      const response = await ai.models.generateContent({
         model: 'gemini-3.5-flash',
         contents: [{ role: 'user', parts: parts.length ? parts : [{ text: 'Generate an interactive 3D particle wave HTML animation' }] }],
         config: {
            systemInstruction: "You are an expert creative developer. The user wants you to generate an interactive HTML file with a visual effect or animation. If they provide an image, generate a 3D animated environment or interactive visual based on it. Use raw HTML, CSS, and JS (Canvas or generic WebGL libraries included via CDN if needed). OUTPUT ONLY RAW HTML CODE. Do not use markdown format tags. Start straight with <!DOCTYPE html>"
         }
      });
      let code = response.text || "";
      if (code.startsWith("```html")) code = code.substring(7);
      else if (code.startsWith("```")) code = code.substring(3);
      if (code.endsWith("```")) code = code.substring(0, code.length - 3);
      
      res.json({ html: code.trim() });
   } catch(e:any) {
      console.error(e);
      res.status(500).json({ error: e.message });
   }
});

async function startServer() {
  if (sql) {
     try {
       await sql`CREATE TABLE IF NOT EXISTS invite_codes (id SERIAL PRIMARY KEY, code VARCHAR(255) UNIQUE NOT NULL, is_used BOOLEAN DEFAULT false, used_by_email VARCHAR(255), created_by_email VARCHAR(255))`;
       try {
         await sql`ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(255)`;
       } catch(e) {}
       await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE NOT NULL, pin VARCHAR(255), role VARCHAR(255), goal VARCHAR(255), source VARCHAR(255))`;
       await sql`CREATE TABLE IF NOT EXISTS tools (id VARCHAR(255) PRIMARY KEY, code TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
       await sql`CREATE TABLE IF NOT EXISTS user_data (email VARCHAR(255) PRIMARY KEY, data JSONB, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
       const codes = await sql`SELECT count(*) FROM invite_codes`;
       if (parseInt(codes[0].count, 10) === 0) {
         await sql`INSERT INTO invite_codes (code) VALUES ('EARLYACCESS')`;
         await sql`INSERT INTO invite_codes (code) VALUES ('BETA123')`;
       }
     } catch (e) {
       console.error("DB init failed", e);
     }
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
