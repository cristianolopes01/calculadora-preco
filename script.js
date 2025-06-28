window.addEventListener("DOMContentLoaded", () => {
  const calcular = document.getElementById("calcular");
  const limpar = document.getElementById("limpar");

  calcular.addEventListener("click", () => {
    const precoCompra = parseFloat(document.getElementById("preco-compra").value) || 0;
    const precoVenda = parseFloat(document.getElementById("preco-venda").value) || 0;
    const diasUteis = parseInt(document.getElementById("dias-uteis").value) || 22;

    // Custos Fixos
    const fixosIds = [
      "fixo-aluguel", "fixo-energia", "fixo-agua", "fixo-internet", "fixo-telefonia",
      "fixo-pessoal", "fixo-socios", "fixo-assinaturas", "fixo-contabilidade",
      "fixo-manutencoes", "fixo-refeicoes", "fixo-depreciacoes", "fixo-outras"
    ];
    let totalFixos = 0;
    fixosIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        totalFixos += parseFloat(el.value) || 0;
      }
    });

    // Custos Variáveis (%)
    const variaveisIds = [
      "variavel-producao", "variavel-impostos", "variavel-comissoes", "variavel-debito",
      "variavel-fretes", "variavel-antecipacao", "variavel-descontos",
      "variavel-outros", "variavel-credito"
    ];
    let totalVariaveisPercent = 0;
    variaveisIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        totalVariaveisPercent += parseFloat(el.value) || 0;
      }
    });

    const percentualVarDecimal = totalVariaveisPercent / 100;
    const custoVariavelReais = precoVenda * percentualVarDecimal;

    const receitaBruta = precoVenda - precoCompra;
    const margemBruta = precoVenda ? (receitaBruta / precoVenda) * 100 : 0;

    const receitaLiquida = receitaBruta - custoVariavelReais;
    const margemLiquida = precoVenda ? (receitaLiquida / precoVenda) * 100 : 0;

    const mcu = receitaLiquida;
    const peUnidades = mcu > 0 ? totalFixos / mcu : 0;
    const peDiarioUnidades = diasUteis > 0 ? peUnidades / diasUteis : 0;
    const peDiarioReais = (margemLiquida > 0 && diasUteis > 0) ? totalFixos / (margemLiquida / 100) / diasUteis : 0;

    const saida = document.getElementById("saida");
    saida.innerHTML = `
      <p><strong>📈 Receita Bruta:</strong> R$ ${receitaBruta.toFixed(2)}</p>
      <p><strong>📊 Margem de Receita Bruta:</strong> ${margemBruta.toFixed(2)}%</p>
      <p><strong>💸 Custos Variáveis:</strong> R$ ${custoVariavelReais.toFixed(2)} (${totalVariaveisPercent.toFixed(2)}%)</p>
      <p><strong>📥 Receita Líquida:</strong> R$ ${receitaLiquida.toFixed(2)}</p>
      <p><strong>📊 Margem de Receita Líquida:</strong> ${margemLiquida.toFixed(2)}%</p>
      <p><strong>🧮 Margem de Contribuição:</strong> ${margemLiquida.toFixed(2)}%</p>
      <hr>
      <p><strong>📦 Ponto de Equilíbrio (mensal):</strong> ${Math.ceil(peUnidades)} unidades</p>
      <p><strong>📅 Por dia útil:</strong> ${Math.ceil(peDiarioUnidades)} unidades/dia</p>
      <p><strong>💰 Faturamento diário necessário:</strong> R$ ${peDiarioReais.toFixed(2)}</p>
    `;

    document.getElementById("resultados").style.display = "block";
  });

  limpar.addEventListener("click", () => {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("saida").innerHTML = "";
    document.getElementById("resultados").style.display = "none";
  });
});
