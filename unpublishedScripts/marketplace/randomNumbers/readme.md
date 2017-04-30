# A numbers library staring with random numbers


##Random()

### how do i import it?

```javascript

 
var R = new (Script.require('../lib/numbers.js')).Random();

```


### What is inside Random() ?

```javascript
//pick random number from (start,end)
R.random(1,100);

//this creates you a new instance of the numberpool
var NP = new R.numberPool();

// fills a pool of numbers from (start,end)
NP.fill(1,100);

//picks a random number from the number pool
NP.pick();

// syntax sugar cales reset then fill;
NP.refill(1,100);

// resets teh number pool
NP.reset();


```




##Force


### how do i import it?

```javascript

 
var F = new (Script.require('../lib/force.js')).Force();

```

### What is inside Force() ?


```javascript
// This will create a random con and random velocity between the range specified (entityRot,minSpeed,maxSpeed,minAngle,maxAngle)
F.randomVelocity({'x': -0.08,'y': 0.47,'z': 0.04,'w': 0.87},1,5,5,10)
```



### Examples

- dice.js
- bingo.js



## numberServer - the Entity Server Script version.


in general you will use the below to send messages to the server:

```javascript
// the default channel is game-channel
// you will type out the method name you wish to use and send the id. it will then broadcast the results on your responder channel
        Messages.sendMessage('games-channel', JSON.stringify({
            requestedMethod: 'numbersPool-pick',
            entityID: entityID
        }));

```

This is an example of the requesting entites Messagesreceived so that it can process the requested methods results. (from bingo)

```javascript
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
```


This is an example of the numberServer.js Messagesreceived

```javascript
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
```



