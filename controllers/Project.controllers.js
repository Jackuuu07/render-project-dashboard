const Project = require('../models/project.model');

//  ------ for listing projects ----
const getProjects = async (req, res) => {
  try {
    const userId = Number(req.user.id); // convert to number if it's stored as numeric
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Data fetched successfully',
      data: projects
    });

  } catch (error) {
    console.error('❌ Error fetching projects:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// ----------- for adding projects ----
const addProject = async (req, res) => {
  try {
    const userId = Number(req.user.id); // ✅ ensure numeric userId
    const { projectName, description, date } = req.body;

    if (!projectName || !description || !date) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    const newProject = new Project({
      userId,
      projectName,
      description,
      date
    });

    await newProject.save();

    // ✅ Include the auto-generated projectId in the JSON response
    res.status(201).json({ 
      success: true,
      message: 'Project added successfully', 
      projectId: newProject.projectId,  // <- key line
      project: newProject 
    });

  } catch (error) {
    console.error('❌ Error adding project:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

module.exports = { getProjects, addProject };






// // ----------------------------------------------- Add new project -----------------------------------------------


// const addProject = async (req, res) => {
//   try {
//     const { projectName, description, date } = req.body;

//     if (!projectName || !description || !date) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     const newProject = new Project({
//       projectName,
//       description,
//       date
//     });

//     await newProject.save();

//     res.status(201).json({
//       success: true,
//       message: 'Project added successfully',
//       data: newProject
//     });

//   } catch (error) {
//     console.error('❌ Error adding project:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error'
//     });
//   }
// };


// // ------------------------------------------- Get all projects ------------------------------------------------------


// const getProject = async (req, res) => {
//   try {
//     const projects = await Project.find().sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       message: 'Data fetched successfully',
//       data: projects
//     });

//   } catch (error) {
//     console.error('❌ Error fetching projects:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error'
//     });
//   }
// };


// // --------------------------------------------- Get a single project by ID ----------------------------------------


// const getProjectById = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Project fetched successfully',
//       data: project
//     });

//   } catch (error) {
//     console.error('❌ Error fetching project:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error'
//     });
//   }
// };



// // ----------------------------------------------- Update a project by ID -----------------------------------------------


// const updateProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { projectName, description, date } = req.body;

//     const updatedProject = await Project.findByIdAndUpdate(
//       projectId,
//       { projectName, description, date },
//       { new: true, runValidators: true }
//     );

//     if (!updatedProject) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Project updated successfully',
//       data: updatedProject
//     });

//   } catch (error) {
//     console.error('❌ Error updating project:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error'
//     });
//   }
// };



// // -------------------------------------------------- Delete a project by ID --------------------------------------------


// const deleteProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     const deletedProject = await Project.findByIdAndDelete(projectId);

//     if (!deletedProject) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Project deleted successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error deleting project:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error'
//     });
//   }
// };

// module.exports = {
//   getProject,
//   getProjectById,
//   addProject,
//   updateProject,
//   deleteProject
// };
















