const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
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
                io.emit('newLocation',response);
            }
        ).catch((error)=>{console.log(error);})          
    });
    //Getting a location
    socket.on('/getlatestcitizenlocation', (data) => {
        axios.post('/getlatestcitizenlocation', data).then(
            (response)=>{
                socket.emit('getlatestcitizenlocation', response);
            }
        ).catch((error)=>{console.log(error);})          
    });
    // I will not update or delete the location using a socket
})

server.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
