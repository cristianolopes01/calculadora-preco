window.addEventListener('DOMContentLoaded', () => {
  const fixosLabels = [
    'Aluguel', 'Energia Elétrica', 'Água', 'Internet', 'Telefonia',
    'Pessoal', 'Remuneração Sócios', 'Assinaturas', 'Contabilidade',
    'Manutenções', 'Refeições', 'Depreciações', 'Outras Despesas'
  ];

  const variaveisLabels = [
    'Custo de Aquisição/Produção', 'Impostos sobre faturamento', 'Comissões de Vendas',
    'Taxa de Cartão – Débito', 'Fretes', 'Taxa de Antecipação',
    'Desconto de Vendas', 'Outros Custos Variáveis', 'Taxa de Cartão – Crédito'
  ];

  // Geração dinâmica dos campos
  const gerarCampos = () => {
    const fixosDiv = document.getElementById('custos-fixos');
    const variaveisDiv = document.getElementById('custos-variaveis');

    fixosLabels.forEach((label, i) => {
      fixosDiv.innerHTML += `
        <div class="fixo-item">
          <label for="fixo${i + 1}">${label}:</label>
          <input class="fixo" data-nome="${label}" id="fixo${i + 1}" type="number" />
          <span class="porcentagem" id="p-fixo${i + 1}">0%</span>
        </div>`;
    });

    variaveisLabels.forEach((label, i) => {
      variaveisDiv.innerHTML += `
        <div class="variavel-item">
          <label for="var${i + 1}">${label}:</label>
          <input class="variavel" data-nome="${label}" id="var${i + 1}" type="text" />
          <span class="porcentagem" id="p-var${i + 1}">0%</span>
        </div>`;
    });
  };

  gerarCampos();

  const formatCurrencyBR = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const coletarDados = (classe) =>
    [...document.querySelectorAll(`.${classe}`)].map((el) => {
      const nome = el.dataset.nome;
      const valor =
        classe === 'variavel'
          ? parseFloat(el.value.replace('%', '').replace(',', '.')) / 100 || 0
          : parseFloat(el.value) || 0;
      return { nome, valor };
    });

  const calcularParticipacao = (lista) => {
    const total = lista.reduce((acc, i) => acc + i.valor, 0);
    return lista.map((i) => ({
      ...i,
      participacao: total > 0 ? (i.valor / total) * 100 : 0
    }));
  };

  const atualizarParticipacoes = (fixos, variaveis) => {
    fixos.forEach((item, i) => {
      const span = document.getElementById(`p-fixo${i + 1}`);
      if (span) span.textContent = `${item.participacao.toFixed(1)}%`;
    });

    const totalVar = variaveis.reduce((acc, i) => acc + i.valor, 0);
    variaveis.forEach((item, i) => {
      const span = document.getElementById(`p-var${i + 1}`);
      const p = totalVar > 0 ? (item.valor / totalVar) * 100 : 0;
      if (span) span.textContent = `${p.toFixed(1)}%`;
    });
  };

  const gerarTabela = (titulo, dados, tipo) => {
    const total = dados.reduce((acc, i) => acc + i.valor, 0);
    const estimado = tipo === 'variavel' ? dados.map(i => ({
      ...i,
      estimado: i.valor * (parseFloat(document.getElementById('precoVenda').value) || 0)
    })) : [];

    let html = `<h3>${titulo}</h3><table><thead><tr><th>Item</th><th>${tipo === 'variavel' ? '%' : 'Valor'}</th>${tipo === 'variavel' ? '<th>Estimado</th>' : '<th>%</th>'}</tr></thead><tbody>`;
    dados.forEach((i) => {
      html += `<tr><td>${i.nome}</td><td>${tipo === 'variavel' ? (i.valor * 100).toFixed(2) + '%' : formatCurrencyBR(i.valor)}</td>${
        tipo === 'variavel' ? `<td>${formatCurrencyBR(i.estimado)}</td>` : `<td>${i.participacao.toFixed(1)}%</td>`
      }</tr>`;
    });
    html += `<tr class="total"><td>Total</td><td>${tipo === 'variavel' ? (total * 100).toFixed(2) + '%' : formatCurrencyBR(total)}</td>${tipo === 'variavel' ? `<td>${formatCurrencyBR(estimado.reduce((a, i) => a + i.estimado, 0))}</td>` : '<td>100%</td>'}</tr></tbody></table>`;
    return html;
  };

  const calcularPontoEquilibrio = (fixos, varPerc, preco) => {
    const peR$ = fixos / (1 - varPerc);
    const qtd = preco > 0 ? Math.ceil(peR$ / preco) : 0;
    const porDia = Math.ceil(qtd / 26);
    const fatDia = peR$ / 26;
    return { peR$, qtd, porDia, fatDia };
  };

  const exibirPontoEquilibrio = (res) => {
    return `
      <h3>📈 Ponto de Equilíbrio</h3>
      <table>
        <tr><td>Ponto de Equilíbrio (R$)</td><td>${formatCurrencyBR(res.peR$)}</td></tr>
        <tr><td>Peças a Vender</td><td>${res.qtd}</td></tr>
        <tr><td>Peças por Dia</td><td>${res.porDia}</td></tr>
        <tr><td>Faturamento por Dia</td><td>${formatCurrencyBR(res.fatDia)}</td></tr>
      </table><br/>`;
  };

  document.getElementById('calcular').addEventListener('click', () => {
    const preco = parseFloat(document.getElementById('precoVenda').value) || 0;
    const fixos = coletarDados('fixo');
    const variaveis = coletarDados('variavel');

    const fixosCalc = calcularParticipacao(fixos);
    atualizarParticipacoes(fixosCalc, variaveis);

    const tabelaFixos = gerarTabela('📘 Custos Fixos', fixosCalc, 'fixo');
    const tabelaVariaveis = gerarTabela('📙 Custos Variáveis', variaveis, 'variavel');

    const percVar = variaveis.reduce((acc, i) => acc + i.valor, 0);
    const resPE = calcularPontoEquilibrio(fixos.reduce((a, i) => a + i.valor, 0), percVar, preco);
    const blocoPE = exibirPontoEquilibrio(resPE);

    document.getElementById('resultadoDetalhado').innerHTML = tabelaFixos + tabelaVariaveis + blocoPE;
  });

  // Simulador de Preço
  window.simularPreco = () => {
    const compra = parseFloat(document.getElementById('precoCompra').value) || 0;
    const margem = parseFloat(document.getElementById('margemDesejada').value) / 100 || 0;
    const impostos = parseFloat(document.getElementById('impostos').value) / 100 || 0;

    const venda = compra / (1 - margem);
    const lucro = venda - compra;
    const impRS = venda * impostos;
    const lucroLiq = lucro - impRS;
    const margLiq = lucroLiq / venda;

    document.getElementById('resultadoSimulacao').innerHTML = `
      <table>
        <tr><td>Preço Venda:</td><td>${formatCurrencyBR(venda)}</td></tr>
        <tr><td>Lucro Bruto:</td><td>${formatCurrencyBR(lucro)}</td></tr>
        <tr><td>Impostos:</td><td>${formatCurrencyBR(impRS)}</td></tr>
        <tr><td>Lucro Líquido:</td><td>${formatCurrencyBR(lucroLiq)}</td></tr>
        <tr><td>Margem Líquida:</td><td>${(margLiq * 100).toFixed(2)}%</td></
