const Babel = require('@babel/standalone');
const code = `
const bgShift = interpolate(
  frame,
  [0, 1],
  [0, 0], 
  { extrapolate: 'clamp' }
);
`;
const code2 = `
<AbsoluteFill>
const bgShift = interpolate(
  frame,
  [0, 1],
  [0, 0], 
  { extrapolate: 'clamp' }
);
</AbsoluteFill>
`;

try { Babel.transform(code2, { presets: ['env', 'react', 'typescript'], filename: 'generated.tsx' }); console.log("OK"); }
catch(e) { console.log(e.message); }
