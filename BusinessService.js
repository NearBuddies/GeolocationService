const express = require('express');
const app = express();
const port = 4000;
const cors = require('cors');

// Configuration CORS
app.use(cors());

// Import des clients des microservices CRUD
const crudServiceClient = require('./CrudService.js'); // Remplacez par l'emplacement de votre client CRUD

// Route pour obtenir la dernière emplacement du jour pour un utilisateur spécifique
app.get('/getLatestCitizenLocation/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Utilisation du client du microservice CRUD pour obtenir la dernière emplacement
    const latestLocation = await crudServiceClient.getLatestCitizenLocation(user_id);

    if (latestLocation) {
      res.status(200).json(latestLocation);
    } else {
      res.status(404).json({ error: 'Aucune emplacement trouvée pour cet utilisateur aujourd\'hui' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière emplacement', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la dernière emplacement' });
  }
});

// Route pour obtenir toutes les emplacements d'un utilisateur à une date spécifique
app.get('/getAllCitizenLocations/:user_id/:date', async (req, res) => {
  try {
    const { user_id, date } = req.params;

    // Utilisation du client du microservice CRUD pour obtenir toutes les emplacements
    const allLocations = await crudServiceClient.getAllCitizenLocations(user_id, date);

    if (allLocations.length > 0) {
      res.status(200).json(allLocations);
    } else {
      res.status(404).json({ error: 'Aucune emplacement trouvé pour cet utilisateur à la date spécifiée' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des emplacements à la date spécifiée', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des emplacements à la date spécifiée' });
  }
});

// Route pour insérer une nouvelle emplacement
app.post('/createCitizenLocation', async (req, res) => {
  try {
    const { user_id, latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    // Utilisation du client du microservice CRUD pour insérer une nouvelle emplacement
    const result = await crudServiceClient.createCitizenLocation(user_id, latitude, longitude, latitudeDelta, longitudeDelta);

    res.status(200).json({ message: 'Emplacement insérée avec succès', locationidentifier: result.locationidentifier });
  } catch (error) {
    console.error('Erreur lors de l\'insertion de l\'emplacement', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion de l\'emplacement' });
  }
});

// Route pour mettre à jour une emplacement
app.put('/updateCitizenLocation/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    // Utilisation du client du microservice CRUD pour mettre à jour une emplacement
    await crudServiceClient.updateCitizenLocation(user_id, latitude, longitude, latitudeDelta, longitudeDelta);

    res.status(200).json({ message: 'Emplacement mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'emplacement', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'emplacement' });
  }
});

// Route pour supprimer une emplacement
app.delete('/deleteCitizenLocation/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Utilisation du client du microservice CRUD pour supprimer une emplacement
    await crudServiceClient.deleteCitizenLocation(user_id);

    res.status(200).json({ message: 'Emplacement supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'emplacement', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'emplacement' });
  }
});

app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
