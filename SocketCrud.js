const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pgp = require('pg-promise')();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3002;


io.on('connection',(socket)=>{
    console.log('We have a client');
    //Posting a location 
    socket.on('/postcitizenlocation', (data) => {
        axios.post('/postcitizenlocation', data).then(
            (response)=>{
                io.emit('newLocation', {
                    user_id,
                    latitude,
                    longitude,
                    latitudeDelta,
                    longitudeDelta,
                    date: new Date().toISOString(),
                    time: new Date().toLocaleTimeString(),
                  });
            }
        ).catch((error)=>{console.log(error);})          
    });
    //Getting a location
    socket.on('/getlatestcitizenlocation', (data) => {
        axios.post('/getlatestcitizenlocation', data).then(
            (response)=>{
                io.emit('newLocation', {
                    user_id,
                    latitude,
                    longitude,
                    latitudeDelta,
                    longitudeDelta,
                    date: new Date().toISOString(),
                    time: new Date().toLocaleTimeString(),
                  });
            }
        ).catch((error)=>{console.log(error);})          
    });
    // Émettre les données au client spécifique connecté via des sockets
    io.to(data.user_id).emit('latestLocation', data);
    // I will not update or delete the location using a socket
})

server.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
