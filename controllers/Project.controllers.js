const Project = require('../models/project.model');
const Counter = require('../models/counter.model');
const Card = require('../models/CardCreation.mdoel')
const Comment = require("../models/commentProject.model");
const Reply = require("../models/replyProject.model");
const Like = require("../models/likeProject.model");
const Dislike = require("../models/dislikeProject.model");
const User = require('../models/user.models')
//  ------ for listing projects ----
const getProjects = async (req, res) => {
  try {
    console.log("\n➡️ [CONTROLLER] getProjects called");

    // 🧠 Log user info coming from middleware
    console.log("👤 Logged-in user object:", req.user);

    const ownerId = Number(req.user.id);
    console.log("📌 Converted User ID:", ownerId);

    // ✅ Fetch projects for this user
    console.log("🔍 Querying database for projects with userId:", ownerId);
    const projects = await Project.find({ ownerId }).sort({ createdAt: -1 });

    console.log(`📦 Projects fetched: ${projects.length}`);

    // 🧾 Log details of each project (optional, helpful for debugging)
    projects.forEach((proj, i) => {
      console.log(`   ${i + 1}. Project ID: ${proj.projectId}, Name: ${proj.projectName}`);
    });

    res.status(200).json({
      success: true,
      message: 'Data fetched successfully',
      data: projects
    });

  } catch (error) {
    console.error("❌ [getProjects] Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// ----------- for adding projects ----


const addProject = async (req, res) => {
  try {
    console.log("🚀 Incoming request body:", req.body);

    const { projectName, description, date } = req.body;

    if (!projectName || !description || !date) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({ message: 'Project name, description, and date are required' });
    }

    console.log("✅ All required fields are present");
    console.log("📌 Logged-in user info from JWT:", req.user);

    const newProject = new Project({
      projectName,
      description,
      date,
      ownerId: req.user.id // owner is logged-in user
    });

    console.log("💾 Saving new project to database:", newProject);

    await newProject.save();

    console.log("🎉 Project saved successfully:", newProject);

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        projectId: newProject.projectId,
        projectName: newProject.projectName,
        ownerId: newProject.ownerId,
        description: newProject.description,
        date: newProject.date
      }
    });
  } catch (error) {
    console.error('❌ Add Project Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ------------------- update project name & description -------------------
const updateProject = async (req, res) => {
  try {
    console.log("\n🚀 [CONTROLLER] updateProject called");

    // Extract projectId from URL
    const projectId = parseInt(req.params.projectId);
    console.log("📦 Project ID (from URL params):", projectId);

    // Extract new data from request body
    const { projectName, description } = req.body;
    console.log("📝 Incoming body data:", { projectName, description });

    // ✅ Validation checks
    if (!projectId) {
      console.warn("⚠️ Missing projectId in URL");
      return res.status(400).json({ status: false, message: "Project ID is required" });
    }

    if (!projectName && !description) {
      console.warn("⚠️ No fields provided for update");
      return res.status(400).json({ 
        status: false, 
        message: "At least one field (projectName or description) is required to update" 
      });
    }

    // ✅ Fetch project from DB
    console.log("🔍 Searching for project in database...");
    const project = await Project.findOne({ projectId });

    if (!project) {
      console.error("❌ Project not found in database");
      return res.status(404).json({ status: false, message: "Project not found" });
    }

    console.log("✅ Project found:", {
      projectId: project.projectId,
      ownerId: project.ownerId,
      projectName: project.projectName
    });

    // ✅ Verify ownership
    console.log("👤 Logged-in user ID:", req.user.id);
    if (project.ownerId.toString() !== req.user.id.toString()) {
      console.warn("🚫 Unauthorized update attempt by user:", req.user.id);
      return res.status(403).json({ 
        status: false, 
        message: "Only the project owner can update this project" 
      });
    }

    // ✅ Update fields
    if (projectName) {
      console.log("🛠️ Updating projectName:", projectName);
      project.projectName = projectName;
    }
    if (description) {
      console.log("🛠️ Updating description:", description);
      project.description = description;
    }

    // ✅ Save updated project
    console.log("💾 Saving updated project...");
    await project.save();

    console.log("🎉 Project updated successfully:", {
      projectId: project.projectId,
      projectName: project.projectName,
      description: project.description
    });

    // ✅ Send response
    return res.status(200).json({
      status: true,
      message: "Project updated successfully",
      updatedProject: {
        projectId: project.projectId,
        projectName: project.projectName,
        description: project.description,
        date: project.date,
        ownerId: project.ownerId
      }
    });

  } catch (error) {
    console.error("🔥 [ERROR in updateProject]:", error);
    return res.status(500).json({ 
      status: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};



// --------------for delete project --------------
const deleteProject = async (req, res) => {
  try {
    console.log("➡️ [CONTROLLER] deleteProject called");

    const projectId = req.params.projectId;

    if (!projectId) {
      return res.status(400).json({ status: false, message: 'Project ID is required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    // Find the project
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ status: false, message: 'Project not found' });
    }

    // Only owner can delete
    if (project.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ status: false, message: 'Only owner can delete this project' });
    }

    // Optional: Log assigned users being removed
    if (project.assignedUsers.length > 0) {
      console.log("🗑️ Removing assigned users:", project.assignedUsers);
    }

    // Delete the project
    await Project.deleteOne({ projectId });
    console.log(`✅ Project ${projectId} deleted successfully`);

    res.status(200).json({ status: true, message: 'Project deleted successfully' });

  } catch (error) {
    console.error("❌ deleteProject Controller Error:", error);
    res.status(500).json({ status: false, message: 'Server Error', error: error.message });
  }
};


// ------------------ card creation in project ---------------------------------

/** helper: get next sequence number (auto-increment) */
const getNextSequence = async (sequenceName) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const createCard = async (req, res) => {
  try {
    console.log("➡️ [CONTROLLER] createCard called");

    const { projectId, cardName, cardDescription } = req.body;
    if (!projectId || !cardName || !cardDescription) {
      return res.status(400).json({ status: false, message: 'projectId, cardName and cardDescription are required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const project = await Project.findOne({ projectId: Number(projectId) });
    if (!project) {
      return res.status(404).json({ status: false, message: 'Project not found' });
    }

    const userIdNum = Number(req.user.id);
    const assignedUsersNums = Array.isArray(project.assignedUsers) ? project.assignedUsers.map(Number) : [];
    const isMember = (project.ownerId.toString() === req.user.id.toString()) || assignedUsersNums.includes(userIdNum);

    if (!isMember) {
      return res.status(403).json({ status: false, message: 'Only project members or owner can create cards' });
    }

    // generate cardId
    const newCardId = await getNextSequence('cardId');
    console.log("🆔 Generated cardId:", newCardId);

    const newCard = new Card({
      cardId: newCardId,
      projectId: Number(projectId),
      creatorId: userIdNum,
      cardName,
      cardDescription,
      status: 'start'
    });

    await newCard.save();
    console.log("✅ Card created successfully:", { cardId: newCard.cardId });

    return res.status(201).json({
      status: true,
      message: 'Card created successfully',
      card: {
        cardId: newCard.cardId,
        projectId: newCard.projectId,
        creatorId: newCard.creatorId,
        cardName: newCard.cardName,
        cardDescription: newCard.cardDescription,
        status: newCard.status,
        createdAt: newCard.createdAt,
        updatedAt: newCard.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ createCard Controller Error:", error);
    return res.status(500).json({ status: false, message: 'Server Error', error: error.message });
  }
};


const updateCardStatus = async (req, res) => {
  try {
    console.log("\n➡️ [CONTROLLER] updateCardStatus called");

    const projectId = parseInt(req.params.projectId);
    const { cardId, status } = req.body;

    console.log("📌 Project ID:", projectId);
    console.log("📌 Card ID to update:", cardId);
    console.log("📌 New status:", status);

    // ✅ Basic validation
    if (!projectId || !cardId || !status) {
      return res.status(400).json({ 
        status: false, 
        message: "Project ID, card ID, and status are required" 
      });
    }

    const validStatuses = ["start", "ongoing", "complete"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        status: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    // ✅ Find the card in Card collection
    const card = await Card.findOne({ cardId, projectId });
    if (!card) {
      return res.status(404).json({ status: false, message: "Card not found in this project" });
    }

    // ✅ Optional: Check if user is authorized (if you have ownerId or assigned users)
    if (card.creatorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        status: false, 
        message: "You are not authorized to update this card" 
      });
    }

    // ✅ Update status
    card.status = status.toLowerCase();
    await card.save();

    console.log(`✅ Card ${cardId} status updated to ${status}`);

    return res.status(200).json({
      status: true,
      message: "Card status updated successfully",
      card,
    });

  } catch (error) {
    console.error("❌ updateCardStatus Error:", error);
    res.status(500).json({ status: false, message: "Server Error", error: error.message });
  }
};

// ---------------- list all card in specific project ------------------

const getProjectCards = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    console.log("📌 Fetching cards for Project ID:", projectId);

    if (!projectId) {
      return res.status(400).json({ 
        status: false, 
        message: "Project ID is required" 
      });
    }

    // ✅ Fetch cards for the project
    const cards = await Card.find({ projectId });

    if (!cards || cards.length === 0) {
      return res.status(404).json({ status: false, message: "No cards found for this project" });
    }

    return res.status(200).json({
      status: true,
      message: `Found ${cards.length} card(s) for this project`,
      cards,
    });

  } catch (error) {
    console.error("❌ getProjectCards Error:", error);
    return res.status(500).json({ status: false, message: "Server Error", error: error.message });
  }
};




// ------------------------------- 1️⃣ Add Comment ------------------------------
const addComment = async (req, res) => {
  try {
    const { projectId, commentText } = req.body;
    const userId = req.user.id;

    if (!projectId || !commentText) {
      return res.status(400).json({ success: false, message: "projectId and commentText are required" });
    }

    const user = await User.findOne({ userId });
    const comment = await Comment.create({ projectId, userId, commentText });

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: {
        _id: comment._id,
        projectId,
        userId,
        username: user ? user.name : "Unknown",
        commentText,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------- 2️⃣ Add Reply ------------------------------
const addReply = async (req, res) => {
  try {
    const { commentId, replyText } = req.body;
    const userId = req.user.id;

    if (!commentId || !replyText) {
      return res.status(400).json({ success: false, message: "commentId and replyText are required" });
    }

    const user = await User.findOne({ userId });
    const reply = await Reply.create({ commentId, userId, replyText });

    res.status(201).json({
      success: true,
      message: "Reply added",
      data: {
        _id: reply._id,
        commentId,
        userId,
        username: user ? user.name : "Unknown",
        replyText,
        createdAt: reply.createdAt
      }
    });
  } catch (error) {
    console.error("❌ Error adding reply:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------- 3️⃣ Like Project ------------------------------------
const likeProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user.id;

    const existingLike = await Like.findOne({ projectId, userId });
    if (existingLike) {
      return res.status(400).json({ success: false, message: "Already liked this project" });
    }

    await Dislike.deleteOne({ projectId, userId });
    await Like.create({ projectId, userId });

    const likes = await Like.find({ projectId });
    const users = await User.find({ userId: { $in: likes.map(l => l.userId) } });

    const likedUsers = likes.map(like => {
      const user = users.find(u => u.userId === like.userId);
      return {
        userId: like.userId,
        username: user ? user.name : "Unknown"
      };
    });

    res.status(200).json({
      success: true,
      message: "Project liked",
      likesCount: likedUsers.length,
      likedUsers
    });
  } catch (error) {
    console.error("❌ Error liking project:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------------------- 4️⃣ Dislike Project ----------------------------------
const dislikeProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user.id;

    const existingDislike = await Dislike.findOne({ projectId, userId });
    if (existingDislike) {
      return res.status(400).json({ success: false, message: "Already disliked this project" });
    }

    await Like.deleteOne({ projectId, userId });
    await Dislike.create({ projectId, userId });

    const likes = await Like.find({ projectId });
    const dislikes = await Dislike.find({ projectId });

    const likeUsers = await User.find({ userId: { $in: likes.map(l => l.userId) } });
    const dislikeUsers = await User.find({ userId: { $in: dislikes.map(d => d.userId) } });

    const likedUsers = likeUsers.map(u => ({ userId: u.userId, username: u.name }));
    const dislikedUsers = dislikeUsers.map(u => ({ userId: u.userId, username: u.name }));

    res.status(200).json({
      success: true,
      message: "Project disliked",
      likesCount: likedUsers.length,
      dislikesCount: dislikedUsers.length,
      likedUsers,
      dislikedUsers
    });
  } catch (error) {
    console.error("❌ Error disliking project:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- userassineg project status ----------------------

// GET: /api/project/:projectId/status
const getProjectStatus = async (req, res) => {
  try {
    console.log("➡️ [CONTROLLER] getProjectStatus called");

    const { projectId } = req.params;
    console.log("📌 Project ID:", projectId);

    const project = await Project.findOne({ projectId });
    if (!project) {
      console.log("❌ Project not found");
      return res.status(404).json({ status: false, message: "Project not found" });
    }

    // Fetch users using userId (number)
    const allUsers = await User.find({}, "userId name email");
    console.log("👥 Total Users Found:", allUsers.length);

    console.log("📋 Project assigneduser_id array:", project.assignedUsers);

    const assignedUserIds = project.assignedUsers || [];

    const userStatusList = allUsers.map((user) => ({
      userId: user.userId,  // number, not string
      name: user.name,
      email: user.email,
      isAssigned: assignedUserIds.includes(user.userId),
    }));

    const response = {
      status: true,
      message: "Project status and user assignment fetched successfully",
      project: {
        projectId: project.projectId,
        projectName: project.projectName,
        description: project.description,
        ownerId: project.ownerId,
      },
      users: userStatusList,
    };

    console.log("✅ Response prepared successfully");
    res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in getProjectStatus:", error.message);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};



module.exports = { addProject, updateProject  , getProjects, getProjectStatus, deleteProject, createCard, updateCardStatus, getProjectCards,
                   addComment, addReply, likeProject, dislikeProject };

