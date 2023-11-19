export const format3DModelScale = (param) => {
  const [x, y, z] = param.split(' ');

  return {
    x: Number(x) || 1,
    y: Number(y) || 1,
    z: Number(z) || 1,
  };
};

export const format3DModelRotation = (param) => {
  const [x, y, z] = param.split(' ');

  return {
    x: Number(x) || 0,
    y: Number(y) || 0,
    z: Number(z) || 0,
  };
};
