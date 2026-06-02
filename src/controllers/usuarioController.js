const db = require("../config/db");

const usuarioController = {
  listarUsuarios: async (req, res) => {
    try {
      const [usuarios] = await db.query("SELECT * FROM usuarios");
      res.status(200).json(usuarios);
    } catch (erro) {
      res
        .status(500)
        .json({ mensagem: "Erro no servidor", erro: erro.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      const [usuarios] = await db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
      );

      if (usuarios.length === 0) {
        return res.status(404).json({ mensagem: "Usuário não encontrado" });
      }

      const usuario = usuarios[0];

      if (usuario.senha !== senha) {
        return res.status(401).json({ mensagem: "Senha incorreta" });
      }

      res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
        },
      });
    } catch (erro) {
      res.status(500).json({
        mensagem: "Erro no servidor ao tentar logar",
        erro: erro.message,
      });
    }
  },

  cadastrarUsuario: async (req, res) => {
    try {
      const { nome, email, senha, perfil } = req.body;

      const [usuarioExistente] = await db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
      );

      if (usuarioExistente.length > 0) {
        return res
          .status(400)
          .json({ mensagem: "Este e-mail já está cadastrado!" });
      }

      const perfilUsuario = perfil || "aluno";

      await db.query(
        "INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)",
        [nome, email, senha, perfilUsuario],
      );

      res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (erro) {
      res.status(500).json({
        mensagem: "Erro no servidor ao tentar cadastrar",
        erro: erro.message,
      });
    }
  },
};

module.exports = usuarioController;
