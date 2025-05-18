const API_URL = "https://6817c88e5a4b07b9d1cd3de9.mockapi.io/api/vi1/bateria?sortBy=createdAt&order=desc";

fetch(API_URL)
  .then(res => res.json())
  .then(dados => {
    if (!dados || dados.length === 0) {
      exibirErroBateria();
      return;
    }

    const ultima = dados[dados.length - 1];
    const tensao = parseFloat(ultima.tensao);
    const porcentagem = calcularPorcentagemBateria(tensao);
    atualizarBarraBateria(porcentagem);
    atualizarTextoBateria(porcentagem, tensao);
    const { labels, porcentagens } = prepararDadosGrafico(dados);
    renderizarGraficoBateria(labels, porcentagens);
  })
  .catch(err => {
    console.error("Erro ao buscar dados:", err);
    exibirErroBateria();
  });

inicializarAccordions();

function calcularPorcentagemBateria(tensao) {
  // Considera 13.5V como 100%
  return Math.min(100, Math.round((tensao / 13.5) * 100));
}

function atualizarBarraBateria(porcentagem) {
  const nivel = document.getElementById("nivel");
  nivel.style.width = porcentagem + "%";
  if (porcentagem < 20) {
    nivel.style.backgroundColor = "red";
  } else if (porcentagem < 50) {
    nivel.style.backgroundColor = "orange";
  } else {
    nivel.style.backgroundColor = "green";
  }
}

function atualizarTextoBateria(porcentagem, tensao) {
  const texto = document.getElementById("texto");
  texto.innerHTML = `Bateria: ${porcentagem}% (${tensao} V)`;
}

function prepararDadosGrafico(dados) {
  const labels = dados.map(d => {
    const data = new Date(d.timestamp);
    return data.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  });
  const porcentagens = dados.map(d => calcularPorcentagemBateria(parseFloat(d.tensao)));
  return { labels, porcentagens };
}

function renderizarGraficoBateria(labels, porcentagens) {
  let chartCanvas = document.getElementById('batteryChart');
  if (!chartCanvas) {
    const div = document.createElement('div');
    div.style.maxWidth = '600px';
    div.style.margin = '32px auto';
    chartCanvas = document.createElement('canvas');
    chartCanvas.id = 'batteryChart';
    div.appendChild(chartCanvas);
    const statusSection = document.getElementById('carregamento');
    statusSection.appendChild(div);
  }
  if (window.batteryChartInstance) {
    window.batteryChartInstance.data.labels = labels;
    window.batteryChartInstance.data.datasets[0].data = porcentagens;
    window.batteryChartInstance.update();
  } else {
    window.batteryChartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Carga da Bateria (%)',
          data: porcentagens,
          borderColor: '#4fb68e',
          backgroundColor: 'rgba(79,182,142,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointBackgroundColor: '#32785d',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Histórico de Carga da Bateria' }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: '%' }
          },
          x: {
            title: { display: true, text: 'Data/Hora' }
          }
        }
      }
    });
  }
}

function exibirErroBateria() {
  const texto = document.getElementById("texto");
  if (texto) texto.textContent = "Erro ao carregar dados.";
}

function inicializarAccordions() {
  const accordions = document.querySelectorAll(".accordion");
  accordions.forEach(botao => {
    botao.addEventListener("click", function () {
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
}