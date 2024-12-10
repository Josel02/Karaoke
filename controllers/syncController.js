// controllers/syncController.js
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const srtService = require('../services/srtService');

exports.syncLyrics = (req, res) => {
    try {
        const { projectName, lyrics, timestamps } = req.body;
        const audioFile = req.files.audioFile;

        // Validar entradas
        if (!projectName || !audioFile || !lyrics) {
            return res.status(400).send('Datos incompletos.');
        }

        const lyricsArray = lyrics.split('\n');
        const parsedTimestamps = JSON.parse(timestamps);

        const uploadsDir = path.join(__dirname, '..', 'music');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        Project.findByName(projectName, (err, existingProject) => { 
            console.log('existingProject:', existingProject);
            
            if (err) {
                console.error('Error al verificar el nombre del proyecto:', err);
                return res.status(500).send('Error al verificar el nombre del proyecto.');
            }
        
            if (existingProject) {
                console.log('El nombre del proyecto ya existe.');
                return res.status(400).send('El nombre del proyecto ya existe. Por favor, elija otro nombre.');
            }

            console.log("El nombre del proyecto es único.");
        
            // Continúa con la creación del proyecto si el nombre es único
            const audioFileExtension = path.extname(audioFile.name); 
            const newAudioFileName = projectName + audioFileExtension;
        
            const audioPath = path.join(uploadsDir, newAudioFileName);
            audioFile.mv(audioPath, (err) => {
                if (err) {
                    console.error('Error al guardar el archivo de audio:', err);
                    return res.status(500).send('Error al guardar el archivo de audio.');
                }
        
                const outputsDir = path.join(__dirname, '..', 'lyrics');
                if (!fs.existsSync(outputsDir)) {
                    fs.mkdirSync(outputsDir);
                }
        
                const outputPath = path.join(outputsDir, `${projectName}.srt`);
                srtService.generateSRT(lyricsArray, parsedTimestamps, outputPath);
        
                Project.create(projectName, `${projectName}.srt`, 'Descripción del proyecto', newAudioFileName, "", (err, project) => {
                    if (err) {
                        console.error('Error al guardar el proyecto en la base de datos:', err);
                        return res.status(500).send('Error al guardar el proyecto.');
                    }
                    res.status(200).send('Sincronización completada y archivo SRT generado.');
                });
            });
        });
    } catch (error) {
        console.error('Error en syncLyrics:', error);
        res.status(500).send('Error interno del servidor.');
    }
};
