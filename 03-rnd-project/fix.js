const fs = require('fs');
const path = require('path');
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}
walkDir('frontend/src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/<Grid\s+item\b([^>]*?)>/g, (match, attrs) => {
      let sizeObj = {};
      let remainingAttrs = attrs.replace(/\b(xs|sm|md|lg|xl)=({[^}]+}|"[^"]+"|\d+)/g, (m, bp, val) => {
        sizeObj[bp] = val; return '';
      });
      if (Object.keys(sizeObj).length > 0) {
        let sizeStr = Object.entries(sizeObj).map(([k, v]) => `${k}: ${v}`).join(', ');
        return `<Grid size={{ ${sizeStr} }}${remainingAttrs}>`;
      }
      return match;
    });
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Updated', filePath);
    }
  }
});
