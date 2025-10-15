const Project = require('../models/project.model');

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

module.exports = { assignUsersToProject };
