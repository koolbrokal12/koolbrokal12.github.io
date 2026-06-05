(() => {
  const timeEl = document.getElementById("time");
  const powerEl = document.getElementById("power");
  const cameraView = document.getElementById("camera-view");
  const camBtns = document.querySelectorAll(".cam-btn");
  const toggleLight = document.getElementById("toggle-light");
  const toggleLeftDoor = document.getElementById("toggle-left-door");
  const toggleRightDoor = document.getElementById("toggle-right-door");
  const leftDoorStateEl = document.getElementById("left-door-state");
  const rightDoorStateEl = document.getElementById("right-door-state");
  const lightStateEl = document.getElementById("light-state");
  const message = document.getElementById("message");
  const office = document.getElementById("player-office");
  const cameraLabel = document.getElementById("camera");
  const nightEl = document.getElementById("night");
  const mainMenu = document.getElementById("main-menu");
  const newGameBtn = document.getElementById("new-game-btn");
  const continueBtn = document.getElementById("continue-btn");
  const menuNightEl = document.getElementById("menu-night");
  const phoneCallBtn = document.getElementById("phone-call-btn");
  const phoneMuteBtn = document.getElementById("phone-mute-btn");
  const phoneBubble = document.getElementById("phone-bubble");

  let currentCam = 0;
  let power = 100;
  let hour = 0; // 0..6 representing 12AM-6AM
  let night = 1;
  let running = false;
  let seconds = 0;
  let phoneMuted = false;

  const rooms = ["Storage", "Hallway", "Stage"];

  const anims = [
    { name: "Bonnie", pos: 0, moveChance: 0.18, type: "standard" },
    { name: "Chica", pos: 0, moveChance: 0.12, type: "standard" },
    { name: "Freddy", pos: 0, moveChance: 0.14, type: "freddy", patience: 0 },
    { name: "Foxy", pos: 0, moveChance: 0.13, type: "foxy", unseenTicks: 0 },
    { name: "Golden Freddy", pos: 0, moveChance: 0.04, type: "golden" },
  ];

  function animSide(a) {
    // Bonnie and Foxy are on the right, Chica and Freddy (and Golden Freddy) are on the left
    const right = ["Bonnie", "Foxy"];
    return right.includes(a.name) ? "right" : "left";
  }

  function animEmoji(a) {
    if (a.type === "golden") return "👑";
    if (a.name.toLowerCase().includes("bonnie")) return "🐰";
    if (a.name.toLowerCase().includes("chica")) return "🐔";
    if (a.name.toLowerCase().includes("freddy")) return "🐻";
    if (a.name.toLowerCase().includes("foxy")) return "🦊";
    return "👾";
  }

  const staticOverlay = document.getElementById("static-overlay");
  function showStatic(ms = 1200) {
    if (!staticOverlay) return;
    staticOverlay.classList.add("active");
    setTimeout(() => staticOverlay.classList.remove("active"), ms);
  }

  function renderStatus() {
    const displayHour = hour === 0 ? 12 : hour;
    if (nightEl) nightEl.textContent = night;
    timeEl.textContent = `${displayHour} AM`;
    powerEl.textContent = Math.max(0, Math.floor(power)) + "%";
    if (cameraLabel) {
      cameraLabel.textContent =
        currentCam !== null ? `Cam ${currentCam + 1}` : "None";
    }
    updateCameraViews();
    saveGameState();
    savePrefs();
  }

  function getSavedState() {
    try {
      return JSON.parse(localStorage.getItem("fnaf-save"));
    } catch (e) {
      return null;
    }
  }

  function hasSavedGame() {
    return !!getSavedState();
  }

  function saveGameState() {
    if (!running) return;
    const save = {
      night,
      hour,
      power,
      currentCam,
      lightOn,
      leftDoorClosed,
      rightDoorClosed,
      seconds,
      anims: anims.map((a) => ({
        name: a.name,
        pos: a.pos,
        moveChance: a.moveChance,
        patience: a.patience,
        unseenTicks: a.unseenTicks,
        type: a.type,
      })),
    };
    localStorage.setItem("fnaf-save", JSON.stringify(save));
  }

  function loadGameState() {
    const save = getSavedState();
    if (!save) return false;
    night = save.night;
    hour = save.hour;
    power = save.power;
    currentCam = save.currentCam;
    lightOn = save.lightOn;
    leftDoorClosed = !!save.leftDoorClosed;
    rightDoorClosed = !!save.rightDoorClosed;
    seconds = save.seconds || 0;
    anims.forEach((a) => {
      const saved = save.anims.find((item) => item.name === a.name);
      if (saved) {
        a.pos = saved.pos;
        a.moveChance = saved.moveChance;
        if (a.type === "freddy") a.patience = saved.patience || 0;
        if (a.type === "foxy") a.unseenTicks = saved.unseenTicks || 0;
      }
    });
    document.querySelector(".room").classList.toggle("light-on", lightOn);
    document
      .querySelector(".room")
      .classList.toggle("door-closed", leftDoorClosed || rightDoorClosed);
    lightStateEl.textContent = lightOn ? "On" : "Off";
    if (leftDoorStateEl)
      leftDoorStateEl.textContent = leftDoorClosed ? "Closed" : "Open";
    if (rightDoorStateEl)
      rightDoorStateEl.textContent = rightDoorClosed ? "Closed" : "Open";
    return true;
  }

  // preferences (persisted independent of running state)
  function getPrefs() {
    try {
      return JSON.parse(localStorage.getItem("fnaf-prefs")) || {};
    } catch (e) {
      return {};
    }
  }

  function savePrefs() {
    try {
      const p = { phoneMuted };
      localStorage.setItem("fnaf-prefs", JSON.stringify(p));
    } catch (e) {}
  }

  // Phone Guy content and playback (uses SpeechSynthesis when available)
  const phoneGuyLines = [
    "Hello? Hello? Hey, uh, you're doing great for your first night.",
    "Um, don't worry too much — just keep an eye on the cameras and conserve power",
    "The doors will stop animatronics when closed, and the lights will help you see in the office.",
    "Uh, good luck. It's going to be a long night.",
  ];

  function showPhoneBubble(text, timeout = 4000) {
    if (!phoneBubble) return;
    phoneBubble.textContent = text;
    phoneBubble.classList.remove("hidden");
    clearTimeout(phoneBubble._t);
    phoneBubble._t = setTimeout(
      () => phoneBubble.classList.add("hidden"),
      timeout,
    );
  }

  function speakLine(text) {
    if (phoneMuted) return Promise.resolve();
    return new Promise((resolve) => {
      showPhoneBubble(text);
      if (window.speechSynthesis) {
        const ut = new SpeechSynthesisUtterance(text);
        ut.rate = 1;
        ut.pitch = 0.9;
        ut.onend = () => resolve();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(ut);
      } else {
        // fallback: just show bubble then resolve
        setTimeout(resolve, 1600 + Math.min(3000, text.length * 40));
      }
    });
  }

  async function playPhoneGuyIntro() {
    for (const line of phoneGuyLines) {
      await speakLine(line);
      await new Promise((r) => setTimeout(r, 300));
    }
    phoneBubble.classList.add("hidden");
  }

  function setMenuNight() {
    if (menuNightEl) menuNightEl.textContent = night;
  }

  function updateContinueButton() {
    if (!continueBtn) return;
    continueBtn.disabled = !hasSavedGame();
  }

  function showActiveCamera() {
    cameraView
      .querySelectorAll(".camera")
      .forEach((c) => c.classList.add("hidden"));
    const active = cameraView.querySelector(
      `.camera[data-cam="${currentCam}"]`,
    );
    if (active) active.classList.remove("hidden");
    camBtns.forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.cam) === currentCam),
    );
  }

  function openMainMenu() {
    if (mainMenu) mainMenu.classList.remove("hidden");
    running = false;
    setMenuNight();
    updateContinueButton();
    renderStatus();
  }

  function closeMenu() {
    if (mainMenu) mainMenu.classList.add("hidden");
    running = true;
    showActiveCamera();
    renderStatus();
    startAmbient();
  }

  function resetGameState() {
    night = 1;
    hour = 0;
    seconds = 0;
    power = 100;
    currentCam = 0;
    lightOn = false;
    leftDoorClosed = false;
    rightDoorClosed = false;
    anims.forEach((a) => {
      a.pos = 0;
      if (a.name === "Bonnie") a.moveChance = 0.18;
      if (a.name === "Chica") a.moveChance = 0.12;
      if (a.name === "Freddy") a.moveChance = 0.14;
      if (a.name === "Foxy") a.moveChance = 0.13;
      if (a.type === "freddy") a.patience = 0;
      if (a.type === "foxy") a.unseenTicks = 0;
    });
    document.body.style.filter = "";
    document.querySelector(".room").classList.remove("light-on", "door-closed");
    lightStateEl.textContent = "Off";
    if (leftDoorStateEl) leftDoorStateEl.textContent = "Open";
    if (rightDoorStateEl) rightDoorStateEl.textContent = "Open";
    cameraView.querySelectorAll(".camera").forEach((c, i) => {
      c.classList.toggle("hidden", i !== 0);
    });
    camBtns.forEach((b, i) => b.classList.toggle("active", i === 0));
    setNightDifficulty();
    renderStatus();
  }

  function updateCameraViews() {
    rooms.forEach((_, i) => {
      const view = document.querySelector(
        `.camera[data-cam="${i}"] .camera-visitors`,
      );
      if (!view) return;
      const visitors = anims.filter((a) => a.pos === i).map((a) => a.name);
      view.textContent = visitors.length
        ? `Visitors: ${visitors.join(", ")}`
        : "Visitors: None";
    });
    // door-specific visitors & lights
    const leftDoorVisitors = anims
      .filter((a) => a.pos === 2 && animSide(a) === "left")
      .map((a) => a.name);
    const rightDoorVisitors = anims
      .filter((a) => a.pos === 2 && animSide(a) === "right")
      .map((a) => a.name);
    if (leftDoorStateEl)
      leftDoorStateEl.textContent = leftDoorVisitors.length
        ? `Close: ${leftDoorVisitors.join(", ")}`
        : leftDoorClosed
          ? "Closed"
          : "Open";
    if (rightDoorStateEl)
      rightDoorStateEl.textContent = rightDoorVisitors.length
        ? `Close: ${rightDoorVisitors.join(", ")}`
        : rightDoorClosed
          ? "Closed"
          : "Open";
    const leftDoorLight = document.getElementById("left-door-light");
    const rightDoorLight = document.getElementById("right-door-light");
    if (leftDoorLight)
      leftDoorLight.classList.toggle(
        "active",
        leftDoorVisitors.length > 0 || leftDoorClosed,
      );
    if (rightDoorLight)
      rightDoorLight.classList.toggle(
        "active",
        rightDoorVisitors.length > 0 || rightDoorClosed,
      );

    const officeVisitors = anims.filter((a) => a.pos >= 3).map((a) => a.name);
    office.textContent = officeVisitors.length
      ? `Office — Close: ${officeVisitors.join(", ")}`
      : "Office";

    // update camera overlays with anim icons
    rooms.forEach((_, i) => {
      const overlay = document.querySelector(
        `.camera[data-cam="${i}"] .camera-overlay`,
      );
      if (!overlay) return;
      overlay.innerHTML = "";
      const icons = anims
        .filter((a) => a.pos === i)
        .map((a) => {
          const s = document.createElement("span");
          s.className = "anim-icon";
          s.textContent = animEmoji(a);
          return s;
        });
      icons.forEach((n) => overlay.appendChild(n));
    });
  }

  function setNightDifficulty() {
    anims.forEach((a) => {
      if (a.name === "Bonnie") a.moveChance = 0.18 + (night - 1) * 0.06;
      if (a.name === "Chica") a.moveChance = 0.12 + (night - 1) * 0.06;
      if (a.name === "Freddy") a.moveChance = 0.14 + (night - 1) * 0.05;
      if (a.name === "Foxy") a.moveChance = 0.13 + (night - 1) * 0.05;
      if (a.type === "golden") a.moveChance = 0.04 + (night - 1) * 0.05;
    });
  }

  function advanceNight() {
    showMessage(`Night ${night} complete! Starting Night ${night + 1}...`);
    night += 1;
    hour = 0;
    seconds = 0;
    power = 100;
    currentCam = 0;
    lightOn = false;
    leftDoorClosed = false;
    rightDoorClosed = false;
    anims.forEach((a) => {
      a.pos = 0;
      if (a.type === "freddy") a.patience = 0;
      if (a.type === "foxy") a.unseenTicks = 0;
    });
    setNightDifficulty();
    document.querySelector(".room").classList.remove("light-on", "door-closed");
    lightStateEl.textContent = "Off";
    if (leftDoorStateEl) leftDoorStateEl.textContent = "Open";
    if (rightDoorStateEl) rightDoorStateEl.textContent = "Open";
    cameraView.querySelectorAll(".camera").forEach((c, i) => {
      c.classList.toggle("hidden", i !== 0);
    });
    camBtns.forEach((b, i) => b.classList.toggle("active", i === 0));
    renderStatus();
    updateCameraViews();
  }

  function showMessage(text) {
    message.textContent = text;
    message.classList.remove("hidden");
    setTimeout(() => message.classList.add("hidden"), 2500);
  }

  camBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      if (!running) return;
      currentCam = Number(btn.dataset.cam);
      cameraView
        .querySelectorAll(".camera")
        .forEach((c) => c.classList.add("hidden"));
      const active = cameraView.querySelector(
        `.camera[data-cam="${currentCam}"]`,
      );
      active.classList.remove("hidden");
      camBtns.forEach((b) => b.classList.toggle("active", b === btn));
      power -= 0.2; // small drain for checking cameras
      renderStatus();
      playClick();
    }),
  );

  newGameBtn?.addEventListener("click", () => {
    resetGameState();
    closeMenu();
    // play Phone Guy intro when starting a new game
    setTimeout(() => playPhoneGuyIntro().catch(() => {}), 300);
  });

  continueBtn?.addEventListener("click", () => {
    if (loadGameState()) {
      closeMenu();
    } else {
      showMessage("No saved night found.");
    }
  });

  // phone controls
  phoneCallBtn?.addEventListener("click", () => {
    playPhoneGuyIntro().catch(() => {});
  });

  phoneMuteBtn?.addEventListener("click", () => {
    phoneMuted = !phoneMuted;
    phoneMuteBtn.classList.toggle("muted", phoneMuted);
    phoneMuteBtn.textContent = phoneMuted
      ? "Unmute Phone Guy"
      : "Mute Phone Guy";
    if (phoneMuted && window.speechSynthesis) window.speechSynthesis.cancel();
    savePrefs();
  });

  let lightOn = false;
  let leftDoorClosed = false;
  let rightDoorClosed = false;

  toggleLight.addEventListener("click", () => {
    if (!running) return;
    lightOn = !lightOn;
    document.querySelector(".room").classList.toggle("light-on", lightOn);
    lightStateEl.textContent = lightOn ? "On" : "Off";
    renderStatus();
    playClick();
  });

  toggleLeftDoor?.addEventListener("click", () => {
    if (!running) return;
    leftDoorClosed = !leftDoorClosed;
    document
      .querySelector(".room")
      .classList.toggle("door-closed", leftDoorClosed || rightDoorClosed);
    if (leftDoorStateEl)
      leftDoorStateEl.textContent = leftDoorClosed ? "Closed" : "Open";
    renderStatus();
    playClick();
  });

  toggleRightDoor?.addEventListener("click", () => {
    if (!running) return;
    rightDoorClosed = !rightDoorClosed;
    document
      .querySelector(".room")
      .classList.toggle("door-closed", leftDoorClosed || rightDoorClosed);
    if (rightDoorStateEl)
      rightDoorStateEl.textContent = rightDoorClosed ? "Closed" : "Open";
    renderStatus();
    playClick();
  });

  function checkLose() {
    for (const a of anims) {
      if (a.pos >= 3) {
        // in office — determine which door would block them
        const side = animSide(a);
        const blocked = side === "left" ? leftDoorClosed : rightDoorClosed;
        if (!blocked && !lightOn) {
          lose(a.name);
          return true;
        }
        if (!blocked && lightOn) {
          lose(a.name);
          return true;
        }
        // if door blocked, they can't get in
      }
    }
    return false;
  }

  function lose(name) {
    running = false;
    stopAmbient();
    showMessage("JUMPSCARED by " + name + "! You lost.");
    document.body.style.filter = "brightness(0.3)";
    triggerJumpscare(name);
  }

  function win() {
    running = false;
    stopAmbient();
    showMessage("You survived the night! You win!");
    document.body.style.filter = "brightness(1.2)";
    document.getElementById("end-controls").classList.remove("hidden");
  }

  // --- audio helpers (WebAudio synths) ---
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  let ambientOsc;
  let ambientAudio = null;
  let clickAudio = null;
  let jumpscareAudio = null;
  const jumpscareImg = document.getElementById("jumpscare-img");
  const jumpscareText = document.getElementById("jumpscare-text");
  const restartBtn = document.getElementById("restart-btn");

  function playTone(freq = 440, time = 0.12, type = "sine", volume = 0.08) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = volume;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + time);
  }

  // playClick is defined later to prefer file-backed click sounds

  function startAmbient() {
    // prefer audio file if available
    if (ambientAudio) {
      ambientAudio.loop = true;
      ambientAudio.volume = 0.25;
      ambientAudio.play().catch(() => {});
      return;
    }
    try {
      ambientOsc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      ambientOsc.type = "sine";
      ambientOsc.frequency.value = 60;
      g.gain.value = 0.008;
      ambientOsc.connect(g);
      g.connect(audioCtx.destination);
      ambientOsc.start();
    } catch (e) {
      /* ignore */
    }
  }

  function stopAmbient() {
    if (ambientOsc) ambientOsc.stop();
    if (ambientAudio) {
      try {
        ambientAudio.pause();
        ambientAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  function triggerJumpscare(kind) {
    stopAmbient();
    // use file if available
    if (jumpscareAudio) {
      jumpscareAudio.play().catch(() => {});
    } else {
      playTone(60, 0.4, "sawtooth", 0.3);
      playTone(420, 0.8, "sawtooth", 0.12);
      playTone(1400, 0.18, "square", 0.1);
    }
    const j = document.getElementById("jumpscare");
    // golden special: flash static briefly
    if (kind && kind.toLowerCase().includes("golden")) showStatic(900);
    // apply golden style when appropriate
    j.classList.toggle(
      "jumpscare-golden",
      !!(kind && kind.toLowerCase().includes("golden")),
    );
    // show image if available, otherwise text
    if (jumpscareImg && jumpscareImg.src) {
      jumpscareImg.classList.remove("hidden");
      jumpscareText.classList.add("hidden");
    } else {
      jumpscareText.classList.remove("hidden");
      jumpscareImg.classList.add("hidden");
    }
    j.classList.remove("hidden");
    j.setAttribute("aria-hidden", "false");
    // show restart
    document.getElementById("end-controls").classList.remove("hidden");
  }

  function hideJumpscare() {
    const j = document.getElementById("jumpscare");
    j.classList.add("hidden");
    j.setAttribute("aria-hidden", "true");
    jumpscareImg.classList.add("hidden");
    jumpscareText.classList.remove("hidden");
    document.getElementById("end-controls").classList.add("hidden");
  }

  restartBtn?.addEventListener("click", () => {
    // reset state
    hideJumpscare();
    running = true;
    power = 100;
    hour = 0;
    night = 1;
    seconds = 0;
    currentCam = 0;
    lightOn = false;
    leftDoorClosed = false;
    rightDoorClosed = false;
    anims.forEach((a) => {
      a.pos = 0;
      if (a.name === "Bonnie") a.moveChance = 0.18;
      if (a.name === "Chica") a.moveChance = 0.12;
      if (a.name === "Freddy") a.moveChance = 0.14;
      if (a.name === "Foxy") a.moveChance = 0.13;
      if (a.type === "freddy") a.patience = 0;
      if (a.type === "foxy") a.unseenTicks = 0;
    });
    document.body.style.filter = "";
    document.querySelector(".room").classList.remove("light-on", "door-closed");
    lightStateEl.textContent = "Off";
    if (leftDoorStateEl) leftDoorStateEl.textContent = "Open";
    if (rightDoorStateEl) rightDoorStateEl.textContent = "Open";
    cameraView.querySelectorAll(".camera").forEach((c, i) => {
      c.classList.toggle("hidden", i !== 0);
    });
    camBtns.forEach((b, i) => b.classList.toggle("active", i === 0));
    setNightDifficulty();
    renderStatus();
    startAmbient();
  });

  // --- asset loading: try to use real files if present ---
  async function tryLoadAsset(url) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) return null;
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      return obj;
    } catch (e) {
      return null;
    }
  }

  (async function loadAssets() {
    const base = "assets/";
    const amb = await tryLoadAsset(base + "ambient.mp3");
    if (amb) {
      ambientAudio = new Audio(amb);
    }
    const clk = await tryLoadAsset(base + "click.mp3");
    if (clk) {
      clickAudio = new Audio(clk);
      clickAudio.volume = 0.6;
    }
    const js = await tryLoadAsset(base + "jumpscare.mp3");
    if (js) {
      jumpscareAudio = new Audio(js);
      jumpscareAudio.volume = 0.9;
    }
    const img = await tryLoadAsset(base + "jumpscare.png");
    if (img && jumpscareImg) {
      jumpscareImg.src = img;
    }
  })();

  // prefer file click
  function playClick() {
    if (clickAudio) {
      clickAudio.currentTime = 0;
      clickAudio.play().catch(() => {});
    } else playTone(1200, 0.06, "square", 0.04);
  }

  function gameTick() {
    if (!running) return;
    // advance deterministic time: every N seconds increment hour
    seconds += 1;
    const secondsPerHour = 10; // quick demo; adjust for longer nights
    if (seconds % secondsPerHour === 0) {
      hour = Math.min(6, hour + 1);
      // small event: anims become slightly more aggressive
      anims.forEach((a) => (a.moveChance = Math.min(0.6, a.moveChance + 0.03)));
    }

    // power drain
    let drain = 0.05;
    if (lightOn) drain += 0.35;
    if (leftDoorClosed || rightDoorClosed) drain += 0.15;
    if (currentCam !== null) drain += 0.12;
    power -= drain;
    if (power <= 0) {
      power = 0;
      lose("Power Loss");
    }

    // animatics move with more interesting behavior
    for (const a of anims) {
      if (a.type === "freddy") {
        if (currentCam === 2 && a.pos >= 2) {
          if (Math.random() < 0.55) {
            a.pos = Math.max(0, a.pos - 1);
            a.patience = 0;
          }
          continue;
        }

        if (currentCam !== 2) {
          a.patience = Math.min(5, a.patience + 1);
        }

        const freddyChance = a.moveChance + hour * 0.03 + a.patience * 0.04;
        if (Math.random() < freddyChance) {
          a.pos = Math.min(3, a.pos + 1);
          a.patience = 0;
        }
        if (
          (animSide(a) === "left" && leftDoorClosed) ||
          (animSide(a) === "right" && rightDoorClosed)
        ) {
          if (a.pos >= 3) a.pos = 2;
        }
        continue;
      }

      if (a.type === "foxy") {
        if (currentCam === 1 && a.pos >= 1) {
          if (Math.random() < 0.4) {
            a.pos = Math.max(0, a.pos - 1);
          }
          a.unseenTicks = 0;
        } else {
          a.unseenTicks = Math.min(6, a.unseenTicks + 1);
        }

        const foxyChance = a.moveChance + hour * 0.04 + a.unseenTicks * 0.05;
        if (Math.random() < foxyChance) {
          a.pos = Math.min(3, a.pos + 1);
        }
        if (
          (animSide(a) === "left" && leftDoorClosed) ||
          (animSide(a) === "right" && rightDoorClosed)
        ) {
          if (a.pos >= 3) a.pos = 2;
        }
        continue;
      }

      // if player is viewing the anim's room, they may retreat
      if (currentCam !== null && a.pos === currentCam) {
        if (Math.random() < 0.45) {
          a.pos = Math.max(0, a.pos - 1);
          continue;
        }
      }

      // normal advance
      if (Math.random() < a.moveChance + hour * 0.03) {
        a.pos = Math.min(3, a.pos + 1);
      }
      // small chance to backtrack
      if (Math.random() < 0.02) a.pos = Math.max(0, a.pos - 1);

      // Golden Freddy special: when reaching office, high chance to cause instant jump
      if (a.type === "golden" && a.pos >= 3) {
        if (Math.random() < 0.6) {
          lose(a.name);
          return;
        } else {
          showMessage("Golden Freddy vanished...");
          a.pos = 0;
          continue;
        }
      }
    }

    // update office indicator
    const close = anims
      .filter((a) => a.pos >= 2)
      .map((a) => a.name)
      .join(", ");
    office.textContent = close ? "Office — Close: " + close : "Office";

    // win condition
    if (hour >= 6) {
      if (night < 5) {
        advanceNight();
        return;
      }
      win();
      return;
    }

    renderStatus();
    checkLose();
  }

  // start with camera 1 active
  cameraView.querySelectorAll(".camera").forEach((c, i) => {
    if (i !== 0) c.classList.add("hidden");
  });
  camBtns.forEach((b, i) => b.classList.toggle("active", i === 0));

  // load prefs
  (function initPrefs() {
    const p = getPrefs();
    phoneMuted = !!p.phoneMuted;
    if (phoneMuteBtn) {
      phoneMuteBtn.classList.toggle("muted", phoneMuted);
      phoneMuteBtn.textContent = phoneMuted
        ? "Unmute Phone Guy"
        : "Mute Phone Guy";
    }
  })();

  // show menu on load
  openMainMenu();

  // keyboard controls: 1-3 cameras, L light, D door
  window.addEventListener("keydown", (e) => {
    if (!running) return;
    if (e.key === "l" || e.key === "L") toggleLight.click();
    if (e.key === "d" || e.key === "D") {
      if (toggleLeftDoor) toggleLeftDoor.click();
      if (toggleRightDoor) toggleRightDoor.click();
    }
    if (["1", "2", "3"].includes(e.key)) {
      const idx = Number(e.key) - 1;
      const btn = Array.from(camBtns)[idx];
      if (btn) btn.click();
    }
  });

  // main loop
  setInterval(gameTick, 1000);
  renderStatus();

  // expose minimal demo controls via console
  window.__FNAF = { anims };
})();
