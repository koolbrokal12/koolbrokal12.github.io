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
    // toggleGrid();

    // TODO 2 - Create Platforms
    // Example platforms (x, y, width, height, color)
    createPlatform(200, 520, 300, 20, "green");
    createPlatform(600, 420, 240, 20, "orange");
    createPlatform(1000, 300, 280, 20, "purple");

    // TODO 3 - Create Collectables
    // Example collectables (type, x, y, gravity, bounce)
    createCollectable("diamond", 320, 480, 0, 0.6);
    createCollectable("database", 680, 360, 0, 0.6);

    // TODO 4 - Create Cannons

    // Example cannons (side, position, delay)
    createCannon("top", 700, 2000);
    createCannon("left", 450, 2500);

    //////////////////////////////////
    // ONLY CHANGE ABOVE THIS POINT //
    //////////////////////////////////
  }

  registerSetup(setup);
});
