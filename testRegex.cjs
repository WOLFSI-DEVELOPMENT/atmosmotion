const code_candidates = [
`
  const shift = interpolate(
    frame,
    [0, 1],
    [0, 0], 
    { extrapolate: 'clamp' }
  );

  // Background gradient shift
  const bgShift = interpolate(
`
];

code_candidates.forEach(c => {
  const sanitizedCode = c.replace(/(\b(?:const|let|var)\s+[a-zA-Z0-9_$]+\s*)\/\/(.*)/g, '$1 = null; //$2');
  console.log(sanitizedCode);
});
