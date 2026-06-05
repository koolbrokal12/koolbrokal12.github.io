$(function () {
  // initialize canvas and context when able to
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("load", loadJson);

  function setup() {
    if (firstTimeSetup) {
      halleImage = document.getElementById("player");
      projectileImage = document.getElementById("projectile");
      cannonImage = document.getElementById("cannon");
      $(document).on("keydown", handleKeyDown);
      $(document).on("keyup", handleKeyUp);
      firstTimeSetup = false;
      //start game
      setInterval(main, 1000 / frameRate);
    }

    // Create walls - do not delete or modify this code
    createPlatform(-50, -50, canvas.width + 100, 50); // top wall
    createPlatform(-50, canvas.height - 10, canvas.width + 100, 200, "navy"); // bottom wall
    createPlatform(-50, -50, 50, canvas.height + 500); // left wall
    createPlatform(canvas.width, -50, 50, canvas.height + 100); // right wall

    //////////////////////////////////
    // ONLY CHANGE BELOW THIS POINT //
    //////////////////////////////////

    // TODO 1 - Enable the Grid
    toggleGrid();

    createPlatform(180, 620, 300, 20, "green");
    createPlatform(520, 520, 240, 20, "orange");
    createPlatform(860, 420, 280, 20, "purple");
    createPlatform(1180, 320, 180, 20, "pink");
    createPlatform(300, 420, 220, 20, "cyan", 300, 560, 2, 0, 0, 0); // moving horizontal platform
    createPlatform(620, 520, 180, 20, "yellow", 0, 0, 0, 460, 540, 1); // moving vertical platform
    createBadPlatform(730, 610, 160, 20, "red");

    createCollectable("diamond", 320, 560, 0, 0.6);
    createCollectable("database", 620, 460, 0, 0.6);
    createCollectable("grace", 920, 380, 0, 1, 860, 1120, 2); // moving collectable

    createCannon("top", 700, 2000, 24, 24, 100, 1200, 2); // moving cannon with medium projectiles
    createCannon("left", 450, 2500, 10, 10, 150, 600, 1); // smaller projectiles
    createCannon("right", 300, 3000, 20, 20, 200, 500, 2); // additional cannon to meet project requirements
    createCannon("left", 670, 0, 0, 0, 670, 670, 0, 0);
  }

  registerSetup(setup);
});
