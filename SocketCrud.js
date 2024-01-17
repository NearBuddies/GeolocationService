const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios'); // Ajout de l'importation Axios
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3002;

io.on('connection', (socket) => {
    console.log('We have a client');
    socket.on('postentitylocation', (data) => {
        axios.post('http://localhost:3000/postentitylocation', data) 
            .then((response) => {
                socket.emit('postentitylocation', response.data); 
            })
            .catch((error) => {
                console.log(error);
            });
    });

    socket.on('getlatestentitylocation', (data) => {
        axios.post(`http://localhost:3000/getlatestentitylocation/${data.entity_id}`)
            .then((response) => {
                socket.emit('getlatestentitylocation', response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    });

});

server.listen(port, () => {
    console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
