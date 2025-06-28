document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("precificacao-form");
  const graficoSection = document.getElementById("grafico-section");
  const ctx = document.getElementById("grafico-pizza").getContext("2d");
  let chart;

  function getValor(id) {
    return parseFloat(document.getElementById(id)?.value) || 0;
  }

  function calcular() {
    const diasMes = getValor("dias-mes") || 26;
    const estimativaVendas = getValor("vendas-estimadas") || 1;

    // Somar custos fixos
    const fixos = document.querySelectorAll("#tabela-fixos input");
    let totalFixos = 0;
    fixos.forEach(input => {
      totalFixos += getValor(input.id);
    });
    document.getElementById("total-fixos").textContent = `R$ ${totalFixos.toFixed(2)}`;
    fixos.forEach(input => {
      const val = getValor(input.id);
      const perc = totalFixos > 0 ? (val / totalFixos) * 100 : 0;
      input.closest("tr").querySelector(".participacao").textContent = `${perc.toFixed(1)}%`;
    });

    // Custos variáveis (%)
    const variaveis = document.querySelectorAll("#tabela-variaveis input");
    let totalPercVar = 0;
    let perc = {};
    variaveis.forEach(input => {
      const id = input.id;
      const val = getValor(id);
      perc[id] = val;
      totalPercVar += val;
    });
    document.getElementById("total-variaveis").textContent = `${totalPercVar.toFixed(2)}%`;

    const precoCompra = getValor("preco-compra");
    const precoVendaManual = getValor("preco-venda");
    const margemDesejada = getValor("margem-desejada"); // Campo separado para margem

    // Custo fixo unitário
    const custoFixoUnit = estimativaVendas > 0 ? totalFixos / estimativaVendas : 0;

    // Preço sugerido
    const totalPercentual = totalPercVar + margemDesejada;
    if (totalPercentual >= 100) {
      alert("❌ A soma dos percentuais não pode ser igual ou superior a 100%");
      return;
    }

    const precoSugerido = (precoCompra + custoFixoUnit) / (1 - (totalPercentual / 100));

    // Comparar com preço inserido
    const impostosValor = precoVendaManual * (perc["variavel-impostos"] / 100);
    const lucroBruto = precoVendaManual - precoCompra;
    const lucroLiquido = lucroBruto - impostosValor;
    const margemBruta = precoVendaManual > 0 ? (lucroBruto / precoVendaManual) * 100 : 0;
    const margemLiquida = precoVendaManual > 0 ? (lucroLiquido / precoVendaManual) * 100 : 0;
    const margemContribuicao = precoVendaManual > 0 ? ((precoVendaManual - precoCompra - impostosValor) / precoVendaManual) * 100 : 0;
    const margemUnitaria = precoVendaManual - precoCompra - impostosValor;

    const pontoEquilibrioUnidades = margemUnitaria > 0 ? totalFixos / margemUnitaria : 0;
    const pontoEquilibrioReais = pontoEquilibrioUnidades * precoVendaManual;
    const pontoEquilibrioDia = pontoEquilibrioUnidades / diasMes;
    const faturamentoDia = precoVendaManual * (estimativaVendas / diasMes);

    // Atualiza campos
    document.getElementById("lucro-bruto").textContent = `R$ ${lucroBruto.toFixed(2)}`;
    document.getElementById("margem-bruta").textContent = `${margemBruta.toFixed(2)}%`;
    document.getElementById("impostos-venda").textContent = `R$ ${impostosValor.toFixed(2)}`;
    document.getElementById("lucro-liquido").textContent = `R$ ${lucroLiquido.toFixed(2)}`;
    document.getElementById("margem-liquida").textContent = `${margemLiquida.toFixed(2)}%`;
    document.getElementById("margem-contribuicao").textContent = `${margemContribuicao.toFixed(2)}%`;

    document.getElementById("pe-unidades").textContent = Math.ceil(pontoEquilibrioUnidades);
    document.getElementById("pe-reais").textContent = `R$ ${pontoEquilibrioReais.toFixed(2)}`;
    document.getElementById("pe-dia").textContent = Math.ceil(pontoEquilibrioDia);
    document.getElementById("faturamento-dia").textContent = `R$ ${faturamentoDia.toFixed(2)}`;

    // Alerta se preço está abaixo do mínimo
    if (precoVendaManual < precoSugerido) {
      alert(`⚠️ O preço inserido (R$ ${precoVendaManual.toFixed(2)}) está abaixo do sugerido (R$ ${precoSugerido.toFixed(2)}). Isso pode comprometer a margem de lucro e aumentar o ponto de equilíbrio.`);
    }

    // Gráfico
    graficoSection.style.display = "block";
    const data = [
      { label: "Compra", valor: precoCompra, cor: "#3498db" },
      { label: "Fixos/unidade", valor: custoFixoUnit, cor: "#9b59b6" },
      { label: "Impostos", valor: impostosValor, cor: "#f39c12" },
      { label: "Lucro líquido", valor: lucroLiquido, cor: "#2ecc71" }
    ];
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.valor),
          backgroundColor: data.map(d => d.cor)
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
      graficoSection.style.display = "none";
      if (chart) chart.destroy();
    }, 100);
  });
});
