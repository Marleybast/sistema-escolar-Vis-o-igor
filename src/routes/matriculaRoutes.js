const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/matriculaController");

router.get("/recentes", ctrl.listarRecentes);
router.get("/vagas/:turma_id", ctrl.consultarVagas);
router.get("/", ctrl.listar);
router.post("/", ctrl.criar);
router.put("/:id/status", ctrl.atualizarStatus);

module.exports = router;
