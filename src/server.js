const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const rotasUsuarios = require("./routes/usuarioRoutes");
const rotasAlunos = require("./routes/alunoRoutes");
const rotasMatriculas = require("./routes/matriculaRoutes");
const rotasAtendimento = require("./routes/atendimentoRoutes");
const rotasAgendamento = require("./routes/agendamentoRoutes");
const iniciarSocket = require("./socket/chat");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/usuarios", rotasUsuarios);
app.use("/api/alunos", rotasAlunos);
app.use("/api/matriculas", rotasMatriculas);
app.use("/api/atendimentos", rotasAtendimento);
app.use("/api/agendamentos", rotasAgendamento);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
});

iniciarSocket(io);

const PORTA = process.env.PORT || 3000;
server.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));
