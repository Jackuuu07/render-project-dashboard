const express = require('express');
const { getProjects, addProject } = require('../controllers/Project.controllers');
const protect = require('../middlewares/protectRoute')


const router = express.Router();

router.get('/getproject', protect, getProjects );

router.post('/addproject', protect, addProject);

module.exports = router;