// TODO 2: moveScenery
function moveScenery() {
    // loop through all building objects
    for (var i = 0; i < scenery.building.instances.length; i++) {
        var buildingInstance = scenery.building.instances[i];
        
        // update position based on speeds
        buildingInstance.x = buildingInstance.x + buildingInstance.speedX + currentLevel.speed;
        
        // if it goes off screen left, reset it to the right side loop point
        if (buildingInstance.x + buildingInstance.width < 0) {
            buildingInstance.x = scenery.building.loopWidth;
        }
    }

    // loop through all lamp objects
    for (var j = 0; j < scenery.lamp.instances.length; j++) {
        var lampInstance = scenery.lamp.instances[j];
        
        lampInstance.x = lampInstance.x + lampInstance.speedX + currentLevel.speed;
        
        if (lampInstance.x + lampInstance.width < 0) {
            lampInstance.x = scenery.lamp.loopWidth;
        }
    }
}

// TODO 3: generateLevel
function generateLevel() {
    for (var i = 0; i < currentLevel.gameObjects.length; i++) {
        var currentObject = currentLevel.gameObjects[i];
        
        // call the factory function to build it
        create(currentObject);
        
        // console.log("type: " + currentObject.type + ", kind: " + currentObject.kind); // commented out for final check
    }
}

// TODO 4: Create
function create(obj) {
    // check type and trigger the matching maker function
    if (obj.type === "obstacle") {
        makeObstacle(obj);
    } 
    else if (obj.type === "enemy") {
        makeEnemy(obj);
    } 
    else if (obj.type === "powerup") {
        makePowerup(obj);
    } 
    else if (obj.type === "goal") {
        makeGoal(obj);
    } 
    else if (obj.type === "platform") {
        makePlatform(obj);
    }
}

// TODO 5: Filter
function filterObjects(type) {
    var matched = [];
    
    for (var i = 0; i < gameObjects.length; i++) {
        if (gameObjects[i].type === type) {
            matched.push(gameObjects[i]);
        }
    }
    
    return matched;
}

// TODO 6: moveGameObjects
function moveGameObjects(objectsArray) {
    for (var i = 0; i < objectsArray.length; i++) {
        var currentObject = objectsArray[i];
        
        // moves objects left as hallebot moves right
        currentObject.x = currentObject.x + currentObject.speedX - currentLevel.speed;
        currentObject.y = currentObject.y + currentObject.speedY;
    }
}

// TODO 8: handleProjectileCollisions
function handleProjectileCollisions() {
    for (var i = 0; i < gameObjects.length; i++) {
        var currentObject = gameObjects[i];
        
        // nested loop for the lasers/projectiles
        for (var j = 0; j < projectiles.length; j++) {
            var currentProjectile = projectiles[j];
            
            if (isCollidingWithProjectile(currentProjectile, currentObject) === true) {
                handleProjectileObjectCollision(i, j);
            }
        }
    }
}

// TODO 9: handleHallebotGenericCollisions
function handleHallebotGenericCollisions() {
    for (var i = 0; i < gameObjects.length; i++) {
        var currentObject = gameObjects[i];
        
        // don't check collision if it's a platform layout element
        if (currentObject.type !== "platform") {
            if (isGenericCollision(currentObject) === true) {
                handleHallebotGenericCollision(i);
            }
        }
    }
}

// TODO 10: triggerLevelTransition
function triggerLevelTransition() {
    currentLevelIndex = currentLevelIndex + 1;
    gameObjects = []; // wipe previous level elements
    
    if (currentLevelIndex >= levels.length) {
        player.winConditionMet = true;
    } else {
        currentLevel = levels[currentLevelIndex];
        generateLevel();
    }
}