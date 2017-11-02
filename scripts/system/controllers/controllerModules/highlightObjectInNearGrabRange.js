"use strict";

//  highlightObjectInNearGrabRange.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

Script.include("/~/system/libraries/controllerDispatcherUtils.js");
Script.include("/~/system/libraries/controllers.js");

(function () {

    function HighlightNearestGrabbableEntity(hand) {
        var _this = this;
        this.hand = hand;
        this.activeHighlightObject = null;

        this.getOtherModule = function () {
            return _this.hand ? leftHighlightNearestGrabbableEntity : rightHighlightNearestGrabbableEntity;
        };

        this.parameters = makeDispatcherModuleParameters(
            610,
            _this.hand ? ["rightHand"] : ["leftHand"],
            [],
            100);

        this.isReady = function (controllerData) {

            if (controllerData.nearbyEntityProperties[_this.hand][0] || _this.activeHighlightObject !== null) {
                return makeRunningValues(true, [], []);
            }
            return makeRunningValues(false, [], []);
        };

        this.run = function (controllerData) {

            var nearbyEntity,
                isGrabbable,
                isCloneable;

            // the closest object to the controller is already computed in the dispatcher.
            nearbyEntity = controllerData.nearbyEntityProperties[_this.hand][0];

            //limited to grabbable and cloneable objects, If you are inside of a zone it registers in this list.

            if (nearbyEntity) {
                if (nearbyEntity.userData) {
                    var userData;
                    try {
                        userData = JSON.parse(nearbyEntity.userData);
                    } catch (e) {
                        print(e);
                    }

                    if (userData && userData.grabbableKey) {
                        isGrabbable = (userData.grabbableKey.grabbable);
                        isCloneable = (userData.grabbableKey.cloneable);
                    }
                }
            }

            if (nearbyEntity && (isGrabbable || isCloneable)) {
                if (_this.activeHighlightObject === null &&
                    (_this.getOtherModule().activeHighlightObject === null ||
                        (_this.getOtherModule().activeHighlightObject &&
                            nearbyEntity.id !== _this.getOtherModule().activeHighlightObject.id))) {

                    _this.activeHighlightObject = nearbyEntity;
                    Selection.addToSelectedItemsList("contextOverlayHighlightList", 'entity', nearbyEntity.id);

                } else if (_this.activeHighlightObject !== null &&
                    _this.activeHighlightObject.id !== nearbyEntity.id) {

                    Selection.removeFromSelectedItemsList("contextOverlayHighlightList", 'entity', _this.activeHighlightObject.id);
                    if (_this.getOtherModule().activeHighlightObject === null ||
                        (_this.getOtherModule().activeHighlightObject &&
                            nearbyEntity.id !== _this.getOtherModule().activeHighlightObject.id)) {
                        _this.activeHighlightObject = nearbyEntity;
                        Selection.addToSelectedItemsList("contextOverlayHighlightList", 'entity', nearbyEntity.id);
                    } else {
                        _this.activeHighlightObject = null;
                    }
                }

            } else if (_this.activeHighlightObject !== null &&
                (!nearbyEntity || ( nearbyEntity && !isGrabbable && !isCloneable ) ) &&
                (_this.getOtherModule().activeHighlightObject === null ||
                    (_this.getOtherModule().activeHighlightObject &&
                        _this.activeHighlightObject.id !== _this.getOtherModule().activeHighlightObject.id))) {

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

    function clean() {
        disableDispatcherModule("leftHighlightNearestGrabbableEntity");
        disableDispatcherModule("rightHighlightNearestGrabbableEntity");
    }

    Script.scriptEnding.connect(clean);
}());
