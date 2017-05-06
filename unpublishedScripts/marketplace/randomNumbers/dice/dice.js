//
// Created by Alan-Michael Moody on 5/2/2017
//

(function () {
    var NO_CACHE = Number(String(Math.random()).substring(2)).toString(16).substring(0,8);
    var R = new (Script.require('../lib/numbers.js?'+NO_CACHE)).Random();
    var F = new (Script.require('../lib/force.js?'+NO_CACHE)).Force();


    var launcherID = '';

    this.preload = function (entityID) {
        launcherID = entityID;
    };

    var TRIGGER_CONTROLS = [
        Controller.Standard.LT,
        Controller.Standard.RT
    ];

    function roleDice(number) {
        var launcher = Entities.getEntityProperties(launcherID, ['position', 'rotation', 'dimensions']);

        //offset on Y the location teh dice spawn in
        var fwd = Vec3.multiply(Quat.getUp(launcher.rotation), 0.11);
        var pos = Vec3.sum(launcher.position, fwd);

        var dice = {
            type: 'Model',
            modelURL: 'https://binaryrelay.com/files/public-docs/hifi/games/dice/dice.fbx',
            dimensions: {x: .1, y: .1, z: .1},
            dynamic: 1,
            shapeType: 'box',
            gravity: {x: 0.0, y: -9.8, z: 0.0},
            collisionsWillMove: 1,
            position: pos,
            rotation: Quat.multiply(launcher.rotation, Quat.fromPitchYawRollDegrees(R.random(0, 360), R.random(0, 360), R.random(0, 360))),
            velocity: F.randomVelocity(launcher.rotation, 3, 6, 5, 10),
            angularVelocity: {x: R.random(-25, 25), y: R.random(-25, 25), z: R.random(-25, 25)},
            lifetime: '15'
        };

        Entities.addEntity(dice);

        number--;
        while (number--) {
            Script.setTimeout(function () {
                dice.rotation = Quat.multiply(launcher.rotation, Quat.fromPitchYawRollDegrees(R.random(0, 360), R.random(0, 360), R.random(0, 360)));
                dice.velocity = F.randomVelocity(launcher.rotation, 3, 6, 5, 10);
                dice.angularVelocity = {
                    x: R.random(-25, 25),
                    y: R.random(-25, 25),
                    z: R.random(-25, 25)
                };
                Entities.addEntity(dice);
            }, 200 * number);
        }
    }

    var NUMBER_OF_DICE = 5;
    this.clickDownOnEntity = function () {
        roleDice(NUMBER_OF_DICE);
    };

    var hand;
    this.startNearGrab = function (entityID, args) {
        hand = args[0] == 'left' ? 0 : 1;
    };

    var canRoll = true;
    this.continueNearGrab = function (entityID, args) {
        if (Controller.getValue(TRIGGER_CONTROLS[hand]) > .95 && canRoll) {
            canRoll = false;
            roleDice(NUMBER_OF_DICE);
            Script.setTimeout(function () {
                canRoll = true;
            }, 3000);
        }
    }
});