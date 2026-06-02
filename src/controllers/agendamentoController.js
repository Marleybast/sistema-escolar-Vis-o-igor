const db = require("../config/db");

const agendamentoController = {
  listar: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT ag.id, a.nome AS aluno, ag.responsavel,
               ag.data_hora, ag.local_setor, ag.status
        FROM agendamentos ag
        JOIN alunos a ON ag.aluno_id = a.id
        ORDER BY ag.data_hora ASC
      `);
      res.json(rows);
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao listar agendamentos", erro: err.message });
    }
  },

  listarProximos: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT ag.id, a.nome AS aluno, ag.responsavel,
               ag.data_hora, ag.local_setor, ag.status
        FROM agendamentos ag
        JOIN alunos a ON ag.aluno_id = a.id
        WHERE ag.data_hora >= NOW() AND ag.status = 'agendado'
        ORDER BY ag.data_hora ASC LIMIT 5
      `);
      res.json(rows);
    } catch (err) {
      res
        .status(500)
        .json({
          mensagem: "Erro ao buscar próximos agendamentos",
          erro: err.message,
        });
    }
  },

  criar: async (req, res) => {
    try {
      const { aluno_id, responsavel, data_hora, local_setor } = req.body;
      if (!aluno_id || !responsavel || !data_hora) {
        return res
          .status(400)
          .json({
            mensagem: "aluno_id, responsavel e data_hora são obrigatórios.",
          });
      }

      const [[conflito]] = await db.query(
        "SELECT id FROM agendamentos WHERE data_hora = ? AND responsavel = ? AND status = 'agendado'",
        [data_hora, responsavel],
      );
      if (conflito)
        return res
          .status(400)
          .json({ mensagem: "Já existe um agendamento neste horário." });

      const [result] = await db.query(
        "INSERT INTO agendamentos (aluno_id, responsavel, data_hora, local_setor) VALUES (?, ?, ?, ?)",
        [aluno_id, responsavel, data_hora, local_setor || null],
      );
      res
        .status(201)
        .json({
          mensagem: "Agendamento realizado!",
          agendamento_id: result.insertId,
        });
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao criar agendamento", erro: err.message });
    }
  },

  atualizarStatus: async (req, res) => {
    try {
      const { status } = req.body;
      await db.query("UPDATE agendamentos SET status = ? WHERE id = ?", [
        status,
        req.params.id,
      ]);
      res.json({ mensagem: "Agendamento atualizado!" });
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao atualizar agendamento", erro: err.message });
    }
  },
};

module.exports = agendamentoController;
