// src/game.html(Claudeで作ったゲーム本体)から、アプリ用の www/index.html を作るスクリプト
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
const src = readFileSync(new URL('../src/game.html', import.meta.url), 'utf8');
const cut = src.indexOf('<header');
if (cut < 0) throw new Error('src/game.html の形式が想定と違います');
// フォントをアプリに同梱(オフラインでも同じ見た目になるように)
const FONTS = [['dela-gothic-one', [400]], ['zen-kaku-gothic-new', [400, 500, 700]], ['jetbrains-mono', [500, 700]]];
let fontCss = '';
const fdir = new URL('../www/fonts/', import.meta.url);
mkdirSync(fdir, { recursive: true });
for (const [pkg, ws] of FONTS) {
  const base = new URL(`../node_modules/@fontsource/${pkg}/`, import.meta.url);
  if (!existsSync(base)) { fontCss = null; break; }
  for (const w of ws) {
    let css = readFileSync(new URL(`${w}.css`, base), 'utf8').replace(/,\s*url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, '');
    for (const m of css.matchAll(/url\(\.\/files\/([^)]+\.woff2)\)/g)) copyFileSync(new URL(`files/${m[1]}`, base), new URL(m[1], fdir));
    fontCss += css.replace(/\.\/files\//g, '');
  }
}
let headSrc = src.slice(0, cut);
if (fontCss) {
  writeFileSync(new URL('fonts.css', fdir), fontCss);
  headSrc = headSrc.replace(/<link rel="preconnect"[^>]*>\s*/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts/fonts.css">');
}
const headPart = headSrc;
const bodyPart = src.slice(cut);
const scriptAt = bodyPart.indexOf('<script>');
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const appHead = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#2f6e52">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="実業団物語">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/pwa-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0;font:14px/1.5 system-ui,-apple-system,sans-serif;overscroll-behavior:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
input,textarea,select,.bubble,.mtg-line p{-webkit-user-select:text;user-select:text}
img{max-width:100%}
[hidden]{display:none!important}
</style>
`;

const bridge = `<script>
/* アプリ版だけで動く処理:端末への保存、戻るボタン、ステータスバー */
(function(){
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var P = C.Plugins || {};
  if (P.Preferences) {
    window.__nativeSave = function(k, v){ try { v ? P.Preferences.set({key:k, value:v}) : P.Preferences.remove({key:k}); } catch(e){} };
    window.__nativeLoad = function(k){ return P.Preferences.get({key:k}).then(function(r){ return r && r.value ? r.value : null; }); };
  }
  if (P.App) {
    P.App.addListener('backButton', function(){
      var sh = document.getElementById('sheet');
      if (sh && !sh.hidden) { var x = sh.querySelector('.x'); if (x) x.click(); return; }
      var gym = document.querySelector('.tabs button[data-t="gym"]');
      if (gym && !gym.classList.contains('on') && !document.getElementById('tabs').classList.contains('lock')) { gym.click(); return; }
      if (P.App.minimizeApp) P.App.minimizeApp(); else P.App.exitApp();
    });
  }
  if (P.StatusBar) {
    var dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    try { P.StatusBar.setStyle({ style: dark ? 'DARK' : 'LIGHT' }); } catch(e){}
  }
})();
</script>
`;

const sw = `<script>
/* Webアプリ(PWA)として公開したときに、オフラインでも遊べるようにする */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) {
  window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
}
</script>
`;

const out = appHead + headPart + '</head>\n<body>\n' +
  bodyPart.slice(0, scriptAt) + bridge + bodyPart.slice(scriptAt).replace(/<\/script>\s*$/, '</script>\n') +
  sw + '</body>\n</html>\n';
mkdirSync(new URL('../www/', import.meta.url), { recursive: true });
writeFileSync(new URL('../www/index.html', import.meta.url), out);

const swSrc = readFileSync(new URL('./sw.template.js', import.meta.url), 'utf8').replace('__VERSION__', version + '-' + Date.now());
writeFileSync(new URL('../www/sw.js', import.meta.url), swSrc);
console.log('www/index.html を作成しました (' + Math.round(out.length / 1024) + 'KB, v' + version + ')');
