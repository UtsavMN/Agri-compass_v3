const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint.json', 'utf8'));
data.forEach(file => {
  file.messages.forEach(m => {
    if (m.severity === 2) {
      console.log(file.filePath + ':' + m.line + ':' + m.column + ' - ' + m.message);
    }
  });
});
