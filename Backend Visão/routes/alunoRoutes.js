const express = require("express");
const router = express.Router();
const alunoController = require("../controllers/alunoController");

// rota para os dados da home
router.get("/recentes", alunoController.listarRecentes);

module.exports = router;
