document.addEventListener("DOMContentLoaded", () => {
  const calcular = document.getElementById("calcular");
  const limpar = document.getElementById("limpar");

  calcular.addEventListener("click", () => {
    const precoCompra = parseFloat(document.getElementById("preco-compra").value) || 0;
    const precoVenda = parseFloat(document.getElementById("preco-venda").value) || 0;
    const diasUteis = parseInt(document.getElementById("dias-uteis").value) || 22;

    // === Custos Fixos ===
    const fixosIds = [
      { id: "fixo-aluguel", nome: "Aluguel" },
      { id: "fixo-energia", nome: "Energia Elétrica" },
      { id: "fixo-agua", nome: "Água" },
      { id: "fixo-internet", nome: "Internet" },
      { id: "fixo-telefonia", nome: "Telefonia" },
      { id: "fixo-pessoal", nome: "Pessoal" },
      { id: "fixo-socios", nome: "Remuneração Sócios" },
      { id: "fixo-assinaturas", nome: "Assinaturas" },
      { id: "fixo-contabilidade", nome: "Contabilidade" },
      { id: "fixo-manutencoes", nome: "Manutenções" },
      { id: "fixo-refeicoes", nome: "Refeições" },
      { id: "fixo-depreciacoes", nome: "Depreciações" },
      { id: "fixo-outras", nome: "Outras Despesas" }
    ];

    let totalFixos = 0;
    const fixos = fixosIds.map(item => {
      const valor = parseFloat(document.getElementById(item.id)?.value) || 0;
      totalFixos += valor;
      return { ...item, valor };
    });
    fixos.forEach(f => f.percentual = totalFixos > 0 ? (f.valor / totalFixos) * 100 : 0);

    // === Custos Variáveis ===
    const variaveisIds = [
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
    const variaveis = variaveisIds.map(item => {
      const percent = parseFloat(document.getElementById(item.id)?.value) || 0;
      totalVariaveisPercent += percent;
      return {
        ...item,
        percent,
        valor: precoVenda * (percent / 100)
      };
    });
    variaveis.forEach(v => {
      v.participacao = totalVariaveisPercent > 0 ? (v.percent / totalVariaveisPercent) * 100 : 0;
    });

    const custoVariavelReais = precoVenda * (totalVariaveisPercent / 100);
    const receitaBruta = precoVenda - precoCompra;
    const margemBruta = precoVenda ? (receitaBruta / precoVenda) * 100 : 0;
    const receitaLiquida = receitaBruta - custoVariavelReais;
    const margemLiquida = precoVenda ? (receitaLiquida / precoVenda) * 100 : 0;

    const mcu = receitaLiquida;
    const peUnidades = mcu > 0 ? totalFixos / mcu : 0;
    const peDiarioUnidades = diasUteis > 0 ? peUnidades / diasUteis : 0;
    const peDiarioReais = (margemLiquida > 0 && diasUteis > 0) ? totalFixos / (margemLiquida / 100) / diasUteis : 0;

    // === RELATÓRIOS ===
    document.getElementById("relatorio-preco").innerHTML = `
      <h3>📋 Preços e Margens</h3>
      <table>
        <tr><td>Preço de Compra</td><td>R$ ${precoCompra.toFixed(2)}</td></tr>
        <tr><td>Preço de Venda</td><td>R$ ${precoVenda.toFixed(2)}</td></tr>
        <tr><td>Receita Bruta</td><td>R$ ${receitaBruta.toFixed(2)}</td></tr>
        <tr><td>Margem Bruta</td><td>${margemBruta.toFixed(2)}%</td></tr>
        <tr><td>Custos Variáveis</td><td>R$ ${custoVariavelReais.toFixed(2)}</td></tr>
        <tr><td>Receita Líquida</td><td>R$ ${receitaLiquida.toFixed(2)}</td></tr>
        <tr><td>Margem de Contribuição</td><td>${margemLiquida.toFixed(2)}%</td></tr>
      </table>
    `;

    document.getElementById("relatorio-fixos").innerHTML = `
      <h3>📘 Custos Fixos</h3>
      <table>
        <tr><th>Item</th><th>R$</th><th>%</th></tr>
        ${fixos.map(f => `<tr><td>${f.nome}</td><td>R$ ${f.valor.toFixed(2)}</td><td>${f.percentual.toFixed(2)}%</td></tr>`).join("")}
        <tr><td><strong>Total</strong></td><td><strong>R$ ${totalFixos.toFixed(2)}</strong></td><td><strong>100%</strong></td></tr>
      </table>
    `;

    document.getElementById("relatorio-variaveis").innerHTML = `
      <h3>📙 Custos Variáveis</h3>
      <table>
        <tr><th>Item</th><th>%</th><th>R$</th><th>% Participação</th></tr>
        ${variaveis.map(v => `<tr><td>${v.nome}</td><td>${v.percent.toFixed(2)}%</td><td>R$ ${v.valor.toFixed(2)}</td><td>${v.participacao.toFixed(2)}%</td></tr>`).join("")}
        <tr><td><strong>Total</strong></td><td><strong>${totalVariaveisPercent.toFixed(2)}%</strong></td><td><strong>R$ ${custoVariavelReais.toFixed(2)}</strong></td><td><strong>100%</strong></td></tr>
      </table>
    `;

    document.getElementById("relatorio-equilibrio").innerHTML = `
      <h3>🎯 Ponto de Equilíbrio</h3>
      <table>
        <tr><td>Mensal (Unidades)</td><td>${Math.ceil(peUnidades)}</td></tr>
        <tr><td>Diário (Unidades)</td><td>${Math.ceil(peDiarioUnidades)}</td></tr>
        <tr><td>Faturamento Diário Necessário</td><td>R$ ${peDiarioReais.toFixed(2)}</td></tr>
      </table>
    `;

    document.getElementById("resultados").style.display = "block";
  });

  limpar.addEventListener("click", () => {
    document.querySelectorAll("input").forEach(input => input.value = "");
    ["relatorio-preco", "relatorio-fixos", "relatorio-variaveis", "relatorio-equilibrio"].forEach(id => {
      document.getElementById(id).innerHTML = "";
    });
    document.getElementById("resultados").style.display = "none";
  });
});
