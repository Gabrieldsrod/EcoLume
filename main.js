// Altere para o link da sua API
const url = "https://6817c88e5a4b07b9d1cd3de9.mockapi.io/api/vi1/bateria";

fetch(url)
      .then(res => res.json())
      .then(dados => {
        const ultima = dados[0];
        const tensao = parseFloat(ultima.tensao);

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

        texto.textContent = `Carga da bateria: ${porcentagem}% (${tensao.toFixed(2)} V)`;
      })
      .catch(err => {
        document.getElementById("texto").textContent = "Erro ao carregar dados";
        console.error(err);
      });