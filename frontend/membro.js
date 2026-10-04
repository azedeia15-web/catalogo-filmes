const API_URL = "https://catalogo-filmes-backend-kbk8.onrender.com";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

let planoEscolhido = null;
let valorEscolhido = null;

const planos = document.querySelectorAll(".plano");

const areaPagamento =
  document.getElementById("areaPagamento");

const planoSelecionado =
  document.getElementById("planoSelecionado");

const formPagamento =
  document.getElementById("formPagamento");

const mensagemPagamento =
  document.getElementById("mensagemPagamento");


planos.forEach((botao) => {

  botao.addEventListener("click", () => {

    planos.forEach((plano) => {
      plano.classList.remove("border-red-600");
    });

    botao.classList.add("border-red-600");

    planoEscolhido =
      botao.dataset.plano;

    valorEscolhido =
      Number(botao.dataset.valor);

    planoSelecionado.textContent =
      `${planoEscolhido} — R$ ${valorEscolhido
        .toFixed(2)
        .replace(".", ",")} por mês`;

    areaPagamento.classList.remove("hidden");

    areaPagamento.scrollIntoView({
      behavior: "smooth"
    });
  });

});


formPagamento.addEventListener(
  "submit",
  async (evento) => {

    evento.preventDefault();

    if (!planoEscolhido) {
      return;
    }

    try {

      const resposta = await fetch(
        `${API_URL}/assinaturas`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify({
            plano: planoEscolhido,
            valor: valorEscolhido
          })
        }
      );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {

        mensagemPagamento.textContent =
          resultado.erro ||
          "Erro ao realizar assinatura.";

        mensagemPagamento.className =
          "mt-5 text-center font-bold text-red-500";

        return;
      }

      mensagemPagamento.textContent =
        "Pagamento de teste aprovado! Você agora é membro.";

      mensagemPagamento.className =
        "mt-5 text-center font-bold text-green-500";

      formPagamento.reset();

    } catch (erro) {

      console.error(erro);

      mensagemPagamento.textContent =
        "Não foi possível concluir a assinatura.";

      mensagemPagamento.className =
        "mt-5 text-center font-bold text-red-500";
    }
  }
);