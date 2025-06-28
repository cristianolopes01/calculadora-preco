window.addEventListener('DOMContentLoaded', () => {
  // Dados fixos e variáveis
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

  // Geração de campos fixos e variáveis
  const fixosDiv = document.getElementById('fixos-container');
  fixosLabels.forEach((label, i) => {
    const campo = document.createElement('div');
    campo.className = 'campo';
    campo.innerHTML = `<label>${label}: <input type="number" id="fixo${i}" /></label>`;
    fixosDiv.appendChild(campo);
  });

  const variaveisDiv = document.getElementById('variaveis-container');
  variaveisLabels.forEach((label, i) => {
    const campo = document.createElement('div');
    campo.className = 'campo';
    campo.innerHTML = `<label>${label}: <input type="number" id="variavel${i}" /></label>`;
    variaveisDiv.appendChild(campo);
  });
});

document.getElementById('calcular').addEventListener('click', () => {
  const fixos = [];
  const variaveis = [];

  let totalFixos = 0;
  let totalVariaveis = 0;

  // Captura fixos
  document.querySelectorAll('#fixos-container input').forEach((el, i) => {
    const valor = parseFloat(el.value) || 0;
    totalFixos += valor;
    fixos.push({ nome: el.parentElement.textContent.replace(':', '').trim(), valor });
  });
  document.getElementById('total-fixos').textContent = totalFixos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Captura variáveis
  document.querySelectorAll('#variaveis-container input').forEach((el, i) => {
    const valor = parseFloat(el.value) || 0;
    totalVariaveis += valor;
    variaveis.push({ nome: el.parentElement.textContent.replace(':', '').trim(), valor });
  });
  document.getElementById('total-variaveis').textContent = totalVariaveis.toFixed(2) + '%';

  // Parâmetros
  const freteUnit = parseFloat(document.getElementById('p-frete').value) || 0;
  const vendas = parseFloat(document.getElementById('p-vendas').value) || 0;
  const margem = parseFloat(document.getElementById('p-margem').value) || 0;
  if (!vendas || margem >= 100) return alert('Informe corretamente os parâmetros de vendas e margem.');

  const custoFixoUnit = totalFixos / vendas;
  const somaPerc = (totalVariaveis + margem) / 100;
  if (somaPerc >= 1) return alert('A soma dos percentuais ultrapassa 100%.');

  const precoVenda = (custoFixoUnit + freteUnit) / (1 - somaPerc);
  const lucro = precoVenda * (margem / 100);

  const saida = document.getElementById('saida');
  saida.innerHTML = `
    <p><strong>💲 Preço de Venda Sugerido:</strong> R$ ${precoVenda.toFixed(2)}</p>
    <p>📦 Frete por Unidade: R$ ${freteUnit.toFixed(2)}</p>
    <p>🏢 Rateio de Fixos por Unidade: R$ ${custoFixoUnit.toFixed(2)}</p>
    <p>📈 Lucro: R$ ${lucro.toFixed(2)} (${margem.toFixed(2)}%)</p>
  `;
  document.getElementById('resultado').style.display = 'block';

  // Tabela Fixos
  let fixosHTML = `
    <h3>📘 Tabela de Custos Fixos</h3>
    <table><thead><tr><th>Item</th><th>Valor</th><th>Participação</th></tr></thead><tbody>
  `;
  fixos.forEach(f => {
    const perc = totalFixos > 0 ? (f.valor / totalFixos) * 100 : 0;
    fixosHTML += `<tr><td>${f.nome}</td><td>R$ ${f.valor.toFixed(2)}</td><td>${perc.toFixed(1)}%</td></tr>`;
  });
  fixosHTML += `<tr><td><strong>Total</strong></td><td><strong>R$ ${totalFixos.toFixed(2)}</strong></td><td><strong>100%</strong></td></tr></tbody></table>`;
  document.getElementById('tabela-fixos').innerHTML = fixosHTML;

  // Tabela Variáveis
  let variaveisHTML = `
    <h3>📙 Tabela de Custos Variáveis</h3>
    <table><thead><tr><th>Item</th><th>Percentual</th><th>Participação</th></tr></thead><tbody>
  `;
  variaveis.forEach(v => {
    const perc = totalVariaveis > 0 ? (v.valor / totalVariaveis) * 100 : 0;
    variaveisHTML += `<tr><td>${v.nome}</td><td>${v.valor.toFixed(2)}%</td><td>${perc.toFixed(1)}%</td></tr>`;
  });
  variaveisHTML += `<tr><td><strong>Total</strong></td><td><strong>${totalVariaveis.toFixed(2)}%</strong></td><td><strong>100%</strong></td></tr></tbody></table>`;
  document.getElementById('tabela-variaveis').innerHTML = variaveisHTML;

  // Gráfico de custos variáveis
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
