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

  });

  const acc = document.querySelectorAll(".accordion");
  acc.forEach(button => {
    button.addEventListener("click", function () {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    });
  });