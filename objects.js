const {getRandomString} = require('./utils');

class Player {
    id;
    x;
    y;
    score = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.id = getRandomString()
    }
}
exports.Player = Player;

// exports.Food = Food;
