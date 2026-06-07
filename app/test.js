const Babel = require('@babel/standalone');
const code = `
  interpolate(
    frame,
    [0, 1],
    [0, 0], 
    { extrapolate: 'clamp' }
  ,);
`;
try { Babel.transform(code, { presets: ['env', 'react', 'typescript'], filename: 'generated.tsx' }); console.log("OK"); }
catch(e) { console.log(e.message); }
