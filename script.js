window.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('input');

  inputs.forEach(input => {
    const saved = localStorage.getItem(input.id);
    if (saved !== null) input.value = saved;
  });

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(',', '.');
      localStorage.setItem(input.id, input.value);
      input.classList.remove('erro');
    });
  });

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }

  document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  function formatCurrencyBR(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calcularParticipacaoFixos(custosFixos) {
    const total = custosFixos.reduce((acc, item) => acc + item.valor, 0);
    return custosFixos.map(item => ({
      ...item,
      participacao: total ? (item.valor / total * 100) : 0
    }));
  }

  function gerarTabelaCustosFixos(fixosCalculados) {
    let total = fixosCalculados.reduce((acc, item) => acc + item.valor, 0);
    let html = `<h3>📘 Custos Fixos</h3><table><thead><tr><th>Item</th><th>Valor</th><th>%</th></tr></thead><tbody>`;
    fixosCalculados.forEach(item => {
      html += `<tr><td>${item.nome}</td><td>${formatCurrencyBR(item.valor)}</td><td>${item.participacao.toFixed(1)}%</td></tr>`;
    });
    html += `<tr class="total"><td>Total</td><td>${formatCurrencyBR(total)}</td><td>100%</td></tr></tbody></table>`;
    return html;
  }

  function calcularVariaveisEstimado(custosVariaveis, precoVenda) {
    return custosVariaveis.map(item => ({
      ...item,
      valorEstimado: precoVenda * item.percentual
    }));
  }

  function gerarTabelaCustosVariaveis(variaveisCalculadas) {
    const totalPercentual = variaveisCalculadas.reduce((acc, item) => acc + item.percentual, 0);
    const totalEstimado = variaveisCalculadas.reduce((acc, item) => acc + item.valorEstimado, 0);
    let html = `<h3>📙 Custos Variáveis</h3><table><thead><tr><th>Item</th><th>%</th><th>Estimado</th></tr></thead><tbody>`;
    variaveisCalculadas.forEach(item => {
      html += `<tr><td>${item.nome}</td><td>${(item.percentual * 100).toFixed(2)}%</td><td>${formatCurrencyBR(item.valorEstimado)}</td></tr>`;
    });
    html += `<tr class="total"><td>Total</td><td>${(totalPercentual * 100).toFixed(2)}%</td><td>${formatCurrencyBR(totalEstimado)}</td></tr></tbody></table>`;
    return html;
  }

  function exibirResumoAnalitico(fixosCalculados, variaveisCalculadas) {
    const divResultado = document.getElementById('resultadoDetalhado');
    divResultado.innerHTML = '';
    const htmlFixos = gerarTabelaCustosFixos(fixosCalculados);
    const htmlVariaveis = gerarTabelaCustosVariaveis(variaveisCalculadas);
    const container = document.createElement('div');
    container.classList.add('resumo-container');
    container.innerHTML = `${htmlFixos}<hr/>${htmlVariaveis}`;
    divResultado.appendChild(container);
  }

  function coletarDadosFixos() {
    const fixos = [];
    document.querySelectorAll('.fixo').forEach(input => {
      const nome = input.dataset.nome;
      const valor = parseFloat(input.value) || 0;
      fixos.push({ nome, valor });
    });
    return fixos;
  }

  function coletarDadosVariaveis() {
    const variaveis = [];
    document.querySelectorAll('.variavel').forEach(input => {
      const nome = input.dataset.nome;
      const percentual = parseFloat(input.value.replace('%', '').replace(',', '.')) / 100 || 0;
      variaveis.push({ nome, percentual });
    });
    return variaveis;
  }

  function calcularPontoEquilibrio(custoFixo, percentualVar, preco) {
    const peFaturamento = custoFixo / (1 - percentualVar);
    const qtdVender = Math.ceil(peFaturamento / preco);
    const diasUteis = 26;
    const porDia = Math.ceil(qtdVender / diasUteis);
    const fatDia = peFaturamento / diasUteis;
    return { peFaturamento, qtdVender, porDia, fatDia };
  }

  function exibirPontoEquilibrio(resultado) {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>📈 Ponto de Equilíbrio</h3>
      <table>
        <tr><td>Ponto de Equilíbrio (R$):</td><td>${formatCurrencyBR(resultado.peFaturamento)}</td></tr>
        <tr><td>Unidades a vender:</td><td>${resultado.qtdVender}</td></tr>
        <tr><td>Vendas/dia (26 dias):</td><td>${resultado.porDia}</td></tr>
        <tr><td>Faturamento por dia:</td><td>${formatCurrencyBR(resultado.fatDia)}</td></tr>
      </table><br/>
    `;
    document.getElementById('resultadoDetalhado').appendChild(div);
  }

  document.getElementById('calcular').addEventListener('click', () => {
    const precoVenda = parseFloat(document.getElementById('precoVenda').value) || 0;
    const custosFixos = coletarDadosFixos();
    const custosVariaveis = coletarDadosVariaveis();

    const fixosCalculados = calcularParticipacaoFixos(custosFixos);
    const variaveisCalculadas = calcularVariaveisEstimado(custosVariaveis, precoVenda);
    exibirResumoAnalitico(fixosCalculados, variaveisCalculadas);

    const percentualTotalVariavel = custosVariaveis.reduce((acc, item) => acc + item.percentual, 0);
    const resultadoPE = calcularPontoEquilibrio(
      fixosCalculados.reduce((acc, item) => acc + item.valor, 0),
      percentualTotalVariavel,
      precoVenda
    );
    exibirPontoEquilibrio(resultadoPE);
  });

  // Simulador de Preço
  window.simularPreco = function () {
    const precoCompra = parseFloat(document.getElementById('precoCompra').value) || 0;
    const margem = parseFloat(document.getElementById('margemDesejada').value) / 100 || 0;
    const impostos = parseFloat(document.getElementById('impostos').value) / 100 || 0;

    const precoVenda = precoCompra / (1 - margem);
    const lucroBruto = precoVenda - precoCompra;
    const imp = precoVenda * impostos;
    const lucroLiq = lucroBruto - imp;
    const margLiq = lucroLiq / precoVenda;

    document.getElementById('resultadoSimulacao').innerHTML = `
      <table>
        <tr><td>Preço Venda:</td><td>${formatCurrencyBR(precoVenda)}</td></tr>
        <tr><td>Lucro Bruto:</td><td>${formatCurrencyBR(lucroBruto)}</td></tr>
        <tr><td>Impostos:</td><td>${formatCurrencyBR(imp)}</td></tr>
        <tr><td>Lucro Líquido:</td><td>${formatCurrencyBR(lucroLiq)}</td></tr>
        <tr><td>Margem Líquida:</td><td>${(margLiq * 100).toFixed(2)}%</td></tr>
      </table>`;
  };

  // Simulador de Ponto de Equilíbrio
  window.calcularSimulacaoPE = function () {
    const fixos = parseFloat(document.getElementById('peFixos').value) || 0;
    const percVar = parseFloat(document.getElementById('peVariavel').value) / 100 || 0;
    const preco = parseFloat(document.getElementById('pePrecoVenda').value) || 1;
    const dias = parseInt(document.getElementById('peDiasMes').value) || 26;

    const peFaturamento = fixos / (1 - percVar);
    const qtdVender = Math.ceil(peFaturamento / preco);
    const porDia
