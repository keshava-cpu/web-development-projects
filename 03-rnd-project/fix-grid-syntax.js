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
    // We are looking for size={{ xs: {12}, sm: {6} }} and want to remove the {} around numbers.
    let newContent = content.replace(/<Grid\s+size={{([^}]+)}}/g, (match, inner) => {
      let newInner = inner.replace(/{(\d+)}/g, '$1');
      return `<Grid size={{${newInner}}}`;
    });
    // Another pass for cases where there might be spaces or something we missed
    // actually, let's just do a generic replace for size={{...}} to fix the inner braces
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Updated', filePath);
    }
  }
});
