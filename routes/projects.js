const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');

router.get('/', projectsController.getProjects);
router.get('/view/:id', projectsController.viewProject);
router.post('/delete/:id', projectsController.deleteProject);

module.exports = router;
