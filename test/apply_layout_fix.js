const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // 1. Tautkan css/app.css jika belum ada
  if (!content.includes('css/app.css')) {
    content = content.replace('</head>', '    <link rel="stylesheet" href="css/app.css">\n</head>');
    changed = true;
  }

  // 2. Beri id='main-wrapper' pada <div class='flex flex-col min-h-screen'>
  if (content.includes('<div class="flex flex-col min-h-screen">')) {
    content = content.replace('<div class="flex flex-col min-h-screen">', '<div id="main-wrapper" class="flex flex-col min-h-screen">');
    changed = true;
  }

  // 3. Pastikan header memiliki class 'fixed-header'
  if (content.includes('<header class="fixed top-0 left-0 right-0 z-40') && !content.includes('fixed-header')) {
    content = content.replace('<header class="fixed top-0 left-0 right-0 z-40', '<header class="fixed-header fixed top-0 left-0 right-0 z-40');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated:', f);
  }
});

