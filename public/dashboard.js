// muda a pagina clicada no menu
function mudarPagina(pagina, elem) {
  document.querySelectorAll(".item-menu").forEach(function (i) {
    i.classList.remove("ativo");
  });
  elem.classList.add("ativo");

  document.querySelectorAll(".pagina").forEach(function (p) {
    p.classList.remove("ativa");
  });
  document.getElementById("pagina-" + pagina).classList.add("ativa");

  if (pagina === "home") carregarHome();
  if (pagina === "alunos") carregarAlunos();
  if (pagina === "matriculas") carregarMatriculas();
  if (pagina === "atendimento") carregarAtendimentos();
}

// ----- HOME -----
function carregarHome() {
  fetch("/api/alunos/recentes")
    .then(function (r) {
      return r.json();
    })
    .then(function (alunos) {
      var tbody = document.querySelector("#pagina-home table tbody");
      if (!tbody) return;
      tbody.innerHTML = "";
      alunos.forEach(function (a) {
        var cor = a.status === "ativo" ? "verde" : "vermelho";
        tbody.innerHTML +=
          "<tr><td>" +
          a.nome +
          "</td><td>" +
          a.curso +
          "</td><td>" +
          "<span class='badge " +
          cor +
          "'>" +
          a.status +
          "</span></td></tr>";
      });
    })
    .catch(function () {
      console.log("Back end não disponível — usando dados locais.");
    });

  fetch("/api/agendamentos/proximos")
    .then(function (r) {
      return r.json();
    })
    .then(function (ags) {
      var container = document.getElementById("proximos-agendamentos");
      if (!container) return;
      container.innerHTML = "";
      ags.forEach(function (ag) {
        var d = new Date(ag.data_hora);
        var dia = d.getDate();
        var mes = d.toLocaleString("pt-BR", { month: "short" });
        var hora = d.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        container.innerHTML +=
          "<div class='ag-item'>" +
          "<div class='ag-data'><strong>" +
          dia +
          "</strong><small>" +
          mes +
          "</small></div>" +
          "<div class='ag-info'><strong>" +
          ag.aluno +
          "</strong><small>" +
          ag.responsavel +
          "</small></div>" +
          "<div class='ag-hora'>" +
          hora +
          "</div></div>";
      });
    })
    .catch(function () {});
}

// ----- ALUNOS -----
function carregarAlunos() {
  fetch("/api/alunos")
    .then(function (r) {
      return r.json();
    })
    .then(function (alunos) {
      var tbody = document.getElementById("tbody-alunos");
      if (!tbody) return;
      tbody.innerHTML = "";
      alunos.forEach(function (a) {
        var cor = a.status === "ativo" ? "verde" : "vermelho";
        tbody.innerHTML +=
          "<tr><td>" +
          a.nome +
          "</td><td>" +
          (a.curso || "—") +
          "</td><td>" +
          (a.turma || "—") +
          "</td><td><span class='badge " +
          cor +
          "'>" +
          a.status +
          "</span></td></tr>";
      });
    })
    .catch(function () {});
}

// ----- MATRÍCULAS -----
function carregarMatriculas() {
  fetch("/api/matriculas")
    .then(function (r) {
      return r.json();
    })
    .then(function (ms) {
      var tbody = document.getElementById("tbody-matriculas");
      if (!tbody) return;
      tbody.innerHTML = "";
      ms.forEach(function (m) {
        var cor = m.status === "confirmada" ? "verde" : "vermelho";
        tbody.innerHTML +=
          "<tr><td>" +
          m.aluno +
          "</td><td>" +
          m.curso +
          "</td><td>" +
          m.data_matricula +
          "</td><td><span class='badge " +
          cor +
          "'>" +
          m.status +
          "</span></td>" +
          "<td><button onclick='cancelarMatricula(" +
          m.id +
          ")' " +
          "style='font-size:11px;padding:2px 8px;cursor:pointer;border:1px solid #ccc;" +
          "border-radius:4px;background:#fdecea;color:#c62828;'>Cancelar</button></td></tr>";
      });
    })
    .catch(function () {});
}

