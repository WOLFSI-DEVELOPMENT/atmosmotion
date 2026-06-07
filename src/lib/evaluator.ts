import * as Babel from '@babel/standalone';
import React from 'react';
import * as Remotion from 'remotion';
import { WatermarkEndScene } from '../components/WatermarkEndScene';

export function evaluateRemotionCode(code: string): React.ComponentType<any> | null {
  // Helper to remove structurally incomplete trailing lines
  const cleanTrailing = (c: string) => {
    let lines = c.split('\n');
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    let changed = true;
    while (changed && lines.length > 0) {
      changed = false;
      const lastLine = lines[lines.length - 1].trim();
      const isIncomplete = 
        lastLine.startsWith('//') || 
        lastLine.startsWith('/*') ||
        lastLine.endsWith('(') || 
        lastLine.endsWith('[') || 
        lastLine.endsWith('{') || 
        lastLine.endsWith(',') ||
        lastLine.endsWith('+') ||
        lastLine.endsWith('-') ||
        lastLine.endsWith('*') ||
        lastLine.endsWith('/') ||
        lastLine.endsWith('=') ||
        (lastLine.startsWith('const ') && !lastLine.endsWith(';') && !lastLine.endsWith('}') && !lastLine.endsWith(')')) ||
        (lastLine.startsWith('let ') && !lastLine.endsWith(';') && !lastLine.endsWith('}') && !lastLine.endsWith(')')) ||
        (lastLine.startsWith('var ') && !lastLine.endsWith(';') && !lastLine.endsWith('}') && !lastLine.endsWith(')'));
        
      if (isIncomplete) {
        lines.pop();
        changed = true;
      }
    }
    return lines.join('\n');
  };

  // 1. Apply initial regex sanitizations and basic trim
  let sanitizedCode = code.replace(/(\b(?:const|let|var)\s+[a-zA-Z0-9_$]+\s*)\/\/(.*)/g, '$1 = null; //$2');
  sanitizedCode = cleanTrailing(sanitizedCode);

  let transformed: string | null = null;
  let attempts = 0;
  const maxFallbackAttempts = 30; // Auto-heal by scanning and popping up to 30 lines if we hit syntax errors
  let lastError: any = null;

  while (attempts < maxFallbackAttempts) {
    try {
      transformed = Babel.transform(sanitizedCode, {
        presets: ['env', 'react', 'typescript'],
        filename: 'generated.tsx'
      }).code || null;
      break; // Successfully transpiled!
    } catch (err: any) {
      lastError = err;
      
      // If we see a parsing/compilation error, pop the last non-empty line and clean again
      let lines = sanitizedCode.split('\n');
      while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }
      
      if (lines.length > 0) {
        lines.pop();
        sanitizedCode = cleanTrailing(lines.join('\n'));
        attempts++;
      } else {
        break;
      }
    }
  }

  try {
    if (!transformed) {
      throw lastError || new Error('Babel evaluation failed to compile');
    }

    const exports: any = {};
    const module = { exports };
    const requireFunc = (name: string) => {
      if (name === 'react') return React;
      if (name === 'remotion') return Remotion;
      if (name === 'ai-studio-watermark') return { WatermarkEndScene };
      console.warn(`Module ${name} not found, proceeding anyway.`);
      return {};
    };

    const evaluate = new Function('require', 'exports', 'module', 'React', transformed);
    evaluate(requireFunc, exports, module, React);

    return module.exports.default || exports.default || null;
  } catch (error) {
    console.error('Babel evaluation error:', error);
    throw error;
  }
}
