const Project = require('../models/project.model');
const Counter = require('../models/counter.model');
const Card = require('../models/CardCreation.mdoel')
const Comment = require("../models/commentProject.model");
const Reply = require("../models/replyProject.model");
const Like = require("../models/likeComment.model");
const Dislike = require("../models/dislikeComment.model");
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


// ------------------- update card status -----------------
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

// -------------------- user assing project status ----------------------

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







// ---------------- Add Comment to a Card ----------------



// controllers/commentCard.controller.js


const getNextCommentId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "commentId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const addCommentToCard = async (req, res) => {
  try {
    console.log("➡️ [CONTROLLER] addCommentToCard called");

    const { projectId, cardId } = req.params;
    const { commentText } = req.body;
    const userId = req.user.id;

    if (!projectId || !cardId || !commentText) {
      return res.status(400).json({ status: false, message: "projectId, cardId, and commentText are required" });
    }

    const card = await Card.findOne({ projectId: Number(projectId), cardId: Number(cardId) });
    if (!card) return res.status(404).json({ status: false, message: "Card not found for this project" });

    const nextCommentId = await getNextCommentId();
    console.log("📝 Auto-incremented commentId:", nextCommentId);

    const newComment = new Comment({
      commentId: nextCommentId,
      projectId: Number(projectId),
      cardId: Number(cardId),
      userId: Number(userId),
      commentText,
    });

    await newComment.save();

    const user = await User.findOne({ userId: Number(userId) });

    console.log("✅ New comment created:", {
      commentId: newComment.commentId,
      projectId: newComment.projectId,
      cardId: newComment.cardId,
      userId: newComment.userId,
      username: user ? user.name : "Unknown",
    });

    return res.status(201).json({
      status: true,
      message: "Comment added successfully",
      data: {
        commentId: newComment.commentId,
        projectId: newComment.projectId,
        cardId: newComment.cardId,
        userId: newComment.userId,
        username: user ? user.name : "Unknown",
        commentText: newComment.commentText,
        createdAt: newComment.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ addCommentToCard Error:", error);
    return res.status(500).json({ status: false, message: "Server Error", error: error.message });
  }
};






// ------------------------- listing all comments to the card --------------
// controllers/commentCard.controller.js (same file)
const getCommentsByCard = async (req, res) => {
  try {
    console.log("➡️ [CONTROLLER] getCommentsByCard called");

    const { projectId, cardId } = req.params;
    console.log("📌 Params:", { projectId, cardId });

    if (!projectId || !cardId) {
      return res.status(400).json({ 
        status: false, 
        message: "projectId and cardId are required" 
      });
    }

    // ✅ Fetch comments sorted by creation date descending
    const comments = await Comment.find({ 
      projectId: Number(projectId),
      cardId: Number(cardId)
    }).sort({ createdAt: -1 }).lean(); // lean() gives plain JS objects

    if (!comments || comments.length === 0) {
      return res.status(404).json({ status: false, message: "No comments found for this card" });
    }

    // ✅ Fetch user info for all comments
    const userIds = comments.map(c => c.userId);
    const users = await User.find({ userId: { $in: userIds } }, "userId name").lean();

    // ✅ Prepare comment list with numeric commentId
    const commentList = comments.map(comment => {
      const user = users.find(u => u.userId === comment.userId);
      return {
        commentId: Number(comment.commentId), // ensure numeric
        cardId: Number(comment.cardId),
        userId: Number(comment.userId),
        username: user ? user.name : "Unknown",
        commentText: comment.commentText,
        likes: comment.likes || 0,
        dislikes: comment.dislikes || 0,
        createdAt: comment.createdAt,
      };
    });

    console.log(`📦 Found ${commentList.length} comments`);
    return res.status(200).json({
      status: true,
      message: `Found ${commentList.length} comments for this card`,
      comments: commentList,
    });
  } catch (error) {
    console.error("❌ getCommentsByCard Error:", error);
    return res.status(500).json({ status: false, message: "Server Error", error: error.message });
  }
};


// ----------------------------------------------------------------------------------------
// 🟢 Like a Comment
// ----------------------------------------------------------------------------------------

const likeComment = async (req, res) => {
  try {
    const { projectId, cardId, commentId } = req.params;
    const userId = req.user.id;

    console.log("\n🕒 [INFO]", new Date().toLocaleString());
    console.log("👍 [CONTROLLER] likeComment called");
    console.log("📩 Params received:", { projectId, cardId, commentId });
    console.log("🙋 User ID:", userId);

    // Validate input
    if (!projectId || !cardId || !commentId) {
      console.warn("⚠️ Missing required params:", { projectId, cardId, commentId });
      return res.status(400).json({
        status: false,
        message: "projectId, cardId, and commentId are required"
      });
    }

    // Find the comment under the given project and card
    console.log("🔍 Searching for comment in database...");
    const comment = await Comment.findOne({
      projectId: Number(projectId),
      cardId: Number(cardId),
      commentId: Number(commentId)
    });

    if (!comment) {
      console.warn("❌ Comment not found for given IDs:", { projectId, cardId, commentId });
      return res.status(404).json({ status: false, message: "Comment not found" });
    }

    console.log("✅ Comment found:", {
      commentId: comment.commentId,
      likes: comment.likes,
      dislikes: comment.dislikes,
      likedByCount: comment.likedBy.length,
      dislikedByCount: comment.dislikedBy.length,
    });

    // Check if the user already liked it
    if (comment.likedBy.includes(userId)) {
      console.log("🔁 User already liked this comment — removing like...");
      comment.likes -= 1;
      comment.likedBy = comment.likedBy.filter(id => id !== userId);
      await comment.save();

      console.log("✅ Like removed successfully. Updated likes:", comment.likes);
      return res.status(200).json({
        status: true,
        message: "Like removed",
        likes: comment.likes
      });
    }

    // If the user had disliked it earlier
    if (comment.dislikedBy.includes(userId)) {
      console.log("↩️ User previously disliked — removing dislike before adding like...");
      comment.dislikes -= 1;
      comment.dislikedBy = comment.dislikedBy.filter(id => id !== userId);
    }

    // Add new like
    console.log("➕ Adding new like...");
    comment.likes += 1;
    comment.likedBy.push(userId);
    await comment.save();

    console.log("✅ Like added successfully:", {
      likes: comment.likes,
      dislikes: comment.dislikes,
      likedBy: comment.likedBy,
    });

    return res.status(200).json({
      status: true,
      message: "Comment liked successfully",
      likes: comment.likes,
      dislikes: comment.dislikes,
    });
  } catch (error) {
    console.error("🔥 [ERROR] likeComment Exception:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message
    });
  }
};





// --------------------------------------------------------------------------------------
// 🔴 Dislike a Comment
// -----------------------------------------------------------------------

const dislikeComment = async (req, res) => {
  try {
    const { projectId, cardId, commentId } = req.params;
    const userId = req.user.id;

    console.log("\n🕒 [INFO]", new Date().toLocaleString());
    console.log("👎 [CONTROLLER] dislikeComment called");
    console.log("📩 Params received:", { projectId, cardId, commentId });
    console.log("🙋 User ID:", userId);

    // ✅ Validate input
    if (!projectId || !cardId || !commentId) {
      console.warn("⚠️ Missing required params:", { projectId, cardId, commentId });
      return res.status(400).json({
        status: false,
        message: "projectId, cardId, and commentId are required"
      });
    }

    // ✅ Find the comment in the DB
    console.log("🔍 Searching for comment in database...");
    const comment = await Comment.findOne({
      projectId: Number(projectId),
      cardId: Number(cardId),
      commentId: Number(commentId)
    });

    if (!comment) {
      console.warn("❌ Comment not found for given IDs:", { projectId, cardId, commentId });
      return res.status(404).json({ status: false, message: "Comment not found" });
    }

    console.log("✅ Comment found:", {
      commentId: comment.commentId,
      likes: comment.likes,
      dislikes: comment.dislikes,
      likedByCount: comment.likedBy.length,
      dislikedByCount: comment.dislikedBy.length,
    });

    // ✅ If already disliked → remove dislike
    if (comment.dislikedBy.includes(userId)) {
      console.log("🔁 User already disliked — removing dislike...");
      comment.dislikes -= 1;
      comment.dislikedBy = comment.dislikedBy.filter(id => id !== userId);
      await comment.save();

      console.log("✅ Dislike removed successfully. Updated dislikes:", comment.dislikes);
      return res.status(200).json({
        status: true,
        message: "Dislike removed",
        dislikes: comment.dislikes
      });
    }

    // ✅ If liked earlier → remove that like
    if (comment.likedBy.includes(userId)) {
      console.log("↩️ User previously liked — removing like before adding dislike...");
      comment.likes -= 1;
      comment.likedBy = comment.likedBy.filter(id => id !== userId);
    }

    // ✅ Add new dislike
    console.log("➕ Adding new dislike...");
    comment.dislikes += 1;
    comment.dislikedBy.push(userId);
    await comment.save();

    console.log("✅ Dislike added successfully:", {
      likes: comment.likes,
      dislikes: comment.dislikes,
      likedBy: comment.likedBy,
      dislikedBy: comment.dislikedBy,
    });

    return res.status(200).json({
      status: true,
      message: "Comment disliked successfully",
      likes: comment.likes,
      dislikes: comment.dislikes,
    });

  } catch (error) {
    console.error("🔥 [ERROR] dislikeComment Exception:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message
    });
  }
};


module.exports = {
  
  // (and your other exports like getCommentsByCard)
};







module.exports = { addProject, updateProject  , getProjects, getProjectStatus, deleteProject, createCard, updateCardStatus, getProjectCards,
                   addComment, addReply, likeProject, dislikeProject, addCommentToCard, getCommentsByCard,addCommentToCard,likeComment, dislikeComment };
