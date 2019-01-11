// Constants
var SCREEN_WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var SCREEN_HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);


// Define block data
var BLOCK_WIDTH = 3;
var BLOCK_HEIGHT = 600;
var MAX_HEIGHT_DIFF = 170;
var X_POS_DIFF = 400;
var AMOUNT_RANDOM_POINTS = 40;

var SPRITE_SCALE_Y = 0.22;
var SPRITE_SCALE_X = 2;
var START_LOC = 100;
var MAX_VEHICLE_SPEED = 15;

var isDriving = false;

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

var engine, world, render, runner, playerCar, mouse, player, finishLine;

Game.init = function () {
    // create engine
    engine = Engine.create();
    world = engine.world;
    world.gravity.scale = 0.0008;
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
    playerCar.bodies[0].render.sprite = {
        texture: 'assets/auto_cool.png',
        xScale: 0.3,
        yScale: 0.2,
        xOffset: 0.5,
        yOffset: 0.5,
    };
    playerCar.bodies[1].render.visible = false;
    playerCar.bodies[2].render.visible = false;
    player = Bodies.rectangle(0, START_LOC, 20, 20, {
        collisionFilter: playerCar.bodies[0].collisionFilter,
        render: {
            sprite: {

                texture: 'assets/head.png',
                yOffset: 0.19,
                xScale: 0.25,
                yScale: 0.25
            }
        },
        label: "player head"
    });

    var axelB = Matter.Constraint.create({
        bodyB: playerCar.bodies[0],
        pointB: {
            x: 0,
            y: -20
        },
        bodyA: player,
        stiffness: 1,
        length: 1
    });

    Matter.Composite.addConstraint(playerCar, axelB);

    World.add(world, playerCar);
    World.add(world, player);

    Game.createEvents();
    // keep the mouse in sync with rendering
    render.mouse = mouse;
    setTimeout(function () {
        document.getElementById('song').volume = 0.9;
        document.getElementById('song').play();
        document.getElementById('carStart').play();

    }, 150);
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
                        collisionFilter: {
                            group: 4
                        },
                        render: {
                            sprite: {
                                texture: 'assets/paint_hell.png',
                                xScale: SPRITE_SCALE_X,
                                yScale: SPRITE_SCALE_Y
                            }
                        }
                    });
                } else {
                    tile = Bodies.rectangle(world.bodies[loc].position.x + BLOCK_WIDTH, world.bodies[loc].position.y + ((diffY / (X_POS_DIFF / BLOCK_WIDTH))), BLOCK_WIDTH, BLOCK_HEIGHT, {
                        isStatic: true,
                        collisionFilter: {
                            group: 4
                        },
                        render: {
                            sprite: {
                                texture: 'assets/paint_hell.png',
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

    var last = world.bodies.length - 1;
    // finish
    finishLine = World.add(world, [Bodies.rectangle(world.bodies[last].position.x + BLOCK_WIDTH, world.bodies[last].position.y + ((diffY / (X_POS_DIFF / BLOCK_WIDTH))) - 200, BLOCK_WIDTH * 2, BLOCK_HEIGHT, {
        isStatic: true,
        label: 'finishline',
        collisionFilter: {
            group: 4
        }
    })]);
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
            x: (playerCar.bodies[1].position.x - window.innerWidth / 4),
            y: (playerCar.bodies[1].position.y - window.innerHeight / 2) - 150
        });
    });

    Events.on(engine, 'afterUpdate', function () {
        Bounds.shift(render.bounds, {
            x: (playerCar.bodies[1].position.x - window.innerWidth / 4),
            y: (playerCar.bodies[1].position.y - window.innerHeight / 2) - 150
        });

        player.angle = playerCar.bodies[0].angle;
        if (!carIdle) return;

        if (!document.getElementById('carStart').paused) return;
        if (isDriving) {
            document.getElementById('carIdle').pause();
            document.getElementById('soundDriving').play();
        } else {
            document.getElementById('soundDriving').pause();
            document.getElementById('carIdle').play();

        }
    });

    Events.on(engine, 'collisionStart', function (event) {
        var pairs = event.pairs;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            if (pair.bodyA.label == "player head" || pair.bodyB.label == "player head") {
                Game.GameOver(true);
            }

            if (pair.bodyA.label == 'finishline' || pair.bodyB.label == 'finishline') {
                alert("YAAAY FINISH!");
                Game.GameOver(false)
            }
        }
    });

    document.addEventListener('keydown', function (event) {
        if (playerCar.bodies[0].speed > MAX_VEHICLE_SPEED) return;
        if (event.code == 'KeyW') {
            isDriving = true;
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
            isDriving = true;
        } // else if (event.code == 'KeyA') {
        //     Body.applyForce(playerCar.bodies[0], playerCar.bodies[0].axes[3], {
        //         x: 0,
        //         y: -0.02
        //     });
        // } else if (event.code == 'KeyD') {
        //     Body.applyForce(playerCar.bodies[0], playerCar.bodies[0].axes[3], {
        //         x: 0,
        //         y: 0.02
        //     });
        // }
    });

    document.addEventListener('keyup', function (event) {
        if (event.code == 'KeyW') {
            isDriving = false;

        } else if (event.code == 'KeyS') {
            isDriving = false;
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

Game.GameOver = function (isGameOver) {
    if (isGameOver) {
        alert("Uh oh, u died! Try again?");
    }
    document.getElementById('carIdle').pause();
    document.getElementById('soundDriving').pause();
    document.getElementById('carStart').pause();
    document.getElementById('song').pause();
    World.clear(engine.world);
    Engine.clear(engine);
    document.getelement
    engine, world, render, runner, playerCar, mouse, player = null;
    document.getElementsByTagName('canvas')[0].remove();
    Game.init();
}

Game.init();