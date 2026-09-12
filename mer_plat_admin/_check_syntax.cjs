const parser = require('@babel/parser');
const fs = require('fs');

function parseSrc(label, src, plugins) {
  try {
    parser.parse(src, { sourceType: 'module', plugins });
    console.log('OK:', label);
  } catch (e) {
    console.log('ERROR:', label);
    console.log(e.message);
  }
}

parseSrc('src/utils/i18nText.js', fs.readFileSync('src/utils/i18nText.js', 'utf8'), []);

const vueSrc = fs.readFileSync('src/components/FormGenerator/components/parser/Parser.vue', 'utf8');
const m = vueSrc.match(/<script>([\s\S]*?)<\/script>/);
if (m) {
  parseSrc('Parser.vue <script>', m[1], ['jsx']);
} else {
  console.log('no <script> block found in Parser.vue');
}
