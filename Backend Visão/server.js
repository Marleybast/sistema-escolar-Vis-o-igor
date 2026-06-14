const express = require("express");
require("dotenv").config();
const rotasUsuarios = require("./routes/usuarioRoutes");
const rotasAlunos = require("./routes/alunoRoutes"); //  Importa as rotas de alunos

const app = express();

app.use(express.json());

// rotas do Sistema
app.use("/usuarios", rotasUsuarios);
app.use("/api/alunos", rotasAlunos); //  rota para a Homepage

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(` Servidor rodando na porta ${PORTA}!`);
});
