export function replaceAll(
  text: string,
  find: string,
  replace: string,
  caseSensitive: boolean
): string {
  if (!find) return text;
  if (caseSensitive) return text.split(find).join(replace);

  const { lower, map } = lowerWithMap(text);
  const findLower = find.toLowerCase();
  if (!findLower) return text;

  let result = "";
  let lowerIndex = 0;
  let origin = 0;
  while (lowerIndex <= lower.length) {
    const idx = lower.indexOf(findLower, lowerIndex);
    if (idx === -1) {
      result += text.slice(origin);
      return result;
    }
    const startOrigin = map[idx];
    const last = idx + findLower.length - 1;
    const matchedOrigin = map[last];
    let endOrigin = text.length;
    for (let k = last + 1; k < map.length; k++) {
      if (map[k] !== matchedOrigin) {
        endOrigin = map[k];
        break;
      }
    }
    result += text.slice(origin, startOrigin) + replace;
    origin = endOrigin;
    lowerIndex = idx + findLower.length;
  }
  return result;
}

function lowerWithMap(text: string): { lower: string; map: number[] } {
  let lower = "";
  const map: number[] = [];
  let origin = 0;
  for (const ch of text) {
    const piece = ch.toLowerCase();
    for (let j = 0; j < piece.length; j++) {
      lower += piece[j];
      map.push(origin);
    }
    origin += ch.length;
  }
  return { lower, map };
}
