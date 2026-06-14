function fazerLogin() {
  var usuario = document.getElementById("usuario").value;
  var senha = document.getElementById("senha").value;
  var mensagem = document.getElementById("mensagem");

  if (usuario == "" || senha == "") {
    mensagem.className = "erro";
    mensagem.textContent = "Preencha todos os campos.";
    return;
  }

  fetch("/usuarios/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: usuario, senha: senha }),
  })
    .then(function (resposta) {
      return resposta.json();
    })
    .then(function (dados) {
      if (dados.mensagem == "Login realizado com sucesso!") {
        mensagem.className = "sucesso";
        mensagem.textContent =
          "Login efetuado com sucesso! Bem-vindo, " + dados.usuario.nome + ".";

        // guarda os dados do usuario logado para usar no dashboard
        sessionStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

        setTimeout(function () {
          window.location.href = "dashboard.html";
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

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    fazerLogin();
  }
});