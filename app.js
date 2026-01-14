// Estado local (simples de propósito)
let peladas = [];

// Criar uma nova pelada
function criarPelada() {
  const novaPelada = {
    id: Date.now(),
    nome: `Pelada ${peladas.length + 1}`,
    criadaEm: new Date().toLocaleString()
  };

  peladas.push(novaPelada);

  document.getElementById("output").innerHTML =
    `Pelada criada: <strong>${novaPelada.nome}</strong>`;

  console.log("Peladas:", peladas);
}

// Listar todas as peladas
function listarPeladas() {
  const output = document.getElementById("output");

  if (peladas.length === 0) {
    output.innerHTML = "Nenhuma pelada criada ainda.";
    return;
  }

  let html = "<strong>Peladas criadas:</strong><ul>";

  peladas.forEach(pelada => {
    html += `<li>${pelada.nome} — ${pelada.criadaEm}</li>`;
  });

  html += "</ul>";

  output.innerHTML = html;
}
