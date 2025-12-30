const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/me", requireAuth, (req, res) => {
  return res.json({ ok: true, user: req.user });
});

module.exports = router;
