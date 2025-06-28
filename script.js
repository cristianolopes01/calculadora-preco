document.addEventListener("DOMContentLoaded", () => {
  const calcular = document.getElementById("calcular");
  const limpar = document.getElementById("limpar");
  const gerarPdf = document.getElementById("gerar-pdf");
  const salvarBtn = document.getElementById("salvar-simulacao");
  const carregarBtn = document.getElementById("carregar-simulacao");
  const listaSelect = document.getElementById("lista-simulacoes");
  const exportarJson = document.getElementById("exportar-json");
  const importarJson = document.getElementById("importar-json");

  let graficoPizza;
  let graficoBarra;

  const executarCalculo = () => {
    const precoCompra = parseFloat(document.getElementById("preco-compra").value) || 0;
    const precoVenda = parseFloat(document.getElementById("preco-venda").value) || 0;
    const diasUteis = parseFloat(document.getElementById("dias-uteis").value) || 22;
    const impostoAliquota = parseFloat(document.getElementById("imposto-vendas").value) || 0;

    const custoVar = precoVenda * 0.25; // exemplo fixo
    const valorImposto = precoVenda * (impostoAliquota / 100);
    const receitaBruta = precoVenda - precoCompra;
    const margemBruta = (receitaBruta / precoVenda) * 100;
    const receitaLiquida = receitaBruta - custoVar - valorImposto;
    const margemLiquida = (receitaLiquida / precoVenda) * 100;
    const pontoEquilibrio = receitaLiquida > 0 ? (5000 / receitaLiquida) : 0; // fixo mensal fictício
    const peDiario = diasUteis > 0 ? pontoEquilibrio / diasUteis : 0;

    document.getElementById("relatorio-preco").innerHTML = `
      <h3>📋 Preço</h3>
      <table>
        <tr><td>Preço Compra</td><td>R$ ${precoCompra.toFixed(2)}</td></tr>
        <tr><td>Preço Venda</td><td>R$ ${precoVenda.toFixed(2)}</td></tr>
        <tr><td>Receita Bruta</td><td>R$ ${receitaBruta.toFixed(2)}</td></tr>
        <tr><td>Imposto (${impostoAliquota}%)</td><td>R$ ${valorImposto.toFixed(2)}</td></tr>
        <tr><td>Custo Variável (25%)</td><td>R$ ${custoVar.toFixed(2)}</td></tr>
        <tr><td>Receita Líquida</td><td>R$ ${receitaLiquida.toFixed(2)}</td></tr>
        <tr><td>Margem Líquida</td><td>${margemLiquida.toFixed(2)}%</td></tr>
      </table>
    `;

    document.getElementById("relatorio-equilibrio").innerHTML = `
      <h3>🎯 Ponto de Equilíbrio</h3>
      <table>
        <tr><td>Unidades no mês</td><td>${pontoEquilibrio.toFixed(0)}</td></tr>
        <tr><td>Unidades por dia</td><td>${peDiario.toFixed(1)}</td></tr>
      </table>
    `;

    document.getElementById("resultados").style.display = "block";

    // Pizza
    if (graficoPizza) graficoPizza.destroy();
    const pizzaCtx = document.getElementById("grafico-variaveis").getContext("2d");
    graficoPizza = new Chart(pizzaCtx, {
      type: "pie",
      data: {
        labels: ["Custo Variável", "Impostos", "Lucro Líquido"],
        datasets: [{
          data: [custoVar, valorImposto, receitaLiquida],
          backgroundColor: ["#f39c12", "#c0392b", "#2ecc71"]
        }]
      }
    });

    // Barras
    if (graficoBarra) graficoBarra.destroy();
    const barraCtx = document.getElementById("grafico-comparativo").getContext("2d");
    graficoBarra = new Chart(barraCtx, {
      type: "bar",
      data: {
        labels: ["Bruta", "Líquida", "Ponto Equilíbrio Dia"],
        datasets: [{
          label: "R$",
          data: [receitaBruta, receitaLiquida, peDiario],
          backgroundColor: ["#3498db", "#2ecc71", "#9b59b6"]
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  };

  calcular.addEventListener("click", executarCalculo);

  document.querySelectorAll("input[type='number']").forEach(input => {
    input.addEventListener("input", executarCalculo);
  });

  limpar?.addEventListener("click", () => {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("resultados").style.display = "none";
  });

  gerarPdf?.addEventListener("click", () => {
    const alvo = document.getElementById("resultados");
    if (alvo.style.display === "none") return alert("Calcule primeiro.");
    html2pdf().from(alvo).set({
      margin: 10,
      filename: `relatorio-${new Date().toLocaleDateString("pt-BR")}.pdf`,
      jsPDF: { format: "a4", orientation: "portrait" }
    }).save();
  });

  // Simulação JSON
  const atualizarLista = () => {
    listaSelect.innerHTML = `<option value="">-- selecione --</option>`;
    Object.keys(localStorage).filter(k => k.startsWith("simulacao_")).forEach(chave => {
      const opt = document.createElement("option");
      opt.value = chave;
      opt.textContent = chave.replace("simulacao_", "");
      listaSelect.appendChild(opt);
    });

    ["comparar-a", "comparar-b"].forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = listaSelect.innerHTML;
      }
    });
  };

  salvarBtn?.addEventListener("click", () => {
    const nome = document.getElementById("nome-simulacao").value.trim();
    if (!nome) return alert("Dê um nome à simulação.");
    const dados = {};
    document.querySelectorAll("input[type='number']").forEach(input => {
      dados[input.id] = input.value;
    });
    localStorage.setItem("simulacao_" + nome, JSON.stringify(dados));
    alert("Simulação salva!");
    atualizarLista();
  });

  carregarBtn?.addEventListener("click", () => {
    const sel = listaSelect.value;
    if (!sel) return alert("Selecione uma simulação.");
    const dados = JSON.parse(localStorage.getItem(sel));
    for (const [k, v] of Object.entries(dados)) {
      const el = document.getElementById(k);
      if (el) el.value = v;
    }
    executarCalculo();
  });

  document.getElementById("comparar-simulacoes")?.addEventListener("click", () => {
    const a = document.getElementById("comparar-a").value;
    const b = document.getElementById("comparar-b").value;
    if (!a || !b || a === b) return alert("Selecione duas simulações diferentes.");

    const simA = JSON.parse(localStorage.getItem(a));
    const simB = JSON.parse(localStorage.getItem(b));

    const get = (sim, id) => parseFloat(sim[id]) || 0;

    const calc = (sim) => {
      const venda = get(sim, "preco-venda");
      const compra = get(sim, "preco-compra");
      const imposto = get(sim, "imposto-vendas") / 100;
      const varCusto = venda * 0.25;
      const imp = venda * imposto;
      const bruta = venda - compra;
      const liquida = bruta - varCusto - imp;
      const margem = venda ? (liquida / venda) * 100 : 0;
      const peUnid = liquida > 0 ? 5000 / liquida : 0;
      return { venda, liquida, margem, peUnid };
    };

    const rA = calc(simA);
    const rB = calc(simB);

    const linha = (label, va, vb, sufixo = "") =>
      `<tr><td>${label}</
