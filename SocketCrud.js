const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3002;

io.on('connection',(socket)=>{
    console.log('We have a client');
    // Posting a location 
    socket.on('postentitylocation', (data) => {
        axios.post(`postentitylocation`, data).then(
            (response)=>{
                io.emit('postentitylocation',response);
            }
        ).catch((error)=>{console.log(error);})          
    });
    // Getting a location
    socket.on('getlatestentitylocation', (data) => {
        axios.post(`getlatestentitylocation/${data.entity_id}`).then(
            (response)=>{
                socket.emit('getlatestentitylocation', response);
            }
        ).catch((error)=>{console.log(error);})          
    });
    // I will not update or delete the location using a socket
})

server.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
