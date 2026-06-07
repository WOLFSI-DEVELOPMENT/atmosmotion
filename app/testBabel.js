const Babel = require('@babel/standalone');

const code = `
  const shift = interpolate(
    frame,
    [0, 1],
    [0, 0], 
    { extrapolate: 'clamp' }
  ); //
`;

try {
  Babel.transform(code, {
    presets: ['env', 'react', 'typescript'],
    filename: 'generated.tsx'
  });
} catch (e) {
  console.log(e.message);
}
