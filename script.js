window.addEventListener('DOMContentLoaded', () => {
  // Labels
  const fixosLabels = [
    'Aluguel', 'Energia Elétrica', 'Água', 'Telefonia',
    'Internet', 'Pessoal', 'Remuneração Sócios', 'Contabilidade',
    'Depreciações', 'Outros Fixos'
  ];

  const variaveisLabels = [
    'Custo de Aquisição/Produção', 'Impostos sobre faturamento',
    'Comissões de Vendas', 'Taxa de Cartão – Débito',
    'Fretes', 'Taxa de Antecipação', 'Desconto de Vendas',
    'Outros Custos Variáveis', 'Taxa de Cartão – Crédito'
  ];

  // Gera campos fixos
  const fixosDiv = document.getElementById('fixos-container');
  fixosLabels.forEach((label, i) => {
    const campo = document.createElement('div');
    campo.className = 'campo';
    campo.innerHTML = `<label>${label}: <input type="number" id="fixo${i}" /></label>`;
    fixosDiv.appendChild(campo);
  });

  // Gera campos variáveis
  const variaveisDiv = document.getElementById('variaveis-container');
  variaveisLabels.forEach((label, i) => {
    const campo = document.createElement('div');
    campo.className = 'campo';
    campo.innerHTML = `<label>${label}: <input type="number" id="variavel${i}" /></label>`;
    variaveisDiv.appendChild(campo);
  });
});

document.getElementById('calcular').addEventListener('click', () => {
  const fixos = [], variaveis = [];
  let totalFixos = 0, totalVariaveis = 0;

  // Coleta fixos
  document.querySelectorAll('#fixos-container input').forEach((el, i) => {
    const val = parseFloat(el.value) || 0;
    totalFixos += val;
    fixos.push({ nome: el.parentElement.textContent.replace(':', '').trim(), valor: val });
  });

  document.getElementById('total-fixos').textContent = totalFixos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Coleta variáveis
  document.querySelectorAll('#variaveis-container input').forEach((el, i) => {
    const val = parseFloat(el.value) || 0;
    totalVariaveis += val;
    variaveis.push({ nome: el.parentElement.textContent.replace(':', '').trim(), valor: val });
  });

  document.getElementById('total-variaveis').textContent = totalVariaveis.toFixed(2) + '%';

  // Parâmetros
  const freteUnit = parseFloat(document.getElementById('p-frete').value) || 0;
  const vendas = parseFloat(document.getElementById('p-vendas').value) || 0;
  const margem = parseFloat(document.getElementById('p-margem').value) || 0;
  if (!vendas || margem >= 100) return alert('Informe corretamente os parâmetros.');

  const custoFixoUnit = totalFixos / vendas;
  const somaPerc = (totalVariaveis + margem) / 100;
  if (somaPerc >= 1) return alert('A soma dos percentuais ultrapassa 100%.');

  const precoVenda = (custoFixoUnit + freteUnit) / (1 - somaPerc);
  const lucro = precoVenda * (margem / 100);

  // Resultado
  const saida = document.getElementById('saida');
  saida.innerHTML = `
    <p><strong>💲 Preço de Venda Sugerido:</strong> R$ ${precoVenda.toFixed(2)}</p>
    <p>📦 Frete por Unidade: R$ ${freteUnit.toFixed(2)}</p>
    <p>🏢 Rateio Fixos por Unidade: R$ ${custoFixoUnit.toFixed(2)}</p>
    <p>📉 Total de Variáveis: ${totalVariaveis.toFixed(2)}%</p>
    <p>💰 Lucro Estimado: R$ ${lucro.toFixed(2)} (${margem.toFixed(2)}%)</p>
  `;

  document.getElementById('resultado').style.display = 'block';

  // Tabela fixos
  let htmlFixos = `<h3>📘 Tabela de Custos Fixos</h3><table><tr><th>Item</th><th>Valor</th><th>Participação</th></tr>`;
  fixos.forEach(f => {
    const perc = totalFixos > 0 ? (f.valor / totalFixos) * 100 : 0;
    htmlFixos += `<tr><td>${f.nome}</td><td>R$ ${f.valor.toFixed(2)}</td><td>${perc.toFixed(1)}%</td></tr>`;
  });
  htmlFixos += `<tr><td><strong>Total</strong></td><td><strong>R$ ${totalFixos.toFixed(2)}</strong></td><td><strong>100%</strong></td></tr></table>`;
  document.getElementById('tabela-fixos').innerHTML = htmlFixos;

  // Tabela variáveis
  let htmlVar = `<h3>📙 Tabela de Custos Variáveis</h3><table><tr><th>Item</th><th>Percentual</th><th>Participação</th></tr>`;
  variaveis.forEach(v => {
    const perc = totalVariaveis > 0 ? (v.valor / totalVariaveis) * 100 : 0;
    htmlVar += `<tr><td>${v.nome}</td><td>${v.valor.toFixed(2)}%</td><td>${perc.toFixed(1)}%</td></tr>`;
  });
  htmlVar += `<tr><td><strong>Total</strong></td><td><strong>${totalVariaveis.toFixed(2)}%</strong></td><td><strong>100%</strong></td></tr></table>`;
  document.getElementById('tabela-variaveis').innerHTML = htmlVar;

  // Gráfico
  const ctx = document.getElementById('grafico').getContext('2d');
  if (window.graficoPizza) window.graficoPizza.destroy();
  window.graficoPizza = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: variaveis.map(v => v.nome),
      datasets: [{
        data: variaveis.map(v => v.valor),
        backgroundColor: [
          '#4CAF50', '#FF9800', '#03A9F4', '#E91E63',
          '#8BC34A', '#FFC107', '#9C27B0', '#795548', '#607D8B'
        ]
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
});

// Botões auxiliares
document.getElementById('limpar').addEventListener('click', () => {
  document.querySelectorAll('input').forEach(i => i.value = '');
  document.getElementById('total-fixos').textContent = 'R$ 0,00';
  document.getElementById('total-variaveis').textContent = '0%';
  document.getElementById('saida').innerHTML = '';
  document.getElementById('tabela-fixos').innerHTML = '';
  document.getElementById('tabela-variaveis').innerHTML = '';
  document.getElementById('resultado').style.display = 'none';
});

document.getElementById('exportar').addEventListener('click', () => {
  const area = document.getElementById('resultado');
  html2pdf().set({
    margin: 0.5,
    filename: 'relatorio_precificacao.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
  }).from(area).save();
});
