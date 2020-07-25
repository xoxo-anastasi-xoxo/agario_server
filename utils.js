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

function generateFood(scene, foodPoints) {
    const amount = (scene.width * scene.height / 7000) - foodPoints.length;
    const newFood = [];
    for (let i = 0; i < amount; i++) {
        newFood.push(new Food(getRandomInt(0, scene.width), getRandomInt(0, scene.height)));
    }
    return newFood;
}

exports.generateFood = generateFood;