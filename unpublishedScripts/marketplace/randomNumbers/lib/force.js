// FORCE
function Force() {
    var NO_CACHE = Number(String(Math.random()).substring(2)).toString(16).substring(0,8);
    var helper = Script.require('./helpers.js?'+NO_CACHE);


    var R = new (Script.require('./numbers.js?'+NO_CACHE)).Random();

    this.randomVelocity = function(entityRot,minSpeed,maxSpeed,minAngle,maxAngle) {

        var SPEED = R.random(minSpeed,maxSpeed);  // m/s
        var ANGLE = R.random(minAngle,maxAngle);

        var velocity = Vec3.multiply(SPEED, Vec3.UNIT_Y);
        velocity = Vec3.multiplyQbyV(Quat.fromPitchYawRollDegrees(ANGLE, 0.0, 0.0), velocity);
        velocity = Vec3.multiplyQbyV(Quat.fromPitchYawRollDegrees(0.0, R.random(0,360), 0.0), velocity);
        velocity = Vec3.multiplyQbyV(entityRot, velocity);
        return helper.responder(velocity);
    }
}



module.exports = {
    Force:Force
};