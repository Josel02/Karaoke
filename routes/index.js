const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// Ruta para cargar la vista de sincronización
router.get('/', (req, res) => {
    res.render('index', { title: 'Sincronización de Karaoke' });
});

// Ruta para procesar la sincronización
router.post('/sync', syncController.syncLyrics);

module.exports = router;
