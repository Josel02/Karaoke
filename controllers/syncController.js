const srtService = require('../services/srtService');

exports.syncLyrics = (req, res) => {
    const { lyrics, timestamps } = req.body;
    
    // Llamar al servicio para generar el archivo SRT
    const srtFile = srtService.generateSRT(lyrics, timestamps);
    
    // Enviar respuesta al cliente
    res.send('Sincronización completada y archivo SRT generado.');
};
