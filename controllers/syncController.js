// controllers/syncController.js
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const srtService = require('../services/srtService');

exports.syncLyrics = (req, res) => {
    const { projectName, lyrics, timestamps } = req.body;
    const audioFile = req.files.audioFile;

    if (!projectName || !audioFile || !lyrics) {
        return res.status(400).send('Datos incompletos.');
    }

    const lyricsArray = lyrics.split('\n');
    const parsedTimestamps = JSON.parse(timestamps);

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    const audioPath = path.join(uploadsDir, audioFile.name);
    audioFile.mv(audioPath, (err) => {
        if (err) {
            console.error('Error al guardar el archivo de audio:', err);
            return res.status(500).send('Error al guardar el archivo de audio.');
        }

        const outputPath = path.join(__dirname, '..', 'outputs', `${projectName}.srt`);
        srtService.generateSRT(lyricsArray, parsedTimestamps, outputPath);

        // Guardar en la base de datos
        Project.create(projectName, `${projectName}.srt`, 'Descripción del proyecto', (err, project) => {
            if (err) {
                console.error('Error al guardar el proyecto en la base de datos:', err);
                return res.status(500).send('Error al guardar el proyecto.');
            }
            res.status(200).send('Sincronización completada y archivo SRT generado.');
        });
    });
};
