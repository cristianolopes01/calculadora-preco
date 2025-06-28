document.getElementById('calculate-btn').addEventListener('click', function () {
  const fixosIds = ['c-energia','c-agua','c-telefonia','c-pessoal','c-socios','c-contabilidade','c-depreciacao','c-internet','c-outros-fixos'];
  let totalCustosFixos = fixosIds.reduce((acc, id) => acc + (parseFloat(document.getElementById(id).value) || 0), 0);

  const variaveisIds = ['v-impostos','v-comissao','v-taxa-cartao','v-descontos'];
  let totalCustosVariaveisPercentual = variaveisIds.reduce((acc, id) => acc + (parseFloat(document.getElementById(id).value) || 0), 0);

  const custoAquisicao = parseFloat(document.getElementById('p-custo-aquisicao').value) || 0;
  const freteUnidade = parseFloat(document.getElementById('p-frete').value) || 0;
  const vendasMes = parseInt(document.getElementById('p-vendas-mes').value) || 0;
  const margemLucro = parseFloat(document.getElementById('p-margem-lucro').value) || 0;

  if (custoAquisicao === 0 || vendasMes === 0 || margemLucro === 0) {
    alert('Preencha o Custo de Aquisição, Vendas Mensais e Margem de Lucro.');
    return;
  }

  const custoFixoUnitario = totalCustosFixos / vendasMes;
  const custoVariavelUnitario = custoAquisicao + freteUnidade;
  const custoTotalUnitario = custoFixoUnitario + custoVariavelUnitario;
  const somaPercentuais = (totalCustosVariaveisPercentual + margemLucro) / 100;

  if (somaPercentuais >= 1) {
    alert('A soma dos percentuais não pode ser maior ou igual a 100%.');
    return;
  }

  const precoDeVenda = custoTotalUnitario / (1 - somaPercentuais);

  const valorImpostos = precoDeVenda * ((parseFloat(document.getElementById('v-impostos').value) || 0) / 100);
  const valorComissao = precoDeVenda * ((parseFloat(document.getElementById('v-comissao').value) || 0) / 100);
  const valorTaxaCartao = precoDeVenda * ((parseFloat(document.getElementById('v-taxa-cartao').value) || 0) / 100);
  const valorLucro = precoDeVenda * (margemLucro / 100);

  const resultCard = document.getElementById('result-card');
  const resultContent = document.getElementById('result-content');

  resultContent.innerHTML = `
    <p class="result-price">Preço de Venda Sugerido: <span>R$ ${precoDeVenda.toFixed(2)}</span></p>
    <p class="result-detail"><strong>Composição do Preço:</strong></p>
    <p class="result-detail">Custo de Aquisição/Produção: <span>R$ ${custoAquisicao.toFixed(2)}</span></p>
    <p class="result-detail">Rateio do Custo Fixo por Unidade: <span>R$ ${custoFixoUnitario.toFixed(2)}</span></p>
    <p class="result-detail">Impostos e Taxas (%): <span>R$ ${(valorImpostos + valorComissao + valorTaxaCartao).toFixed(2)}</span></p>
    <p class="result-detail">Lucro Bruto por Unidade: <span>R$ ${valorLucro.toFixed(2)} (${margemLucro}%)</span></p>
  `;

  resultCard.classList.add('mostrar');

  const ctx = document.getElementById('grafico').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Aquisição', 'Fixos', 'Impostos/Taxas', 'Lucro'],
      datasets: [{
        data: [
          custoAquisicao,
          custoFixoUnitario,
          valorImpostos + valorComissao + valorTaxaCartao,
          valorLucro
        ],
        backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc
