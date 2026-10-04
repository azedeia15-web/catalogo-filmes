let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function adicionarCarrinho(nome, preco) {
  carrinho.push({
    nome: nome,
    preco: preco
  });

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  atualizarCarrinho();
}

function atualizarCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const totalElemento = document.getElementById("total");

  lista.innerHTML = "";

  let total = 0;

  carrinho.forEach(produto => {
    const item = document.createElement("p");

    item.textContent =
      produto.nome + " - R$ " + produto.preco.toFixed(2);

    lista.appendChild(item);

    total += produto.preco;
  });

  totalElemento.textContent =
    total.toFixed(2).replace(".", ",");
}

function limparCarrinho() {
  carrinho = [];

  localStorage.removeItem("carrinho");

  atualizarCarrinho();
}

atualizarCarrinho();