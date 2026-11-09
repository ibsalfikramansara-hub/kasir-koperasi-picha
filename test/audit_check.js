const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== AUDIT CODEBASE KASIR KOPERASI PICHA ===\n');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const htmlSet = new Set(htmlFiles);

let issues = [];

// 1. Check HTML files
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');

  // Charset
  if (!content.includes('charset="UTF-8"') && !content.includes("charset='UTF-8'")) {
    issues.push(`[${file}] Missing or invalid charset (expected UTF-8)`);
  }

  // Dead links
  const hrefMatches = [...content.matchAll(/href=["']([^"']+)["']/g)];
  for (const m of hrefMatches) {
    const url = m[1];
    if (url === '#' || url.startsWith('#')) {
      issues.push(`[${file}] Dead link found: href="${url}"`);
    } else if (url.endsWith('.html') && !htmlSet.has(url)) {
      issues.push(`[${file}] Broken link: target file "${url}" does not exist`);
    }
  }

  // Check script tags for syntax errors
  const scriptMatches = [...content.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
  scriptMatches.forEach((sm, idx) => {
    try {
      new vm.Script(sm[1], { filename: `${file}#inline-script-${idx + 1}` });
    } catch (err) {
      issues.push(`[${file}] Script syntax error in inline script ${idx + 1}: ${err.message}`);
    }
  });
}

// 2. Check JS files
const jsFiles = ['js/core.js', 'js/auth.js'];
for (const jf of jsFiles) {
  if (fs.existsSync(jf)) {
    try {
      new vm.Script(fs.readFileSync(jf, 'utf8'), { filename: jf });
    } catch (err) {
      issues.push(`[${jf}] Syntax error: ${err.message}`);
    }
  } else {
    issues.push(`Missing JS file: ${jf}`);
  }
}

// 3. Check vercel.json configuration
if (fs.existsSync('vercel.json')) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    if (vercelConfig.rewrites) {
      for (const rw of vercelConfig.rewrites) {
        const dest = rw.destination.replace(/^\//, '');
        if (dest.endsWith('.html') && !htmlSet.has(dest)) {
          issues.push(`[vercel.json] Rewrite destination "${rw.destination}" does not exist!`);
        }
      }
    }
  } catch (err) {
    issues.push(`[vercel.json] Invalid JSON: ${err.message}`);
  }
} else {
  issues.push('Missing vercel.json');
}

console.log(`Audited ${htmlFiles.length} HTML files and ${jsFiles.length} JS files.`);
if (issues.length === 0) {
  console.log('✓ No critical syntax or link issues found!');
} else {
  console.log(`Found ${issues.length} issue(s):`);
  issues.forEach(i => console.log(' - ' + i));
}

process.exit(issues.length > 0 ? 1 : 0);

