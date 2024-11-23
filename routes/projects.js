const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');

// Obtener todos los proyectos
router.get('/', projectsController.getProjects);

// Ver detalles de un proyecto
router.get('/view/:id', (req, res, next) => {
    res.locals.title = 'Detalles del Karaoke'; // Añades el título a res.locals
    next(); // Continúas con el controlador
}, projectsController.viewProject);

// Eliminar un proyecto
router.post('/delete/:id', projectsController.deleteProject);

// Ruta para subir el video
router.post('/uploadVideo/:id', projectsController.uploadVideo);

// Ruta para eliminar el video
router.post('/deleteVideo/:id', projectsController.deleteVideo);

module.exports = router;
