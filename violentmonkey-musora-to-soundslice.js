// ==UserScript==
// @name        Musora send SoundSlice iframe message
// @namespace   Violentmonkey Scripts
// @match       https://www.musora.com/
// @include     /\.musora\.com\/.*\/(songs|method|workouts|packs|courses|quick-tips|rudiments|song-tutorials).*/
// @grant       none
// @version     1.1
// @author      -
// @description 4/13/2024, 12:17:03 PM
// ==/UserScript==

var app = document.querySelector("#app");
if(app) {
  var observerSoundSlice = new MutationObserver(function (mutations) {
    var ssIFrame = document.querySelector("#ssEmbed");
    if(ssIFrame) {
      ssIFrame.onload = function() {
        ssIFrame.contentWindow.postMessage({custom: true, caller: window.location.href}, ssIFrame.src);
        observerSoundSlice.disconnect();
      }
    }
  });

  let options = {
    childList: true,
    subtree: true
  };

  observerSoundSlice.observe(app, options);
}

// Set Vimeo volume
if(app) {
  var observerVimeo = new MutationObserver(function (mutations) {
    var volInput = document.querySelector("input.volume-range");
    if(volInput) {
      setTimeout(() => {
        volInput.value = 70;
        volInput.dispatchEvent(new Event("input", {bubbles: true, cancellable: false}));
        observerVimeo.disconnect();
      }, 1000);
    }
  });

  let options = {
    childList: true,
    subtree: true
  };

  observerVimeo.observe(app, options);
}

