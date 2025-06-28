window.addEventListener('DOMContentLoaded', () => {
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

  const fixosDiv = document.getElementById('fixos-container');
  const variaveisDiv = document.getElementById('variaveis-container');

  fixosLabels.forEach((label, i) => {
    fixosDiv.innerHTML += `<div class="campo"><label>${label}: <input type="number" id="fixo${i}" /></label></div>`;
  });

  variaveisLabels.forEach((label, i) => {
    variaveisDiv.innerHTML += `<div class="campo"><label>${label}: <input type="number" id="variavel${i}" /></label></div>`;
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
  document.getElementById('total-variaveis').textContent = totalVariaveis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Parâmetros
  const frete = parseFloat(document.getElementById('p-frete').value) || 0;
  const vendasMes = parseFloat(document.getElementById('p-vendas').value) || 0;
  const margem = parseFloat(document.getElementById('p-margem').value) || 0;

  if (!vendasMes || margem >= 100) return alert('Preencha as Vendas Mensais corretamente e verifique a Margem.');

  const custoFixoUnit = totalFixos / vendasMes;
  const custoVariavelUnit = totalVariaveis / vendasMes;
  const somaCustos = custoFixoUnit + custoVariavelUnit + frete;
  const precoVenda = somaCustos / (1 - margem / 100);
  const valorLucro = precoVenda * (margem / 100);

  // Resultado
  const saida = document.getElementById('saida');
  saida.innerHTML = `
    <p><strong>💲 Preço de Venda Sugerido:</strong> R$ ${precoVenda.toFixed(2)}</p>
    <p>📦 Frete Unitário: R$ ${frete.toFixed(2)}</p>
    <p>🏢 Custo Fixo Unitário: R$ ${custoFixoUnit.toFixed(2)}</p>
    <p>🔧 Custo Variável Unitário: R$ ${custoVariavelUnit.toFixed(2)}</p>
    <p>💰 Lucro: R$ ${valorLucro.toFixed(2)} (${margem.toFixed(2)}%)</p>
  `;

  document.getElementById('resultado').style.display = 'block';

  // Tabelas
  const gerarTabela = (dados, total, titulo) => {
    let html = `<h3>${titulo}</h3><table><thead><tr><th>Item</th><th>Valor (R$)</th><th>Participação</th></tr></thead><tbody>`;
    dados.forEach(item => {
      const perc = total > 0 ? (item.valor / total) * 100 : 0;
      html += `<tr><td>${item.nome}</td><td>R$ ${item.valor.toFixed(2)}</td><td>${perc.toFixed(1)}%</td></tr>`;
    });
    html += `<tr><td><strong>Total</strong></td><td><strong>R$ ${total.toFixed(2)}</strong></td><td><strong>100%</strong></td></tr></tbody></table>`;
    return html;
  };

  document.getElementById('tabela-fixos').innerHTML = gerarTabela(fixos, totalFixos, '📘 Custos Fixos');
  document.getElementById('tabela-variaveis').innerHTML = gerarTabela(variaveis, totalVariaveis, '📙 Custos Variáveis');

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
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
});

// Limpar
document.getElementById('limpar').addEventListener('click', () => {
  document.querySelectorAll('input').forEach(el => el.value = '');
  document.getElementById('total-fixos').textContent = 'R$ 0,00';
  document.getElementById('total-variaveis').textContent = 'R$ 0,00';
  document.getElementById('saida').innerHTML = '';
  document.getElementById('resultado').style.display = 'none';
  document.getElementById('tabela-fixos').innerHTML = '';
  document.getElementById('tabela-variaveis').innerHTML = '';
});

// Exportar PDF
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
