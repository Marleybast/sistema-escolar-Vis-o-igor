function cadastrarUsuario() {
  var nome = document.getElementById("nome").value.trim();
  var email = document.getElementById("email").value.trim();
  var senha = document.getElementById("senha").value;
  var confirmarSenha = document.getElementById("confirmarSenha").value;
  var perfil = document.getElementById("perfil").value;
  var mensagem = document.getElementById("mensagem");

  // valida campos vazios
  if (nome == "" || email == "" || senha == "" || confirmarSenha == "") {
    mensagem.className = "erro";
    mensagem.textContent = "Preencha todos os campos.";
    return;
  }

  // valida formato do email
  var emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) {
    mensagem.className = "erro";
    mensagem.textContent = "Digite um e-mail válido.";
    return;
  }

  // valida tamanho minimo da senha
  if (senha.length < 6) {
    mensagem.className = "erro";
    mensagem.textContent = "A senha deve ter no mínimo 6 caracteres.";
    return;
  }

  // valida se as senhas coincidem
  if (senha != confirmarSenha) {
    mensagem.className = "erro";
    mensagem.textContent = "As senhas não coincidem.";
    return;
  }

  // envia para o back end
  fetch("/usuarios/cadastrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: nome,
      email: email,
      senha: senha,
      perfil: perfil,
    }),
  })
    .then(function (resposta) {
      return resposta.json();
    })
    .then(function (dados) {
      if (dados.mensagem == "Usuário cadastrado com sucesso!") {
        mensagem.className = "sucesso";
        mensagem.textContent = "Conta criada com sucesso! Redirecionando para o login...";

        setTimeout(function () {
          window.location.href = "login.html";
        }, 2000);
      } else {
        mensagem.className = "erro";
        mensagem.textContent = dados.mensagem;
      }
    })
    .catch(function () {
      mensagem.className = "erro";
      mensagem.textContent = "Erro ao conectar com o servidor.";
    });
}

// permite usar o Enter para cadastrar
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    cadastrarUsuario();
  }
});
