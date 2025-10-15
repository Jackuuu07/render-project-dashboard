const mongoose = require('mongoose');
const Project = require('../models/project.model');



const removeAssignedUsers = async (req, res) => {
  try {
    console.log("➡️ [CONTROLLER] removeAssignedUsers called");

    const projectId = parseInt(req.params.projectId);
    let { assigneduser_id } = req.body;

    console.log("📌 Project ID from URL:", projectId);
    console.log("📌 Incoming assigneduser_id from body:", assigneduser_id);

    // Ensure assigneduser_id exists
    if (!assigneduser_id) {
      return res.status(400).json({ status: false, message: 'assigneduser_id is required' });
    }

    // Wrap single ID into array
    if (!Array.isArray(assigneduser_id)) {
      assigneduser_id = [assigneduser_id];
    }

    console.log("📌 Normalized assigneduser_id array:", assigneduser_id);

    // Check logged-in user
    if (!req.user || !req.user.id) {
      console.error("❌ No logged-in user info in req.user");
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    // Validate projectId
    if (!projectId) {
      return res.status(400).json({ status: false, message: 'Project ID is required' });
    }

    // Find the project
    const project = await Project.findOne({ projectId });
    if (!project) {
      console.error("❌ Project not found");
      return res.status(404).json({ status: false, message: 'Project not found' });
    }

    console.log("📌 Project ownerId:", project.ownerId);
    console.log("📌 Existing assignedUsers before removal:", project.assignedUsers);

    // Only owner can remove users
    if (project.ownerId.toString() !== req.user.id.toString()) {
      console.error("❌ Logged-in user is not the owner");
      return res.status(403).json({ status: false, message: 'Only owner can remove assigned users' });
    }

    // Ensure assignedUsers is an array
    let assignedUsers = project.assignedUsers || [];
    if (!Array.isArray(assignedUsers)) assignedUsers = [];
    project.assignedUsers = assignedUsers; // initialize if undefined

    // Remove numeric IDs
    const removeIdsSet = new Set(assigneduser_id.map(Number));
    console.log("📌 Removing numeric users:", Array.from(removeIdsSet));

    // Log each user removal individually
    assignedUsers.forEach(userId => {
      if (removeIdsSet.has(userId)) {
        console.log(`🗑️ Removing user ID: ${userId}`);
      }
    });

    // Filter out the users to remove
    project.assignedUsers = assignedUsers.filter(userId => !removeIdsSet.has(userId));

    console.log("✅ Updated assignedUsers after removal:", project.assignedUsers);

    // Save the project
    await project.save();
    console.log("💾 Project saved successfully");

    // Respond with updated project data
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
    console.error("❌ removeAssignedUsers Controller Error:", error);
    res.status(500).json({ status: false, message: 'Server Error', error: error.message });
  }
};


module.exports = { removeAssignedUsers };
