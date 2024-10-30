const db = require('../database/db');

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
