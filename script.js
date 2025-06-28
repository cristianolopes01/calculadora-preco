document.addEventListener("DOMContentLoaded", () => {
  const calcular = document.getElementById("calcular");
  const limpar = document.getElementById("limpar");

  let graficoPizza;
  let graficoBarra;

  function executarCalculo() {
    const precoCompra = parseFloat(document.getElementById("preco-compra").value) || 0;
    const precoVenda = parseFloat(document.getElementById("preco-venda").value) || 0;
    const diasUteis = parseInt(document.getElementById("dias-uteis").value) || 22;
    const impostoAliquota = parseFloat(document.getElementById("imposto-vendas").value) || 0;

    const fixosIds = [
      { id: "fixo-aluguel", nome: "Aluguel" },
      { id: "fixo-energia", nome: "Energia" },
      { id: "fixo-agua", nome: "Água" },
      { id: "fixo-internet", nome: "Internet" },
      { id: "fixo-telefonia", nome: "Telefonia" },
      { id: "fixo-pessoal", nome: "Pessoal" },
      { id: "fixo-socios", nome: "Sócios" },
      { id: "fixo-assinaturas", nome: "Assinaturas" },
      { id: "fixo-contabilidade", nome: "Contabilidade" },
      { id: "fixo-manutencoes", nome: "Manutenções" },
      { id: "fixo-refeicoes", nome: "Refeições" },
      { id: "fixo-depreciacoes", nome: "Depreciações" },
      { id: "fixo-outras", nome: "Outras" }
    ];

    let totalFixos = 0;
    const fixos = fixosIds.map(item => {
      const valor = parseFloat(document.getElementById(item.id)?.value) || 0;
      totalFixos += valor;
      return { ...item, valor };
    });

    const variaveisIds = [
      { id: "variavel-producao", nome: "Produção/Aquisição" },
      { id: "variavel-impostos", nome: "Impostos" },
      { id: "variavel-comissoes", nome: "Comissões" },
      { id: "variavel-debito", nome: "Débito" },
      { id: "variavel-fretes", nome: "Fretes" },
      { id: "variavel-antecipacao", nome: "Antecipação" },
      { id: "variavel-descontos", nome: "Descontos" },
      { id: "variavel-outros", nome: "Outros" },
      { id: "variavel-credito", nome: "Crédito" }
    ];

    let totalVariaveis = 0;
    const variaveis = variaveisIds.map(item => {
      const percent = parseFloat(document.getElementById(item.id)?.value) || 0;
      const valor = precoVenda * (percent / 100);
      totalVariaveis += valor;
      return { ...item, percent, valor };
    });

    const valorImposto = precoVenda * (impostoAliquota / 100);
    const receitaBruta = precoVenda - precoCompra;
    const receitaLiquida = receitaBruta - totalVariaveis - valorImposto;
    const margemLiquida = precoVenda ? receitaLiquida / precoVenda * 100 : 0;
    const mcu = receitaLiquida;
    const pontoEquilibrio = mcu > 0 ? totalFixos / mcu : 0;
    const peDiario = diasUteis > 0 ? pontoEquilibrio / diasUteis : 0;
        document.getElementById("relatorio-preco").innerHTML = `
      <h3>📋 Preços e Margens</h3>
      <table>
        <tr><td>Preço de Compra</td><td>R$ ${precoCompra.toFixed(2)}</td></tr>
        <tr><td>Preço de Venda</td><td>R$ ${precoVenda.toFixed(2)}</td></tr>
        <tr><td>Receita Bruta</td><td>R$ ${receitaBruta.toFixed(2)}</td></tr>
        <tr><td>Impostos (${impostoAliquota.toFixed(2)}%)</td><td>R$ ${valorImposto.toFixed(2)}</td></tr>
        <tr><td>Custos Variáveis</td><td>R$ ${totalVariaveis.toFixed(2)}</td></tr>
        <tr><td>Receita Líquida</td><td>R$ ${receitaLiquida.toFixed(2)}</td></tr>
        <tr><td>Margem de Contribuição</td><td>${margemLiquida.toFixed(2)}%</td></tr>
      </table>
    `;

    document.getElementById("relatorio-fixos").innerHTML = `
      <h3>📘 Custos Fixos</h3>
      <table>
        <tr><th>Item</th><th>R$</th></tr>
        ${fixos.map(f => `<tr><td>${f.nome}</td><td>R$ ${f.valor.toFixed(2)}</td></tr>`).join("")}
        <tr><td><strong>Total</strong></td><td><strong>R$ ${totalFixos.toFixed(2)}</strong></td></tr>
      </table>
    `;

    document.getElementById("relatorio-variaveis").innerHTML = `
      <h3>📙 Custos Variáveis</h3>
      <table>
        <tr><th>Item</th><th>%</th><th>R$</th></tr>
        ${variaveis.map(v => `<tr><td>${v.nome}</td><td>${v.percent.toFixed(2)}%</td><td>R$ ${v.valor.toFixed(2)}</td></tr>`).join("")}
        <tr><td><strong>Total</strong></td><td>–</td><td><strong>R$ ${totalVariaveis.toFixed(2)}</strong></td></tr>
      </table>
    `;

    document.getElementById("relatorio-equilibrio").innerHTML = `
      <h3>🎯 Ponto de Equilíbrio</h3>
      <table>
        <tr><td>Mensal (Unidades)</td><td>${Math.ceil(pontoEquilibrio)}</td></tr>
        <tr><td>Diário (Unidades)</td><td>${Math.ceil(peDiario)}</td></tr>
      </table>
    `;

    document.getElementById("resultados").style.display = "block";

    // Atualiza gráfico de pizza
    if (graficoPizza) graficoPizza.destroy();
    const ctxPizza = document.getElementById("grafico-variaveis").getContext("2d");
    graficoPizza = new Chart(ctxPizza, {
      type: "pie",
      data: {
        labels: variaveis.map(v => v.nome),
        datasets: [{
          data: variaveis.map(v => v.valor),
          backgroundColor: variaveis.map((_, i) => `hsl(${i * 35}, 70%, 60%)`)
        }]
      }
    });

    // Atualiza gráfico de barras
    if (graficoBarra) graficoBarra.destroy();
    const ctxBarra = document.getElementById("grafico-comparativo").getContext("2d");
    graficoBarra = new Chart(ctxBarra, {
      type: "bar",
      data: {
        labels: ["Receita Bruta", "Receita Líquida", "PE Diário (R$)"],
        datasets: [{
          label: "Valor",
          data: [receitaBruta, receitaLiquida, peDiario],
          backgroundColor: ["#2980b9", "#27ae60", "#8e44ad"]
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
    // Aciona cálculo ao clicar no botão
  calcular.addEventListener("click", executarCalculo);

  // Cálculo automático em tempo real
  document.querySelectorAll("input[type='number']").forEach(input => {
    input.addEventListener("input", executarCalculo);
  });

  // Limpar todos os campos
  limpar.addEventListener("click", () => {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("resultados").style.display = "none";
    document.getElementById("relatorio-comparacao").style.display = "none";
  });
    // Exportar PDF
  document.getElementById("gerar-pdf").addEventListener("click", () => {
    const resultado = document.getElementById("resultados");
    if (!resultado || resultado.style.display === "none") {
      alert("Calcule primeiro antes de gerar o PDF.");
      return;
    }

    const opt = {
      margin: 10,
      filename: `relatorio-${new Date().toLocaleDateString('pt-BR')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(resultado).save();
  });
    function capturarInputs() {
    const data = {};
    document.querySelectorAll("input[type='number']").forEach(input => {
      data[input.id] = input.value;
    });
    return data;
  }

  function aplicarDadosSimulacao(data) {
    Object.entries(data).forEach(([id, valor]) => {
      const campo = document.getElementById(id);
      if (campo) campo.value = valor;
    });
    executarCalculo();
  }

  function atualizarListaSimulacoes() {
    const select = document.getElementById("lista-simulacoes");
    select.innerHTML = `<option value="">-- selecione --</option>`;
    Object.keys(localStorage)
      .filter(k => k.startsWith("simulacao_"))
      .forEach(k => {
        const opt = document.createElement("option");
        opt.value = k;
        opt.textContent = k.replace("simulacao_", "");
        select.appendChild(opt);
      });

    ["comparar-a", "comparar-b"].forEach(id => {
      const sel = document.getElementById(id);
      if (sel) sel.innerHTML = select.innerHTML;
    });
  }

  document.getElementById("salvar-simulacao").addEventListener("click", () => {
    const nome = document.getElementById("nome-simulacao").value.trim();
    if (!nome) return alert("Dê um nome à simulação.");
    const chave = "simulacao_" + nome;
    localStorage.setItem(chave, JSON.stringify(capturarInputs()));
    alert("Simulação salva com sucesso!");
    atualizarListaSimulacoes();
  });

  document.getElementById("carregar-simulacao").addEventListener("click", () => {
    const chave = document.getElementById("lista-simulacoes").value;
    if (!chave) return alert("Selecione uma simulação.");
    const dados = JSON.parse(localStorage.getItem(chave));
    aplicarDadosSimulacao(dados);
  });

  document.getElementById("exportar-json").addEventListener("click", () => {
    const nome = document.getElementById("nome-simulacao").value.trim() || "simulacao";
    const dados = capturarInputs();
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nome}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importar-json").addEventListener("change", e => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dados = JSON.parse(event.target.result);
      aplicarDadosSimulacao(dados);
    };
    reader.readAsText(arquivo);
  });

  atualizarListaSimulacoes();
    document.getElementById("comparar-simulacoes").addEventListener("click", () => {
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
      const totalVarPercent = [
        "variavel-producao", "variavel-impostos", "variavel-comissoes", "variavel-debito",
        "variavel-fretes", "variavel-antecipacao", "variavel-descontos", "variavel-outros", "variavel-credito"
      ].reduce((soma, id) => soma + get(sim, id), 0);
      const custoVar = venda * (totalVarPercent / 100);
      const valImposto = venda * imposto;
      const bruta = venda - compra;
      const liquida = bruta - custoVar - valImposto;
      const margem = venda ? liquida / venda * 100 : 0;
      const fixos = Object.keys(sim).filter(k => k.startsWith("fixo-")).reduce((s, k) => s + get(sim, k), 0);
      const pe = liquida > 0 ? fixos / liquida : 0;
      return { venda, liquida, margem, pe };
    };

    const rA = calc(simA);
    const rB = calc(simB);

    const linha = (label, a, b, sufixo = "") =>
      `<tr><td>${label}</td><td>${a.toFixed(2)}${sufixo}</td><td>${b.toFixed(2)}${sufixo}</td></tr>`;

    document.getElementById("tabela-comparacao").innerHTML = `
      <table>
        <thead>
          <tr><th>Indicador</th><th>${a.replace("simulacao_", "")}</th><th>${b.replace("simulacao_", "")}</th></tr>
        </thead>
        <tbody>
          ${linha("Preço de Venda", rA.venda, rB.venda, " R$")}
          ${linha("Receita Líquida", rA.liquida, rB.liquida, " R$")}
          ${linha("Margem Líquida", rA.margem, rB.margem, " %")}
          ${linha("Ponto de Equilíbrio", rA.pe, rB.pe, " unid")}
        </tbody>
      </table>
    `;
    document.getElementById("relatorio-comparacao").style.display = "block";
  });
});
