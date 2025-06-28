document.addEventListener("DOMContentLoaded", () => {
  const calcular = document.getElementById("calcular");
  const limpar = document.getElementById("limpar");

  calcular.addEventListener("click", () => {
    const precoCompra = parseFloat(document.getElementById("preco-compra").value) || 0;
    const precoVenda = parseFloat(document.getElementById("preco-venda").value) || 0;
    const diasUteis = parseInt(document.getElementById("dias-uteis").value) || 22;

    // Fixos
    const fixosIds = [
      { id: "fixo-aluguel", nome: "Aluguel" },
      { id: "fixo-energia", nome: "Energia Elétrica" },
      { id: "fixo-agua", nome: "Água" },
      { id: "fixo-internet", nome: "Internet" },
      { id: "fixo-telefonia", nome: "Telefonia" },
      { id: "fixo-pessoal", nome: "Pessoal" },
      { id: "fixo-socios", nome: "Remuneração Sócios" },
      { id: "fixo-assinaturas", nome: "Assinaturas" },
      { id: "fixo-contabilidade", nome: "Contabilidade" },
      { id: "fixo-manutencoes", nome: "Manutenções" },
      { id: "fixo-refeicoes", nome: "Refeições" },
      { id: "fixo-depreciacoes", nome: "Depreciações" },
      { id: "fixo-outras", nome: "Outras Despesas" }
    ];

    let totalFixos = 0;
    const fixosCalculados = fixosIds.map(item => {
      const valor = parseFloat(document.getElementById(item.id)?.value) || 0;
      totalFixos += valor;
      return { ...item, valor };
    });

    // Variáveis
    const variaveisIds = [
      { id: "variavel-producao", nome: "Custo de Aquisição/Produção" },
      { id: "variavel-impostos", nome: "Impostos sobre faturamento" },
      { id: "variavel-comissoes", nome: "Comissões de Vendas" },
      { id: "variavel-debito", nome: "Taxa de Cartão – Débito" },
      { id: "variavel-fretes", nome: "Fretes" },
      { id: "variavel-antecipacao", nome: "Taxa de Antecipação" },
      { id: "variavel-descontos", nome: "Desconto de Vendas" },
      { id: "variavel-outros", nome: "Outros Custos Variáveis" },
      { id: "variavel-credito", nome: "Taxa de Cartão – Crédito" }
    ];

    let totalVariaveisPercent = 0;
    const variaveisCalculadas = variaveisIds.map(item => {
      const percent = parseFloat(document.getElementById(item.id)?.value) || 0;
      totalVariaveisPercent += percent;
      return {
        ...item,
        percent,
        valor: precoVenda * (percent / 100)
      };
    });

    // Preço
    const custoVariavelReais = precoVenda * (totalVariaveisPercent / 100);
    const receitaBruta = precoVenda - precoCompra;
    const margemBruta = precoVenda ? (receitaBruta / precoVenda) * 100 : 0;
    const receitaLiquida = receitaBruta - custoVariavelReais;
    const margemLiquida = precoVenda ? (receitaLiquida / precoVenda) * 100 : 0;
    const mcu = receitaLiquida;

    const peUnidades = mcu > 0 ? totalFixos / mcu : 0;
    const peDiarioUnidades = diasUteis > 0 ? peUnidades / diasUteis : 0;
    const peDiarioReais = (margemLiquida > 0 && diasUteis > 0) ? totalFixos / (margemLiquida / 100) / diasUteis : 0;

    // Tabela de Preço
    document.getElementById("relatorio-preco").innerHTML = `
      <h3>📋 Tabela
