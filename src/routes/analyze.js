const { Router } = require("express");
const { analyseValidator } = require("../validators/analyse");
const { validate } = require("../utils/utils");
const { analyze } = require("../controllers/analyze");
const router = Router();

router.post("/question", analyseValidator, validate, analyze);

module.exports = router;
