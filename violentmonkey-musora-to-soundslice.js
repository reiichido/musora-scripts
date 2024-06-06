// ==UserScript==
// @name        Musora send SoundSlice iframe message
// @namespace   Violentmonkey Scripts
// @match       https://www.musora.com/
// @include     /\.musora\.com\/.*\/(songs|method|workouts|packs|courses|quick-tips|rudiments).*/
// @grant       none
// @version     1.0
// @author      rei.ichido
// @description 4/13/2024, 12:17:03 PM
// ==/UserScript==

var app = document.getElementById("app");
if(app) {
  var observer = new MutationObserver(function (mutations) {
    var ssIFrame = document.getElementById("ssEmbed");
    if(ssIFrame) {
      document.getElementById("ssEmbed").onload = function() {
        ssIFrame.contentWindow.postMessage({custom: true, caller: window.location.href}, ssIFrame.src);
        observer.disconnect();
      }
    }
  });

  let options = {
    childList: true,
    subtree: true
  };

  observer.observe(document.getElementById("app"), options);
}
