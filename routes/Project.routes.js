const express = require('express');
const { getProjects, addProject } = require('../controllers/Project.controllers');
const protect = require('../middlewares/protectRoute')


const router = express.Router();

router.get('/project', protect, getProjects );

router.post('/project', protect, addProject);