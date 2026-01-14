// ===== DADOS SIMULADOS =====

let usuarioLogado = {
  id: "user_1",
  nome: "Organizador"
};

let peladas = [];
let participacoes = [];

// ===== FUNÇÕES =====

function criarPelada() {
  const pelada = {
    id: "pelada_" + Date.now(),
    nome: "Pelada Teste",
    dataHora: new Date(),
    valor: 20,
    status: "ativa",
    criadaPor: usuarioLogado.id
  };

  peladas.push(pelada);

  log("Pelada criada:", pelada);
}

function listarPeladas() {
  log("Peladas:", peladas);
}

function log(titulo, dado) {
  document.getElementById("output").textContent =
    titulo + "\n" + JSON.stringify(dado, null, 2);
}

