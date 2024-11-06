// models/project.js
const db = require('../database/db');

const Project = {
    create: (name, filename, description, callback) => {
        const sql = `INSERT INTO projects (name, filename, description) VALUES (?, ?, ?)`;
        db.run(sql, [name, filename, description], function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, { id: this.lastID, name, filename, description });
        });
    },

    findAll: (callback) => {
        const sql = `SELECT * FROM projects ORDER BY created_at DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                return callback(err);
            }
            callback(null, rows);
        });
    },

    findById: (id, callback) => {
        const sql = `SELECT * FROM projects WHERE id = ?`;
        db.get(sql, [id], (err, row) => {
            if (err) {
                return callback(err);
            }
            callback(null, row);
        });
    },

    deleteById: (id, callback) => {
        const sql = `DELETE FROM projects WHERE id = ?`;
        db.run(sql, [id], function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, { deleted: this.changes });
        });
    }
};

module.exports = Project;
