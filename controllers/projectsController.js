const db = require('../database/db');
const path = require('path');
const fs = require('fs');

exports.getProjects = (req, res) => {
    const query = `SELECT * FROM projects ORDER BY created_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error al recuperar proyectos:', err);
            res.status(500).send('Error al cargar proyectos.');
        } else {
            res.render('projects', { title: 'Mis Proyectos', projects: rows });
        }
    });
};

exports.deleteProject = (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM projects WHERE id = ?`;

    db.get(`SELECT filename FROM projects WHERE id = ?`, [id], (err, row) => {
        if (err || !row) {
            console.error('Error al encontrar el proyecto:', err);
            res.status(404).send('Proyecto no encontrado.');
            return;
        }

        const filePath = path.join(__dirname, '../outputs', row.filename);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar archivo:', err);
        });

        db.run(query, [id], (err) => {
            if (err) {
                console.error('Error al eliminar proyecto:', err);
                res.status(500).send('Error al eliminar proyecto.');
            } else {
                res.redirect('/projects');
            }
        });
    });
};

exports.viewProject = (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM projects WHERE id = ?`, [id], (err, project) => {
        if (err || !project) {
            console.error('Error al encontrar proyecto:', err);
            res.status(404).send('Proyecto no encontrado.');
        } else {
            res.render('project-detail', { title: project.name, project });
        }
    });
};
