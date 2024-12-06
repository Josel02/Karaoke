const express = require('express');
const router = express.Router();

// Ruta para renderizar audio.pug
router.get('/', (req, res) => {
    res.render('audio', { title: 'Modificar Tono' });
});

module.exports = router;