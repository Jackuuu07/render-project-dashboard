const Project = require('../models/project.model');

// ----------------- to assined user to project ---------------
const assignUsersToProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId); // Project ID from URL
    const { assigneduser_id } = req.body; // Array from body

    console.log("➡️ Incoming request to assign users");
    console.log("📌 Project ID from URL:", projectId);
    console.log("📌 Request body:", req.body);
    console.log("📌 Logged-in user info:", req.user);

    if (!projectId) {
      console.warn("⚠️ Project ID missing in URL");
      return res.status(400).json({ status: false, message: 'Project ID is required in URL' });
    }

    if (!Array.isArray(assigneduser_id)) {
      console.warn("⚠️ assigneduser_id is not an array");
      return res.status(400).json({ status: false, message: 'assigneduser_id must be an array' });
    }

    // Find the project
    const project = await Project.findOne({ projectId });
    if (!project) {
      console.warn("⚠️ Project not found for projectId:", projectId);
      return res.status(404).json({ status: false, message: 'Project not found' });
    }

    console.log("📌 Project ownerId:", project.ownerId);
    console.log("📌 Project existing assigned users:", project.assignedUsers);

    // Only owner can assign users
    if (project.ownerId !== req.user.id) {
      console.error("❌ Logged-in user is not the owner");
      return res.status(403).json({ status: false, message: 'Only owner can assign users' });
    }

    console.log("📌 New users to assign:", assigneduser_id);

    // Merge new users and remove duplicates
    project.assignedUsers = Array.from(new Set([...assigneduser_id]));

    await project.save();

    console.log("✅ Updated assigned users:", project.assignedUsers);

    res.status(200).json({
      status: true,
      project: {
        id: project.projectId,
        project_name: project.projectName,
        project_description: project.description,
        owner_user_id: project.ownerId,
        assigned_user_ids: project.assignedUsers,
        created_at: project.createdAt,
        updated_at: project.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ Assign Users API Error:", error.message);
    res.status(500).json({ status: false, message: 'Server Error' });
  }
};


// ------------------- specific assined users project -------------

const getAssignedProjects = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const role = req.query.role?.toLowerCase(); // "owner", "assigned", or undefined

    console.log("➡️ [CONTROLLER] getAssignedProjects called");
    console.log("📌 userId:", userId, "| 📌 role:", role);

    if (!userId) {
      console.warn("⚠️ Missing userId in params");
      return res.status(400).json({ status: false, message: 'User ID is required in URL' });
    }

    let filter = {};

    // Build query based on role
    if (!role || role === 'all') {
      // All projects (owned or assigned)
      filter = {
        $or: [
          { ownerId: userId },
          { assignedUsers: { $in: [userId] } }
        ]
      };
    } else if (role === 'owner') {
      filter = { ownerId: userId };
    } else if (role === 'assigned') {
      filter = {
        assignedUsers: { $in: [userId] },
        ownerId: { $ne: userId } // exclude projects owned by the same user
      };
    } else {
      console.warn("⚠️ Invalid role query parameter");
      return res.status(400).json({ 
        status: false, 
        message: "Invalid role parameter. Use 'owner', 'assigned', or omit for all." 
      });
    }

    const projects = await Project.find(filter);

    console.log(`📊 Found ${projects.length} projects for user ${userId} (${role || 'all'})`);

    if (!projects.length) {
      return res.status(404).json({ 
        status: false, 
        message: `No ${role || 'assigned'} projects found for this user` 
      });
    }

    const formattedProjects = projects.map(p => ({
      id: p.projectId,
      project_name: p.projectName,
      project_description: p.description,
      owner_user_id: p.ownerId,
      assigned_user_ids: p.assignedUsers,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    }));

    res.status(200).json({
      status: true,
      role: role || 'all',
      count: formattedProjects.length,
      projects: formattedProjects
    });

  } catch (error) {
    console.error("❌ Error fetching assigned projects:", error.message);
    res.status(500).json({ status: false, message: 'Server Error' });
  }
};


module.exports = { assignUsersToProject, getAssignedProjects };
