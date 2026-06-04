(() => {
  const timeEl = document.getElementById("time");
  const powerEl = document.getElementById("power");
  const cameraView = document.getElementById("camera-view");
  const camBtns = document.querySelectorAll(".cam-btn");
  const toggleLight = document.getElementById("toggle-light");
  const toggleDoor = document.getElementById("toggle-door");
  const doorStateEl = document.getElementById("door-state");
  const lightStateEl = document.getElementById("light-state");
  const message = document.getElementById("message");
  const office = document.getElementById("player-office");
  const cameraLabel = document.getElementById("camera");

  let currentCam = 0;
  let power = 100;
  let hour = 0; // 0..6 representing 12AM-6AM
  let running = true;
  let seconds = 0;

  const rooms = ["Storage", "Hallway", "Stage"];

  const anims = [
    { name: "Bonnie", pos: 0, moveChance: 0.18 },
    { name: "Chica", pos: 0, moveChance: 0.12 },
  ];

  function renderStatus() {
    const displayHour = 12 + hour;
    timeEl.textContent = `${displayHour} AM`;
    powerEl.textContent = Math.max(0, Math.floor(power)) + "%";
    if (cameraLabel) {
      cameraLabel.textContent =
        currentCam !== null ? `Cam ${currentCam + 1}` : "None";
    }
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

  let lightOn = false;
  let doorClosed = false;

  toggleLight.addEventListener("click", () => {
    if (!running) return;
    lightOn = !lightOn;
    document.querySelector(".room").classList.toggle("light-on", lightOn);
    lightStateEl.textContent = lightOn ? "On" : "Off";
    renderStatus();
    playClick();
  });

  toggleDoor.addEventListener("click", () => {
    if (!running) return;
    doorClosed = !doorClosed;
    document.querySelector(".room").classList.toggle("door-closed", doorClosed);
    doorStateEl.textContent = doorClosed ? "Closed" : "Open";
    renderStatus();
    playClick();
  });

  function checkLose() {
    for (const a of anims) {
      if (a.pos >= 3) {
        // in office
        if (!doorClosed && !lightOn) {
          lose(a.name);
          return true;
        }
        if (!doorClosed && lightOn) {
          // light lets you see them but they still can get you when close
          lose(a.name);
          return true;
        }
        // if door closed, they can't get in
      }
    }
    return false;
  }

  function lose(name) {
    running = false;
    stopAmbient();
    showMessage("JUMPSCARED by " + name + "! You lost.");
    document.body.style.filter = "brightness(0.3)";
    triggerJumpscare();
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

  function triggerJumpscare() {
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
    seconds = 0;
    currentCam = 0;
    lightOn = false;
    doorClosed = false;
    anims.forEach((a) => {
      a.pos = 0;
      a.moveChance = a.name === "Bonnie" ? 0.18 : 0.12;
    });
    document.body.style.filter = "";
    document.querySelector(".room").classList.remove("light-on", "door-closed");
    lightStateEl.textContent = "Off";
    doorStateEl.textContent = "Open";
    cameraView.querySelectorAll(".camera").forEach((c, i) => {
      c.classList.toggle("hidden", i !== 0);
    });
    camBtns.forEach((b, i) => b.classList.toggle("active", i === 0));
    startAmbient();
    renderStatus();
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
    if (doorClosed) drain += 0.15;
    if (currentCam !== null) drain += 0.12;
    power -= drain;
    if (power <= 0) {
      power = 0;
      lose("Power Loss");
    }

    // animatics move with more interesting behavior
    for (const a of anims) {
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
    }

    // update office indicator
    const close = anims
      .filter((a) => a.pos >= 2)
      .map((a) => a.name)
      .join(", ");
    office.textContent = close ? "Office — Close: " + close : "Office";

    // win condition
    if (hour >= 6) {
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

  // start ambient audio for atmosphere
  startAmbient();

  // keyboard controls: 1-3 cameras, L light, D door
  window.addEventListener("keydown", (e) => {
    if (!running) return;
    if (e.key === "l" || e.key === "L") toggleLight.click();
    if (e.key === "d" || e.key === "D") toggleDoor.click();
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
