window.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('input');

  // Carrega valores salvos
  inputs.forEach(input => {
    const saved = localStorage.getItem(input.id);
    if (saved !== null) {
      input.value = saved;
    }
  });

  // Salva enquanto digita
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      localStorage.setItem(input.id, input.value);
      input.classList.remove('erro');
    });
  });

  // Alternar tema
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }

  document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // Botão Calcular
  document.getElementById('calculate-btn').addEventListener('click', function () {
    const fixosIds = ['c-energia','c-agua','c-telefonia','c-pessoal','c-socios','c-contabilidade','c-depreciacao','c-internet','c-outros-fixos'];
    const variaveisIds = ['v-impostos','v-comissao','v-taxa-cartao','v-descontos'];

    let totalCustosFixos = fixosIds.reduce((acc, id) => acc + (parseFloat(document.getElementById(id).value) || 0), 0);
    let totalCustosVariaveisPercentual = variaveisIds.reduce((acc, id) => acc + (parseFloat(document.getElementById(id).value) || 0), 0);

    const custoAquisicao = parseFloat(document.getElementById('p-custo-aquisicao').value) || 0;
    const freteUnidade = parseFloat(document.getElementById('p-frete').value) || 0;
    const vendasMes = parseInt(document.getElementById('p-vendas-mes').value) || 0;
    const margemLucro = parseFloat(document.getElementById('p-margem-lucro').value) || 0;

    // Validação visual
    ['p-custo-aquisicao', 'p-vendas-mes', 'p-margem-lucro'].forEach(id => {
      document.getElementById(id).classList.remove('erro');
    });

    if (custoAquisicao === 0 || vendasMes === 0 || margemLucro === 0) {
      const campos = [
        { id: 'p-custo-aquisicao', valor: custoAquisicao },
        { id: 'p-vendas-mes', valor: vendasMes },
        { id: 'p-margem-lucro', valor: margemLucro }
      ];
      for (const campo of campos) {
        if (campo.valor === 0) {
          const input = document.getElementById(campo.id);
          input.classList.add('erro');
          input.focus();
          break;
        }
      }
      return;
    }

    const custoFixoUnitario = totalCustosFixos / vendasMes;
    const custoTotalUnitario = custoAquisicao + freteUnidade + custoFixoUnitario;
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

    const resultContent = document.getElementById('result-content');
    resultContent.innerHTML = `
      <p class="result-price">Preço de Venda Sugerido: <span>R$ ${precoDeVenda.toFixed(2)}</span></p>
      <p class="result-detail"><strong>Composição do Preço:</strong></p>
      <p class="result-detail">Custo de Aquisição/Produção: <span>R$ ${custoAquisicao.toFixed(2)}</span></p>
      <p class="result-detail">Custo Fixo Unitário: <span>R$ ${custoFixoUnitario.toFixed(2)}</span></p>
      <p class="result-detail">Impostos/Taxas: <span>R$ ${(valorImpostos + valorComissao + valorTaxaCartao).toFixed(2)}</span></p>
      <p class="result-detail">Lucro Bruto: <span>R$ ${valorLucro.toFixed(2)} (${margemLucro}%)</span></p>
    `;

    document.getElementById('result-card').classList.add('mostrar');

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
          backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  });

  // Botão Limpar
  document.getElementById('clear-btn').addEventListener('click', function () {
    inputs.forEach(input => {
      input.value = '';
      localStorage.removeItem(input.id);
      input.classList.remove('erro');
    });

    document.getElementById('result-content').innerHTML = '';
    document.getElementById('result-card').classList.remove('mostrar');

    const canvas = document.getElementById('grafico');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Exportar PDF
  document.getElementById('exportar-btn').addEventListener('click', () => {
    const resultCard = document.getElementById('result-card');
    if (!resultCard.classList.contains('mostrar')) {
      alert('Calcule o preço antes de exportar.');
      return;
    }

    const opt = {
      margin: 0.5,
      filename: 'resultado-preco-venda.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(resultCard).set(opt).save();
  });

  // Atualiza ano no rodapé
  document.getElementById('ano-atual').textContent = new Date().getFullYear();
});
