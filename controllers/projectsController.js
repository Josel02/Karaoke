const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');

exports.getProjects = (req, res) => {
    Project.findAll((err, projects) => {
        if (err) {
            console.error('Error al obtener proyectos:', err);
            return res.status(500).send('Error al obtener proyectos.');
        }
        res.render('projects', { title: 'Mis Proyectos', projects });
    });
};

exports.viewProject = (req, res) => {
    const projectId = req.params.id;
    Project.findById(projectId, (err, project) => {
        if (err) {
            console.error('Error al obtener el proyecto:', err);
            return res.status(500).send('Error al obtener el proyecto.');
        }
        if (!project) {
            return res.status(404).send('Proyecto no encontrado.');
        }

        // Leer el archivo SRT asociado al proyecto
        const srtPath = path.join(__dirname, '..', 'outputs', project.filename);
        let srtContent = '';
        try {
            srtContent = fs.readFileSync(srtPath, 'utf8');
        } catch (err) {
            console.error('Error al leer el archivo SRT:', err);
            return res.status(500).send('Error al leer el archivo SRT.');
        }

        // Parsear el archivo SRT
        const { lyrics, timestamps } = parseSRT(srtContent);

        // Renderizar la vista con los datos necesarios
        res.render('project-detail', {
            project,
            lyrics: JSON.stringify(lyrics), // Convertir a JSON para enviar al cliente
            timestamps: JSON.stringify(timestamps), // Convertir a JSON para enviar al cliente
        });
    });
};

exports.deleteProject = (req, res) => {
    const projectId = req.params.id;
    Project.deleteById(projectId, (err, result) => {
        if (err) {
            console.error('Error al eliminar el proyecto:', err);
            return res.status(500).send('Error al eliminar el proyecto.');
        }
        res.redirect('/projects');
    });
};

exports.uploadVideo = (req, res) => {
    const projectId = req.params.id;
    const videoFile = req.files.video;

    // Validar entrada
    if (!videoFile) {
        return res.status(400).send('No se recibió ningún archivo.');
    }

    const uploadPath = path.join(__dirname, '..', 'uploads', `${projectId}.mp4`);

    // Convertir el archivo a MP4 y guardarlo
    videoFile.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error al guardar el video:', err);
            return res.status(500).send('Error al guardar el video.');
        }

        res.status(200).send('Video guardado con éxito.');
    });
};

// Parser simple para SRT
function parseSRT(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const lyrics = [];
    const timestamps = [];

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
            const timeParts = lines[i].split('-->');
            const start = parseSRTTime(timeParts[0].trim());
            lyrics.push(lines[i + 1]); // La línea siguiente contiene la letra
            timestamps.push(start); // Guardar la marca de tiempo inicial
        }
    }

    return { lyrics, timestamps };
}

function parseSRTTime(time) {
    const [hours, minutes, seconds] = time.split(':');
    return (
        parseInt(hours, 10) * 3600 +
        parseInt(minutes, 10) * 60 +
        parseFloat(seconds.replace(',', '.'))
    );
}
