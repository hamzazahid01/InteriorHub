const express = require("express");
const { getRoot } = require("../controllers/rootController");

const router = express.Router();

router.get("/", getRoot);

module.exports = router;

