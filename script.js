document.getElementById('calcular').addEventListener('click', function () {
  // IDs de custos fixos
  const fixosIds = [
    'c-aluguel', 'c-energia', 'c-agua', 'c-telefonia', 'c-internet',
    'c-pessoal', 'c-socios', 'c-contabilidade', 'c-depreciacao', 'c-outros'
  ];
  let totalFixos = 0;
  fixosIds.forEach(id => {
    totalFixos += parseFloat(document.getElementById(id).value) || 0;
  });
  document.getElementById('total-fixos').textContent = totalFixos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Variáveis
  const impostos = parseFloat(document.getElementById('v-impostos').value) || 0;
  const comissao = parseFloat(document.getElementById('v-comissao').value) || 0;
  const cartao = parseFloat(document.getElementById('v-cartao').value) || 0;
  const descontos = parseFloat(document.getElementById('v-descontos').value) || 0;
  const totalVariaveisPerc = impostos + comissao + cartao + descontos;
  document.getElementById('total-variaveis').textContent = totalVariaveisPerc.toFixed(2) + '%';

  // Parâmetros
  const custoAquisicao = parseFloat(document.getElementById('p-custo').value) || 0;
  const freteUnidade = parseFloat(document.getElementById('p-frete').value) || 0;
  const vendasMes = parseInt(document.getElementById('p-vendas').value) || 0;
  const margemLucro = parseFloat(document.getElementById('p-margem').value) || 0;

  if (!custoAquisicao || !vendasMes || !margemLucro) {
    alert('Preencha todos os parâmetros obrigatórios.');
    return;
  }

  const custoFixoUnit = totalFixos / vendasMes;
  const custoTotalUnit = custoAquisicao + freteUnidade + custoFixoUnit;
  const somaPercentuais = (totalVariaveisPerc + margemLucro) / 100;

  if (somaPercentuais >= 1) {
    alert('A soma dos percentuais não pode ser maior ou igual a 100%.');
    return;
  }

  const precoVenda = custoTotalUnit / (1 - somaPercentuais);
  const valorImpostos = precoVenda * (impostos / 100);
  const valorComissao = precoVenda * (comissao / 100);
  const valorCartao = precoVenda * (cartao / 100);
  const valorLucro = precoVenda * (margemLucro / 100);

  const saida = document.getElementById('saida');
  saida.innerHTML = `
    <p><strong>Preço de Venda Sugerido:</strong> R$ ${precoVenda.toFixed(2)}</p>
    <p><strong>Composição do Preço:</strong></p>
    <p>🧾 Custo de Aquisição: R$ ${custoAquisicao.toFixed(2)}</p>
    <p>🚚 Frete por Unidade: R$ ${freteUnidade.toFixed(2)}</p>
    <p>🏢 Rateio de Custos Fixos por Unidade: R$ ${custoFixoUnit.toFixed(2)}</p>
    <p>📉 Impostos + Comissão + Cartão: R$ ${(valorImpostos + valorComissao + valorCartao).toFixed(2)}</p>
    <p>💰 Lucro Estimado: R$ ${valorLucro.toFixed(2)} (${margemLucro.toFixed(2)}%)</p>
  `;

  document.getElementById('resultado').style.display = 'block';

  // Gráfico
  const ctx = document.getElementById('grafico').getContext('2d');
  if (window.meuGrafico) window.meuGrafico.destroy();
  window.meuGrafico = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Aquisição', 'Frete', 'Fixos', 'Impostos/Taxas', 'Lucro'],
      datasets: [{
        data: [
          custoAquisicao,
          freteUnidade,
          custoFixoUnit,
          valorImpostos + valorComissao + valorCartao,
          valorLucro
        ],
        backgroundColor: ['#4CAF50', '#FFC107', '#FF9800', '#F44336', '#2196F3']
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
});

// Botão limpar
const limpar = document.createElement('button');
limpar.textContent = 'Limpar';
limpar.style.marginLeft = '1rem';
limpar.onclick = () => {
  document.querySelectorAll('input').forEach(el => el.value = '');
  document.getElementById('total-fixos').textContent = 'R$ 0,00';
  document.getElementById('total-variaveis').textContent = '0%';
  document.getElementById('saida').innerHTML = '';
  document.getElementById('resultado').style.display = 'none';
};
document.getElementById('calcular').after(limpar);

// Botão Exportar PDF
const exportar = document.createElement('button');
exportar.textContent = 'Exportar PDF';
exportar.style.marginLeft = '1rem';
exportar.onclick = () => {
  const elemento = document.getElementById('resultado');
  const opt = {
    margin: 0.5,
    filename: 'relatorio_precificacao.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(elemento).save();
};
document.getElementById('calcular').after(exportar);
