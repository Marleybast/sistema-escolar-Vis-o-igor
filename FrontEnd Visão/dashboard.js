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
  if (pagina === "cursos") carregarCursos();
  if (pagina === "matriculas") carregarMatriculas();
  if (pagina === "atendimento") carregarAtendimentos();
}

// ----- HOME -----
function carregarHome() {
  // tabela de alunos recentes
  fetch("/api/alunos/recentes")
    .then(function (r) { return r.json(); })
    .then(function (alunos) {
      var tbody = document.getElementById("tbody-home-alunos");
      if (!tbody) return;

      if (!alunos.length) {
        tbody.innerHTML = "<tr><td colspan='3' class='vazio'>Nenhum aluno cadastrado.</td></tr>";
        return;
      }

      tbody.innerHTML = "";
      alunos.forEach(function (a) {
        var cor = a.status === "ativo" ? "verde" : "vermelho";
        tbody.innerHTML +=
          "<tr><td>" + a.nome + "</td><td>" + a.curso + "</td>" +
          "<td><span class='badge " + cor + "'>" + a.status + "</span></td></tr>";
      });
    })
    .catch(function () {
      var tbody = document.getElementById("tbody-home-alunos");
      if (tbody) tbody.innerHTML = "<tr><td colspan='3' class='vazio'>Não foi possível carregar os dados.</td></tr>";
    });

  // proximos agendamentos
  fetch("/api/agendamentos/proximos")
    .then(function (r) { return r.json(); })
    .then(function (ags) {
      var container = document.getElementById("proximos-agendamentos");
      if (!container) return;

      if (!ags.length) {
        container.innerHTML = "<p class='vazio'>Nenhum agendamento próximo.</p>";
        return;
      }

      container.innerHTML = "";
      ags.forEach(function (ag) {
        var d = new Date(ag.data_hora);
        var dia = d.getDate();
        var mes = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
        var hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        container.innerHTML +=
          "<div class='ag-item'>" +
            "<div class='ag-data'><strong>" + dia + "</strong><small>" + mes + "</small></div>" +
            "<div class='ag-info'><strong>" + ag.aluno + "</strong><small>" + ag.responsavel + "</small></div>" +
            "<div class='ag-hora'>" + hora + "</div>" +
          "</div>";
      });
    })
    .catch(function () {
      var container = document.getElementById("proximos-agendamentos");
      if (container) container.innerHTML = "<p class='vazio'>Não foi possível carregar os agendamentos.</p>";
    });

  // cards de resumo
  carregarCardsResumo();

  // avisos do sistema
  fetch("/api/avisos")
    .then(function (r) { return r.json(); })
    .then(function (avisos) {
      var container = document.getElementById("lista-avisos");
      if (!container) return;

      if (!avisos.length) {
        container.innerHTML = "<p class='vazio'>Nenhum aviso no momento.</p>";
        return;
      }

      container.innerHTML = "";
      avisos.forEach(function (av) {
        var cor = av.prioridade === "alta" ? "" : (av.prioridade === "media" ? "azul" : "cinza");
        container.innerHTML +=
          "<div class='aviso-item'>" +
            "<span class='aviso-dot " + cor + "'></span>" +
            "<div><strong>" + av.titulo + "</strong><small>" + av.descricao + "</small></div>" +
          "</div>";
      });
    })
    .catch(function () {
      var container = document.getElementById("lista-avisos");
      if (container) container.innerHTML = "<p class='vazio'>Nenhum aviso no momento.</p>";
    });

  // mensagens recentes
  fetch("/api/atendimentos/mensagens-recentes")
    .then(function (r) { return r.json(); })
    .then(function (msgs) {
      var container = document.getElementById("lista-mensagens");
      if (!container) return;

      if (!msgs.length) {
        container.innerHTML = "<p class='vazio'>Nenhuma mensagem recente.</p>";
        return;
      }

      container.innerHTML = "";
      msgs.forEach(function (m) {
        var iniciais = m.remetente
          .split(" ")
          .map(function (p) { return p[0]; })
          .slice(0, 2)
          .join("")
          .toUpperCase();
        container.innerHTML +=
          "<div class='msg-item'>" +
            "<div class='msg-avatar'>" + iniciais + "</div>" +
            "<div class='msg-texto'><strong>" + m.remetente + "</strong><p>" + m.conteudo + "</p></div>" +
          "</div>";
      });
    })
    .catch(function () {
      var container = document.getElementById("lista-mensagens");
      if (container) container.innerHTML = "<p class='vazio'>Nenhuma mensagem recente.</p>";
    });
}

