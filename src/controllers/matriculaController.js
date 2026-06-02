const db = require("../config/db");

const matriculaController = {
  // GET /api/matriculas — lista todas com joins
  listar: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT
          m.id,
          a.nome     AS aluno,
          c.nome     AS curso,
          t.codigo   AS turma,
          m.status,
          m.data_matricula,
          m.observacao
        FROM matriculas m
        JOIN alunos a ON m.aluno_id = a.id
        JOIN cursos c ON m.curso_id = c.id
        JOIN turmas t ON m.turma_id = t.id
        ORDER BY m.data_matricula DESC
      `);
      res.json(rows);
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao listar matrículas", erro: err.message });
    }
  },

  // GET /api/matriculas/recentes — últimas 5 para a home
  listarRecentes: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT a.nome AS aluno, c.nome AS curso,
               DATE_FORMAT(m.data_matricula, '%d/%m/%Y') AS data, m.status
        FROM matriculas m
        JOIN alunos a ON m.aluno_id = a.id
        JOIN cursos c ON m.curso_id = c.id
        ORDER BY m.id DESC
        LIMIT 5
      `);
      res.json(rows);
    } catch (err) {
      res
        .status(500)
        .json({
          mensagem: "Erro ao buscar matrículas recentes",
          erro: err.message,
        });
    }
  },

  // POST /api/matriculas — cria nova matrícula com validações
  criar: async (req, res) => {
    try {
      const { aluno_id, curso_id, turma_id, observacao } = req.body;

      if (!aluno_id || !curso_id || !turma_id) {
        return res
          .status(400)
          .json({
            mensagem: "aluno_id, curso_id e turma_id são obrigatórios.",
          });
      }

      // 1. aluno existe e está ativo?
      const [[aluno]] = await db.query(
        "SELECT id, status FROM alunos WHERE id = ?",
        [aluno_id],
      );
      if (!aluno)
        return res.status(404).json({ mensagem: "Aluno não encontrado." });
      if (aluno.status === "inativo") {
        return res
          .status(400)
          .json({ mensagem: "Aluno inativo não pode ser matriculado." });
      }

      // 2. turma existe e está ativa?
      const [[turma]] = await db.query(
        "SELECT id, vagas, status, curso_id FROM turmas WHERE id = ?",
        [turma_id],
      );
      if (!turma)
        return res.status(404).json({ mensagem: "Turma não encontrada." });
      if (turma.status === "encerrada") {
        return res.status(400).json({ mensagem: "Turma encerrada." });
      }

      // 3. turma pertence ao curso?
      if (turma.curso_id !== Number(curso_id)) {
        return res
          .status(400)
          .json({ mensagem: "Turma não pertence ao curso selecionado." });
      }

      // 4. aluno já está matriculado nesta turma?
      const [[matriculaDupl]] = await db.query(
        "SELECT id FROM matriculas WHERE aluno_id = ? AND turma_id = ? AND status != 'cancelada'",
        [aluno_id, turma_id],
      );
      if (matriculaDupl) {
        return res
          .status(400)
          .json({ mensagem: "Aluno já está matriculado nesta turma." });
      }

      // 5. vagas disponíveis?
      const [[vagasRow]] = await db.query(
        `
        SELECT t.vagas - COUNT(m.id) AS disponivel
        FROM turmas t
        LEFT JOIN matriculas m ON m.turma_id = t.id AND m.status != 'cancelada'
        WHERE t.id = ?
        GROUP BY t.id
      `,
        [turma_id],
      );

      const disponivel = vagasRow ? vagasRow.disponivel : turma.vagas;
      if (disponivel <= 0) {
        return res
          .status(400)
          .json({ mensagem: "Turma sem vagas disponíveis." });
      }

      // tudo ok — cria a matrícula
      const [result] = await db.query(
        "INSERT INTO matriculas (aluno_id, curso_id, turma_id, status, observacao) VALUES (?, ?, ?, 'confirmada', ?)",
        [aluno_id, curso_id, turma_id, observacao || null],
      );

      res.status(201).json({
        mensagem: "Matrícula realizada com sucesso!",
        matricula_id: result.insertId,
        vagas_restantes: disponivel - 1,
      });
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao criar matrícula", erro: err.message });
    }
  },

  // PUT /api/matriculas/:id/status — confirma, cancela etc.
  atualizarStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const statusValidos = ["pendente", "confirmada", "cancelada"];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ mensagem: "Status inválido." });
      }

      const [result] = await db.query(
        "UPDATE matriculas SET status = ? WHERE id = ?",
        [status, req.params.id],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensagem: "Matrícula não encontrada." });
      }

      res.json({ mensagem: `Matrícula ${status} com sucesso!` });
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao atualizar matrícula", erro: err.message });
    }
  },

  // GET /api/matriculas/vagas/:turma_id — quantas vagas restam
  consultarVagas: async (req, res) => {
    try {
      const [[row]] = await db.query(
        `
        SELECT t.codigo, t.vagas AS total,
               t.vagas - COUNT(m.id) AS disponivel
        FROM turmas t
        LEFT JOIN matriculas m ON m.turma_id = t.id AND m.status != 'cancelada'
        WHERE t.id = ?
        GROUP BY t.id
      `,
        [req.params.turma_id],
      );

      if (!row)
        return res.status(404).json({ mensagem: "Turma não encontrada." });
      res.json(row);
    } catch (err) {
      res
        .status(500)
        .json({ mensagem: "Erro ao consultar vagas", erro: err.message });
    }
  },
};

module.exports = matriculaController;
