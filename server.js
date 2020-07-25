const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});

const {Player} = require('./objects');
const {getRandomInt, generateFood} = require('./utils');

const SAFE_SPACE = 50;
const gameSession = {
    scene: {
        // TODO: нужен сеттер и геттер
        width: 1000,
        height: 1000,
    },
    foodPoints: [],
    players: [],
};

wss.on('connection', (ws) => {
    // Восстановим баланс еды.
    const newFood = generateFood(gameSession.scene, gameSession.foodPoints);
    gameSession.foodPoints.push(...newFood);

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
            client.send(JSON.stringify({newPlayer, newFood}));
        }
    });

    // TODO кто и куда + надо вернуть знание о том, кого съели и как еда ребалансировалась
    ws.on('message', (data) => {
        console.log('received: %s', data);
        const {updatePlayer} = JSON.parse(data);
        if (updatePlayer) {
            const {x, y} = updatePlayer;
            gameSession.players = gameSession.players.map(player => player.id === updatePlayer.id ? {...player, x, y} : player);
        }

        wss.clients.forEach((client) => {
            // TODO тут просто всем отправить соо что именно изменилось
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });

    });
    ws.on('close', () => {
        console.log('A player lost connection: ', newPlayer.id);
        gameSession.players = gameSession.players.filter(({id}) => id !== newPlayer.id);
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({deletedPlayer: newPlayer}));
            }
        });
    })
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server started on port 3000')
});