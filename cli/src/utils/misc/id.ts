export const getId = (inputstring: string) => {
  return String(inputstring)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};