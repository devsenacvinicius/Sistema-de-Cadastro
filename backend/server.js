
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const fs = require('node:fs');

const app = express();
const PORTA = 3000;

// Permite receber dados em JSON
app.use(express.json());

// Caminhos do projeto e do banco de dados
const pastaProjeto = path.join(__dirname, '..');
const pastaDados = path.join(__dirname, 'data');

fs.mkdirSync(pastaDados, { recursive: true });

// IMPORTANTE:
// Se o banco do Letos estiver em outra pasta,
// altere o caminho abaixo para o arquivo correto.
const caminhoBanco = path.join(pastaDados, 'Banco_Dados.db');

// Conexão com o banco SQLite
const banco = new sqlite3.Database(caminhoBanco, (erro) => {
    if (erro) {
        console.error('Erro ao conectar ao banco:', erro.message);
        return;
    }

    console.log('Banco de dados conectado:', caminhoBanco);
});

// Cria a tabela caso ela ainda não exista
banco.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        codinome TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        nivel TEXT NOT NULL DEFAULT 'Iniciante',
        telefone TEXT NOT NULL
    )
`, (erro) => {
    if (erro) {
        console.error('Erro ao criar tabela:', erro.message);
        return;
    }

    // Confere se o banco já possuía a tabela antiga
    banco.all('PRAGMA table_info(usuarios)', (erro, colunas) => {
        if (erro) {
            console.error('Erro ao verificar tabela:', erro.message);
            return;
        }

        const nomes = colunas.map(coluna => coluna.name);

        const alteracoes = [];

        if (!nomes.includes('codinome')) {
            alteracoes.push(
                "ALTER TABLE usuarios ADD COLUMN codinome TEXT NOT NULL DEFAULT ''"
            );
        }

        if (!nomes.includes('nivel')) {
            alteracoes.push(
                "ALTER TABLE usuarios ADD COLUMN nivel TEXT NOT NULL DEFAULT 'Iniciante'"
            );
        }

        if (!nomes.includes('telefone')) {
            alteracoes.push(
                "ALTER TABLE usuarios ADD COLUMN telefone TEXT NOT NULL DEFAULT ''"
            );
        }

        // Executa as alterações antes de iniciar o servidor
        banco.serialize(() => {
            alteracoes.forEach(sql => {
                banco.run(sql, erro => {
                    if (erro) {
                        console.error('Erro ao atualizar tabela:', erro.message);
                    }
                });
            });

            banco.run('SELECT 1', erro => {
                if (erro) {
                    console.error('Erro ao preparar banco:', erro.message);
                    return;
                }

                iniciarServidor();
            });
        });
    });
});

// Disponibiliza o frontend
app.use(express.static(pastaProjeto));

app.get('/', (req, res) => {
    res.sendFile(path.join(pastaProjeto, 'index.html'));
});

// CREATE — POST /usuarios
app.post('/usuarios', (req, res) => {
    const { nome, codinome, email, nivel, telefone } = req.body;

    const campos = { nome, codinome, email, nivel, telefone };

    for (const [campo, valor] of Object.entries(campos)) {
        if (typeof valor !== 'string' || !valor.trim()) {
            return res.status(400).json({
                erro: `O campo ${campo} é obrigatório.`
            });
        }
    }

    const sql = `
        INSERT INTO usuarios (nome, codinome, email, nivel, telefone)
        VALUES (?, ?, ?, ?, ?)
    `;

    banco.run(
        sql,
        [
            nome.trim(),
            codinome.trim(),
            email.trim(),
            nivel.trim(),
            telefone.trim()
        ],
        function (erro) {
            if (erro) {
                if (erro.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({
                        erro: 'Este e-mail já está cadastrado.'
                    });
                }

                console.error(erro.message);
                return res.status(500).json({
                    erro: 'Erro ao cadastrar usuário.'
                });
            }

            res.status(201).json({
                mensagem: 'Usuário cadastrado com sucesso!',
                usuario: {
                    id: this.lastID,
                    nome: nome.trim(),
                    codinome: codinome.trim(),
                    email: email.trim(),
                    nivel: nivel.trim(),
                    telefone: telefone.trim()
                }
            });
        }
    );
});

// READ — GET /usuarios
app.get('/usuarios', (req, res) => {
    banco.all(
        `SELECT id, nome, codinome, email, nivel, telefone
         FROM usuarios
         ORDER BY id DESC`,
        [],
        (erro, usuarios) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).json({
                    erro: 'Erro ao consultar usuários.'
                });
            }

            res.status(200).json(usuarios);
        }
    );
});

// READ — GET /usuarios/:id
app.get('/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido.' });
    }

    banco.get(
        `SELECT id, nome, codinome, email, nivel, telefone
         FROM usuarios WHERE id = ?`,
        [id],
        (erro, usuario) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).json({
                    erro: 'Erro ao consultar usuário.'
                });
            }

            if (!usuario) {
                return res.status(404).json({
                    erro: 'Usuário não encontrado.'
                });
            }

            res.status(200).json(usuario);
        }
    );
});

// UPDATE — PUT /usuarios/:id
app.put('/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nome, codinome, email, nivel, telefone } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido.' });
    }

    const campos = { nome, codinome, email, nivel, telefone };

    for (const [campo, valor] of Object.entries(campos)) {
        if (typeof valor !== 'string' || !valor.trim()) {
            return res.status(400).json({
                erro: `O campo ${campo} é obrigatório.`
            });
        }
    }

    banco.run(
        `UPDATE usuarios
         SET nome = ?, codinome = ?, email = ?, nivel = ?, telefone = ?
         WHERE id = ?`,
        [
            nome.trim(),
            codinome.trim(),
            email.trim(),
            nivel.trim(),
            telefone.trim(),
            id
        ],
        function (erro) {
            if (erro) {
                if (erro.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({
                        erro: 'Este e-mail já pertence a outro usuário.'
                    });
                }

                console.error(erro.message);
                return res.status(500).json({
                    erro: 'Erro ao atualizar usuário.'
                });
            }

            if (this.changes === 0) {
                return banco.get(
                    'SELECT id FROM usuarios WHERE id = ?',
                    [id],
                    (erroConsulta, usuario) => {
                        if (erroConsulta) {
                            return res.status(500).json({
                                erro: 'Erro ao verificar usuário.'
                            });
                        }

                        if (!usuario) {
                            return res.status(404).json({
                                erro: 'Usuário não encontrado.'
                            });
                        }

                        res.status(200).json({
                            mensagem: 'Nenhuma alteração necessária.'
                        });
                    }
                );
            }

            res.status(200).json({
                mensagem: 'Usuário atualizado com sucesso!'
            });
        }
    );
});

// DELETE — DELETE /usuarios/:id
app.delete('/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido.' });
    }

    banco.run(
        'DELETE FROM usuarios WHERE id = ?',
        [id],
        function (erro) {
            if (erro) {
                console.error(erro.message);
                return res.status(500).json({
                    erro: 'Erro ao excluir usuário.'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    erro: 'Usuário não encontrado.'
                });
            }

            res.status(200).json({
                mensagem: 'Usuário excluído com sucesso!'
            });
        }
    );
});

// Tratamento para JSON inválido
app.use((erro, req, res, next) => {
    if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
        return res.status(400).json({ erro: 'JSON inválido.' });
    }

    next(erro);
});

// Inicia o servidor após preparar o banco
function iniciarServidor() {
    app.listen(PORTA, () => {
        console.log(`Servidor rodando em http://localhost:${PORTA}`);
    });
}
