class Food {
    id;
    x;
    y;
    value = 1;

    constructor(x, y, val) {
        this.x = x;
        this.y = y;
        this.id = getRandomString();
        this.value = val || this.value;
    }
}

class Player {
    id;
    x;
    y;
    radius = 30;
    score = 0;

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.id = getRandomString();
        this.radius = radius || 30;
    }
}
exports.Player = Player;

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

exports.getRandomArbitrary = getRandomArbitrary;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.getRandomInt = getRandomInt;

function getRandomString(length = 16) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

exports.getRandomString = getRandomString;

function generateFood(scene, foodPoints, fraction=1.0) {
    // TODO научиться с клиента регулировать плотность еды на поле
    const amount = ((scene.width * scene.height / 20000) - foodPoints.length) * fraction;
    const newFood = [];
    for (let i = 0; i < amount; i++) {
        // don't spawn near the edge
        newFood.push(new Food(getRandomInt(20, scene.width - 20), getRandomInt(20, scene.height - 20)));
    }
    return newFood;
}

exports.generateFood = generateFood;

function calculateDistance(x1, y1, x2, y2) {
    const dx = x1 - x2, dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

exports.calculateDistance = calculateDistance;

function* enumerate(array) {
    for (let i in array) {
        yield [i, array[i]];
    }
}

exports.enumerate = enumerate;
