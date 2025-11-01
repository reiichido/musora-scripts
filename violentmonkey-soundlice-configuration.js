// ==UserScript==
// @name        SoundSlice automation
// @namespace   Violentmonkey Scripts
// @match       *://www.soundslice.com/slices/*
// @match       *://www.soundslice.com/scores/*
// @grant       none
// @version     1.2
// @author      -
// @description 8/20/2025, 9:46:19 AM
// ==/UserScript==

var configJson = {
  doWaitMessage: true,
  hideVideo: false,
  metronome: {
    enable: false,
    volume: 20,
    // 0- Only downbeats
    // 1- Every beat
    option:0,
    countIn: {
      enable: false,
      // 1- Before plaback
      // 2- During loops
      // 3- Always
      option: 3,
      // 1-3
      barCount: 1
    },
  },
  speed: 100,
  video : {
    useSynth: false,
    // useSynth false AND drumless available
    useDrumless: false
  },
  useLoop: false,
	settings: {
    masterVolume: 70,
		// -21 -> 60, default 0
		zoomLevel: 0,
		layout: {
			// scrollable / paged, default scrollable
			mode: "scrollable",
			scrollable: {
				// default false
				horizontalNotation: false,
				// if true, default false
				proportionalNotation: false,
				// if proportionalNotation false
				// min 25, max: screen dependant
				staveWidth: {
					doModify: false,
					doFitToScreen: false,
					value: 25
				},
				// if proportionalNotation true
				// 20-80, default 50
				value: 50

			},
			paged: {
				// if proportionalNotation false
				// min 25, max: screen dependant
				staveWidth: {
					doModify: false,
					doFitToScreen: false,
					value: 25
				},
				// if proportionalNotation true
				// auto/1/2, deafult auto
				pagePerSecond:"auto"
			}
		},
    // Synth only
		transposition: {
			// -12 -> 12, default 0
			note: 0,
      // 1- Audio and notation (default)
      // 2- Notation only
      // 3- Audio only
      transpositionPreference: 2
		},
		playHeadStyle: {
      // 1- Only scroll when necessary
      // 2- Keep playhead at top of screen (default)
      // 3- Disable automatic scrolling
      // 4- Keep playhead in middle of screen
      scrollType: 2,
			// 1-4, default 1
			shape: 1,
			// 1-4, default 1
			color: 1,
			// default true
			highlightNotes: true,
			// deafult false
			highlightBar: false
		},
    // 0 - 1000
    audioLatency: 0
	},
  timeout: 700,
	temp: 1
};

if(!window.location.pathname.includes("embed") || !configJson.doWaitMessage) {
  configJson.metronome.countIn.enable=true;
  configJson.video.useSynth = false;
  configJson.timeout = 1000;
  processConfiguration();
} else {
if(configJson.doWaitMessage) {
  window.addEventListener('message', event => {
    if(event.data.custom) {
      var caller = event.data.caller;
      // TODO override config for specific caller
      switch(event.data.caller.split("/")[4]) {
        case "songs":
          //configJson.hideVideo=false;
          configJson.settings.masterVolume=90;
          configJson.metronome.enable=false;
          configJson.metronome.volume=40;
          configJson.metronome.countIn.enable=true;
          break;
        case "method":
          configJson.settings.masterVolume=90;
          configJson.metronome.enable=true;
          configJson.metronome.volume=40;
          configJson.metronome.countIn.enable=true;
          break;
          case "challenge":
          break;
          case "workouts":
          break;
        case "packs":
          configJson.hideVideo=true;
          break;
        case "courses":
          break;
        case "quick-tips":
          break;
        case "rudiments":
          break;
      }
      processConfiguration();
    }
  });
}}

function processConfiguration() {
  setTimeout(() => {
    hideVideo(configJson.hideVideo);
    setMetronome(configJson.metronome);
    setLoop(configJson.useLoop);
    setVideo(configJson.video);
    setSpeed(configJson.speed);
    setSettings(configJson.settings);

    // Does not work in FF
    //setFullScreen();
  }, configJson.timeout);
}

function hideVideo(option) {
  if(option && document.getElementById("video-sidebar")) {
    document.getElementById("video-sidebar").style.cssText = "visibility:collapse";
  }
}

function setMetronome(options) {
  handleCheckBoxChange("toggle-metronome", options.enable);
  if(options.enable) {
    handleInputValueChange("metronomevol", options.volume);
    handleInputValueChange("metronome-every-beat", options.option);
  }
  var countinOptions = options.countIn;
  handleCheckBoxChange("countin-toggle", countinOptions.enable);
  if(countinOptions.enable) {
      handleInputValueChange("metronome-loop-countin", countinOptions.option);
      handleInputValueChange("countinlen", countinOptions.barCount);
  }
}

function setSpeed(speed, doObserve = true) {
  if(speed) {
    document.querySelector(".speedvalue").dispatchEvent(getMouseDownEvent());
    document.querySelector(".speedinp").value = speed;
    document.querySelector(".speedvalue").dispatchEvent(getMouseDownEvent());
    if(doObserve) {
      var observer = new MutationObserver(function (mutations) {
        if(mutations.length === 1) {
          setSpeed(speed, false);
          observer.disconnect();
        }
      });

      let options = {
        childList: true,
        subtree: true
      };

      observer.observe(document.querySelector(".speedvaluetext"), options);
    } else {
      document.querySelector(".speedbut-plus").dispatchEvent(getMouseDownEvent());
    }
  }
}

