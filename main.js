const url = "https://6817c88e5a4b07b9d1cd3de9.mockapi.io/api/vi1/bateria?sortBy=createdAt&order=desc";

fetch(url)
  .then(res => res.json())
  .then(dados => {
    const ultima = dados[0];
    const tensao = parseFloat(ultima.tensao);

    // Converte voltagem para porcentagem (assumindo 13.5V = 100%)
    const porcentagem = Math.min(100, Math.round((tensao / 13.5) * 100));

    const nivel = document.getElementById("nivel");
    const texto = document.getElementById("texto");

    nivel.style.width = porcentagem + "%";

    if (porcentagem < 20) {
      nivel.style.backgroundColor = "red";
    } else if (porcentagem < 50) {
      nivel.style.backgroundColor = "orange";
    } else {
      nivel.style.backgroundColor = "green";
    }
    texto.innerHTML = "Bateria: " + porcentagem + "%" + " (" + tensao + " V)";
  })
  .catch(err => {
    console.error("Erro ao buscar dados:", err);
    document.getElementById("texto").textContent = "Erro ao carregar dados.";
  });

// Adicionando animação para abrir e fechar os accordions no JavaScript
const acc = document.querySelectorAll(".accordion");
acc.forEach(button => {
  button.addEventListener("click", function () {
    this.classList.toggle("active");
    const panel = this.nextElementSibling;

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
      panel.style.opacity = 0;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
      panel.style.opacity = 1;
    }
  });
});