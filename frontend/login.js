const API_URL = "https://catalogo-filmes-backend-kbk8.onrender.com";

const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");

const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");

const mensagem = document.getElementById("mensagem");


// TROCAR ENTRE LOGIN E CADASTRO

btnLogin.addEventListener("click", () => {
  formLogin.classList.remove("hidden");
  formCadastro.classList.add("hidden");

  btnLogin.classList.add("bg-red-600");
  btnCadastro.classList.remove("bg-red-600");

  mensagem.textContent = "";
});


btnCadastro.addEventListener("click", () => {
  formCadastro.classList.remove("hidden");
  formLogin.classList.add("hidden");

  btnCadastro.classList.add("bg-red-600");
  btnLogin.classList.remove("bg-red-600");

  mensagem.textContent = "";
});


// CADASTRO

formCadastro.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nome = document.getElementById("cadastroNome").value;
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;

  try {
    const resposta = await fetch(`${API_URL}/cadastro`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        nome,
        email,
        senha
      })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = resultado.erro;
      mensagem.className = "mt-5 text-center text-sm text-red-500";
      return;
    }

    mensagem.textContent = "Conta criada! Agora faça login.";
    mensagem.className = "mt-5 text-center text-sm text-green-500";

    formCadastro.reset();

    setTimeout(() => {
      btnLogin.click();
    }, 1000);

  } catch (erro) {
    console.error(erro);

    mensagem.textContent = "Erro ao criar conta.";
    mensagem.className = "mt-5 text-center text-sm text-red-500";
  }
});


// LOGIN

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  try {
    const resposta = await fetch(`${API_URL}/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        email,
        senha
      })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = resultado.erro;
      mensagem.className = "mt-5 text-center text-sm text-red-500";
      return;
    }

    localStorage.setItem("token", resultado.token);

    localStorage.setItem(
      "usuario",
      JSON.stringify(resultado.usuario)
    );

    window.location.href = "index.html";

  } catch (erro) {
    console.error(erro);

    mensagem.textContent = "Erro ao fazer login.";
    mensagem.className = "mt-5 text-center text-sm text-red-500";
  }
});