(function () {
    var entityID = '';
    var NO_CACHE = Number(String(Math.random()).substring(2)).toString(16).substring(0, 8);

    this.preload = function (id) {
        entityID = id;
        Messages.sendMessage('games-channel', JSON.stringify({
            methodValues: {start: 1, end: 75},
            requestedMethod: 'numbersPool-fill',
            entityID: entityID
        }));
    };

    var helper = Script.require('../lib/helpers.js?' + NO_CACHE);
    var ERRORS = helper.ERRORS;

    Messages.subscribe('games-channel-responder');

    function announce(number) {
        var letter = '';
        switch (true) {
            case (number <= 15):
                letter = 'B';
                break;
            case (15 < number && number <= 30):
                letter = 'I';
                break;
            case (30 < number && number <= 45):
                letter = 'N';
                break;
            case (45 < number && number <= 60):
                letter = 'G';
                break;
            case (60 < number && number <= 75):
                letter = 'O';
                break;
            default:
                letter = {error: ERRORS[2]};
                break;
        }

        print('Current call Bingo', letter + number);
    }



    this.clickDownOnEntity = function () {
        Messages.sendMessage('games-channel', JSON.stringify({
            requestedMethod: 'numbersPool-pick',
            entityID: entityID
        }));
    };


    Messages.messageReceived.connect(function (channel, message, senderID) {
        message = JSON.parse(message);

        if (message.entityID === entityID && channel === 'games-channel-responder') {

            switch (message.requestedMethod) {
                case 'getRandom':
                    break;
                case 'numbersPool-fill':
                    break;
                case 'numbersPool-pick':
                    announce(message.res);
                    break;
                case 'numbersPool-refill':
                    break;
                case 'numbersPool-reset':
                    break;
                default:
                    print('ERRORS[1]', JSON.stringify(ERRORS[1]));
                    break;
            }
        }

    });
});
