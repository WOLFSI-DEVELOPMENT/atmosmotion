const Babel = require('@babel/standalone');
const code = `
  const test = interpolate(
    frame,
    [0, 1],
    [0, 0], 
    { extrapolate: 'clamp' } //
  );

  // Background gradient shift
  const bgShift = interpolate(
`;
try { Babel.transform(code, { presets: ['env', 'react', 'typescript'], filename: 'generated.tsx' }); console.log("OK"); }
catch(e) { console.log(e.message); }
