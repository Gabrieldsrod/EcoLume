const url = "https://6817c88e5a4b07b9d1cd3de9.mockapi.io/api/vi1/bateria?sortBy=createdAt&order=desc";

fetch(url)
    .then(res => res.json())
    .then(dados => {
        const ultima = dados[0];
        const voltagem = parseFloat(ultima.voltagem);

        // Converte voltagem para porcentagem (assumindo 13.5V = 100%)
        const porcentagem = Math.min(100, Math.round((voltagem / 13.5) * 100));

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


        texto.textContent = `Carga da bateria: ${porcentagem}% (${voltagem.toFixed(2)} V)`;
    })
    .catch(err => {
        document.getElementById("texto").textContent = "Erro ao carregar dados";
        console.error(err);
    });