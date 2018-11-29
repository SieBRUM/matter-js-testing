// Constants
var SCREEN_WIDTH = 1500;
var SCREEN_HEIGHT = 900;

var BLOCK_LENGTH = 1;
var MAX_HEIGHT_DIFF = 150;
var X_POS_DIFF = 500;
var TILE_WIDTH = 1;
var AMOUNT_RANDOM_POINTS = 10;

// Global variables
var Game = Game || {};

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Bounds = Matter.Bounds,
    Events = Matter.Events;

var engine, world, render, runner, playerCar, mouse;

Game.init = function () {
    // create engine
    engine = Engine.create();
    world = engine.world;

    // create renderer
    render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            showAngleIndicator: true,
            showCollisions: true,
            hasBounds: true
        }
    });

    Render.run(render);

    // create runner
    runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Game.buildSurface();

    var scale = 0.8;
    playerCar = Composites.car(0, 300, 150 * scale, 30 * scale, 30 * scale);
    World.add(world, playerCar);

    Game.createEvents();
    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: {
            x: 0,
            y: 450
        },
        max: {
            x: SCREEN_WIDTH,
            y: SCREEN_HEIGHT
        }
    });


}

Game.buildSurface = function () {
    for (var i = 0; i < AMOUNT_RANDOM_POINTS; i++) {
        if (i == 0) {
            World.add(world, [
                Bodies.rectangle(0, 400, 100, 50, {
                    isStatic: true
                })
            ]);

        } else {
            var randomNumber = ((Math.random() - 0.5) * 2) * MAX_HEIGHT_DIFF;

            var randomLoc = Bodies.rectangle(world.bodies[world.bodies.length - 1].position.x + X_POS_DIFF, world.bodies[world.bodies.length - 1].position.y + randomNumber, BLOCK_LENGTH, TILE_WIDTH, {
                isStatic: true
            });

            var diffY = world.bodies[i - 1].position.y - randomLoc.position.y;

            for (var a = 0; a < X_POS_DIFF / BLOCK_LENGTH; a++) {
                var loc = Math.floor(a + ((i - 1) * X_POS_DIFF / BLOCK_LENGTH));

                var tile = Bodies.rectangle(world.bodies[loc].position.x + BLOCK_LENGTH, world.bodies[loc].position.y + (diffY / (X_POS_DIFF / BLOCK_LENGTH)), BLOCK_LENGTH, TILE_WIDTH, {
                    isStatic: true
                });

                World.add(world, [tile]);
                console.log(World);
            }
        }
    }

    console.log(world.bodies[5]);
    console.log(world.bodies[world.bodies.length - 1]);
}

Game.createEvents = function () {
    // add mouse control
    mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Events.on(engine, 'beforeUpdate', function () {
        Bounds.shift(render.bounds, {
            x: playerCar.bodies[1].position.x - window.innerWidth / 4,
            y: playerCar.bodies[1].position.y - window.innerHeight / 2
        });
    });

    document.addEventListener('keydown', function (event) {
        if (!playerCar.bodies[2])
            return;

        var collision = Matter.SAT.collides(playerCar.bodies[2], world.bodies[0]);
        if (collision.collided) {
            console.log("Colliding with ground!"); // Add force to other bodies
        }

        if (event.code == 'KeyW') {
            Body.applyForce(playerCar.bodies[1], {
                x: playerCar.bodies[1].position.x,
                y: playerCar.bodies[1].position.y
            }, {
                x: 0.05,
                y: 0
            });
        } else if (event.code == 'KeyS') {
            Body.applyForce(playerCar.bodies[1], {
                x: playerCar.bodies[1].position.x,
                y: playerCar.bodies[1].position.y
            }, {
                x: -0.05,
                y: 0
            });
        }
    });

    World.add(world, mouseConstraint);
}

Game.init();