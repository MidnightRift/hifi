(function () {
    var debug = Script.require('https://debug.midnightrift.com/files/hifi/debug.min.js');
    debug.connect('midnight');
    var FORCE_DROP_CHANNEL = "Hifi-Hand-Drop";

    var proxInterval,
        proxTimeout;

    var _entityID;

    var BALL_SOUNDS = [];

    function playBounceSound(position) {

        function randomNumber(start, end) {
            return Math.floor(Math.random() * (end - start + 1)) + start;
        }
        var ballsound = BALL_SOUNDS[randomNumber(0,BALL_SOUNDS.length)];
        debug.send('Is this debouncing');
        Audio.playSound(ballsound, {
            position: position,
            volume: 1.0
        });
    }


    this.preload = function (entityID) {
        _entityID = entityID;

        Entities.editEntity(_entityID, {
            userData: '{"grabbableKey": {"grabbable": true}'
        });
        BALL_SOUNDS.push(SoundCache.getSound('https://s3-us-west-1.amazonaws.com/shortbow/dodgeball/bounce01.wav'));
        BALL_SOUNDS.push(SoundCache.getSound('https://s3-us-west-1.amazonaws.com/shortbow/dodgeball/bounce02.wav'));
        BALL_SOUNDS.push(SoundCache.getSound('https://s3-us-west-1.amazonaws.com/shortbow/dodgeball/bounce03.wav'));
        BALL_SOUNDS.push(SoundCache.getSound('https://s3-us-west-1.amazonaws.com/shortbow/dodgeball/bounce04.wav'));
        BALL_SOUNDS.push(SoundCache.getSound('https://s3-us-west-1.amazonaws.com/shortbow/dodgeball/bounce05.wav'));

    };

    var particleTrailEntity = null;

    function particleTrail() {

        var props = {
            type: 'ParticleEffect',
            name: 'Particle',
            parentID: _entityID,
            isEmitting: true,
            lifespan: 4.0,
            maxParticles: 100,
            textures: 'https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png',
            emitRate: 150,
            emitSpeed: 0,
            emitAcceleration: {
                x: 0,
                y: 0,
                z: 0
            },
            emitterShouldTrail: true,
            particleRadius: 0,
            radiusSpread: 0,
            radiusStart: .2,
            radiusFinish: 0.1,
            color: {
                red: 201,
                blue: 201,
                green: 34
            },
            accelerationSpread: {
                x: 0,
                y: 0,
                z: 0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -180,
            azimuthFinish: 180
        };

        particleTrailEntity = Entities.addEntity(props);
    }

    function particleExplode() {
       var entPos = Entities.getEntityProperties(_entityID, 'position').position;
        var props = {
            type: 'ParticleEffect',
            name: 'Particle',
            parentID: _entityID,
            isEmitting: true,
            lifespan: 2,
            maxParticles: 10,
            localPosition: {
                x: 0,
                y: 0,
                z: 0
            },
            textures: 'https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png',
            emitRate: 1,
            emitSpeed: 0,
            emitterShouldTrail: false,
            particleRadius: 1,
            radiusSpread: 0,
            radiusStart: 0,
            radiusFinish: 1,
            color: {
                red: 232,
                blue: 232,
                green: 26
            },
            emitAcceleration: {
                x: 0,
                y: 0,
                z: 0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: .5,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -180,
            azimuthFinish: 180
        };
        var explosionParticles = Entities.addEntity(props);
        Entities.editEntity(_entityID, {
            velocity: Vec3.ZERO,
            dynamic: false
        });

        playBounceSound(entPos);

        Script.setTimeout(function () {
            Entities.deleteEntity(explosionParticles);
            Entities.editEntity(_entityID, {
                dynamic: true
            })
        }, 500);
    }


    function clearProxCheck() {
        if (proxInterval) {
            Script.clearInterval(proxInterval);
            Entities.deleteEntity(particleTrailEntity);
            particleTrailEntity = null;
        }

        if (proxTimeout) {
            Script.clearTimeout(proxTimeout);
        }
    }

    function proxCheck() {
        var ballPos = Entities.getEntityProperties(_entityID, ['position']).position;
        var isAnyAvatarInRange = AvatarList.isAvatarInRange(ballPos, 1);

        if (isAnyAvatarInRange) {
            clearProxCheck();
            particleExplode();
        }
    }

    this.startDistanceGrab = function (thisEntityID, triggerHandAndAvatarUUIDArray) {
        clearProxCheck();
        var triggerHand = triggerHandAndAvatarUUIDArray[0];
        var avatarUUID = triggerHandAndAvatarUUIDArray[1];

        var ballPos = Entities.getEntityProperties(_entityID, ['position']).position;
        var MAX_DISTANCE_GRAB = 2; //meter

        if (Vec3.distance(ballPos, AvatarList.getAvatar(avatarUUID).position) > MAX_DISTANCE_GRAB) {
            Messages.sendMessage(FORCE_DROP_CHANNEL, triggerHand, true);
        }

    };
    this.startNearGrab = function (thisEntityID, triggerHandAndAvatarUUIDArray) {
        clearProxCheck();
    };

    this.releaseGrab = function (thisEntityID) {
        canMakeBounceNoise = true;
        if (particleTrailEntity === null) {
            particleTrail();
        }

        Script.setTimeout(function () {
            proxInterval = Script.setInterval(proxCheck, 50);
        }, 200); // Setting a delay to give it time to leave initial avatar without proc.

        proxTimeout = Script.setTimeout(function () {
            clearProxCheck();
        }, 10000)
    };

    var canMakeBounceNoise = true;
    this.collisionWithEntity = function (thisEntityID, collisionEntityID, collisionInfo) {

        if(canMakeBounceNoise){ //a simple debounce
            playBounceSound(collisionInfo.contactPoint);
            canMakeBounceNoise = false;
            Script.setTimeout(function () {
                canMakeBounceNoise = true;
            },3000);
        }

        clearProxCheck();
    };

});
