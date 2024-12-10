// models/project.js
const db = require('../database/db');

const Project = {
    create: (name, filename, description, audio, video, callback) => {
        const sql = `INSERT OR ABORT INTO projects (name, filename, description, audio, video) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [name, filename, description, audio, video], function (err) {
            if (err) {
                console.log(err);
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return callback(new Error('El nombre del proyecto ya existe.'));
                }
                return callback(err);
            }
            callback(null, { id: this.lastID, name, filename, description, audio, video });
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

    findByName: (name, callback) => {
        const sql = `SELECT * FROM projects WHERE name = ?`;
        db.get(sql, [name], (err, row) => {
            if (err) {
                return callback(err);
            }
            callback(null, row);
        });
    },

    update: (id, fields, callback) => {
        const updates = [];
        const values = [];
    
        Object.entries(fields).forEach(([key, value]) => {
            updates.push(`${key} = ?`);
            values.push(value);
        });
    
        values.push(id);
    
        const sql = `UPDATE projects SET ${updates.join(', ')}, last_modified = CURRENT_TIMESTAMP WHERE id = ?`;
    
        db.run(sql, values, function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, { updated: this.changes });
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
