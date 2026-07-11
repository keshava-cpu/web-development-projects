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
    let newContent = content.replace(/<Grid\s+size={{(.*?)}}/g, (match, inner) => {
      let newInner = inner.replace(/{(\d+)}/g, '$1');
      return `<Grid size={{${newInner}}}`;
    });
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Updated', filePath);
    }
  }
});
