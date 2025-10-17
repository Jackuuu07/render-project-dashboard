const express = require('express');
const { getProjects, addProject, deleteProject, getProjectCards, updateProject, getProjectStatus} = require('../controllers/Project.controllers');
const {assignUsersToProject} = require('../controllers/assignedProjects')
const protect = require('../middlewares/protectRoute')
const {removeAssignedUsers} = require('../controllers/removeassignedProjects')
const { createCard, updateCardStatus } = require('../controllers/Project.controllers');
const { addComment, addReply, likeProject, dislikeProject } = require("../controllers/Project.controllers");
const router = express.Router();
const { addCommentToCard, getCommentsByCard } = require("../controllers/Project.controllers");

router.get('/getproject', protect, getProjects );



// ---------------------- add project ---------------------


router.post('/addproject', protect, (req, res, next) => {
    console.log("➡️ Incoming request to /addproject");
    console.log("📌 Request headers:", req.headers);
    console.log("📌 Request body:", req.body);
    console.log("📌 Logged-in user info (from protect middleware):", req.user);

    // Call the actual controller
    addProject(req, res, next);
});

router.post('/:projectId/assignedproject', protect, assignUsersToProject);

// ---------------------- update project ---------------------

router.put('/:projectId/updateproject', protect, updateProject);

// ---------------------- get project status ---------------------

router.get('/:projectId/status', protect, getProjectStatus);

// -------------------- remove assigned -----------------


router.post('/:projectId/removeassigned', protect, async (req, res, next) => {
  console.log("➡️ [ROUTE] /:projectId/removeassigned called");
  console.log("📌 Params:", req.params);
  console.log("📌 Body:", req.body);
  console.log("📌 Logged-in user:", req.user);

  try {
    await removeAssignedUsers(req, res);
  } catch (err) {
    console.error("❌ Route-level error:", err);
    res.status(500).json({ status: false, message: 'Server Error', error: err.message });
  }
});



// -------------------- delete project ------------------



router.delete('/:projectId', protect, async (req, res, next) => {
  try {
    console.log("\n=============================");
    console.log("➡️ [ROUTE] DELETE /projects/:projectId called");
    console.log("=============================");
    console.log("📌 Request Method:", req.method);
    console.log("📌 Request URL:", req.originalUrl);
    console.log("📌 Params:", req.params);
    console.log("📌 Logged-in User Info:", req.user ? req.user : "❌ No user info found in request");

    // Continue to the controller
    await deleteProject(req, res, next);

    console.log("✅ [ROUTE] deleteProject controller executed successfully");
  } catch (err) {
    console.error("❌ [ROUTE] Error while calling deleteProject:", err);
    res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
  }
});



// --------------- card creation and updation ----------------------
// ✳️ Create Card (Any member can do this)
router.post('/cards', protect, createCard);

router.put('/:projectId/cards/status', protect, updateCardStatus);


// --------------- list all card in project ----------

router.get('/:projectId/cards', getProjectCards);

// -------------- comment / reply / liked / disliked --------------


router.post("/comment", protect, addComment);
router.post("/reply", protect, addReply);
router.post("/like", protect, likeProject);
router.post("/dislike", protect, dislikeProject);


// -------------------------- comment / listComment into card ----------------

// ======================= ROUTES =======================

// 🟢 POST: Add Comment to a Card
router.post("/:projectId/card/:cardId/comment", protect, (req, res, next) => {
  console.log("📩 [ROUTER] POST /project/:projectId/card/:cardId/comment called");
  console.log("➡️ Params:", req.params);
  console.log("➡️ Body:", req.body);
  console.log("➡️ User:", req.user);
  next(); // continue to controller
}, addCommentToCard);

// 🟣 GET: List All Comments for a Card
router.get("/:projectId/card/:cardId/comments", protect, (req, res, next) => {
  console.log("📜 [ROUTER] GET /project/:projectId/card/:cardId/comments called");
  console.log("➡️ Params:", req.params);
  console.log("➡️ User:", req.user);
  next(); // continue to controller
}, getCommentsByCard);


module.exports = router;    
