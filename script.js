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
  let totalVariaveisPercentual = 0;

  // Custos fixos
  document.querySelectorAll('#fixos-container input').forEach((el, i) => {
    const valor = parseFloat(el.value) || 0;
    totalFixos += valor;
    fixos.push({ nome: el.parentElement.textContent.replace(':', '').trim(), valor });
  });
  document.getElementById('total-fixos').textContent = totalFixos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Custos variáveis (% sobre preço de venda)
  document.querySelectorAll('#variaveis-container input').forEach((el, i) => {
    const valor = parseFloat(el.value) || 0;
    totalVariaveisPercentual += valor;
    variaveis.push({ nome: el.parentElement.textContent.replace(':', '').trim(), valor });
  });
  document.getElementById('total-variaveis').textContent = totalVariaveisPercentual.toFixed(2) + '%';

  // Parâmetros
  const frete = parseFloat(document.getElementById('p-frete').value) || 0;
  const vendasMes = parseFloat(document.getElementById('p-vendas').value) || 1;
  const margem = parseFloat(document.getElementById('p-margem').value) || 0;
  const diasUteis = parseInt(document.getElementById('dias-uteis')?.value) || 22;
  const margemReceitaDesejada = parseFloat(document.getElementById('desejada-margem-receita')?.value) || 0;

  // Custo fixo e variável por unidade
  const custoFixoUnit = totalFixos / vendasMes;
  const custoVariavelUnit = totalVariaveisPercentual; // ainda percentual
  const somaPercentuais = (totalVariaveisPercentual + margem) / 100;

  let precoVenda = 0;
  if (somaPercentuais >= 1) return alert('A soma dos custos variáveis e margem ultrapassa 100%');

  precoVenda = (custoFixoUnit + frete) / (1 - somaPercentuais);
  const valorLucro = precoVenda * (margem / 100);

  const saida = document.getElementById('saida');
  saida.innerHTML = `
    <p><strong>💲 Preço de Venda Sugerido:</strong> R$ ${precoVenda.toFixed(2)}</p>
    <p>📦 Frete Unitário: R$ ${frete.toFixed(2)}</p>
    <p>🏢 Custo Fixo Unitário: R$ ${custoFixoUnit.toFixed(2)}</p>
    <p>📉 Custos Variáveis (%): ${totalVariaveisPercentual.toFixed(2)}%</p>
    <p>💰 Lucro Estimado: R$ ${valorLucro.toFixed(2)} (${margem.toFixed(2)}%)</p>
  `;

  // >>> Ponto de Equilíbrio com preço calculado
  const mcu = precoVenda - ((precoVenda * totalVariaveisPercentual) / 100);
  const mcuPercent = (mcu / precoVenda) * 100;
  const peUnidades = totalFixos / mcu;
  const peDiario = peUnidades / diasUteis;
  const peValorDiario = totalFixos / (mcuPercent / 100) / diasUteis;

  saida.innerHTML += `
    <hr>
    <p><strong>🧮 Margem de Contribuição:</strong> R$ ${mcu.toFixed(2)} (${mcuPercent.toFixed(1)}%)</p>
    <p><strong>📦 PE Mensal:</strong> ${Math.ceil(peUnidades)} unidades</p>
    <p><strong>📅 PE Diário:</strong> ${Math.ceil(peDiario)} unidades por dia</p>
    <p><strong>💰 Vendas por dia para Empatar:</strong> R$ ${peValorDiario.toFixed(2)}</p>
  `;

  // >>> Preço de venda a partir da margem desejada
  if (margemReceitaDesejada > 0 && margemReceitaDesejada < 100) {
    const custoVarUnit = (totalVariaveisPercentual / 100) * precoVenda;
    const precoDesejado = custoVarUnit / (1 - (margemReceitaDesejada / 100));
    const mcuDesejada = precoDesejado - custoVarUnit;
    const peDesejado = totalFixos / mcuDesejada;
    const peDesejadoDiario = peDesejado / diasUteis;
    const peDesejadoValorDia = totalFixos / (margemReceitaDesejada / 100) / diasUteis;

    saida.innerHTML += `
      <hr>
      <p><strong>🎯 Preço para Margem Desejada (${margemReceitaDesejada}%)</strong>: R$ ${precoDesejado.toFixed(2)}</p>
      <p>🧮 Margem Unitária: R$ ${mcuDesejada.toFixed(2)}</p>
      <p>📦 PE Mensal: ${Math.ceil(peDesejado)} unidades</p>
      <p>📅 PE Diário: ${Math.ceil(peDesejadoDiario)} unidades</p>
      <p>💰 Vendas/dia: R$ ${peDesejadoValorDia.toFixed(2)}</p>
    `;
  }

  document.getElementById('resultado').style.display = 'block';

  // Tabela fixos
  const gerarTabela = (dados, total, titulo, sufixo) => {
    let html = `<h3>${titulo}</h3><table><tr><th>Item</th><th>Valor</th><th>Participação</th></tr>`;
    dados.forEach(item => {
      const perc = total > 0 ? (item.valor / total) * 100 : 0;
      html += `<tr><td>${item.nome}</td><td>${sufixo === '%' ? item.valor.toFixed(2) + '%' : 'R$ ' + item.valor.toFixed(2)}</td><td>${perc.toFixed(1)}%</td></tr>`;
    });
    html += `<tr><td><strong>Total</strong></td><td><strong>${sufixo === '%' ? total.toFixed(2) + '%' : 'R$ ' + total.toFixed(2)}</strong></td><td><strong>100%</strong></td></tr></table>`;
    return html;
  };

  document.getElementById('tabela-fixos').innerHTML = gerarTabela(fixos, totalFixos, '📘 Custos Fixos', 'R$');
  document.getElementById('tabela-variaveis').innerHTML = gerarTabela(variaveis, totalVariaveisPercentual, '📙 Custos Variáveis', '%
