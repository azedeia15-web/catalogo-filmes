let carrinho =
  JSON.parse(localStorage.getItem("carrinho")) || [];


function adicionarCarrinho(nome, preco, selectId = null) {

  let tamanho = null;

  if (selectId) {
    tamanho = document.getElementById(selectId).value;
  }


  const produtoExistente = carrinho.find(produto =>
    produto.nome === nome &&
    produto.tamanho === tamanho
  );


  if (produtoExistente) {

    if (!produtoExistente.quantidade) {
      produtoExistente.quantidade = 1;
    }

    produtoExistente.quantidade += 1;

  } else {

    carrinho.push({
      nome: nome,
      preco: preco,
      tamanho: tamanho,
      quantidade: 1
    });

  }


  salvarCarrinho();
  atualizarCarrinho();
  abrirCarrinho();

}



function salvarCarrinho() {

  localStorage.setItem(
    "carrinho",
    JSON.stringify(carrinho)
  );

}



function atualizarCarrinho() {

  const lista =
    document.getElementById("listaCarrinho");

  const contador =
    document.getElementById("contadorCarrinho");

  const totalElemento =
    document.getElementById("totalCarrinho");


  if (!lista || !contador || !totalElemento) {
    return;
  }


  lista.innerHTML = "";


  let total = 0;
  let quantidadeTotal = 0;


  carrinho.forEach(produto => {

    const quantidade =
      produto.quantidade || 1;

    quantidadeTotal += quantidade;

  });


  contador.textContent =
    quantidadeTotal;



  if (carrinho.length === 0) {

    lista.innerHTML = `

      <div
        class="rounded-xl border border-zinc-800 p-6 text-center"
      >

        <p class="text-zinc-500">

          Seu carrinho está vazio.

        </p>

      </div>

    `;


    totalElemento.textContent =
      "0,00";

    return;

  }



  carrinho.forEach((produto, index) => {

    const quantidade =
      produto.quantidade || 1;


    const subtotal =
      produto.preco * quantidade;


    total += subtotal;



    let tamanhoTexto = "";


    if (produto.tamanho) {

      tamanhoTexto = `

        <p class="mt-1 text-sm text-zinc-500">

          Tamanho: ${produto.tamanho}

        </p>

      `;

    }



    const item =
      document.createElement("div");


    item.className =
      "rounded-xl border border-zinc-800 bg-black p-4";


    item.innerHTML = `

      <div
        class="flex items-start justify-between gap-4"
      >

        <div class="flex-1">


          <h3 class="font-black text-white">

            ${produto.nome}

          </h3>


          ${tamanhoTexto}


          <p class="mt-2 text-sm text-zinc-400">

            R$ ${produto.preco
              .toFixed(2)
              .replace(".", ",")} cada

          </p>



          <div class="mt-4 flex items-center gap-3">


            <button
              onclick="diminuirQuantidade(${index})"
              class="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 font-black transition hover:border-red-600 hover:bg-red-600"
            >

              −

            </button>



            <span
              class="min-w-[25px] text-center font-black"
            >

              ${quantidade}

            </span>



            <button
              onclick="aumentarQuantidade(${index})"
              class="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 font-black transition hover:border-red-600 hover:bg-red-600"
            >

              +

            </button>


          </div>



          <p class="mt-4 font-black text-red-500">

            R$ ${subtotal
              .toFixed(2)
              .replace(".", ",")}

          </p>


        </div>



        <button
          onclick="removerProduto(${index})"
          class="text-xl text-zinc-500 transition hover:text-red-500"
          title="Remover produto"
        >

          ×

        </button>


      </div>

    `;


    lista.appendChild(item);

  });



  totalElemento.textContent =
    total
      .toFixed(2)
      .replace(".", ",");

}



function aumentarQuantidade(index) {

  if (!carrinho[index]) {
    return;
  }


  if (!carrinho[index].quantidade) {

    carrinho[index].quantidade = 1;

  }


  carrinho[index].quantidade += 1;


  salvarCarrinho();
  atualizarCarrinho();

}



function diminuirQuantidade(index) {

  if (!carrinho[index]) {
    return;
  }


  if (!carrinho[index].quantidade) {

    carrinho[index].quantidade = 1;

  }


  if (carrinho[index].quantidade > 1) {

    carrinho[index].quantidade -= 1;

  } else {

    carrinho.splice(index, 1);

  }


  salvarCarrinho();
  atualizarCarrinho();

}



function removerProduto(index) {

  if (!carrinho[index]) {
    return;
  }


  carrinho.splice(index, 1);


  salvarCarrinho();
  atualizarCarrinho();

}



function limparCarrinho() {

  carrinho = [];


  localStorage.removeItem("carrinho");


  atualizarCarrinho();

}



function abrirCarrinho() {

  const painel =
    document.getElementById("carrinhoPainel");


  if (painel) {

    painel.style.display = "block";

  }

}



function fecharCarrinho() {

  const painel =
    document.getElementById("carrinhoPainel");


  if (painel) {

    painel.style.display = "none";

  }

}



function finalizarCompra() {

  if (carrinho.length === 0) {

    alert(
      "Seu carrinho está vazio."
    );

    return;

  }


  alert(
    "Compra demonstrativa! Nenhum pagamento real será realizado."
  );

}



atualizarCarrinho();