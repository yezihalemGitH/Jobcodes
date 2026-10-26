// ==UserScript==
// @name         ReporterFill
// @namespace    https://github.com/yezihalemGitH/Jobcodes
// @version      1.0
// @description  Adds a ReporterFill button on Ethiopian Reporter Jobs. It fills your profile from your own CV; you still check and tap Save yourself.
// @match        https://www.ethiopianreporterjobs.com/*
// @match        https://ethiopianreporterjobs.com/*
// @grant        none
// ==/UserScript==
(function(){
if(window.top!==window.self)return;
var b=document.createElement('button');b.textContent='ReporterFill';
b.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483645;padding:12px 16px;border:0;border-radius:24px;background:#1a7f37;color:#fff;font:bold 15px sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.3)';
b.onclick=function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/yezihalemGitH/jobcodes@e562a31811/rfill.js';document.body.appendChild(s)};
document.body.appendChild(b);
})();