function setVideo(options) {
  if(options.useSynth) {
    document.getElementById("usesynth").click();
  } else {
    document.getElementById("midi-toggle").dispatchEvent(getMouseDownEvent());
    var isDrumlessActive = isButtonActive(document.getElementById("realrectoggle").querySelector("#synth-toggle-tooltip"));
    if(isDrumlessActive) {
      var drumlessOpt = options.useDrumless ? 1 : 0
      document.getElementById("realrectoggle").querySelectorAll("label.visible")[drumlessOpt].click()
    }
  }
}

function setLoop(ok = true) {
  var loopButton = document.getElementsByClassName("loopbutton")[0];
  if((ok && !isButtonActive(loopButton)) || (!ok && isButtonActive(loopButton))) {
    loopButton.dispatchEvent(getPointerDownEvent());
  }
}

function setFullScreen(ok = true) {
  var pointerDownEvent = new PointerEvent("pointerdown", {bubbles: true, cancellable: false});
  var fullscreenButton = document.getElementById("fullscreenbutton");
  if((ok && !isButtonActive(fullscreenButton)) || (!ok && isButtonActive(fullscreenButton))) {
    fullscreenButton.click();
    fullscreenButton.dispatchEvent(getMouseDownEvent());
  }
}

function setSettings(config) {
  var settingsButton = document.getElementById("toggle-settings");
  settingsButton.dispatchEvent(getPointerDownEvent());

  setTimeout(() => {
    handleInputValueChange("mainvol", config.masterVolume);
    handleInputValueChange("resizerange", config.zoomLevel);

    setLayout(config.layout);
    setSettingsTransposition(config.transposition);
    setSettingsPlayHeadStyle(config.playHeadStyle);
    setAudioLatency(config.audioLatency);

    settingsButton.dispatchEvent(getPointerDownEvent());

  }, 1000);
}

function setLayout(options) {
  if(options.mode === "scrollable") {
    setLayoutScrollable(options.scrollable);
  } else if(options.mode === "paged") {
    setLayoutPaged(options.paged);
  }
}

function setLayoutScrollable(options) {
  var scrollableCheckBox = document.getElementById("vtform").getElementsByTagName("input")[0];
  if(!scrollableCheckBox.checked) {
    scrollableCheckBox.click();
  }

  var horizontalNotationButton = document.getElementById("horiztoggle");
  if(options.horizontalNotation && !isButtonActive(horizontalNotationButton) || !options.horizontalNotation && isButtonActive(horizontalNotationButton)) {
      horizontalNotationButton.dispatchEvent(getPointerDownEvent());
  }

  if(!options.horizontalNotation) {
    setLayoutStaveWidth(options.staveWidth);
  } else {
    handleCheckBoxChange("proportionalckbox", options.proportionalNotation);
    if(options.proportionalNotation) {
      handleInputValueChange("proportionalslider", options.value);
    }
  }
}

function setLayoutPaged(options) {
  var pageCheckBox = document.getElementById("vtform").getElementsByTagName("input")[1];
    if(!pageCheckBox.checked) {
      pageCheckBox.click();
    }

  setLayoutStaveWidth(options.staveWidth);

  var ppsOpt = 0;
  switch(options.pagePerSecond) {
      case "auto":
        ppsOpt = 0;
        break;
      case "1":
        ppsOpt = 1;
        break;
      case "2":
        ppsOpt = 2;
        break;
  }
  var ppsOptChk = document.getElementById("numpagesui").getElementsByTagName("input")[ppsOpt];
  ppsOptChk.dispatchEvent(getChangeEvent());
}

function setLayoutStaveWidth(options) {
  if(options.doModify) {
    var staveWidthElement = document.getElementById("stavewidthrg");
    var value = options.value;
    if(options.doFitToScreen) {
      value = staveWidthElement.max;
    }
    handleInputValueChange("stavewidthrg", value);
  }
}
function setSettingsTransposition(options) {
  handleInputValueChange("transposeslider", options.note)
  if(document.getElementById("usesynth").classList.contains("toggle-active")) {
    handleInputValueChange("transposepref", options.transpositionPreference);
  }
}

function setSettingsPlayHeadStyle(options) {
  handleInputValueChange("scrolltype", options.scrollType);
  handleInputValueChange("playhead-shape", options.shape);
  handleInputValueChange("playhead-color", options.color);
  handleCheckBoxChange("highlight-notes", options.highlightNotes);
  handleCheckBoxChange("highlight-bar-option", options.highlightBar);
}

function setAudioLatency(options) {
  handleInputValueChange("audio-latency-range", options, getInputEvent);
}

function isButtonActive(button) {
  return button.classList.contains("active");
}

function handleInputValueChange(elementId, value, eventFunction = getChangeEvent) {
  var elt = document.getElementById(elementId);
  elt.value = value;
  elt.dispatchEvent(eventFunction());
}

function handleCheckBoxChange(elementId, value) {
  var elt = document.getElementById(elementId);
  elt.checked = value;
  elt.dispatchEvent(getChangeEvent());
}

function getChangeEvent() {
  return new Event("change", {bubbles: true, cancellable: false});
}

function getInputEvent() {
  return new Event("input", {bubbles: true, cancellable: false});
}

function getPointerDownEvent() {
  return new PointerEvent("pointerdown", {bubbles: true, cancellable: false});
}

function getMouseDownEvent() {
  return new MouseEvent("mousedown", {bubbles: true, cancellable: false});
}

