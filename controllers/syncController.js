const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const srtService = require('../services/srtService');

exports.syncLyrics = (req, res) => {
    const { lyrics, timestamps, projectName } = req.body;
    const filename = `${projectName.replace(/\s+/g, '_')}_${Date.now()}.srt`; // Nombre único basado en el proyecto
    const outputPath = path.join(__dirname, '../outputs', filename);

    // Generar el archivo SRT
    srtService.generateSRT(lyrics, timestamps, outputPath);

    // Guardar proyecto en la base de datos
    const query = `INSERT INTO projects (name, filename) VALUES (?, ?)`;
    db.run(query, [projectName, filename], (err) => {
        if (err) {
            console.error('Error al guardar en la base de datos:', err);
            res.status(500).send('Error al guardar el proyecto.');
        } else {
            res.send(`Sincronización completada. Archivo generado: ${filename}`);
        }
    });
};
