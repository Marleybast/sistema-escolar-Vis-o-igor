const db = require("../config/db");

const usuariosOnline = new Map();

function iniciarSocket(io) {
  io.on("connection", (socket) => {
    socket.on("autenticar", (userId) => {
      usuariosOnline.set(String(userId), socket.id);
      socket.userId = String(userId);
      io.emit("online_count", usuariosOnline.size);
    });

    socket.on("entrar_atendimento", (atendimentoId) => {
      socket.join(`atendimento_${atendimentoId}`);
    });

    socket.on("nova_mensagem", async (dados) => {
      try {
        const { atendimento_id, remetente_id, conteudo } = dados;
        if (!atendimento_id || !remetente_id || !conteudo?.trim()) return;

        const [result] = await db.query(
          "INSERT INTO mensagens (atendimento_id, remetente_id, conteudo) VALUES (?, ?, ?)",
          [atendimento_id, remetente_id, conteudo.trim()],
        );

        const [[usuario]] = await db.query(
          "SELECT nome, perfil FROM usuarios WHERE id = ?",
          [remetente_id],
        );

        io.to(`atendimento_${atendimento_id}`).emit("mensagem_recebida", {
          id: result.insertId,
          atendimento_id,
          remetente_id,
          remetente: usuario?.nome || "Usuário",
          perfil: usuario?.perfil,
          conteudo: conteudo.trim(),
          enviado_em: new Date().toISOString(),
        });
      } catch (err) {
        socket.emit("erro_socket", { mensagem: "Erro ao enviar mensagem" });
      }
    });

    socket.on("digitando", ({ atendimento_id, nome }) => {
      socket
        .to(`atendimento_${atendimento_id}`)
        .emit("usuario_digitando", { nome });
    });

    socket.on("parou_digitar", ({ atendimento_id }) => {
      socket.to(`atendimento_${atendimento_id}`).emit("usuario_parou_digitar");
    });

    socket.on("encerrar_atendimento", async ({ atendimento_id }) => {
      await db.query(
        "UPDATE atendimentos SET status = 'encerrado', encerrado_em = NOW() WHERE id = ?",
        [atendimento_id],
      );
      io.to(`atendimento_${atendimento_id}`).emit("atendimento_encerrado", {
        atendimento_id,
      });
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        usuariosOnline.delete(socket.userId);
        io.emit("online_count", usuariosOnline.size);
      }
    });
  });
}

module.exports = iniciarSocket;
