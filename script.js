document.getElementById('calcular').addEventListener('click', function () {
  // Custos Fixos
  const fixosIds = [
    'c-aluguel', 'c-energia', 'c-agua', 'c-telefonia', 'c-internet',
    'c-pessoal', 'c-socios', 'c-contabilidade', 'c-depreciacao', 'c-outros'
  ];
  let totalFixos = 0;
  fixosIds.forEach(id => {
    totalFixos += parseFloat(document.getElementById(id).value) || 0;
  });
  document.getElementById('total-fixos').textContent = totalFixos.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  // Custos Variáveis
  const variaveisDetalhes = [
    { id: 'v-aquisicao', label: 'Aquisição/Produção' },
    { id: 'v-impostos', label: 'Impostos' },
    { id: 'v-comissao', label: 'Comissões' },
    { id: 'v-cartao-debito', label: 'Cartão – Débito' },
    { id: 'v-fretes', label: 'Fretes' },
    { id: 'v-antecipacao', label: 'Antecipação' },
    { id: 'v-descontos', label: 'Descontos' },
    { id: 'v-outros', label: 'Outros' },
    { id: 'v-cartao-credito', label: 'Cartão – Crédito' }
  ];

  let totalVariaveisPerc = 0;
  const labelsVar = [];
  const dataVar = [];

  variaveisDetalhes.forEach(item => {
    const val = parseFloat(document.getElementById(item.id).value) || 0;
    totalVariaveisPerc += val;
    if (val > 0) {
      labelsVar.push(item.label);
      dataVar.push(val.toFixed(2));
    }
  });

  document.getElementById('total-variaveis').textContent = totalVariaveisPerc.toFixed(2) + '%';

  // Parâmetros
  const freteUnit = parseFloat(document.getElementById('p-frete').value) || 0;
  const vendasMes = parseInt(document.getElementById('p-vendas').value) || 0;
  const margemLucro = parseFloat(document.getElementById('p-margem').value) || 0;

  if (!vendasMes || margemLucro === 0) {
    alert('Preencha as Vendas Mensais e a Margem de Lucro.');
    return;
  }

  const custoFixoUnit = totalFixos / vendasMes;
  const somaPercentuais = (totalVariaveisPerc + margemLucro) / 100;

  if (somaPercentuais >= 1) {
    alert('A soma dos percentuais não pode ser maior ou igual a 100%.');
    return;
  }

  const precoVenda = (custoFixoUnit + freteUnit) / (1 - somaPercentuais);
  const valorLucro = precoVenda * (margemLucro / 100);

  const saida = document.getElementById('saida');
  saida.innerHTML = `
    <p><strong>💲 Preço de Venda Sugerido:</strong> R$ ${precoVenda.toFixed(2)}</p>
    <p><strong>Composição do Preço:</strong></p>
    <p>🚚 Frete por Unidade: R$ ${freteUnit.toFixed(2)}</p>
    <p>🏢 Rateio de Fixos por Unidade: R$ ${custoFixoUnit.toFixed(2)}</p>
    <p>📉 Total de Custos Variáveis: ${totalVariaveisPerc.toFixed(2)}%</p>
    <p>💰 Lucro Estimado: R$ ${valorLucro.toFixed(2)} (${margemLucro.toFixed(2)}%)</p>
  `;

  document.getElementById('resultado').style.display = 'block';

  // Gráfico por Item de Custo Variável
  const ctx = document.getElementById('grafico').getContext('2d');
  if (window.graficoVariaveis) window.graficoVariaveis.destroy();

  window.graficoVariaveis = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labelsVar,
      datasets: [{
        label: 'Custos Variáveis (%)',
        data: dataVar,
        backgroundColor: [
          '#4CAF50', '#FF9800', '#03A9F4', '#E91E63',
          '#8BC34A', '#FFC107', '#9C27B0', '#795548', '#607D8B'
        ]
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.parsed}%`;
            }
          }
        }
      }
    }
  });
});

// Botões extra: limpar e exportar
const botoesDiv = document.querySelector('.botoes');

const btnLimpar = document.createElement('button');
btnLimpar.textContent = 'Limpar';
btnLimpar.addEventListener('click', () => {
  document.querySelectorAll('input').forEach(el => el.value = '');
  document.getElementById('total-fixos').textContent = 'R$ 0,00';
  document.getElementById('total-variaveis').textContent = '0%';
  document.getElementById('saida').innerHTML = '';
  document.getElementById('resultado').style.display = 'none';
});
botoesDiv.appendChild(btnLimpar);

const btnExportar = document.createElement('button');
btnExportar.textContent = 'Exportar PDF';
btnExportar.addEventListener('click', () => {
  const elemento = document.getElementById('resultado');
  const opt = {
    margin: 0.5,
    filename: 'resultado_precificacao.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(elemento).save();
});
botoesDiv.appendChild(btnExportar);
