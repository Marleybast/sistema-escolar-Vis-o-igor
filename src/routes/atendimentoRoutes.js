const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/atendimentoController");

router.get("/",                       ctrl.listar);
router.post("/",                      ctrl.criar);
router.post("/enviar-para-todos",     ctrl.enviarParaTodos);
router.put("/:id/assumir",            ctrl.assumir);
router.put("/:id/encerrar",           ctrl.encerrar);
router.get("/:id/mensagens",          ctrl.listarMensagens);
router.post("/:id/mensagens",         ctrl.enviarMensagem);
router.put("/:id/mensagens/lidas",    ctrl.marcarLidas);

module.exports = router;