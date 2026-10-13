const fs = require('fs');
const path = require('path');

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'css', 'style.css'), 'utf8');
const questionsJs = fs.readFileSync(path.join(dir, 'js', 'questions.js'), 'utf8');
const audioJs = fs.readFileSync(path.join(dir, 'js', 'audio.js'), 'utf8');
const confettiJs = fs.readFileSync(path.join(dir, 'js', 'confetti.js'), 'utf8');
const appJs = fs.readFileSync(path.join(dir, 'js', 'app.js'), 'utf8');

// دمج كل الملفات في ملف واحد شامل
let standalone = html
  .replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
  .replace('<script src="js/questions.js"></script>', '<script>\n' + questionsJs + '\n</script>')
  .replace('<script src="js/audio.js"></script>', '<script>\n' + audioJs + '\n</script>')
  .replace('<script src="js/confetti.js"></script>', '<script>\n' + confettiJs + '\n</script>')
  .replace('<script src="js/app.js"></script>', '<script>\n' + appJs + '\n</script>');

const targetPath = path.join(dir, 'saudi-history-quiz-standalone.html');
fs.writeFileSync(targetPath, standalone, 'utf8');

console.log('Done! Standalone file created successfully at:', targetPath);
console.log('Total file size:', standalone.length, 'bytes');