// ----- CARDS DE RESUMO -----
function carregarCardsResumo() {
  fetch("/api/alunos")
    .then(function (r) { return r.json(); })
    .then(function (alunos) {
      var el = document.getElementById("card-total-alunos");
      if (el) el.textContent = alunos.length;
    })
    .catch(function () {
      var el = document.getElementById("card-total-alunos");
      if (el) el.textContent = "0";
    });

  fetch("/api/cursos")
    .then(function (r) { return r.json(); })
    .then(function (cursos) {
      var el = document.getElementById("card-total-cursos");
      if (el) el.textContent = cursos.filter(function (c) { return c.status === "ativo"; }).length;
    })
    .catch(function () {
      var el = document.getElementById("card-total-cursos");
      if (el) el.textContent = "0";
    });

  fetch("/api/matriculas")
    .then(function (r) { return r.json(); })
    .then(function (ms) {
      var el = document.getElementById("card-total-matriculas");
      if (el) el.textContent = ms.length;
    })
    .catch(function () {
      var el = document.getElementById("card-total-matriculas");
      if (el) el.textContent = "0";
    });

  fetch("/api/atendimentos")
    .then(function (r) { return r.json(); })
    .then(function (ats) {
      var el = document.getElementById("card-total-atendimentos");
      if (el) el.textContent = ats.filter(function (a) { return a.status !== "encerrado"; }).length;
    })
    .catch(function () {
      var el = document.getElementById("card-total-atendimentos");
      if (el) el.textContent = "0";
    });
}

// ----- ALUNOS -----
function carregarAlunos() {
  fetch("/api/alunos")
    .then(function (r) { return r.json(); })
    .then(function (alunos) {
      var tbody = document.getElementById("tbody-alunos");
      if (!tbody) return;

      if (!alunos.length) {
        tbody.innerHTML = "<tr><td colspan='4' class='vazio'>Nenhum aluno cadastrado.</td></tr>";
        return;
      }

      tbody.innerHTML = "";
      alunos.forEach(function (a) {
        var cor = a.status === "ativo" ? "verde" : "vermelho";
        tbody.innerHTML +=
          "<tr><td>" + a.nome + "</td><td>" + (a.curso || "—") + "</td>" +
          "<td>" + (a.turma || "—") + "</td>" +
          "<td><span class='badge " + cor + "'>" + a.status + "</span></td></tr>";
      });
    })
    .catch(function () {
      var tbody = document.getElementById("tbody-alunos");
      if (tbody) tbody.innerHTML = "<tr><td colspan='4' class='vazio'>Não foi possível carregar os alunos.</td></tr>";
    });
}

// ----- CURSOS -----
function carregarCursos() {
  fetch("/api/cursos")
    .then(function (r) { return r.json(); })
    .then(function (cursos) {
      var tbody = document.getElementById("tbody-cursos");
      if (!tbody) return;

      if (!cursos.length) {
        tbody.innerHTML = "<tr><td colspan='4' class='vazio'>Nenhum curso cadastrado.</td></tr>";
        return;
      }

      tbody.innerHTML = "";
      cursos.forEach(function (c) {
        var cor = c.status === "ativo" ? "verde" : "vermelho";
        tbody.innerHTML +=
          "<tr><td>" + c.nome + "</td><td>" + (c.duracao || "—") + "</td>" +
          "<td>" + (c.total_alunos != null ? c.total_alunos : "—") + "</td>" +
          "<td><span class='badge " + cor + "'>" + c.status + "</span></td></tr>";
      });
    })
    .catch(function () {
      var tbody = document.getElementById("tbody-cursos");
      if (tbody) tbody.innerHTML = "<tr><td colspan='4' class='vazio'>Não foi possível carregar os cursos.</td></tr>";
    });
}

// ----- MATRÍCULAS -----
function carregarMatriculas() {
  fetch("/api/matriculas")
    .then(function (r) { return r.json(); })
    .then(function (ms) {
      var tbody = document.getElementById("tbody-matriculas");
      if (!tbody) return;

      if (!ms.length) {
        tbody.innerHTML = "<tr><td colspan='5' class='vazio'>Nenhuma matrícula cadastrada.</td></tr>";
        return;
      }

      tbody.innerHTML = "";
      ms.forEach(function (m) {
        var cor = m.status === "confirmada" ? "verde" : (m.status === "pendente" ? "amarelo" : "vermelho");
        var data = m.data_matricula;
        tbody.innerHTML +=
          "<tr><td>" + m.aluno + "</td><td>" + m.curso + "</td><td>" + data + "</td>" +
          "<td><span class='badge " + cor + "'>" + m.status + "</span></td>" +
          "<td>" + (m.status !== "cancelada"
            ? "<button class='btn-cancel' onclick='cancelarMatricula(" + m.id + ")'>Cancelar</button>"
            : "—") + "</td></tr>";
      });
    })
    .catch(function () {
      var tbody = document.getElementById("tbody-matriculas");
      if (tbody) tbody.innerHTML = "<tr><td colspan='5' class='vazio'>Não foi possível carregar as matrículas.</td></tr>";
    });
}

