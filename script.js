document.getElementById("calcular").addEventListener("click", () => {
  const precoCompra = parseFloat(document.getElementById("preco-compra").value) || 0;
  const precoVenda = parseFloat(document.getElementById("preco-venda").value) || 0;
  const diasUteis = parseInt(document.getElementById("dias-uteis").value) || 22;

  // === Custos Fixos ===
  const fixosIds = [
    "fixo-aluguel", "fixo-energia", "fixo-agua", "fixo-internet", "fixo-telefonia",
    "fixo-pessoal", "fixo-socios", "fixo-assinaturas", "fixo-contabilidade",
    "fixo-manutencoes", "fixo-refeicoes", "fixo-depreciacoes", "fixo-outras"
  ];
  let totalFixos = 0;
  fixosIds.forEach(id => {
    const valor = parseFloat(document.getElementById(id).value) || 0;
    totalFixos += valor;
  });

  // === Custos Variáveis (%) ===
  const variaveisIds = [
    "variavel-producao", "variavel-impostos", "variavel-comissoes", "variavel-debito",
    "variavel-fretes", "variavel-antecipacao", "variavel-descontos",
    "variavel-outros", "variavel-credito"
  ];
  let totalVariaveisPercent = 0;
  variaveisIds.forEach(id => {
    const percentual = parseFloat(document.getElementById(id).value) || 0;
    totalVariaveisPercent += percentual;
  });

  const percentualVarDecimal = totalVariaveisPercent / 100;
  const custoVariavelReais = precoVenda * percentualVarDecimal;

  const receitaBruta = precoVenda - precoCompra;
  const margemBruta = (receitaBruta / precoVenda) * 100;

  const receitaLiquida = receitaBruta - custoVariavelReais;
  const margemLiquida = (receitaLiquida / precoVenda) * 100;

  const margemContribuicao = margemLiquida; // mesma coisa nesse contexto

  const mcu = receitaLiquida;
  const peUnidades = totalFixos / mcu;
  const peDiarioUnidades = peUnidades / diasUteis;
  const peDiarioReais = totalFixos / (margemContribuicao / 100) / diasUteis;

  const saida = document.getElementById("saida");
  saida.innerHTML = `
    <p><strong>📈 Receita Bruta:</strong> R$ ${receitaBruta.toFixed(2)}</p>
    <p><strong>📊 Margem de Receita Bruta:</strong> ${margemBruta.toFixed(2)}%</p>
    <p><strong>💸 Custos Variáveis:</strong> R$ ${custoVariavelReais.toFixed(2)} (${totalVariaveisPercent.toFixed(2)}%)</p>
    <p><strong>📥 Receita Líquida:</strong> R$ ${receitaLiquida.toFixed(2)}</p>
    <p><strong>📊 Margem de Receita Líquida:</strong> ${margemLiquida.toFixed(2)}%</p>
    <p><strong>🧮 Margem de Contribuição:</strong> ${margemContribuicao.toFixed(2)}%</p>
    <hr>
    <p><strong>📦 Ponto de Equilíbrio (mensal):</strong> ${Math.ceil(peUnidades)} unidades</p>
    <p><strong>📅 Por dia útil:</strong> ${Math.ceil(peDiarioUnidades)} unidades/dia</p>
    <p><strong>💰 Faturamento diário necessário:</strong> R$ ${peDiarioReais.toFixed(2)}</p>
  `;

  document.getElementById("resultados").style.display = "block";
});

document.getElementById("limpar").addEventListener("click", () => {
  document.querySelectorAll("input").forEach(input => (input.value = ""));
  document.getElementById("saida").innerHTML = "";
  document.getElementById("resultados").style.display = "none";
});
