const Project = require('../models/project.model')

//  ------ for listing projects ----
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id; // Comes from JWT middleware
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'data fetch successfully',
      data: projects
    })

  } catch (error) {
    
    console.error('❌ Error fetching projects:', error.message);
    
    res.status(500).json({ 
      success: false,
      message: 'Server Error' });
  }
};

// ----------- for adding proects ----

const addProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectName, description, date } = req.body;

    if (!projectName || !description || !date) {
      return res.status(400).json({ 
        success : false,
        message: 'All fields are required' });
    }

    const newProject = new Project({
      userId,
      projectName,
      description,
      date
    });

    await newProject.save();
    res.status(201).json({ message: 'Project added successfully', project: newProject });
  } catch (error) {
    console.error('❌ Error adding project:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getProjects, addProject };