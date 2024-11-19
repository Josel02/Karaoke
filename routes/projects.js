const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');

// Obtener todos los proyectos
router.get('/', projectsController.getProjects);

// Ver detalles de un proyecto
router.get('/view/:id', projectsController.viewProject);

// Eliminar un proyecto
router.post('/delete/:id', projectsController.deleteProject);

// Ruta para subir el video
router.post('/uploadVideo/:id', projectsController.uploadVideo);

module.exports = router;
