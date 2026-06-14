const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

// Rota para listar todos os usuários (que você já tinha)
router.get("/", usuarioController.listarUsuarios);

// NOVA: Rota para processar o login enviado pela tela
router.post("/login", usuarioController.login);

module.exports = router;
