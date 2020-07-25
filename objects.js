const {getRandomString} = require('./utils');

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

// exports.Food = Food;
