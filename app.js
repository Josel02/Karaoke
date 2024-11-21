// app.js
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');

const indexRouter = require('./routes/index');
const projectsRouter = require('./routes/projects');

const app = express();

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware para manejo de archivos
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Limite de 50MB
}));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/lyrics', express.static(path.join(__dirname, 'lyrics')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/music', express.static(path.join(__dirname, 'music')));

// Rutas
app.get('/', (req, res) => res.render('home', { title: 'Karaoke Sync' })); // Vista de inicio
app.use('/create', indexRouter); // Ruta para crear proyecto
app.use('/projects', projectsRouter); // Ruta para gestionar proyectos

// Manejo de errores 404
app.use((req, res, next) => {
    next(createError(404));
});

// Manejo de otros errores
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
