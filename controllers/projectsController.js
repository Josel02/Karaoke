const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');

exports.getProjects = (req, res) => {
    Project.findAll((err, projects) => {
        if (err) {
            console.error('Error al obtener proyectos:', err);
            return res.status(500).send('Error al obtener proyectos.');
        }

        // Generar y mezclar una lista de números
        let iconNumbers = [];

        function getNextIcon() {
            // Si la lista está vacía, la rellenamos y mezclamos
            if (iconNumbers.length === 0) {
                iconNumbers = shuffleArray([...Array(10).keys()].map((n) => n + 1));
            }
            // Retornar el siguiente número
            return iconNumbers.pop();
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Asignar iconos a los proyectos
        const projectsWithIcons = projects.map((project) => ({
            ...project,
            icon: getNextIcon(),
        }));

        res.render('projects', { title: 'Mis Proyectos', projects: projectsWithIcons });
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
        const srtPath = path.join(__dirname, '..', 'lyrics', project.filename);
        let srtContent = '';
        try {
            srtContent = fs.readFileSync(srtPath, 'utf8');
        } catch (err) {
            console.error('Error al leer el archivo SRT:', err);
            return res.status(500).send('Error al leer el archivo SRT.');
        }

        // Parsear el archivo SRT
        const { lyrics, timestamps } = parseSRT(srtContent);
        const audioPath = `/music/${project.audio}`;
        console.log(audioPath);
        const videoExists = !!project.video; // Verifica si hay un archivo de video asociado

        // Renderizar la vista con los datos necesarios
        res.render('project-detail', {
            project,
            lyrics: JSON.stringify(lyrics), 
            timestamps: JSON.stringify(timestamps),
            audioPath: JSON.stringify(audioPath),
            videoExists,
        });
    });
};

exports.deleteProject = (req, res) => {
    const projectId = req.params.id;

    // Buscar el proyecto en la base de datos para obtener los nombres de los archivos
    Project.findById(projectId, (err, project) => {
        if (err) {
            console.error('Error al obtener el proyecto:', err);
            return res.status(500).send('Error al obtener el proyecto.');
        }

        if (!project) {
            return res.status(404).send('Proyecto no encontrado.');
        }

        // Rutas de los archivos
        const lyricsPath = path.join(__dirname, '..', 'lyrics', project.filename);
        const musicPath = project.audio ? path.join(__dirname, '..', 'music', project.audio) : null;
        const videoPath = project.video ? path.join(__dirname, '..', 'videos', project.video) : null;

        // Función para eliminar un archivo
        const deleteFile = (filePath) => {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error al eliminar el archivo ${filePath}:`, err);
                    } else {
                        console.log(`Archivo eliminado: ${filePath}`);
                    }
                });
            }
        };

        // Eliminar los archivos relacionados
        deleteFile(lyricsPath);
        deleteFile(musicPath);
        deleteFile(videoPath);

        // Eliminar el proyecto de la base de datos
        Project.deleteById(projectId, (err, result) => {
            if (err) {
                console.error('Error al eliminar el proyecto:', err);
                return res.status(500).send('Error al eliminar el proyecto.');
            }
            res.redirect('/projects');
        });
    });
};

exports.uploadVideo = (req, res) => {
    const projectId = req.params.id;
    const videoFile = req.files.video;

    // Validar entrada
    if (!videoFile) {
        return res.status(400).send('No se recibió ningún archivo.');
    }
    Project.findById(projectId, (err, project) => {
        const videoFileName = `${project.name}.mp4`; // Nombre del archivo basado en el ID del proyecto
        const uploadPath = path.join(__dirname, '..', 'videos', videoFileName);

        // Guardar el archivo de video
        videoFile.mv(uploadPath, (err) => {
            if (err) {
                console.error('Error al guardar el video:', err);
                return res.status(500).send('Error al guardar el video.');
            }

            // Actualizar la base de datos con el nombre del video
            Project.update(projectId, { video: videoFileName }, (err) => {
                if (err) {
                    console.error('Error al actualizar el proyecto con el video:', err);
                    return res.status(500).send('Error al actualizar el proyecto con el video.');
                }

                res.status(200).send('Video guardado y proyecto actualizado con éxito.');
            });
        });
    });
};

exports.deleteVideo = (req, res) => {
    const projectId = req.params.id;

    Project.findById(projectId, (err, project) => {
        if (err) {
            console.error('Error al obtener el proyecto:', err);
            return res.status(500).send('Error al obtener el proyecto.');
        }

        if (!project || !project.video) {
            return res.status(404).send('El proyecto o el video no existe.');
        }

        const videoPath = path.join(__dirname, '..', 'videos', project.video);

        // Eliminar el archivo de video
        fs.unlink(videoPath, (err) => {
            if (err) {
                console.error('Error al eliminar el archivo de video:', err);
                return res.status(500).send('Error al eliminar el archivo de video.');
            }

            // Actualizar el proyecto en la base de datos
            Project.update(projectId, { video: null }, (err) => {
                if (err) {
                    console.error('Error al actualizar el proyecto:', err);
                    return res.status(500).send('Error al actualizar el proyecto.');
                }

                res.status(200).send('Video eliminado con éxito.');
            });
        });
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
