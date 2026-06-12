// Map data layout structure containing obstacles, enemies, powerups and goals
var levels = [
    {
        name: "Level 1: Ground Zero",
        speed: 3,
        gameObjects: [
            { type: "platform", kind: "basicPlatform", x: 200, y: 250, width: 150, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 500, y: 180, width: 150, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 800, y: 230, width: 150, height: 20 },
            { type: "obstacle", kind: "spikes", x: 400, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "obstacle", kind: "spikes", x: 700, y: 300, width: 40, height: 40, hp: 1 },
            { type: "obstacle", kind: "spikes", x: 1100, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "enemy", kind: "bug", x: 450, y: 280, width: 40, height: 40, speedX: -1, hp: 1 },
            { type: "enemy", kind: "bug", x: 750, y: 280, width: 40, height: 40, speedX: -2, hp: 1 },
            { type: "enemy", kind: "bug", x: 1000, y: 280, width: 40, height: 40, speedX: -1, hp: 2 },
            { type: "powerup", kind: "healthUp", x: 550, y: 120, width: 30, height: 30, collect: true, contactHealthChange: 10 },
            { type: "powerup", kind: "healthUp", x: 850, y: 150, width: 30, height: 30, collect: true, contactHealthChange: 10 },
            { type: "goal", kind: "flag", x: 1400, y: 220, width: 50, height: 80 }
        ]
    },
    {
        name: "Level 2: High Voltage",
        speed: 5,
        gameObjects: [
            { type: "platform", kind: "basicPlatform", x: 200, y: 220, width: 120, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 450, y: 150, width: 120, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 700, y: 250, width: 120, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 950, y: 160, width: 120, height: 20 },
            { type: "obstacle", kind: "spikes", x: 350, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "obstacle", kind: "spikes", x: 600, y: 300, width: 40, height: 40, hp: 1 },
            { type: "obstacle", kind: "spikes", x: 800, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "obstacle", kind: "spikes", x: 1100, y: 300, width: 40, height: 40, hp: 1 },
            { type: "obstacle", kind: "spikes", x: 1300, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "enemy", kind: "bug", x: 300, y: 280, width: 40, height: 40, speedX: -2, hp: 1 },
            { type: "enemy", kind: "bug", x: 550, y: 280, width: 40, height: 40, speedX: -3, hp: 1 },
            { type: "enemy", kind: "bug", x: 850, y: 280, width: 40, height: 40, speedX: -2, hp: 2 },
            { type: "enemy", kind: "bug", x: 1050, y: 280, width: 40, height: 40, speedX: -4, hp: 1 },
            { type: "enemy", kind: "bug", x: 1250, y: 280, width: 40, height: 40, speedX: -1, hp: 3 },
            { type: "powerup", kind: "healthUp", x: 250, y: 150, width: 30, height: 30, collect: true },
            { type: "powerup", kind: "healthUp", x: 500, y: 90, width: 30, height: 30, collect: true },
            { type: "powerup", kind: "healthUp", x: 1000, y: 100, width: 30, height: 30, collect: true },
            { type: "goal", kind: "flag", x: 1600, y: 220, width: 50, height: 80 }
        ]
    },
    {
        name: "Level 3: The Final Challenge",
        speed: 6,
        gameObjects: [
            { type: "platform", kind: "basicPlatform", x: 150, y: 250, width: 100, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 350, y: 180, width: 100, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 600, y: 120, width: 100, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 850, y: 200, width: 100, height: 20 },
            { type: "platform", kind: "basicPlatform", x: 1100, y: 150, width: 100, height: 20 },
            { type: "obstacle", kind: "spikes", x: 300, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "obstacle", kind: "spikes", x: 500, y: 300, width: 40, height: 40, hp: 2 },
            { type: "obstacle", kind: "spikes", x: 550, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "obstacle", kind: "spikes", x: 750, y: 300, width: 40, height: 40, hp: 1 },
            { type: "obstacle", kind: "spikes", x: 950, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "obstacle", kind: "spikes", x: 1200, y: 300, width: 40, height: 40, hp: 1 },
            { type: "obstacle", kind: "spikes", x: 1400, y: 300, width: 40, height: 40, hp: Infinity },
            { type: "enemy", kind: "bug", x: 200, y: 280, width: 40, height: 40, speedX: -3, hp: 1 },
            { type: "enemy", kind: "bug", x: 400, y: 280, width: 40, height: 40, speedX: -4, hp: 2 },
            { type: "enemy", kind: "bug", x: 650, y: 280, width: 40, height: 40, speedX: -2, hp: 3 },
            { type: "enemy", kind: "bug", x: 900, y: 280, width: 40, height: 40, speedX: -5, hp: 1 },
            { type: "enemy", kind: "bug", x: 1150, y: 280, width: 40, height: 40, speedX: -3, hp: 2 },
            { type: "enemy", kind: "bug", x: 1350, y: 280, width: 40, height: 40, speedX: -6, hp: 1 },
            { type: "powerup", kind: "healthUp", x: 200, y: 190, width: 30, height: 30, collect: true },
            { type: "powerup", kind: "healthUp", x: 400, y: 120, width: 30, height: 30, collect: true },
            { type: "powerup", kind: "healthUp", x: 650, y: 60, width: 30, height: 30, collect: true },
            { type: "powerup", kind: "healthUp", x: 900, y: 140, width: 30, height: 30, collect: true },
            { type: "goal", kind: "flag", x: 1750, y: 220, width: 50, height: 80 }
        ]
    }
];