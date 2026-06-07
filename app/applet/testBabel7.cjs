const Babel = require('@babel/standalone');
const code = `
const Comp = () => {
  return (
    <div style={{
      opacity: interpolate(
        frame,
        [0, 1],
        [0, 0], 
        { extrapolate: 'clamp' }
      );
    }} />
  );
};
`;
try { Babel.transform(code, { presets: ['env', 'react'] }); console.log("OK"); }
catch(e) { console.log(e.message); }
