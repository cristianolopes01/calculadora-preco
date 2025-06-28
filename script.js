document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("precificacao-form");
  const pizzaSection = document.getElementById("grafico-section");
  const ctx = document.getElementById("grafico-pizza").getContext("2d");
  let chart;

  function getNumber(id) {
    return parseFloat(document.getElementById(id)?.value) || 0;
  }

  function calcular() {
    // 1. Somar Custos Fixos
    const fixos = Array.from(document.querySelectorAll("#tabela-fixos tbody tr"));
    let totalFixos = 0;
    fixos.forEach(row => {
      const val = parseFloat(row.querySelector("input").value) || 0;
      totalFixos += val;
    });
    document.getElementById("total-fixos").textContent = `R$ ${totalFixos.toFixed(2)}`;
    fixos.forEach(row => {
      const val = parseFloat(row.querySelector("input").value) || 0;
      const perc = totalFixos > 0 ? (val / totalFixos) * 100 : 0;
      row.querySelector(".participacao").textContent = `${perc.toFixed(1)}%`;
    });

    // 2. Custos Variáveis
    const variaveis = Array.from(document.querySelectorAll("#tabela-variaveis tbody tr"));
    let totalPercentualVar = 0;
    let variaveisPerc = {};
    variaveis.forEach(row => {
      const id = row.querySelector("input").id;
      const valor = parseFloat(row.querySelector("input").value) || 0;
      variaveisPerc[id] = valor;
      totalPercentualVar += valor;
    });
    document.getElementById("total-variaveis").textContent = `${totalPercentualVar.toFixed(2)}%`;

    // 3. PARÂMETROS OPERACIONAIS
    const precoCompra = getNumber("preco-compra");
    const precoVendaManual = getNumber("preco-venda");
    const margemDesejada = getNumber("variavel-descontos"); // usaremos campo "descontos" como margem desejada
    const diasMes = getNumber("dias-mes") || 26;
    const vendasEstimadas = getNumber("vendas-estimadas") || 1;

    // 4. Custo fixo por unidade estimada
    const custoFixoUnit = vendasEstimadas > 0 ? totalFixos / vendasEstimadas : 0;

    // 5. Custo variável por unidade (% do preço)
    const somaPercentuais = totalPercentualVar + margemDesejada;
    if (somaPercentuais >= 100) {
      alert("❌ A soma dos custos variáveis + margem não pode ultrapassar 100%");
      return;
    }

    // 6. Preço ideal com markup reverso
    const precoIdeal = (precoCompra + custoFixoUnit) / (1 - (totalPercentualVar + margemDesejada) / 100);

    // 7. Composição real com preço inserido manualmente
    const valorImpostos = precoVendaManual * (variaveisPerc["variavel-impostos"] / 100);
    const lucroBruto = precoVendaManual - precoCompra;
    const lucroLiquido = lucroBruto - valorImpostos;
    const margemLiquidaReal = precoVendaManual > 0 ? (lucroLiquido / precoVendaManual) * 100 : 0;

    // 8. Margem de contribuição unitária
    const margemContribuicaoUnid = precoVendaManual - precoCompra - valorImpostos;

    // 9. Ponto de equilíbrio real
    const peUnidades = margemContribuicaoUnid > 0 ? totalFixos / margemContribuicaoUnid : 0;
    const peDia = peUnidades / diasMes;
    const faturamentoDia = precoVendaManual * (vendasEstimadas / diasMes);

    // 10. Preencher Campos
    document.getElementById("lucro-bruto").textContent = `R$ ${(precoVendaManual - precoCompra).toFixed(2)}`;
    document.getElementById("margem-bruta").textContent = `${((precoVendaManual - precoCompra) / precoVendaManual * 100 || 0).toFixed(2)}%`;
    document.getElementById("impostos-venda").textContent = `R$ ${valorImpostos.toFixed(2)}`;
    document.getElementById("lucro-liquido").textContent = `R$ ${lucroLiquido.toFixed(2)}`;
    document.getElementById("margem-liquida").textContent = `${margemLiquidaReal.toFixed(2)}%`;
    document.getElementById("margem-contribuicao").textContent = `${margemContribuicaoUnid > 0 ? (margemContribuicaoUnid / precoVendaManual * 100).toFixed(2) : 0}%`;

    document.getElementById("pe-unidades").textContent = Math.ceil(peUnidades);
    document.getElementById("pe-reais").textContent = `R$ ${(precoVendaManual * peUnidades).toFixed(2)}`;
    document.getElementById("pe-dia").textContent = Math.ceil(peDia);
    document.getElementById("faturamento-dia").textContent = `R$ ${faturamentoDia.toFixed(2)}`;

    // 11. Alerta se preço abaixo do ideal
    if (precoVendaManual < precoIdeal) {
      alert(`⚠️ O preço de venda inserido (R$ ${precoVendaManual.toFixed(2)}) está abaixo do ideal (R$ ${precoIdeal.toFixed(2)}). Isso reduz a margem e aumenta o ponto de equilíbrio.`);
    } else {
      console.log("✅ Preço está adequado à margem desejada.");
    }

    // 12. Mostrar Gráfico
    pizzaSection.style.display = "block";
    const custos = [
      { label: "Compra", valor: precoCompra, cor: "#3498db" },
      { label: "Fixos/unid", valor: custoFixoUnit, cor: "#9b59b6" },
      { label: "Impostos", valor: valorImpostos, cor: "#f39c12" },
      { label: "Lucro", valor: lucroLiquido, cor: "#2ecc71" }
    ];
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: custos.map(c => c.label),
        datasets: [{
          data: custos.map(c => c.valor),
          backgroundColor: custos.map(c => c.cor)
        }]
      },
      options: { plugins: { legend: { position: "bottom" } } }
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
