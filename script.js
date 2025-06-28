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
  document.getElementById('total-fixos').textContent = totalFixos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Custos Variáveis
  const variaveisIds = [
  'v-aquisicao',
  'v-impostos',
  'v-comissao',
  'v-cartao-debito',
  'v-fretes',
  'v-antecipacao',
  'v-descontos',
  'v-outros',
  'v-cartao-credito'
];
  let totalVariaveisPerc = 0;
  variaveisIds.forEach(id => {
    totalVariaveisPerc += parseFloat(document.getElementById(id).value) || 0;
  });
  document.getElementById('total-variaveis').textContent = totalVariaveisPerc.toFixed(2) + '%';

  // Parâmetros
  const freteUnit = parseFloat(document.getElementById('p-frete').value) || 0;
  const vendasMes = parseInt(document.getElementById('p-vendas').value) || 0;
  const margemLucro = parseFloat(document.getElementById('p-margem').value) || 0;
  const custoAquisicaoPerc = parseFloat(document.getElementById('v-aquisicao').value) || 0;

  if (!vendasMes || !margemLucro) {
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
    <p><strong>Preço de Venda Sugerido:</strong> R$ ${precoVenda.toFixed(2)}</p>
    <p><strong>Composição:</strong></p>
    <p>📦 Custo Aquisição (%): ${custoAquisicaoPerc.toFixed(2)}%</p>
    <p>🚚 Frete por Unidade: R$ ${freteUnit.toFixed(2)}</p>
    <p>🏢 Rateio Fixos por Unidade: R$ ${custoFixoUnit.toFixed(2)}</p>
    <p>📈 Lucro Estimado: R$ ${valorLucro.toFixed(2)} (${margemLucro.toFixed(2)}%)</p>
  `;

  document.getElementById('resultado').style.display = 'block';

  // Gráfico Doughnut
  const ctx = document.getElementById('grafico').getContext('2d');
  if (window.meuGrafico) window.meuGrafico.destroy();
  window.meuGrafico = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Frete', 'Fixos', 'Variáveis (%)', 'Lucro'],
      datasets: [{
        data: [
          freteUnit,
          custoFixoUnit,
          precoVenda * (totalVariaveisPerc / 100),
          valorLucro
        ],
        backgroundColor: ['#FFC107', '#FF9800', '#F44336', '#2196F3']
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
});