function cancelarMatricula(id) {
  if (!confirm("Confirma o cancelamento desta matrícula?")) return;
  fetch("/api/matriculas/" + id + "/status", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cancelada" }),
  })
    .then(function (r) { return r.json(); })
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
    .then(function (r) { return r.json(); })
    .then(function (ats) {
      var tbody = document.getElementById("tbody-atendimentos");
      if (!tbody) return;

      if (!ats.length) {
        tbody.innerHTML = "<tr><td colspan='5' class='vazio'>Nenhum atendimento registrado.</td></tr>";
        return;
      }

      tbody.innerHTML = "";
      ats.forEach(function (at) {
        var cor = at.status === "aberto" ? "vermelho" : (at.status === "em_andamento" ? "amarelo" : "verde");
        tbody.innerHTML +=
          "<tr><td>" + at.aluno + "</td><td>" + at.assunto + "</td>" +
          "<td><span class='badge " + cor + "'>" + at.status.replace("_", " ") + "</span></td>" +
          "<td>" + (at.atendente || "—") + "</td>" +
          "<td>" + (at.status !== "encerrado"
            ? "<button class='btn-cancel' onclick='encerrarAtendimento(" + at.id + ")'>Encerrar</button>"
            : "—") + "</td></tr>";
      });
    })
    .catch(function () {
      var tbody = document.getElementById("tbody-atendimentos");
      if (tbody) tbody.innerHTML = "<tr><td colspan='5' class='vazio'>Não foi possível carregar os atendimentos.</td></tr>";
    });
}

function encerrarAtendimento(id) {
  if (!confirm("Encerrar este atendimento?")) return;
  fetch("/api/atendimentos/" + id + "/encerrar", { method: "PUT" })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      alert(d.mensagem);
      carregarAtendimentos();
    })
    .catch(function () {
      alert("Erro ao encerrar.");
    });
}

// ----- POPULA SELECTS DE ALUNO (agendamento e mensagem) -----
function popularSelectsAlunos() {
  fetch("/api/alunos")
    .then(function (r) { return r.json(); })
    .then(function (alunos) {
      var selAg = document.getElementById("ag-aluno");
      var selMsg = document.getElementById("msg-dest");

      if (selAg) {
        alunos.forEach(function (a) {
          var opt = document.createElement("option");
          opt.value = a.id;
          opt.textContent = a.nome;
          selAg.appendChild(opt);
        });
      }

      if (selMsg) {
        alunos.forEach(function (a) {
          var opt = document.createElement("option");
          opt.value = a.id;
          opt.textContent = a.nome;
          selMsg.appendChild(opt);
        });
      }
    })
    .catch(function () {});
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
    .then(function (r) { return r.json(); })
    .then(function (d) {
      msg.className = "msg-ok";
      msg.textContent = d.mensagem || "Agendamento realizado!";
    })
    .catch(function () {
      msg.className = "msg-erro";
      msg.textContent = "Erro ao conectar com o servidor.";
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

  if (dest === "todos") {
    fetch("/api/atendimentos/enviar-para-todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        remetente_id: 1,
        assunto: "Mensagem da Secretaria",
        conteudo: texto,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        retorno.className = "msg-ok";
        retorno.textContent = d.mensagem || "Mensagem enviada para todos os alunos!";
        document.getElementById("msg-texto").value = "";
        carregarAtendimentos();
      })
      .catch(function () {
        retorno.className = "msg-erro";
        retorno.textContent = "Erro ao conectar com o servidor.";
      });
    return;
  }

  // mensagem para um aluno especifico: abre um atendimento e envia a mensagem
  fetch("/api/atendimentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      aluno_id: dest,
      assunto: "Mensagem da Secretaria",
      prioridade: "normal",
    }),
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d.atendimento_id) throw new Error("sem id");
      return fetch("/api/atendimentos/" + d.atendimento_id + "/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remetente_id: 1, conteudo: texto }),
      });
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      retorno.className = "msg-ok";
      retorno.textContent = d.mensagem || "Mensagem enviada!";
      document.getElementById("msg-texto").value = "";
      carregarAtendimentos();
    })
    .catch(function () {
      retorno.className = "msg-erro";
      retorno.textContent = "Erro ao conectar com o servidor.";
    });
}

// ----- USUARIO LOGADO -----
function carregarUsuarioLogado() {
  var dados = sessionStorage.getItem("usuarioLogado");
  if (!dados) return;

  try {
    var usuario = JSON.parse(dados);
    var nomeEl = document.querySelector(".header-nome");
    var perfilEl = document.querySelector(".header-perfil");
    var avatarEl = document.querySelector(".avatar");

    if (nomeEl) nomeEl.textContent = usuario.nome;
    if (perfilEl) perfilEl.textContent = usuario.perfil || "Usuário";
    if (avatarEl) {
      var iniciais = usuario.nome
        .split(" ")
        .map(function (p) { return p[0]; })
        .slice(0, 2)
        .join("")
        .toUpperCase();
      avatarEl.textContent = iniciais;
    }
  } catch (e) {}
}

// ----- inicializa -----
carregarUsuarioLogado();
carregarHome();
popularSelectsAlunos();