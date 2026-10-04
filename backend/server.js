const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const app = express();

const swaggerDocument = YAML.load(
  path.join(__dirname, "openapi.yaml")
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// ================= CONFIGURAÇÕES =================

app.use(cors());
app.use(express.json());


// ================= BANCO DE DADOS =================

const pool = new Pool({
  user: "postgres",
  host: "db",
  database: "catalogo",
  password: "1234",
  port: 5432
});


// Chave usada para criar o token de login
const JWT_SECRET = "trasheira-violenta-chave-secreta";

function autenticarToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      erro: "Você precisa estar logado."
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const usuario = jwt.verify(token, JWT_SECRET);

    req.usuario = usuario;

    next();

  } catch (erro) {
    return res.status(401).json({
      erro: "Login inválido ou expirado."
    });
  }
}

// ================= TESTE DO BACKEND =================

app.get("/", (req, res) => {
  res.send("Backend funcionando!");
});


// ==================================================
// CADASTRO DE USUÁRIO
// ==================================================

app.post("/cadastro", async (req, res) => {
  try {
    let { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Preencha nome, e-mail e senha."
      });
    }

    nome = nome.trim();
    email = email.trim().toLowerCase();

    if (senha.length < 6) {
      return res.status(400).json({
        erro: "A senha precisa ter pelo menos 6 caracteres."
      });
    }

    // Verifica se o e-mail já existe
    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        erro: "Este e-mail já está cadastrado."
      });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(
      senha,
      10
    );

    // Salva usuário
    const resultado = await pool.query(
      `INSERT INTO usuarios
       (nome, email, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email`,
      [
        nome,
        email,
        senhaCriptografada
      ]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: resultado.rows[0]
    });

  } catch (erro) {
    console.error("Erro no cadastro:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar usuário."
    });
  }
});


// ==================================================
// LOGIN
// ==================================================

app.post("/login", async (req, res) => {
  try {
    let { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Informe e-mail e senha."
      });
    }

    email = email.trim().toLowerCase();

    // Procura usuário pelo e-mail
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    const usuario = resultado.rows[0];

    // Compara a senha digitada com a senha criptografada
    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    // Cria token
    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    res.json({
      mensagem: "Login realizado com sucesso!",
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (erro) {
    console.error("Erro no login:", erro);

    res.status(500).json({
      erro: "Erro ao realizar login."
    });
  }
});


// ==================================================
// LISTAR REVIEWS
// ==================================================

app.get("/reviews", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM reviews ORDER BY id DESC"
    );

    res.json(resultado.rows);

  } catch (erro) {
    console.error("Erro ao buscar reviews:", erro);

    res.status(500).json({
      erro: "Erro ao buscar reviews."
    });
  }
});


// ==================================================
// CADASTRAR REVIEW
// ==================================================

app.post("/reviews", autenticarToken, async (req, res) => {
  try {
    const {
      titulo,
      categoria,
      ano,
      nota,
      descricao
    } = req.body;

    if (!titulo || !categoria || !ano || nota === undefined) {
      return res.status(400).json({
        erro: "Preencha os campos obrigatórios."
      });
    }

    const resultado = await pool.query(
      `INSERT INTO reviews
       (titulo, categoria, ano, nota, descricao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        titulo,
        categoria,
        ano,
        nota,
        descricao
      ]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (erro) {
    console.error("Erro ao cadastrar review:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar review."
    });
  }
});


// ==================================================
// EDITAR REVIEW
// ==================================================

app.put("/reviews/:id", autenticarToken, async (req, res) => {  try {
    const { id } = req.params;

    const {
      titulo,
      categoria,
      ano,
      nota,
      descricao
    } = req.body;

    const resultado = await pool.query(
      `UPDATE reviews
       SET titulo = $1,
           categoria = $2,
           ano = $3,
           nota = $4,
           descricao = $5
       WHERE id = $6
       RETURNING *`,
      [
        titulo,
        categoria,
        ano,
        nota,
        descricao,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Review não encontrada."
      });
    }

    res.json({
      mensagem: "Review editada com sucesso!",
      review: resultado.rows[0]
    });

  } catch (erro) {
    console.error("Erro ao editar review:", erro);

    res.status(500).json({
      erro: "Erro ao editar review."
    });
  }
});


// ==================================================
// EXCLUIR REVIEW
// ==================================================

app.delete("/reviews/:id", autenticarToken, async (req, res) => {  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM reviews
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Review não encontrada."
      });
    }

    res.json({
      mensagem: "Review excluída com sucesso!"
    });

  } catch (erro) {
    console.error("Erro ao excluir review:", erro);

    res.status(500).json({
      erro: "Erro ao excluir review."
    });
  }
});


// ==================================================
// SERVIDOR
// ==================================================


// ==================================================
// ASSINATURA / SEJA MEMBRO
// ==================================================

app.post("/assinaturas", async (req, res) => {
  try {

    // Pega o token enviado pelo navegador
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        erro: "Você precisa estar logado."
      });
    }

    const token = authorization.split(" ")[1];

    let usuario;

    try {
      usuario = jwt.verify(token, JWT_SECRET);
    } catch (erro) {
      return res.status(401).json({
        erro: "Login inválido ou expirado."
      });
    }


    const { plano } = req.body;


    // Valores definidos pelo próprio servidor
    const planos = {
      "Básico": 9.90,
      "Premium": 19.90
    };


    if (!planos[plano]) {
      return res.status(400).json({
        erro: "Plano inválido."
      });
    }


    const valor = planos[plano];


    // Verifica se o usuário já possui assinatura ativa
    const assinaturaExistente = await pool.query(
      `SELECT * FROM assinaturas
       WHERE usuario_id = $1
       AND status = 'ativo'`,
      [usuario.id]
    );


    // Se já for membro, atualiza o plano
    if (assinaturaExistente.rows.length > 0) {

      const resultado = await pool.query(
        `UPDATE assinaturas
         SET plano = $1,
             valor = $2,
             data_inicio = CURRENT_TIMESTAMP
         WHERE usuario_id = $3
         AND status = 'ativo'
         RETURNING *`,
        [
          plano,
          valor,
          usuario.id
        ]
      );


      return res.json({
        mensagem: "Assinatura atualizada com sucesso!",
        assinatura: resultado.rows[0]
      });
    }


    // Se ainda não for membro, cria assinatura
    const resultado = await pool.query(
      `INSERT INTO assinaturas
       (usuario_id, plano, valor, status)
       VALUES ($1, $2, $3, 'ativo')
       RETURNING *`,
      [
        usuario.id,
        plano,
        valor
      ]
    );


    res.status(201).json({
      mensagem: "Assinatura realizada com sucesso!",
      assinatura: resultado.rows[0]
    });


  } catch (erro) {

    console.error(
      "Erro ao realizar assinatura:",
      erro
    );


    res.status(500).json({
      erro: "Erro ao realizar assinatura."
    });
  }
});



// ==================================================
// VER ASSINATURA DO USUÁRIO
// ==================================================

app.get("/minha-assinatura", autenticarToken, async (req, res) => {
  try {

    const resultado = await pool.query(
      `SELECT *
       FROM assinaturas
       WHERE usuario_id = $1
       AND status = 'ativo'
       ORDER BY id DESC
       LIMIT 1`,
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.json({
        membro: false
      });
    }

    res.json({
      membro: true,
      assinatura: resultado.rows[0]
    });

  } catch (erro) {

    console.error(
      "Erro ao verificar assinatura:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao verificar assinatura."
    });
  }
});





app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});