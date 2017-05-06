//
// Created by Alan-Michael Moody on 5/2/2017
//

var NO_CACHE = Number(String(Math.random()).substring(2)).toString(16).substring(0,8);
var helper = Script.require('./helpers.js?'+NO_CACHE);
ERRORS = helper.ERRORS;

function Random() {

    function randomNumber(start, end) {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    }

    this.random = function(start, end) {
        return helper.responder(randomNumber(start, end));
    };

    this.numberPool = function() {
        var pool = [];

        function fill(start, end) {
            var count = end - start + 1;
            while (count--) {
                pool.push(end--);
            }
        }

        this.fill = fill;

        this.pick = function () {
            var count = pool.length;

            if (count <= 0) return helper.responder({error:ERRORS[0]});

            var rand = randomNumber(0, count - 1); // the -1 shifts the number space to 0-(n-1) from 1-n

            var num = pool[rand];
            pool.splice(pool.indexOf(num), 1);

            print('Number Pool: ',JSON.stringify(pool));


            return helper.responder(num);
        };

        this.refill = function (start, end) {
            pool = [];
            fill(start, end);
        };

        this.reset = function () {
            pool = [];
        }
    }
}

module.exports = {
    Random:Random
};