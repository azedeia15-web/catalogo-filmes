const tokenUsuario = localStorage.getItem("token");
const dadosUsuario = localStorage.getItem("usuario");

if (!tokenUsuario) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async () => {

  const nomeUsuario =
    document.getElementById("nomeUsuario");

  const btnSair =
    document.getElementById("btnSair");


  // =========================
  // MOSTRAR NOME
  // =========================

  if (dadosUsuario && nomeUsuario) {

    const usuario =
      JSON.parse(dadosUsuario);

    nomeUsuario.textContent =
      `Olá, ${usuario.nome}`;
  }


  // =========================
  // VERIFICAR ASSINATURA
  // =========================

  try {

    const resposta = await fetch(
      "http://localhost:3000/minha-assinatura",
      {
        headers: {
          Authorization:
            `Bearer ${tokenUsuario}`
        }
      }
    );


    if (resposta.ok) {

      const resultado =
        await resposta.json();


      if (
        resultado.membro &&
        nomeUsuario
      ) {

        // Evita criar dois badges
        if (
          !document.getElementById(
            "badgeMembro"
          )
        ) {

          const badge =
            document.createElement("span");


          badge.id =
            "badgeMembro";


          badge.className =
            "whitespace-nowrap rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white";


          badge.textContent =
            `★ ${resultado.assinatura.plano}`;


          nomeUsuario.insertAdjacentElement(
            "afterend",
            badge
          );

        }

      }

    }

  } catch (erro) {

    console.error(
      "Erro ao verificar assinatura:",
      erro
    );

  }


  // =========================
  // BOTÃO SAIR
  // =========================

  if (btnSair) {

    btnSair.addEventListener(
      "click",
      () => {

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "usuario"
        );

        window.location.href =
          "login.html";

      }
    );

  }

});