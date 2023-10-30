import express from 'express';
const app = express();
const port = 4000;
import cors from 'cors';
import { createServer } from 'http';
import socketIo from 'socket.io';

app.use(cors());

const server = createServer(app);
const io = socketIo(server);


import { getLatestCitizenLocation, getAllCitizenLocations, createCitizenLocation, updateCitizenLocation, deleteCitizenLocation } from './CrudService'; 

io.on('connection', (socket) => {
  console.log('Un client s\'est connecté au serveur WebSocket');

  socket.on('disconnect', () => {
    console.log('Un client s\'est déconnecté du serveur WebSocket');
  });

  socket.on('request', async (data) => {
    if (data.operation === 'getLatestCitizenLocation') {
      try {
        const { user_id } = data;
        const latestLocation = await getLatestCitizenLocation(user_id);

        if (latestLocation) {
          socket.emit('response', { success: true, data: latestLocation });
        } else {
          socket.emit('response', { success: false, error: 'Aucune emplacement trouvée pour cet utilisateur aujourd\'hui' });
        }
      } catch (error) {
        socket.emit('response', { success: false, error: 'Erreur lors de la récupération de la dernière emplacement' });
      }
    } else if (data.operation === 'getAllCitizenLocations') {
      try {
        const { user_id, date } = data;
        const allLocations = await getAllCitizenLocations(user_id, date);

        if (allLocations.length > 0) {
          socket.emit('response', { success: true, data: allLocations });
        } else {
          socket.emit('response', { success: false, error: 'Aucune emplacement trouvé pour cet utilisateur à la date spécifiée' });
        }
      } catch (error) {
        socket.emit('response', { success: false, error: 'Erreur lors de la récupération des emplacements à la date spécifiée' });
      }
    } else if (data.operation === 'createCitizenLocation') {
      try {
        const { user_id, latitude, longitude, latitudeDelta, longitudeDelta } = data;
        const result = await createCitizenLocation(user_id, latitude, longitude, latitudeDelta, longitudeDelta);
        socket.emit('response', { success: true, data: { message: 'Emplacement insérée avec succès', locationidentifier: result.locationidentifier } });
      } catch (error) {
        socket.emit('response', { success: false, error: 'Erreur lors de l\'insertion de l\'emplacement' });
      }
    } else if (data.operation === 'updateCitizenLocation') {
      try {
        const { user_id, latitude, longitude, latitudeDelta, longitudeDelta } = data;
        await updateCitizenLocation(user_id, latitude, longitude, latitudeDelta, longitudeDelta);
        socket.emit('response', { success: true, data: { message: 'Emplacement mis à jour avec succès' } });
      } catch (error) {
        socket.emit('response', { success: false, error: 'Erreur lors de la mise à jour de l\'emplacement' });
      }
    } else if (data.operation === 'deleteCitizenLocation') {
      try {
        const { user_id } = data;
        await deleteCitizenLocation(user_id);
        socket.emit('response', { success: true, data: { message: 'Emplacement supprimée avec succès' } });
      } catch (error) {
        socket.emit('response', { success: false, error: 'Erreur lors de la suppression de l\'emplacement' });
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
