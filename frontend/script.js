const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const API_URL = "https://catalogo-filmes-backend-kbk8.onrender.com";

const usuario = JSON.parse(
  localStorage.getItem("usuario")
);


// ==========================================
// QUANDO A PÁGINA CARREGAR
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  const nomeUsuario =
    document.getElementById("nomeUsuario");

  const btnSair =
    document.getElementById("btnSair");


  // MOSTRAR NOME DO USUÁRIO

  if (nomeUsuario && usuario) {
    nomeUsuario.textContent =
      `Olá, ${usuario.nome}`;
  }


  // VERIFICAR SE O USUÁRIO É MEMBRO
try {
  const respostaAssinatura = await fetch(
    `${API_URL}/minha-assinatura`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (respostaAssinatura.ok) {
    const dadosAssinatura =
      await respostaAssinatura.json();

    if (
      dadosAssinatura.membro &&
      nomeUsuario
    ) {
      const badge =
        document.createElement("span");

      badge.id = "badgeMembro";

      badge.className =
        "whitespace-nowrap rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white";

      badge.textContent =
        `★ ${dadosAssinatura.assinatura.plano}`;

      nomeUsuario.insertAdjacentElement(
        "afterend",
        badge
      );
    }
  }

} catch (erro) {
  console.error(
    "Erro ao verificar assinatura:",
    erro
  );
}



  // BOTÃO SAIR

  if (btnSair) {

    btnSair.addEventListener("click", () => {

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      window.location.href =
        "login.html";

    });
  }


  // FORMULÁRIO DE REVIEW

  const formulario =
    document.getElementById("formReview");

  if (formulario) {

    formulario.addEventListener(
      "submit",
      cadastrarReview
    );

  }


  // BUSCA

  const searchInput =
    document.getElementById("searchInput");

  if (searchInput) {

    searchInput.addEventListener(
      "input",
      () => {

        const termo =
          searchInput.value.toLowerCase();

        const cards =
          document.querySelectorAll(
            "[data-search]"
          );

        cards.forEach((card) => {

          const conteudo =
            card
              .getAttribute("data-search")
              .toLowerCase();

          if (
            conteudo.includes(termo)
          ) {

            card.style.display = "";

          } else {

            card.style.display =
              "none";

          }

        });

      }
    );

  }


  carregarReviews();

});



// ==========================================
// CARREGAR REVIEWS
// ==========================================

async function carregarReviews() {

  try {

    const resposta =
      await fetch(
        `${API_URL}/reviews`
      );

    const reviews =
      await resposta.json();


    const lista =
      document.getElementById(
        "reviewsBanco"
      );


    if (!lista) {
      return;
    }


    lista.innerHTML = "";


    if (reviews.length === 0) {

      lista.innerHTML = `
        <p class="text-zinc-400">
          Nenhuma review cadastrada ainda.
        </p>
      `;

      return;
    }


    reviews.forEach((review) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition hover:-translate-y-1 hover:border-red-800";


      card.innerHTML = `

        <span
          class="text-xs font-black uppercase text-red-600"
        >
          ${review.categoria}
        </span>


        <h3
          class="mt-3 text-xl font-black text-white"
        >
          ${review.titulo}
        </h3>


        <p
          class="mt-1 text-lg font-black text-red-600"
        >
          ★ ${review.nota}/10
        </p>


        <p
          class="mt-2 text-sm text-zinc-400"
        >
          Ano: ${review.ano}
        </p>


        <p
          class="mt-3 text-sm leading-6 text-zinc-400"
        >
          ${
            review.descricao ||
            "Sem descrição."
          }
        </p>


        <div class="mt-5 flex gap-3">


          <button
            onclick="editarReview(${review.id})"
            class="flex-1 rounded-lg border border-zinc-700 px-4 py-2 font-bold text-white transition hover:border-red-600"
          >
            Editar
          </button>


          <button
            onclick="excluirReview(${review.id})"
            class="flex-1 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-500"
          >
            Excluir
          </button>


        </div>
      `;


      lista.appendChild(card);

    });


  } catch (erro) {

    console.error(
      "Erro ao carregar reviews:",
      erro
    );

  }

}



