document.addEventListener("DOMContentLoaded", () => {
  const calcular = document.getElementById("calcular");
  const limpar = document.getElementById("limpar");
  const gerarPdf = document.getElementById("gerar-pdf");
  let grafico;

  function executarCalculo() {
    const precoVenda = parseFloat(document.getElementById("preco-venda")?.value) || 0;
    const precoCompra = parseFloat(document.getElementById("preco-compra")?.value) || 0;
    const imposto = parseFloat(document.getElementById("imposto-vendas")?.value) || 0;
    const adicional = parseFloat(document.getElementById("margem-adicional")?.value) || 0;
    const diasUteis = parseInt(document.getElementById("dias-uteis")?.value) || 22;

    // Custos fixos
    const fixos = ["fixo-aluguel", "fixo-salarios", "fixo-energia", "fixo-internet", "fixo-outros"];
    const totalFixos = fixos.reduce((acc, id) => {
      return acc + (parseFloat(document.getElementById(id)?.value) || 0);
    }, 0);

    const valorImposto = precoVenda * (imposto / 100);
    const margemContribuicao = precoVenda - precoCompra - valorImposto + adicional;

    const peUnidades = margemContribuicao > 0 ? totalFixos / margemContribuicao : 0;
    const peDiario = diasUteis > 0 ? peUnidades / diasUteis : 0;

    // Relatório Preço
    document.getElementById("relatorio-preco").innerHTML = `
      <h3>🧾 Margem de Contribuição</h3>
      <table>
        <tr><td>Preço de Venda</td><td>R$ ${precoVenda.toFixed(2)}</td></tr>
        <tr><td>Preço de Compra</td><td>R$ ${precoCompra.toFixed(2)}</td></tr>
        <tr><td>Imposto sobre Venda (${imposto}%)</td><td>R$ ${valorImposto.toFixed(2)}</td></tr>
        <tr><td>Margem Adicional</td><td>R$ ${adicional.toFixed(2)}</td></tr>
        <tr><td><strong>Margem de Contribuição Unitária</strong></td><td><strong>R$ ${margemContribuicao.toFixed(2)}</strong></td></tr>
      </table>
    `;

    // Relatório Fixos
    document.getElementById("relatorio-fixos").innerHTML = `
      <h3>📘 Custos Fixos</h3>
      <table>
        ${fixos.map(id => {
          const nome = id.replace("fixo-", "").replace("-", " ").toUpperCase();
          const val = parseFloat(document.getElementById(id)?.value) || 0;
          return `<tr><td>${nome}</td><td>R$ ${val.toFixed(2)}</td></tr>`;
        }).join("")}
        <tr><td><strong>Total</strong></td><td><strong>R$ ${totalFixos.toFixed(2)}</strong></td></tr>
      </table>
    `;

    // Relatório Equilíbrio
    document.getElementById("relatorio-equilibrio").innerHTML = `
      <h3>🎯 Ponto de Equilíbrio</h3>
      <table>
        <tr><td>PE Mensal (Unidades)</td><td>${margemContribuicao > 0 ? Math.ceil(peUnidades) : '–'}</td></tr>
        <tr><td>PE Diário (Unidades)</td><td>${margemContribuicao > 0 ? Math.ceil(peDiario) : '–'}</td></tr>
      </table>
    `;

    document.getElementById("resultados").style.display = "block";

    if (grafico) grafico.destroy();
    const ctx = document.getElementById("grafico-margem").getContext("2d");

    grafico = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Venda", "Compra", "Imposto", "Margem Unitária"],
        datasets: [{
          label: "R$",
          data: [precoVenda, precoCompra, valorImposto, margemContribuicao],
          backgroundColor: ["#2980b9", "#c0392b", "#f39c12", "#27ae60"]
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  }

  calcular.addEventListener("click", executarCalculo);
  document.querySelectorAll("input").forEach(el =>
    el.addEventListener("input", executarCalculo)
  );

  limpar.addEventListener("click", () => {
    document.querySelectorAll("input").forEach(el => el.value = "");
    document.getElementById("resultados").style.display = "none";
    if (grafico) grafico.destroy();
  });

  gerarPdf.addEventListener("click", () => {
    const resultado = document.getElementById("resultados");
    if (!resultado || resultado.style.display === "none") {
      alert("Calcule antes de gerar o PDF.");
      return;
    }

    html2pdf().from(resultado).set({
      margin: 10,
      filename: `relatorio-pe-${new Date().toLocaleDateString("pt-BR")}.pdf`,
      jsPDF: { format: "a4", orientation: "portrait" }
    }).save();
  });
});
