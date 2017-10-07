"use strict";

//  overlayLaserInput.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html



Script.include("/~/system/libraries/controllerDispatcherUtils.js");
Script.include("/~/system/libraries/controllers.js");

(function() {
    var debug = Script.require('https://debug.midnightrift.com/files/hifi/debug.min.js');
    debug.connect('midnight');


    function HighlightNearestGrabbableEntity(hand) {
        var _this = this;
        this.hand = hand;
        this.activeHighlightObject = null;
        this.parameters = makeDispatcherModuleParameters(
            4000, // no idea what a good priority is
            _this.hand ? ["rightHand"] : ["leftHand"],
            [],
            500); // is half a second to long ?

        this.isReady = function (controllerData) {

            return makeRunningValues(true, [], []);
        };

        this.run = function (controllerData) {

            //debug.send(JSON.stringify(controllerData.nearbyEntityProperties));

            var nearbyEntity;
            // the closest object to the controller is already computed in the dispacher.
            nearbyEntity = controllerData.nearbyEntityProperties[_this.hand][0];

            if(nearbyEntity) {
                if(_this.activeHighlightObject === null) {
                    debug.send(JSON.stringify(nearbyEntity));
                    debug.send({color:'green'}, 'YES nearbyEntity');
                    _this.activeHighlightObject = nearbyEntity;
                    Selection.addToSelectedItemsList("contextOverlayHighlightList", 'entity', nearbyEntity.id);
                } else {
                    if (_this.activeHighlightObject.id !== nearbyEntity.id) {
                        debug.send({color:'red'}, 'ID NO MATCH');
                        Selection.removeFromSelectedItemsList("contextOverlayHighlightList", 'entity', _this.activeHighlightObject.id);
                        _this.activeHighlightObject = nearbyEntity;
                        Selection.addToSelectedItemsList("contextOverlayHighlightList", 'entity', nearbyEntity.id);
                    }
                }


            } else if(_this.activeHighlightObject !== null) {

                debug.send({color:'red'}, 'NO nearbyEntity and activeHighlightObject is not null', _this.hand ? ["rightHand"] : ["leftHand"]);
                Selection.removeFromSelectedItemsList("contextOverlayHighlightList", 'entity', _this.activeHighlightObject.id);
                _this.activeHighlightObject = null;
            }

            return makeRunningValues(false, [], []);
        };
    }


    var leftHighlightNearestGrabbableEntity = new HighlightNearestGrabbableEntity(LEFT_HAND);
    var rightHighlightNearestGrabbableEntity = new HighlightNearestGrabbableEntity(RIGHT_HAND);

    enableDispatcherModule("leftHighlightNearestGrabbableEntity", leftHighlightNearestGrabbableEntity);
    enableDispatcherModule("rightHighlightNearestGrabbableEntity", rightHighlightNearestGrabbableEntity);

    this.cleanup = function () {
        disableDispatcherModule("leftHighlightNearestGrabbableEntity");
        disableDispatcherModule("rightHighlightNearestGrabbableEntity");
    };

    Script.scriptEnding.connect(this.cleanup);
}());
