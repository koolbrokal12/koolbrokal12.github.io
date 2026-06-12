// === SCENERY CREATION ===

/* Important Note:
    The background images will be drawn in order from top to bottom, so put the ones in the far background first, then work forward. Note that none of the background images can go in front of Hallebot.
*/

// scenery configurations for parallax scrolling
// adding different widths and speeds to make it look dimensional
var scenery = {
    building: {
        loopWidth: 1200,
        instances: [
            { x: 0, width: 100, height: 300, speedX: -2 },
            { x: 300, width: 150, height: 400, speedX: -1.5 },
            { x: 650, width: 120, height: 250, speedX: -2.2 },
            { x: 900, width: 180, height: 450, speedX: -1.2 }
        ]
    },
    lamp: {
        loopWidth: 800,
        instances: [
            { x: 150, width: 20, height: 100, speedX: -3 },
            { x: 450, width: 20, height: 100, speedX: -3 },
            { x: 750, width: 20, height: 100, speedX: -3 },
            { x: 1050, width: 20, height: 100, speedX: -3 }
        ]
    }
};