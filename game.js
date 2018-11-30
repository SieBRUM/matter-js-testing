// Constants
var SCREEN_WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var SCREEN_HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);


// Define block data
var BLOCK_WIDTH = 5;
var BLOCK_HEIGHT = 600;
var MAX_HEIGHT_DIFF = 150;
var X_POS_DIFF = 500;
var AMOUNT_RANDOM_POINTS = 40;

var SPRITE_SCALE_Y = 0.22;
var SPRITE_SCALE_X = 2;
var START_LOC = 100;


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
    Composite = Matter.Composite,
    Bounds = Matter.Bounds,
    Events = Matter.Events;

var engine, world, render, runner, playerCar, mouse, player;

Game.init = function () {
    // create engine
    engine = Engine.create();
    world = engine.world;
    world.gravity.scale = 0.0005;
    // create renderer
    render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            showAngleIndicator: false,
            showCollisions: false,
            hasBounds: true,
            wireframes: false
        }
    });

    Render.run(render);

    render.options.background = 'transparent';
    // create runner
    runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Game.buildSurface();

    var scale = 0.8;
    playerCar = Composites.car(0, START_LOC, 150 * scale, 30 * scale, 30 * scale);
    player = Bodies.rectangle(0, START_LOC, 20, 20, {
        inertia: 'Infinity'
    });

    World.add(world, playerCar);
    World.add(world, player);

    Game.createEvents();
    // keep the mouse in sync with rendering
    render.mouse = mouse;
}

Game.buildSurface = function () {
    for (var i = 0; i < AMOUNT_RANDOM_POINTS; i++) {
        if (i == 0) {
            World.add(world, Bodies.rectangle(-100, START_LOC + 100, BLOCK_WIDTH, BLOCK_HEIGHT, {
                isStatic: true,
                render: {
                    background: "#FFFFFF"
                }
            }));
        } else {
            var randomNumber = ((Math.random() - 0.5) * 2) * MAX_HEIGHT_DIFF;
            var randomLoc = Bodies.rectangle(world.bodies[world.bodies.length - 1].position.x + X_POS_DIFF, world.bodies[world.bodies.length - 1].position.y + randomNumber, BLOCK_WIDTH, BLOCK_HEIGHT, {
                isStatic: true
            });

            var diffY = world.bodies[i - 1].position.y - randomLoc.position.y;
            var lastLoc = 0;

            for (var a = 0; a < X_POS_DIFF / BLOCK_WIDTH; a++) {
                var loc = Math.round(a + ((i - 1) * X_POS_DIFF / BLOCK_WIDTH));
                var tile;

                // Make sure to not add duplicates (issue with framework)
                if (lastLoc == world.bodies[loc].position.x + BLOCK_WIDTH) {
                    continue;
                }

                lastLoc = world.bodies[loc].position.x + BLOCK_WIDTH;

                if (world.bodies.length == 1) {
                    tile = Bodies.rectangle(world.bodies[loc].position.x + BLOCK_WIDTH, world.bodies[loc].position.y + ((diffY / (X_POS_DIFF / BLOCK_WIDTH))) + (BLOCK_HEIGHT / 2), BLOCK_WIDTH, BLOCK_HEIGHT, {
                        isStatic: true,
                        render: {
                            sprite: {
                                texture: 'images/paint_grass.png',
                                xScale: SPRITE_SCALE_X,
                                yScale: SPRITE_SCALE_Y
                            }
                        }
                    });
                } else {
                    tile = Bodies.rectangle(world.bodies[loc].position.x + BLOCK_WIDTH, world.bodies[loc].position.y + ((diffY / (X_POS_DIFF / BLOCK_WIDTH))), BLOCK_WIDTH, BLOCK_HEIGHT, {
                        isStatic: true,
                        render: {
                            sprite: {
                                texture: 'images/paint_grass.png',
                                xScale: SPRITE_SCALE_X,
                                yScale: SPRITE_SCALE_Y
                            }
                        }
                    });
                }
                World.add(world, [tile]);
            }
        }
    }
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

        var loc = Object.create(playerCar.bodies[0].position);
        loc.x = loc.x;
        Body.setPosition(player, loc);

    });

    Events.on(engine, 'collisionStart', function (event) {
        var pairs = event.pairs;
        console.log(pairs);

        // // change object colours to show those starting a collision
        // for (var i = 0; i < pairs.length; i++) {
        //     var pair = pairs[i];
        //     pair.bodyA.render.fillStyle = '#333';
        //     pair.bodyB.render.fillStyle = '#333';
        // }
    });

    document.addEventListener('keydown', function (event) {
        if (event.code == 'KeyW') {
            Body.applyForce(playerCar.bodies[0], {
                x: playerCar.bodies[0].position.x,
                y: playerCar.bodies[0].position.y
            }, {
                x: 0.05,
                y: 0
            });
        } else if (event.code == 'KeyS') {
            Body.applyForce(playerCar.bodies[0], {
                x: playerCar.bodies[0].position.x,
                y: playerCar.bodies[0].position.y
            }, {
                x: -0.05,
                y: 0
            });
        }
    });

    World.add(world, mouseConstraint);
}

Game.Drive = function (value) {
    Body.applyForce(playerCar.bodies[0], {
        x: playerCar.bodies[0].position.x,
        y: playerCar.bodies[0].position.y
    }, {
        x: value * 0.00005,
        y: 0
    });
}

Game.init();