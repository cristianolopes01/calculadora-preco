document.addEventListener("DOMContentLoaded", () => {
  const calcular = document.getElementById("calcular");
  const limpar = document.getElementById("limpar");
  const gerarPdf = document.getElementById("gerar-pdf");
  let graficoPizza;

  function executarCalculo() {
    const precoCompra = parseFloat(document.getElementById("preco-compra")?.value) || 0;
    const precoVenda = parseFloat(document.getElementById("preco-venda")?.value) || 0;
    const diasUteis = parseInt(document.getElementById("dias-uteis")?.value) || 22;
    const impostoVendas = parseFloat(document.getElementById("imposto-vendas")?.value) || 0;

    // Custos Fixos
    const fixosIds = ["fixo-aluguel", "fixo-energia", "fixo-agua", "fixo-internet", "fixo-pessoal", "fixo-outros"];
    const totalFixos = fixosIds.reduce((total, id) => {
      return total + (parseFloat(document.getElementById(id)?.value) || 0);
    }, 0);

    // Custos Variáveis
    const variaveisIds = [
      { id: "variavel-producao", nome: "Produção" },
      { id: "variavel-impostos", nome: "Impostos" },
      { id: "variavel-comissoes", nome: "Comissões" },
      { id: "variavel-fretes", nome: "Frete" },
      { id: "variavel-outros", nome: "Outros" }
    ];

    const variaveis = variaveisIds.map(item => {
      const perc = parseFloat(document.getElementById(item.id)?.value) || 0;
      const valor = precoVenda * (perc / 100);
      return { nome: item.nome, percent: perc, valor };
    });

    const totalVariaveis = variaveis.reduce((s, v) => s + v.valor, 0);
    const valorImposto = precoVenda * (impostoVendas / 100);

    const receitaBruta = precoVenda - precoCompra;
    const receitaLiquida = receitaBruta - totalVariaveis - valorImposto;
    const margemContrib = precoVenda > 0 ? (receitaLiquida / precoVenda) * 100 : 0;

    const mcu = receitaLiquida; // considerando 1 unidade
    const peUnidades = mcu > 0 ? totalFixos / mcu : 0;
    const peDiario = diasUteis > 0 ? peUnidades / diasUteis : 0;

    // Relatórios
    document.getElementById("relatorio-preco").innerHTML = `
      <h3>📋 Preço e Margem</h3>
      <table>
        <tr><td>Preço de Compra</td><td>R$ ${precoCompra.toFixed(2)}</td></tr>
        <tr><td>Preço de Venda</td><td>R$ ${precoVenda.toFixed(2)}</td></tr>
        <tr><td>Receita Bruta</td><td>R$ ${receitaBruta.toFixed(2)}</td></tr>
        <tr><td>Impostos (${impostoVendas}%)</td><td>R$ ${valorImposto.toFixed(2)}</td></tr>
        <tr><td>Custos Variáveis</td><td>R$ ${totalVariaveis.toFixed(2)}</td></tr>
        <tr><td>Receita Líquida</td><td><strong>R$ ${receitaLiquida.toFixed(2)}</strong></td></tr>
        <tr><td>Margem de Contribuição</td><td>${margemContrib.toFixed(2)}%</td></tr>
      </table>
    `;

    document.getElementById("relatorio-fixos").innerHTML = `
      <h3>📘 Custos Fixos</h3>
      <table>
        ${fixosIds.map(id => {
          const nome = id.replace("fixo-", "").replace(/^\w/, c => c.toUpperCase());
          const val = parseFloat(document.getElementById(id)?.value) || 0;
          return `<tr><td>${nome}</td><td>R$ ${val.toFixed(2)}</td></tr>`;
        }).join("")}
        <tr><td><strong>Total</strong></td><td><strong>R$ ${totalFixos.toFixed(2)}</strong></td></tr>
      </table>
    `;

    document.getElementById("relatorio-variaveis").innerHTML = `
      <h3>📙 Custos Variáveis</h3>
      <table>
        <tr><th>Item</th><th>%</th><th>Valor</th></tr>
        ${variaveis.map(v => `<tr><td>${v.nome}</td><td>${v.percent.toFixed(2)}%</td><td>R$ ${v.valor.toFixed(2)}</td></tr>`).join("")}
        <tr><td><strong>Total</strong></td><td>–</td><td><strong>R$ ${totalVariaveis.toFixed(2)}</strong></td></tr>
      </table>
    `;

    document.getElementById("relatorio-equilibrio").innerHTML = `
      <h3>🎯 Ponto de Equilíbrio</h3>
      <table>
        <tr><td>Margem de Contribuição Unitária</td><td>R$ ${mcu.toFixed(2)}</td></tr>
        <tr><td>PE Mensal (Unid)</td><td>${Math.ceil(peUnidades)}</td></tr>
        <tr><td>PE Diário (Unid)</td><td>${Math.ceil(peDiario)}</td></tr>
      </table>
    `;

    document.getElementById("resultados").style.display = "block";

    // Gráfico de Pizza
    if (graficoPizza) graficoPizza.destroy();
    const ctx = document.getElementById("grafico-variaveis").getContext("2d");
    graficoPizza = new Chart(ctx, {
      type: "pie",
      data: {
        labels: variaveis.map(v => v.nome),
        datasets: [{
          data: variaveis.map(v => v.valor),
          backgroundColor: variaveis.map((_, i) => `hsl(${i * 50}, 70%, 60%)`)
        }]
      },
      options: {
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

  calcular.addEventListener("click", executarCalculo);
  document.querySelectorAll("input").forEach(el => el.addEventListener("input", executarCalculo));

  limpar.addEventListener("click", () => {
    document.querySelectorAll("input").forEach(el => el.value = "");
    document.getElementById("resultados").style.display = "none";
  });

  gerarPdf.addEventListener("click", () => {
    const resultado = document.getElementById("resultados");
    if (resultado.style.display === "none") {
      alert("Calcule primeiro antes de exportar.");
      return;
    }
    html2pdf().from(resultado).set({
      margin: 10,
      filename: `relatorio-preco-${new Date().toLocaleDateString("pt-BR")}.pdf`,
      jsPDF: { format: "a4", orientation: "portrait" }
    }).save();
  });
});
