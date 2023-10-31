const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pgp = require('pg-promise')();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;
const cors = require('cors');

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'spatial2',
  user: 'postgres',
  password: '123',
};

const db = pgp(dbConfig);

app.use(express.json());
app.use(cors());

app.post('/postcitizenlocation', async (req, res) => {
  try {
    const { user_id, latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    const insertQuery = `
      INSERT INTO LocationAtTime (user_id, location, latitudeDelta, longitudeDelta)
      VALUES ($1, ST_MakePoint($2, $3), $4, $5)
      RETURNING locationidentifier;
    `;
    const result = await db.one(insertQuery, [user_id, latitude, longitude, latitudeDelta, longitudeDelta]);

    res.status(200).json({ message: 'Données insérées avec succès', locationidentifier: result.locationidentifier });

    io.emit('newLocation', {
      user_id,
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error('Erreur lors de l\'insertion de la personne', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion de la personne' });
  }
});

app.get('/getlatestcitizenlocation/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
  
      const selectQuery = `
        SELECT user_id, ST_X(location) as latitude, ST_Y(location) as longitude, latitudeDelta, longitudeDelta, date, time
        FROM LocationAtTime
        WHERE user_id = $1
        AND date = current_date
        ORDER BY date DESC, time DESC
        LIMIT 1
      `;
      const data = await db.oneOrNone(selectQuery, [user_id]);
  
      if (data) {
        // Émettre les données au client spécifique connecté via des sockets
        io.to(data.user_id).emit('latestLocation', data);
  
        res.status(200).json(data);
      } else {
        res.status(404).json({ error: 'Aucune emplacement trouvée pour cet utilisateur aujourd\'hui' });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la dernière emplacement', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la dernière emplacement' });
    }
  });
  

app.get('/getlatestcitizenlocation/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
  
      const selectQuery = `
        SELECT user_id, ST_X(location) as latitude, ST_Y(location) as longitude, latitudeDelta, longitudeDelta, date, time
        FROM LocationAtTime
        WHERE user_id = $1
        AND date = current_date
        ORDER BY date DESC, time DESC
        LIMIT 1
      `;
      const data = await db.oneOrNone(selectQuery, [user_id]);
  
      if (data) {
        // Envoyer les données à tous les clients connectés via des sockets
        io.emit('latestLocation', data);
  
        res.status(200).json(data);
      } else {
        res.status(404).json({ error: 'Aucune emplacement trouvée pour cet utilisateur aujourd\'hui' });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la dernière emplacement', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la dernière emplacement' });
    }
  });
  

app.put('/updatecitizenlocation/:user_id', async (req, res) => {
  // Cette fonction n'est pas sensée intervenir, on ne met pas à jour une location, on rajoute
  // Cette fonction met pas à jour toutes les locations de la journée en une seule location
  // Je la laisse avant de mieux réfléchir, mais je la supprimerais probablement plus tard
  // ...
});

app.delete('/deletecitizenlocation/:user_id', async (req, res) => {
  // Supprime toute les locations de quelqu'un, un trigger peut se déclencher
  // chaque deux jours sur les locations vieilles de trois jours et les supprimer
  // ...
});

io.on('connection', (socket) => {
  console.log(`Client connecté: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client déconnecté: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
