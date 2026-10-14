
const API_URL = 'http://localhost:3000/usuarios';

const form = document.getElementById('formCadastro');
const nomeInput = document.getElementById('nome');
const codinomeInput = document.getElementById('codinome');
const emailInput = document.getElementById('email');
const nivelInput = document.getElementById('nivel');
const numeroInput = document.getElementById('numero');

const tabelaUsuarios = document.getElementById('tabelaUsuarios');
const totalUsuarios = document.getElementById('totalUsuarios');
const listaVazia = document.getElementById('listaVazia');
const mensagem = document.getElementById('mensagem');

const botaoConfirmar = form.querySelector('button[type="submit"]');

let usuarios = [];
let usuarioEditandoId = null;

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

function criarCelula(valor) {
    const td = document.createElement('td');
    td.textContent = valor ?? '';
    return td;
}

async function carregarUsuarios() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error('Não foi possível carregar os usuários.');
        }

        usuarios = await resposta.json();
        renderizarUsuarios();
    } catch (erro) {
        mostrarMensagem(
            'Erro ao carregar usuários. Confira se o servidor está ligado.',
            'erro'
        );
        console.error(erro);
    }
}

function renderizarUsuarios() {
    tabelaUsuarios.replaceChildren();

    usuarios.forEach(usuario => {
        const linha = document.createElement('tr');

        linha.append(
            criarCelula(usuario.id),
            criarCelula(usuario.nome),
            criarCelula(usuario.codinome),
            criarCelula(usuario.email),
            criarCelula(usuario.nivel),
            criarCelula(usuario.telefone)
        );

        const celulaAcao = document.createElement('td');

        // Botão Alterar
        const botaoAlterar = document.createElement('button');
        botaoAlterar.type = 'button';
        botaoAlterar.className = 'btn-alterar';
        botaoAlterar.textContent = 'Alterar';

        botaoAlterar.addEventListener('click', () => {
            editarUsuario(usuario);
        });

        // Botão Excluir
        const botaoExcluir = document.createElement('button');
        botaoExcluir.type = 'button';
        botaoExcluir.className = 'btn-excluir';
        botaoExcluir.textContent = 'Excluir';

        botaoExcluir.addEventListener('click', () => {
            excluirUsuario(usuario.id);
        });

        celulaAcao.append(botaoAlterar, botaoExcluir);
        linha.append(celulaAcao);
        tabelaUsuarios.append(linha);
    });

    totalUsuarios.textContent =
        `${usuarios.length} ${usuarios.length === 1 ? 'usuário' : 'usuários'}`;

    listaVazia.classList.toggle('oculto', usuarios.length > 0);
}

function editarUsuario(usuario) {
    usuarioEditandoId = usuario.id;

    nomeInput.value = usuario.nome;
    codinomeInput.value = usuario.codinome;
    emailInput.value = usuario.email;
    nivelInput.value = usuario.nivel;
    numeroInput.value = usuario.telefone;

    botaoConfirmar.textContent = 'Salvar alterações';

    mostrarMensagem('Altere os dados desejados e salve.', 'sucesso');

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    nomeInput.focus();
}

function cancelarEdicao() {
    usuarioEditandoId = null;
    form.reset();
    botaoConfirmar.textContent = 'Confirmar cadastro';
}

form.addEventListener('submit', async event => {
    event.preventDefault();

    const dados = {
        nome: nomeInput.value.trim(),
        codinome: codinomeInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        nivel: nivelInput.value,
        telefone: numeroInput.value.trim()
    };

    if (Object.values(dados).some(valor => !valor)) {
        mostrarMensagem('Preencha todos os campos.', 'erro');
        return;
    }

    const editando = usuarioEditandoId !== null;

    const url = editando
        ? `${API_URL}/${usuarioEditandoId}`
        : API_URL;

    try {
        const resposta = await fetch(url, {
            method: editando ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || 'Não foi possível salvar os dados.'
            );
        }

        cancelarEdicao();
        await carregarUsuarios();

        mostrarMensagem(
            editando
                ? 'Dados alterados com sucesso!'
                : 'Usuário cadastrado com sucesso!',
            'sucesso'
        );

        nomeInput.focus();
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro');
        console.error(erro);
    }
});

async function excluirUsuario(id) {
    if (!confirm('Deseja realmente excluir este usuário?')) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao excluir usuário.');
        }

        if (usuarioEditandoId === id) {
            cancelarEdicao();
        }

        await carregarUsuarios();
        mostrarMensagem('Cadastro excluído com sucesso!', 'sucesso');
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro');
        console.error(erro);
    }
}

carregarUsuarios();
