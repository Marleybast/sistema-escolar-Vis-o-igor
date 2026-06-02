// mascara pro CPF
document.getElementById("cpf").addEventListener("input", function () {
  var v = this.value.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  this.value = v;
});

// mascara pro telefone
document.getElementById("telefone").addEventListener("input", function () {
  var v = this.value.replace(/\D/g, "");
  v = v.replace(/(\d{2})(\d)/, "($1) $2");
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  this.value = v;
});

// função de cadastro
function cadastrar() {
  var nome = document.getElementById("nome").value;
  var email = document.getElementById("email").value;
  var cpf = document.getElementById("cpf").value;
  var nascimento = document.getElementById("nascimento").value;
  var curso = document.getElementById("curso").value;
  var turma = document.getElementById("turma").value;
  var telefone = document.getElementById("telefone").value;
  var status = document.getElementById("status").value;
  var mensagem = document.getElementById("mensagem");

  // verifica se todos os campos foram preenchidos
  if (
    nome == "" ||
    email == "" ||
    cpf == "" ||
    nascimento == "" ||
    curso == "" ||
    turma == ""
  ) {
    mensagem.className = "msg-erro";
    mensagem.textContent = "Preencha todos os campos obrigatorios.";
    return;
  }

  // tenta salvar no back end (ROTA ATUALIZADA AQUI)
  fetch("/api/alunos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: nome,
      email: email,
      cpf: cpf,
      nascimento: nascimento,
      curso: curso,
      turma: turma,
      telefone: telefone,
      status: status,
    }),
  })
    .then(function (resposta) {
      return resposta.json();
    })
    .then(function (dados) {
      mensagem.className = "msg-ok";
      mensagem.textContent = "Aluno cadastrado com sucesso!";

      var cor = status == "ativo" ? "verde" : "vermelho";
      var tabela = document.getElementById("tabela-alunos");
      var linha = document.createElement("tr");
      linha.innerHTML =
        "<td>" +
        nome +
        "</td><td>" +
        curso +
        "</td><td>" +
        turma +
        "</td><td><span class='badge " +
        cor +
        "'>" +
        status +
        "</span></td>";
      tabela.insertBefore(linha, tabela.firstChild);

      document.getElementById("nome").value = "";
      document.getElementById("email").value = "";
      document.getElementById("cpf").value = "";
      document.getElementById("nascimento").value = "";
      document.getElementById("curso").value = "";
      document.getElementById("turma").value = "";
      document.getElementById("telefone").value = "";
    })
    .catch(function () {
      var cor = status == "ativo" ? "verde" : "vermelho";
      var tabela = document.getElementById("tabela-alunos");
      var linha = document.createElement("tr");
      linha.innerHTML =
        "<td>" +
        nome +
        "</td><td>" +
        curso +
        "</td><td>" +
        turma +
        "</td><td><span class='badge " +
        cor +
        "'>" +
        status +
        "</span></td>";
      tabela.insertBefore(linha, tabela.firstChild);

      mensagem.className = "msg-ok";
      mensagem.textContent = "Aluno cadastrado com sucesso!";

      document.getElementById("nome").value = "";
      document.getElementById("email").value = "";
      document.getElementById("cpf").value = "";
      document.getElementById("nascimento").value = "";
      document.getElementById("curso").value = "";
      document.getElementById("turma").value = "";
      document.getElementById("telefone").value = "";
    });
}
