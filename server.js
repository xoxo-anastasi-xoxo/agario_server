const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});

const {Player, getRandomInt, generateFood, calculateDistance} = require('./utils');

const SAFE_SPACE = 50;
const FOOD_RADIUS = 10;

const gameSession = {
    scene: {
        // FIXME: нужен сеттер и геттер этих значений
        width: 10000,
        height: 10000,
    },
    foodPoints: [],
    players: [],
};
gameSession.foodPoints = generateFood(gameSession.scene, gameSession.foodPoints, 1.0);

setInterval(() => {
    // Восстановим баланс еды.
    const newFood = generateFood(gameSession.scene, gameSession.foodPoints, 0.1);
    gameSession.foodPoints.push(...newFood);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({newFood}));
        }
    });
}, 10000);

wss.on('connection', (ws) => {
    const newPlayer = new Player(
        getRandomInt(SAFE_SPACE, gameSession.scene.width - SAFE_SPACE),
        getRandomInt(SAFE_SPACE, gameSession.scene.height - SAFE_SPACE),
    );
    console.log('A new player connected: ', newPlayer.id);

    gameSession.players.push(newPlayer);
    // Ответим новому подключившемуся текущим состоянием.
    ws.send(JSON.stringify({gameSession, mainPlayer: newPlayer}));
    // Оповестим всех остальных, что появился новый игрок.
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({newPlayer}));
        }
    });

    ws.on('message', (data) => {
        // console.log('received: %s', data);
        const {updatePlayer} = JSON.parse(data);
        const broadcast = {};
        const eatenFood = new Set();
        const eatenPlayers = new Set();

        if (updatePlayer) {
            const {x, y} = updatePlayer;

            for (let player of gameSession.players) {
                if (player.id === updatePlayer.id) {
                    for (let food of gameSession.foodPoints) {
                        if (calculateDistance(food.x, food.y, x, y) <= player.radius - FOOD_RADIUS) {
                            eatenFood.add(food.id);

                            // the area of the food is added to the player's area
                            // FIXME: продумать норм. функцию роста (!)
                            player.radius = Math.sqrt(player.radius * player.radius + FOOD_RADIUS);
                        }
                    }

                    for (let enemy of gameSession.players) {
                        if (enemy.id !== player.id && player.radius > enemy.radius * 1.1 && calculateDistance(enemy.x, enemy.y, x, y) <= player.radius - enemy.radius) {
                            eatenPlayers.add(enemy.id);

                            // the area of the food is added to the player's area
                            // FIXME: продумать норм. функцию роста (!)
                            player.radius = Math.sqrt(player.radius * player.radius + enemy.radius);
                        }
                    }

                    updatePlayer.radius = player.radius;


                    player.x = Math.max(Math.min(x, gameSession.scene.width - player.radius), player.radius);
                    player.y = Math.max(Math.min(y, gameSession.scene.height - player.radius), player.radius);

                    updatePlayer.x = player.x;
                    updatePlayer.y = player.y;
                }
            }

            broadcast.updatePlayer = updatePlayer;
        }


        // Note: there's still room to speed this up
        gameSession.foodPoints = gameSession.foodPoints.filter(fp => !eatenFood.has(fp.id));
        if (eatenFood.size > 0) {
            broadcast.deletedFood = Array.from(eatenFood);
        }

        gameSession.players = gameSession.players.filter(p => !eatenPlayers.has(p.id));
        if (eatenPlayers.size > 0) {
            broadcast.deletedPlayers = Array.from(eatenPlayers);
        }

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(broadcast));
            }
        });

    });
    ws.on('close', () => {
        console.log('A player lost connection: ', newPlayer.id);
        gameSession.players = gameSession.players.filter(({id}) => id !== newPlayer.id);
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({deletedPlayers: [newPlayer.id]}));
            }
        });
    })
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server started on port 3000')
});