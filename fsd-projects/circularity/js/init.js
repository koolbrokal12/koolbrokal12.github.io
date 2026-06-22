var init = function (window) {
    'use strict';
    var 
        draw = window.opspark.draw,
        physikz = window.opspark.racket.physikz,
        
        app = window.opspark.makeApp(),
        canvas = app.canvas, 
        view = app.view,
        fps = draw.fps('#000');

    window.opspark.makeGame = function() {
        
        window.opspark.game = {};
        var game = window.opspark.game;
        
        ///////////////////
        // PROGRAM SETUP //
        ///////////////////
        
        // TODO 1 : Declare and initialize our variables
        var circle;
        var circles = [];

        // TODO 2 : Create a function that draws a circle
        var drawCircle = function () {
            circle = draw.randomCircleInArea(canvas, true, true, "#999", 2);
            physikz.addRandomVelocity(circle, canvas);
            view.addChild(circle);
            circles.push(circle);
        };

        // Initialize gamification features (unlocked after completing educational TODOs)
        Gamification.init({
            canvas: canvas,
            view: view,
            draw: draw,
            physikz: physikz,
            circles: circles,
            game: game
        });

        // TODO 3 : Call the drawCircle() function

        // all deleted so dont worry MOM it was removed for the loop on Todo 7 and i also found out how to fix 6

// TODO 7 : Use a loop to create multiple circles
        for (var i = 0; i < 100; i++) {
            drawCircle();
        }

        ///////////////////
        // PROGRAM LOGIC //
        ///////////////////
        
        /* 
        This Function is called 60 times/second, producing 60 frames/second.
        In each frame, for every circle, it should redraw that circle
        and check to see if it has drifted off the screen.         
        */
        function update() {
            // TODO 4 / 5 / 8 / 9 : Iterate over the array
            for (var i = 0; i < circles.length; i++) {
                var eachCircle = circles[i];
                
                physikz.updatePosition(eachCircle);
                game.checkCirclePosition(eachCircle);
            }

            // Update gamification features each frame
            Gamification.update();
        }
    
        /* 
        This Function should check the position of a circle that is passed to the 
        Function. If that circle drifts off the screen, this Function should move
        it to the opposite side of the screen.
        */
        game.checkCirclePosition = function(circle) {

            // Right Boundary
            if (circle.x > canvas.width) {
                circle.x = 0;
            }
            
            // TODO 6 : Left Boundary
            if (circle.x < 0) {
                circle.x = canvas.width;
            }

            // Top Boundary
            if (circle.y < 0) {
                circle.y = canvas.height;
            }

            // Bottom Boundary
            if (circle.y > canvas.height) {
                circle.y = 0;
            }
        };
        
        /////////////////////////////////////////////////////////////
        // --- NO CODE BELOW HERE  --- DO NOT REMOVE THIS CODE --- //
        /////////////////////////////////////////////////////////////
        
        view.addChild(fps);
        app.addUpdateable(fps);
        
        game.circle = circle;
        game.circles = circles;
        game.drawCircle = drawCircle;
        game.update = update;
        
        app.addUpdateable(window.opspark.game);
    };

    // DO NOT REMOVE THIS CODE //////////////////////////////////////////////////////
    if((typeof process !== 'undefined') &&
        (typeof process.versions.node !== 'undefined')) {
        // here, export any references you need for tests //
        module.exports = init;
    }
};
