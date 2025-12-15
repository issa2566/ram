const express = require("express");
const router = express.Router();

const {
  getSectionContent,
  createOrUpdateSectionContent,
  deleteSectionContent,
} = require("../controllers/sectionContentController");

router.get("/", getSectionContent);
router.post("/", createOrUpdateSectionContent);
router.delete("/", deleteSectionContent);

module.exports = router;
