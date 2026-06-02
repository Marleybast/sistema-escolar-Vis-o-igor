const db = require("../config/db");

const alunoController = {
  // Busca os últimos alunos ativos para a tabela da Homepage
  listarRecentes: async (req, res) => {
    try {
      // Faz um JOIN
      const querySql = `
        SELECT a.nome, c.nome AS curso, m.status 
        FROM matriculas m
        JOIN alunos a ON m.aluno_id = a.id
        JOIN cursos c ON m.curso_id = c.id
        ORDER BY m.id DESC 
        LIMIT 5
      `;
      const [resultados] = await db.query(querySql);
      res.status(200).json(resultados);
    } catch (erro) {
      res.status(500).json({
        mensagem: "Erro ao buscar alunos da home",
        erro: erro.message,
      });
    }
  },
};

module.exports = alunoController;
