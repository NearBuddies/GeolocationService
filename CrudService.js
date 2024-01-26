const express = require('express');
const pgp = require('pg-promise')();
const app = express();
const port = 3000;
const cors = require('cors');

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'nearbuddies_spatial_db',
  user: 'postgres',
  password: '123',
};

const db = pgp(dbConfig);

app.use(express.json());
app.use(cors());

app.post('/postentitylocation', async (req, res) => {
  try {
    const { entity_id, entity_type, latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    const insertQuery = `
      INSERT INTO LocationAtTime (entity_id, entity_type, location, latitudeDelta, longitudeDelta)
      VALUES ($1,$2, ST_MakePoint($3, $4), $5, $6)
      RETURNING locationidentifier;
    `;
    const result = await db.one(insertQuery, [entity_id, entity_type, latitude, longitude, latitudeDelta, longitudeDelta]);

    res.status(200).json({ message: 'Données insérées avec succès', locationidentifier: result.locationidentifier });
  } catch (error) {
    console.error('Erreur lors de l\'insertion de l entité', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion de l entité' });
  }
});

// Route pour obtenir la dernière emplacement du jour pour un utilisateur spécifique
app.get('/getlatestentitylocation/:entity_id', async (req, res) => {
  try {
    const { entity_id } = req.params;

    const selectQuery = `
      SELECT entity_id, entity_type,ST_X(location) as latitude, ST_Y(location) as longitude, latitudeDelta, longitudeDelta, date, time
      FROM LocationAtTime
      WHERE entity_id = $1
      AND date = current_date
      ORDER BY date DESC, time DESC
      LIMIT 1
    `;
    const data = await db.oneOrNone(selectQuery, [entity_id]);

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Aucune emplacement trouvée pour cet utilisateur aujourd\'hui' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière emplacement', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la dernière emplacement' });
  }
});

// Route pour obtenir les 5 communautés les plus proches d'un utilisateur

app.get('/getnearestcommunities/:entity_id/:latitude/:longitude', async (req, res) => {
  try {
    const { entity_id, latitude, longitude } = req.params;

    const selectQuery = `
      SELECT entity_id, ST_X(location) as latitude, ST_Y(location) as longitude, latitudeDelta, longitudeDelta, date, time
      FROM LocationAtTime
      WHERE entity_type = 'community'
      AND entity_id != $1
      ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $3), 4326))
      LIMIT 5
    `;
    const data = await db.manyOrNone(selectQuery, [entity_id, latitude, longitude]);

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Aucune entité communautaire trouvée à proximité de cette entité' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des entités les plus proches', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entités les plus proches' });
  }
});

// Route pour obtenir la distance entre duex entités
app.get('/getdistancetwoentities/:entity_id1/:entity_id2', async (req, res) => {
  try {
    const { entity_id1, entity_id2 } = req.params;

    const distanceQuery = `
      SELECT ST_Distance(entity1.location::geography, entity2.location::geography) as distance
      FROM LocationAtTime as entity1, LocationAtTime as entity2
      WHERE entity1.entity_id = $1 AND entity2.entity_id = $2;
    `;
    const result = await db.oneOrNone(distanceQuery, [entity_id1, entity_id2]);

    if (result) {
      res.status(200).json({ distance: result.distance });
    } else {
      res.status(404).json({ error: 'Les entités spécifiées n\'existent pas' });
    }
  } catch (error) {
    console.error('Erreur lors du calcul de la distance entre les entités', error);
    res.status(500).json({ error: 'Erreur lors du calcul de la distance entre les entités' });
  }
});



// Route pour obtenir toutes les emplacements d'un utilisateur à une date spécifique
app.get('/getallentitylocations/:entity_id/:date', async (req, res) => {
  try {
    const { entity_id, date } = req.params;

    // Convertir la date au format "jourmoisannee" en date PostgreSQL
    const formattedDate = `${date.substring(4, 8)}-${date.substring(2, 4)}-${date.substring(0, 2)}`;

    const selectQuery = `
      SELECT entity_id, ST_X(location) as latitude, ST_Y(location) as longitude, latitudeDelta, longitudeDelta, date, time
      FROM LocationAtTime
      WHERE entity_id = $1
      AND date = $2
    `;
    const data = await db.manyOrNone(selectQuery, [entity_id, formattedDate]);

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Aucune emplacement trouvé pour cet utilisateur à la date spécifiée' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des emplacements à la date spécifiée', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des emplacements à la date spécifiée' });
  }
});

//Cette fonction n'est pas sensée intervenir, on ne met pas à jour une location, on rajoute
//Cette fonction met pas à jour toutes les locations de la journée en une seule location
//Je la laisse avant de mieux réfléchir, mais je la suprimerais probablement plus tard 
app.put('/updateentitylocation/:entity_id', async (req, res) => {
  try {
    const { entity_id } = req.params;
    const { latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    const updateQuery = `
      UPDATE LocationAtTime
      SET location = ST_MakePoint($2, $3), latitudeDelta = $4, longitudeDelta = $5
      WHERE entity_id = $1
    `;
    await db.none(updateQuery, [entity_id, latitude, longitude, latitudeDelta, longitudeDelta]);

    res.status(200).json({ message: 'Données mises à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l entité', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l entité' });
  }
});

//Pour supprimer toute les locations de quelqu'un, un trigger peut se déclencher 
//chaque deux jours sur les locations vieilles de trois jours et les supprimer
app.delete('/deleteentitylocation/:entity_id', async (req, res) => {
  try {
    const { entity_id } = req.params;

    const deleteQuery = `
      DELETE FROM LocationAtTime
      WHERE entity_id = $1
    `;
    await db.none(deleteQuery, [entity_id]);

    res.status(200).json({ message: 'Données supprimées avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression des données', error);
    res.status(500).json({ error: 'Erreur lors de la suppression des données' });
  }
});

app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
