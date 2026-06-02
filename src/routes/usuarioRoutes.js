const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

router.get("/", usuarioController.listarUsuarios);

router.post("/login", usuarioController.login);

router.post("/cadastrar", usuarioController.cadastrarUsuario);

module.exports = router;
