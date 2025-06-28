document.addEventListener("DOMContentLoaded", () => {
  const calcular = document.getElementById("calcular");
  const limpar = document.getElementById("limpar");

  calcular.addEventListener("click", () => {
    const precoCompra = parseFloat(document.getElementById("preco-compra").value) || 0;
    const precoVenda = parseFloat(document.getElementById("preco-venda").value) || 0;
    const diasUteis = parseInt(document.getElementById("dias-uteis").value) || 22;

    const fixosIds = [
      "fixo-aluguel", "fixo-energia", "fixo-agua", "fixo-internet", "fixo-telefonia",
      "fixo-pessoal", "fixo-socios", "fixo-assinaturas", "fixo-contabilidade",
      "fixo-manutencoes", "fixo-refeicoes", "fixo-depreciacoes", "fixo-outras"
    ];
    const totalFixos = fixosIds.reduce((soma, id) => soma + (parseFloat(document.getElementById(id)?.value) || 0), 0);

    const itensVariaveis = [
      { id: "variavel-producao", nome: "Custo de Aquisição/Produção" },
      { id: "variavel-impostos", nome: "Impostos sobre faturamento" },
      { id: "variavel-comissoes", nome: "Comissões de Vendas" },
      { id: "variavel-debito", nome: "Taxa de Cartão – Débito" },
      { id: "variavel-fretes", nome: "Fretes" },
      { id: "variavel-antecipacao", nome: "Taxa de Antecipação" },
      { id: "variavel-descontos", nome: "Desconto de Vendas" },
      { id: "variavel-outros", nome: "Outros Custos Variáveis" },
      { id: "variavel-credito", nome: "Taxa de Cartão – Crédito" }
    ];

    let totalVariaveisPercent = 0;
    let tabelaVariaveis = `<h3>💡 Detalhamento dos Custos Variáveis por Unidade</h3><table border="1" cellspacing="0" cellpadding="6"><tr><th>Item</th><th>%</th><th>R$</th></tr>`;

    itensVariaveis.forEach(item => {
      const percent = parseFloat(document.getElementById(item.id)?.value) || 0;
      const valor = precoVenda * (percent / 100);
      totalVariaveisPercent += percent;
      tabelaVariaveis += `<tr><td>${item.nome}</td><td>${percent.toFixed(2)}%</td><td>R$ ${valor.toFixed(2)}</td></tr>`;
    });

    const custoVariavelReais = precoVenda * (totalVariaveisPercent / 100);
    tabelaVariaveis += `<tr><td><strong>Total</strong></td><td><strong>${totalVariaveisPercent.toFixed(2)}%</strong></td><td><strong>R$ ${custoVariavelReais.toFixed(2)}</strong></td></tr></table><br>`;

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
      <p><strong>📥 Receita Líquida:</strong> R$ ${receitaLiquida.toFixed(2)}</p>
      <p><strong>📊 Margem de Receita Líquida:</strong> ${margemLiquida.toFixed(2)}%</p>
      <p><strong>🧮 Margem de Contribuição:</strong> ${margemLiquida.toFixed(2)}%</p>
      <hr>
      <p><strong>📦 Ponto de Equilíbrio (mensal):</strong> ${Math.ceil(peUnidades)} unidades</p>
      <p><strong>📅 Por dia útil:</strong> ${Math.ceil(peDiarioUnidades)} unidades/dia</p>
      <p><strong>💰 Faturamento diário necessário:</strong> R$ ${peDiarioReais.toFixed(2)}</p>
      <hr>
      ${tabelaVariaveis}
    `;

    document.getElementById("resultados").style.display = "block";
  });

  limpar.addEventListener("click", () => {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("saida").innerHTML = "";
    document.getElementById("resultados").style.display = "none";
  });
});