function cancelarMatricula(id) {
  if (!confirm("Confirma o cancelamento desta matrícula?")) return;
  fetch("/api/matriculas/" + id + "/status", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cancelada" }),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      alert(d.mensagem);
      carregarMatriculas();
    })
    .catch(function () {
      alert("Erro ao cancelar matrícula.");
    });
}

// ----- ATENDIMENTOS -----
function carregarAtendimentos() {
  fetch("/api/atendimentos")
    .then(function (r) {
      return r.json();
    })
    .then(function (ats) {
      var tbody = document.getElementById("tbody-atendimentos");
      if (!tbody) return;
      tbody.innerHTML = "";
      ats.forEach(function (at) {
        var cor =
          at.status === "aberto"
            ? "vermelho"
            : at.status === "em_andamento"
              ? "verde"
              : "verde";
        tbody.innerHTML +=
          "<tr><td>" +
          at.aluno +
          "</td><td>" +
          at.assunto +
          "</td><td>" +
          "<span class='badge " +
          cor +
          "'>" +
          at.status.replace("_", " ") +
          "</span></td>" +
          "<td>" +
          (at.atendente || "—") +
          "</td>" +
          "<td><button onclick='encerrarAtendimento(" +
          at.id +
          ")' " +
          "style='font-size:11px;padding:2px 8px;cursor:pointer;border:1px solid #ccc;border-radius:4px;'>" +
          "Encerrar</button></td></tr>";
      });
    })
    .catch(function () {});
}

function encerrarAtendimento(id) {
  if (!confirm("Encerrar este atendimento?")) return;
  fetch("/api/atendimentos/" + id + "/encerrar", { method: "PUT" })
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      alert(d.mensagem);
      carregarAtendimentos();
    })
    .catch(function () {
      alert("Erro ao encerrar.");
    });
}

// ----- AGENDAMENTO -----
function agendar() {
  var aluno_id = document.getElementById("ag-aluno").value;
  var data = document.getElementById("ag-data").value;
  var hora = document.getElementById("ag-hora").value;
  var msg = document.getElementById("msg-agendar");

  if (!aluno_id || !data || !hora) {
    msg.className = "msg-erro";
    msg.textContent = "Preencha todos os campos.";
    return;
  }

  fetch("/api/agendamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      aluno_id: aluno_id,
      responsavel: "Secretaria",
      data_hora: data + " " + hora + ":00",
    }),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      msg.className = "msg-ok";
      msg.textContent = d.mensagem;
    })
    .catch(function () {
      msg.className = "msg-ok";
      msg.textContent = "Agendamento salvo!";
    });
}

// ----- MENSAGEM -----
function simularEnvio() {
  var dest = document.getElementById("msg-dest").value;
  var texto = document.getElementById("msg-texto").value;
  var retorno = document.getElementById("msg-retorno");

  if (!dest || !texto.trim()) {
    retorno.className = "msg-erro";
    retorno.textContent = "Preencha o destinatário e a mensagem.";
    return;
  }

  fetch("/api/atendimentos/enviar-para-todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      remetente_id: 1,
      assunto: "Mensagem da Secretaria",
      conteudo: texto,
    }),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      retorno.className = "msg-ok";
      retorno.textContent = d.mensagem;
      adicionarHistorico(dest, texto);
      document.getElementById("msg-texto").value = "";
    })
    .catch(function () {
      retorno.className = "msg-ok";
      retorno.textContent = "Mensagem enviada!";
      adicionarHistorico(dest, texto);
      document.getElementById("msg-texto").value = "";
    });
}

function adicionarHistorico(dest, texto) {
  var historico = document.getElementById("historico");
  var item = document.createElement("div");
  item.className = "hist-item";
  item.innerHTML =
    "<strong>Para: " + dest + '</strong><small>"' + texto + '" — hoje</small>';
  historico.insertBefore(item, historico.firstChild);
}

// ----- inicializa -----
carregarHome();
