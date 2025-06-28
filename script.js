document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("precificacao-form");
  const pizzaSection = document.getElementById("grafico-section");
  const ctx = document.getElementById("grafico-pizza").getContext("2d");
  let chart;

  function calcular() {
    // Fixos
    const fixos = Array.from(document.querySelectorAll("#tabela-fixos tbody tr"));
    let totalFixos = 0;
    fixos.forEach(row => {
      const val = parseFloat(row.querySelector("input").value) || 0;
      totalFixos += val;
    });
    document.getElementById("total-fixos").textContent = `R$ ${totalFixos.toFixed(2)}`;
    fixos.forEach(row => {
      const val = parseFloat(row.querySelector("input").value) || 0;
      const part = totalFixos > 0 ? (val / totalFixos) * 100 : 0;
      row.querySelector(".participacao").textContent = `${part.toFixed(1)}%`;
    });

    // Variáveis
    const variaveis = Array.from(document.querySelectorAll("#tabela-variaveis tbody tr"));
    let totalVarPerc = 0;
    variaveis.forEach(row => {
      const perc = parseFloat(row.querySelector("input").value) || 0;
      totalVarPerc += perc;
    });
    document.getElementById("total-variaveis").textContent = `${totalVarPerc.toFixed(2)}%`;

    // Preço
    const precoCompra = parseFloat(document.getElementById("preco-compra").value) || 0;
    const precoVenda = parseFloat(document.getElementById("preco-venda").value) || 0;
    const lucroBruto = precoVenda - precoCompra;
    const margemBruta = precoVenda > 0 ? (lucroBruto / precoVenda) * 100 : 0;
    const impostosPerc = parseFloat(document.getElementById("variavel-impostos").value) || 0;
    const impostosValor = precoVenda * (impostosPerc / 100);
    const lucroLiquido = lucroBruto - impostosValor;
    const margemLiquida = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0;
    const margemContribuicao = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0;

    document.getElementById("lucro-bruto").textContent = `R$ ${lucroBruto.toFixed(2)}`;
    document.getElementById("margem-bruta").textContent = `${margemBruta.toFixed(2)}%`;
    document.getElementById("impostos-venda").textContent = `R$ ${impostosValor.toFixed(2)}`;
    document.getElementById("lucro-liquido").textContent = `R$ ${lucroLiquido.toFixed(2)}`;
    document.getElementById("margem-liquida").textContent = `${margemLiquida.toFixed(2)}%`;
    document.getElementById("margem-contribuicao").textContent = `${margemContribuicao.toFixed(2)}%`;

    // PE
    const diasMes = parseInt(document.getElementById("dias-mes").value) || 26;
    const qtdeEstimadas = parseFloat(document.getElementById("vendas-estimadas").value) || 0;
    const margemUnitaria = precoVenda - precoCompra - impostosValor;
    const peUnidades = margemUnitaria > 0 ? totalFixos / margemUnitaria : 0;
    const peReais = precoVenda * peUnidades;
    const peDia = peUnidades / diasMes;
    const fatDia = precoVenda * (qtdeEstimadas / diasMes || 0);

    document.getElementById("pe-unidades").textContent = Math.ceil(peUnidades);
    document.getElementById("pe-reais").textContent = `R$ ${peReais.toFixed(2)}`;
    document.getElementById("pe-dia").textContent = Math.ceil(peDia);
    document.getElementById("faturamento-dia").textContent = `R$ ${fatDia.toFixed(2)}`;

    // Gráfico
    const custosGrafico = [
      { label: "Compra", valor: precoCompra, cor: "#3498db" },
      { label: "Impostos", valor: impostosValor, cor: "#f39c12" },
      { label: "Fixos por unidade", valor: totalFixos / (qtdeEstimadas || 1), cor: "#9b59b6" },
      { label: "Lucro", valor: lucroLiquido, cor: "#2ecc71" }
    ];
    pizzaSection.style.display = "block";
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: custosGrafico.map(c => c.label),
        datasets: [{
          data: custosGrafico.map(c => c.valor),
          backgroundColor: custosGrafico.map(c => c.cor)
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

  form.addEventListener("submit", e => {
    e.preventDefault();
    calcular();
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      document.querySelectorAll("td.participacao").forEach(td => td.textContent = "");
      document.querySelectorAll("td[id]").forEach(td => td.textContent = "");
      pizzaSection.style.display = "none";
      if (chart) chart.destroy();
    }, 100);
  });
});
