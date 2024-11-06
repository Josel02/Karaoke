// controllers/projectsController.js
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
        res.render('project-detail', { project });
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
