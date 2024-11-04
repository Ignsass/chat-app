// utils/generateColor.js

function generateColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 70%)`; // Sugeneruojame pastelinę spalvą
}

export default generateColor;