// ==========================================
// CADASTRAR REVIEW
// ==========================================

async function cadastrarReview(evento) {

  evento.preventDefault();


  const titulo =
    document.getElementById(
      "tituloReview"
    ).value;


  const categoria =
    document.getElementById(
      "categoriaReview"
    ).value;


  const ano =
    document.getElementById(
      "anoReview"
    ).value;


  const nota =
    document.getElementById(
      "notaReview"
    ).value;


  const descricao =
    document.getElementById(
      "descricaoReview"
    ).value;


  const review = {

    titulo,

    categoria,

    ano: Number(ano),

    nota: Number(nota),

    descricao

  };


  try {

    const resposta =
      await fetch(
        `${API_URL}/reviews`,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${token}`

          },

          body:
            JSON.stringify(review)

        }
      );


    const resultado =
      await resposta.json();


    if (resposta.status === 401) {

      alert(
        "Seu login expirou. Faça login novamente."
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "usuario"
      );

      window.location.href =
        "login.html";

      return;

    }


    if (!resposta.ok) {

      alert(
        resultado.erro ||
        "Erro ao cadastrar review."
      );

      return;

    }


    alert(
      "Review cadastrada com sucesso!"
    );


    document
      .getElementById(
        "formReview"
      )
      .reset();


    carregarReviews();


  } catch (erro) {

    console.error(
      "Erro ao cadastrar review:",
      erro
    );


    alert(
      "Não foi possível cadastrar a review."
    );

  }

}



// ==========================================
// EXCLUIR REVIEW
// ==========================================

async function excluirReview(id) {

  const confirmar =
    confirm(
      "Tem certeza que deseja excluir esta review?"
    );


  if (!confirmar) {
    return;
  }


  try {

    const resposta =
      await fetch(
        `${API_URL}/reviews/${id}`,
        {

          method: "DELETE",

          headers: {

            "Authorization":
              `Bearer ${token}`

          }

        }
      );


    if (resposta.status === 401) {

      alert(
        "Seu login expirou. Faça login novamente."
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "usuario"
      );

      window.location.href =
        "login.html";

      return;

    }


    if (!resposta.ok) {

      alert(
        "Erro ao excluir a review."
      );

      return;

    }


    alert(
      "Review excluída com sucesso!"
    );


    carregarReviews();


  } catch (erro) {

    console.error(erro);


    alert(
      "Não foi possível excluir a review."
    );

  }

}



// ==========================================
// EDITAR REVIEW
// ==========================================

async function editarReview(id) {

  try {

    const resposta =
      await fetch(
        `${API_URL}/reviews`
      );


    const reviews =
      await resposta.json();


    const review =
      reviews.find(
        (r) => r.id === id
      );


    if (!review) {
      return;
    }


    const titulo =
      prompt(
        "Título:",
        review.titulo
      );


    if (titulo === null) {
      return;
    }


    const categoria =
      prompt(
        "Categoria:",
        review.categoria
      );


    if (categoria === null) {
      return;
    }


    const ano =
      prompt(
        "Ano:",
        review.ano
      );


    if (ano === null) {
      return;
    }


    const nota =
      prompt(
        "Nota:",
        review.nota
      );


    if (nota === null) {
      return;
    }


    const descricao =
      prompt(
        "Descrição:",
        review.descricao || ""
      );

const imagem =
  document.getElementById("imagem").value;




    if (descricao === null) {
      return;
    }


    const respostaEdicao =
      await fetch(
        `${API_URL}/reviews/${id}`,
        {

          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${token}`

          },

          body: JSON.stringify({
  titulo,
  categoria,
  ano,
  nota,
  descricao,
  imagem
})
        }
      );


    if (
      respostaEdicao.status === 401
    ) {

      alert(
        "Seu login expirou. Faça login novamente."
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "usuario"
      );

      window.location.href =
        "login.html";

      return;

    }


    if (!respostaEdicao.ok) {

      alert(
        "Erro ao editar a review."
      );

      return;

    }


    alert(
      "Review editada com sucesso!"
    );


    carregarReviews();


  } catch (erro) {

    console.error(erro);


    alert(
      "Não foi possível editar a review."
    );

  }

}