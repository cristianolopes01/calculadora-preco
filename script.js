window.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('input');

  // Preenche campos com dados salvos
  inputs.forEach(input => {
    const saved = localStorage.getItem(input.id);
    if (saved !== null) {
      input.value = saved;
    }
  });

  // Salva em tempo real e aceita vírgula
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(',', '.');
      localStorage.setItem(input.id, input.value);
      input.classList.remove('erro');
    });
  });

  // Tema escuro automático
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }

  // Alternar tema manual
  document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  function formatCurrencyBR(value) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
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
    let html = `<h3>📘 Composição de Custos Fixos</h3><table><thead><tr>
      <th>Item</th><th>Valor</th><th>% Participação</th></tr></thead><tbody>`;
    fixosCalculados.forEach(item => {
      html += `<tr><td>${item.nome}</td><td>${formatCurrencyBR(item.valor)}</td>
      <td>${item.participacao.toFixed(1)}%</td></tr>`;
    });
    html += `<tr class="total"><td><strong>Total</strong></td>
      <td><strong>${formatCurrencyBR(total)}</strong></td><td><strong>100%</strong></td></tr></tbody></table>`;
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
    let html = `<h3>📙 Composição de Custos Variáveis</h3><table><thead><tr>
      <th>Item</th><th>%</th><th>Valor Estimado (R$)</th></tr></thead><tbody>`;
    variaveisCalculadas.forEach(item => {
      html += `<tr><td>${item.nome}</td><td>${(item.percentual * 100).toFixed(2)}%</td>
        <td>${formatCurrencyBR(item.valorEstimado)}</td></tr>`;
    });
    html += `<tr class="total"><td><strong>Total</strong></td><td><strong>${(totalPercentual * 100).toFixed(2)}%</strong></td>
      <td><strong>${formatCurrencyBR(totalEstimado)}</strong></td></tr></tbody></table>`;
    return html;
  }

  function exibirResumoAnalitico(fixosCalculados, variaveisCalculadas) {
    const divResultado = document.getElementById('resultadoDetalhado');
    divResultado.innerHTML = '';
    const htmlFixos = gerarTabelaCustosFixos(fixosCalculados);
    const htmlVariaveis = gerarTabelaCustosVariaveis(variaveisCalculadas);
    const container = document.createElement('div');
    container.classList.add('resumo-container');
    container.innerHTML = `
      <button class="toggle-detalhes">📂 Mostrar/Esconder Detalhes</button>
      <div class="bloco-detalhes" style="display: none;">
        ${htmlFixos}
        <hr/>
        ${htmlVariaveis}
      </div>`;
    divResultado.appendChild(container);
    const btnToggle = container.querySelector('.toggle-detalhes');
    const blocoDetalhes = container.querySelector('.bloco-detalhes');
    btnToggle.addEventListener('click', () => {
      blocoDetalhes.style.display = blocoDetalhes.style.display === 'none' ? 'block' : 'none';
    });
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

  document.getElementById('calcular').addEventListener('click', () => {
    const precoVenda = parseFloat(document.getElementById('precoVenda').value) || 0;
    const custosFixos = coletarDadosFixos();
    const custosVariaveis = coletarDadosVariaveis();
    const fixosCalculados = calcularParticipacaoFixos(custosFixos);
    const variaveisCalculadas = calcularVariaveisEstimado(custosVariaveis, precoVenda);
    exibirResumoAnalitico(fixosCalculados, variaveisCalculadas);
  });
});
