const db = require("../config/db");

const usuarioController = {
  // Mantém a sua função de listagem
  listarUsuarios: async (req, res) => {
    try {
      const [usuarios] = await db.query("SELECT * FROM usuarios");
      res.status(200).json(usuarios);
    } catch (erro) {
      res.status(500).json({ mensagem: "Erro no servidor", erro: erro.message });
    }
  },

  // NOVA: Função que faz a mágica do login acontecer!
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // 1. Busca o usuário pelo e-mail exato digitado na tela
      const [usuarios] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);

      // 2. Se o array voltar vazio, significa que o e-mail não existe no banco
      if (usuarios.length === 0) {
        return res.status(404).json({ mensagem: "Usuário não encontrado" });
      }

      const usuario = usuarios[0];

      // 3. Compara a senha digitada com a senha de texto limpo do banco ('123456')
      if (usuario.senha !== senha) {
        return res.status(401).json({ mensagem: "Senha incorreta" });
      }

      // 4. Se passou por tudo, o login deu certo!
      res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        }
      });

    } catch (erro) {
      res.status(500).json({ mensagem: "Erro no servidor ao tentar logar", erro: erro.message });
    }
  }
};

module.exports = usuarioController;
