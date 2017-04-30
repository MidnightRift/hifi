(function () {
    var NO_CACHE = Number(String(Math.random()).substring(2)).toString(16).substring(0, 8);
    var ACTIVE_GAMES = {};


    var helper = Script.require('./lib/helpers.js?' + NO_CACHE);
    var ERRORS = helper.ERRORS;

    var numLib = Script.require('./lib/numbers.js?' + NO_CACHE);


    Messages.subscribe('games-channel');
    Messages.messageReceived.connect(function (channel, message, senderID) {
        message = JSON.parse(message);

        if (channel === 'games-channel') {

            var messageOut = {};

            messageOut.requestedMethod = message.requestedMethod;
            messageOut.entityID = message.entityID;

            if (!ACTIVE_GAMES[message.entityID]) {
                var Random = new numLib.Random();
                ACTIVE_GAMES[message.entityID] = {};
                ACTIVE_GAMES[message.entityID].Random = Random;
                ACTIVE_GAMES[message.entityID].Random.np = new Random.numberPool();
            }

            switch (message.requestedMethod) {
                case 'getRandom':
                    messageOut.res = ACTIVE_GAMES[message.entityID].Random.random(message.methodValues.start, message.methodValues.end);
                    break;
                case 'numbersPool-fill':
                    ACTIVE_GAMES[message.entityID].Random.np.fill(message.methodValues.start, message.methodValues.end);
                    break;
                case 'numbersPool-pick':
                    messageOut.res = ACTIVE_GAMES[message.entityID].Random.np.pick();
                    break;
                case 'numbersPool-refill':
                    ACTIVE_GAMES[message.entityID].Random.np.refill(message.methodValues.start, message.methodValues.end);
                    break;
                case 'numbersPool-reset':
                    ACTIVE_GAMES[message.entityID].Random.np.reset();
                    break;
                default:
                    messageOut.error = ERRORS[1];
                    break;
            }

            ACTIVE_GAMES[message.entityID].lastUsed = Date.now() / 1000;

            messageOut.string = true;

            Messages.sendMessage('games-channel-responder', helper.responder(messageOut,true));

        }

    });


    Script.setInterval(function () { // destroy inactive games.
        var gameKeys = Object.keys(ACTIVE_GAMES);
        var gamesCount = gameKeys.length;
        var now = Date.now() / 1000;

        if (gamesCount === 0) return;
        while (gamesCount--) {
            if ((ACTIVE_GAMES[gameKeys[gamesCount]].lastUsed + 900) <= now) {
                delete ACTIVE_GAMES[gameKeys[gamesCount]];
            }
        }
    }, 120000);


});