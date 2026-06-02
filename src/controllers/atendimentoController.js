const db = require("../config/db");

const atendimentoController = {
  listar: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT at.id, a.nome AS aluno, u.nome AS atendente,
               at.assunto, at.status, at.prioridade, at.criado_em
        FROM atendimentos at
        JOIN alunos a ON at.aluno_id = a.id
        LEFT JOIN usuarios u ON at.atendente_id = u.id
        ORDER BY FIELD(at.status,'aberto','em_andamento','encerrado'),
                 FIELD(at.prioridade,'alta','normal','baixa'), at.criado_em DESC
      `);
      res.json(rows);
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao listar atendimentos", erro: err.message });
    }
  },

  criar: async (req, res) => {
    try {
      const { aluno_id, assunto, prioridade } = req.body;
      if (!aluno_id || !assunto)
        return res
          .status(400)
          .json({ mensagem: "aluno_id e assunto são obrigatórios." });

      const [[aluno]] = await db.query("SELECT id FROM alunos WHERE id = ?", [
        aluno_id,
      ]);
      if (!aluno)
        return res.status(404).json({ mensagem: "Aluno não encontrado." });

      const [result] = await db.query(
        "INSERT INTO atendimentos (aluno_id, assunto, prioridade) VALUES (?, ?, ?)",
        [aluno_id, assunto, prioridade || "normal"],
      );
      res
        .status(201)
        .json({
          mensagem: "Atendimento aberto!",
          atendimento_id: result.insertId,
        });
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao abrir atendimento", erro: err.message });
    }
  },

  assumir: async (req, res) => {
    try {
      const { atendente_id } = req.body;
      if (!atendente_id)
        return res
          .status(400)
          .json({ mensagem: "atendente_id é obrigatório." });

      const [[ticket]] = await db.query(
        "SELECT id, status FROM atendimentos WHERE id = ?",
        [req.params.id],
      );
      if (!ticket)
        return res
          .status(404)
          .json({ mensagem: "Atendimento não encontrado." });
      if (ticket.status === "encerrado")
        return res.status(400).json({ mensagem: "Atendimento já encerrado." });

      await db.query(
        "UPDATE atendimentos SET atendente_id = ?, status = 'em_andamento' WHERE id = ?",
        [atendente_id, req.params.id],
      );
      res.json({ mensagem: "Atendimento assumido!" });
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao assumir atendimento", erro: err.message });
    }
  },

  encerrar: async (req, res) => {
    try {
      const [result] = await db.query(
        "UPDATE atendimentos SET status = 'encerrado', encerrado_em = NOW() WHERE id = ?",
        [req.params.id],
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ mensagem: "Atendimento não encontrado." });
      res.json({ mensagem: "Atendimento encerrado!" });
    } catch (err) {
      res.status(500).json({ mensagem: "Erro ao encerrar", erro: err.message });
    }
  },

  listarMensagens: async (req, res) => {
    try {
      const [rows] = await db.query(
        `
        SELECT m.id, u.nome AS remetente, u.perfil, m.conteudo, m.lida, m.enviado_em
        FROM mensagens m
        JOIN usuarios u ON m.remetente_id = u.id
        WHERE m.atendimento_id = ? ORDER BY m.enviado_em ASC
      `,
        [req.params.id],
      );
      res.json(rows);
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao buscar mensagens", erro: err.message });
    }
  },

  enviarMensagem: async (req, res) => {
    try {
      const { remetente_id, conteudo } = req.body;
      if (!remetente_id || !conteudo)
        return res
          .status(400)
          .json({ mensagem: "remetente_id e conteudo são obrigatórios." });

      const [result] = await db.query(
        "INSERT INTO mensagens (atendimento_id, remetente_id, conteudo) VALUES (?, ?, ?)",
        [req.params.id, remetente_id, conteudo],
      );
      res
        .status(201)
        .json({ mensagem: "Mensagem enviada!", mensagem_id: result.insertId });
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao enviar mensagem", erro: err.message });
    }
  },

  marcarLidas: async (req, res) => {
    try {
      await db.query(
        "UPDATE mensagens SET lida = 1 WHERE atendimento_id = ? AND lida = 0",
        [req.params.id],
      );
      res.json({ mensagem: "Mensagens marcadas como lidas." });
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao marcar mensagens", erro: err.message });
    }
  },

  enviarParaTodos: async (req, res) => {
    try {
      const { remetente_id, conteudo, assunto } = req.body;
      if (!remetente_id || !conteudo || !assunto)
        return res
          .status(400)
          .json({
            mensagem: "remetente_id, assunto e conteudo são obrigatórios.",
          });

      const [alunos] = await db.query(
        "SELECT id FROM alunos WHERE status = 'ativo'",
      );
      let enviados = 0;
      for (const aluno of alunos) {
        const [ticket] = await db.query(
          "INSERT INTO atendimentos (aluno_id, assunto, prioridade) VALUES (?, ?, 'baixa')",
          [aluno.id, assunto],
        );
        await db.query(
          "INSERT INTO mensagens (atendimento_id, remetente_id, conteudo) VALUES (?, ?, ?)",
          [ticket.insertId, remetente_id, conteudo],
        );
        enviados++;
      }
      res.json({ mensagem: `Mensagem enviada para ${enviados} aluno(s).` });
    } catch (err) {
      res
        .status(500)
        .json({
          mensagem: "Erro ao enviar mensagem em massa",
          erro: err.message,
        });
    }
  },
};

module.exports = atendimentoController;
