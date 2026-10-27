const chavePerfil = 'rota-raiz-perfil-cliente';
const chaveReviews = 'rota-raiz-reviews-cliente';
const chaveFavoritos = 'rota-raiz-restaurantes-favoritos';
const dialogGerenciarPerfil = document.getElementById('dialog-gerenciar-perfil');
const botaoGerenciarPerfil = document.getElementById('botao-gerenciar-perfil');
const botaoFecharDialog = document.getElementById('botao-fechar-dialog');
const opcoesGerenciamento = document.getElementById('opcoes-gerenciamento');
const paineisGerenciamento = document.querySelectorAll('.painel-gerenciamento');
const formularioEditarPerfil = document.getElementById('form-editar-perfil');
const campoNomeUsuario = document.getElementById('editar-nome-usuario');
const campoFotoPerfil = document.getElementById('editar-foto-perfil');
const nomeUsuario = document.getElementById('nome-usuario');
const fotoPerfil = document.querySelector('.img-perfil');
const statusEditarPerfil = document.getElementById('status-editar-perfil');
const statusPostagem = document.getElementById('status-postagem');
const listaReviews = document.getElementById('lista-reviews');
const mensagemReviews = document.getElementById('mensagem-reviews');
const listaFavoritos = document.getElementById('lista-favoritos');
const mensagemFavoritos = document.getElementById('mensagem-favoritos');
const quantidadeReviews = document.getElementById('quantidade-reviews');
let fotoSelecionada = null;

function lerListaSalva(chave) {
    try {
        const valor = JSON.parse(localStorage.getItem(chave) || '[]');
        if (!Array.isArray(valor)) {
            throw new Error(`O conteúdo salvo em ${chave} não é uma lista.`);
        }
        return valor;
    } catch (erro) {
        console.error(`Não foi possível carregar os dados de ${chave}.`, erro);
        return [];
    }
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function carregarPerfil() {
    try {
        const perfilSalvo = JSON.parse(localStorage.getItem(chavePerfil) || '{}');
        if (typeof perfilSalvo.nome === 'string' && perfilSalvo.nome.trim()) {
            nomeUsuario.textContent = perfilSalvo.nome;
            campoNomeUsuario.value = perfilSalvo.nome;
        }
        if (typeof perfilSalvo.foto === 'string' && perfilSalvo.foto.startsWith('data:image/')) {
            fotoPerfil.src = perfilSalvo.foto;
        }
    } catch (erro) {
        console.error('Não foi possível carregar os dados salvos do perfil.', erro);
    }
}

function abrirPainel(idPainel) {
    opcoesGerenciamento.hidden = true;
    paineisGerenciamento.forEach(painel => {
        painel.hidden = painel.id !== idPainel;
    });

    if (idPainel === 'painel-reviews') {
        renderizarReviews();
    } else if (idPainel === 'painel-favoritos') {
        renderizarFavoritos();
    }
}

function voltarOpcoes() {
    paineisGerenciamento.forEach(painel => {
        painel.hidden = true;
    });
    opcoesGerenciamento.hidden = false;
}

botaoGerenciarPerfil.addEventListener('click', () => {
    voltarOpcoes();
    dialogGerenciarPerfil.showModal();
});

botaoFecharDialog.addEventListener('click', () => dialogGerenciarPerfil.close());

dialogGerenciarPerfil.addEventListener('click', evento => {
    if (evento.target === dialogGerenciarPerfil) {
        dialogGerenciarPerfil.close();
    }
});

opcoesGerenciamento.addEventListener('click', evento => {
    const botao = evento.target.closest('[data-painel]');
    if (botao) {
        abrirPainel(botao.dataset.painel);
    }
});

document.querySelectorAll('.botao-voltar-gerenciamento').forEach(botao => {
    botao.addEventListener('click', voltarOpcoes);
});

function renderizarReviews() {
    const reviews = lerListaSalva(chaveReviews).filter(review =>
        review && typeof review.id === 'string' && typeof review.texto === 'string'
    );
    listaReviews.replaceChildren();
    quantidadeReviews.textContent = String(reviews.length);
    mensagemReviews.textContent = reviews.length
        ? 'Escolha uma review para apagar.'
        : 'Você ainda não publicou reviews.';

    reviews.forEach(review => {
        const item = document.createElement('li');
        const texto = document.createElement('span');
        const botaoApagar = document.createElement('button');
        texto.textContent = review.texto;
        botaoApagar.type = 'button';
        botaoApagar.className = 'botao-remover-gerenciamento';
        botaoApagar.textContent = 'Apagar';
        botaoApagar.setAttribute('aria-label', `Apagar review: ${review.texto.slice(0, 60)}`);
        botaoApagar.addEventListener('click', () => {
            try {
                const atualizadas = lerListaSalva(chaveReviews)
                    .filter(itemSalvo => itemSalvo.id !== review.id);
                salvarLista(chaveReviews, atualizadas);
                renderizarReviews();
            } catch (erro) {
                console.error('Não foi possível apagar a review.', erro);
                mensagemReviews.textContent = 'Não foi possível apagar a review.';
            }
        });
        item.append(texto, botaoApagar);
        listaReviews.append(item);
    });
}

function renderizarFavoritos() {
    const favoritos = lerListaSalva(chaveFavoritos).filter(nome => typeof nome === 'string');
    listaFavoritos.replaceChildren();
    mensagemFavoritos.textContent = favoritos.length
        ? 'Seus restaurantes marcados como favoritos.'
        : 'Você ainda não tem restaurantes favoritos.';

    favoritos.forEach(nome => {
        const item = document.createElement('li');
        const texto = document.createElement('span');
        const botaoRemover = document.createElement('button');
        texto.textContent = nome;
        botaoRemover.type = 'button';
        botaoRemover.className = 'botao-remover-gerenciamento';
        botaoRemover.textContent = 'Remover';
        botaoRemover.setAttribute('aria-label', `Remover ${nome} dos favoritos`);
        botaoRemover.addEventListener('click', () => {
            try {
                const atualizados = lerListaSalva(chaveFavoritos)
                    .filter(favorito => favorito !== nome);
                salvarLista(chaveFavoritos, atualizados);
                renderizarFavoritos();
            } catch (erro) {
                console.error('Não foi possível remover o restaurante dos favoritos.', erro);
                mensagemFavoritos.textContent = 'Não foi possível atualizar seus favoritos.';
            }
        });
        item.append(texto, botaoRemover);
        listaFavoritos.append(item);
    });
}

carregarPerfil();
quantidadeReviews.textContent = String(lerListaSalva(chaveReviews).length);

function prepararFotoPerfil(arquivo) {
    return new Promise((resolve, reject) => {
        const urlTemporaria = URL.createObjectURL(arquivo);
        const imagem = new Image();

        imagem.onload = () => {
            URL.revokeObjectURL(urlTemporaria);
            const escala = Math.min(1, 512 / Math.max(imagem.width, imagem.height));
            const largura = Math.max(1, Math.round(imagem.width * escala));
            const altura = Math.max(1, Math.round(imagem.height * escala));
            const canvas = document.createElement('canvas');
            canvas.width = largura;
            canvas.height = altura;

            const contexto = canvas.getContext('2d');
            if (!contexto) {
                reject(new Error('Não foi possível preparar a imagem selecionada.'));
                return;
            }

            contexto.fillStyle = '#f5f1dc';
            contexto.fillRect(0, 0, largura, altura);
            contexto.drawImage(imagem, 0, 0, largura, altura);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };

        imagem.onerror = () => {
            URL.revokeObjectURL(urlTemporaria);
            reject(new Error('Não foi possível abrir a imagem selecionada.'));
        };

        imagem.src = urlTemporaria;
    });
}

campoFotoPerfil.addEventListener('change', () => {
    const arquivo = campoFotoPerfil.files[0];
    fotoSelecionada = arquivo || null;

    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
        fotoSelecionada = null;
        campoFotoPerfil.value = '';
        statusEditarPerfil.textContent = 'Selecione um arquivo de imagem.';
        return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
        fotoSelecionada = null;
        campoFotoPerfil.value = '';
        statusEditarPerfil.textContent = 'A imagem deve ter no máximo 5 MB.';
        return;
    }

    statusEditarPerfil.textContent = 'A foto será atualizada ao salvar as alterações.';
});

formularioEditarPerfil.addEventListener('submit', async evento => {
    evento.preventDefault();
    statusEditarPerfil.textContent = '';

    const nome = campoNomeUsuario.value.trim();
    if (!nome) {
        statusEditarPerfil.textContent = 'Informe um nome de usuário.';
        campoNomeUsuario.focus();
        return;
    }

    try {
        const perfilAtual = JSON.parse(localStorage.getItem(chavePerfil) || '{}');
        const perfilAtualizado = {
            nome,
            foto: fotoSelecionada ? await prepararFotoPerfil(fotoSelecionada) : perfilAtual.foto || null
        };

        localStorage.setItem(chavePerfil, JSON.stringify(perfilAtualizado));
        nomeUsuario.textContent = nome;
        if (perfilAtualizado.foto) {
            fotoPerfil.src = perfilAtualizado.foto;
        }

        fotoSelecionada = null;
        campoFotoPerfil.value = '';
        statusEditarPerfil.textContent = 'Perfil atualizado com sucesso.';
    } catch (erro) {
        console.error('Não foi possível salvar as alterações do perfil.', erro);
        statusEditarPerfil.textContent = erro instanceof Error
            ? erro.message
            : 'Não foi possível salvar as alterações do perfil.';
    }
});

document.querySelectorAll('.botao-icone-review').forEach(botao => {
    botao.addEventListener('click', function() {
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
});

document.querySelector('.botao-postar').addEventListener('click', () => {
    const campoReview = document.getElementById('texto-review');
    const texto = campoReview.value.trim();
    if (!texto) {
        statusPostagem.textContent = 'Escreva sua review antes de postar.';
        campoReview.focus();
        return;
    }

    try {
        const reviews = lerListaSalva(chaveReviews);
        reviews.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            texto
        });
        salvarLista(chaveReviews, reviews);
        campoReview.value = '';
        statusPostagem.textContent = 'Review publicada.';
        quantidadeReviews.textContent = String(reviews.length);
        if (!dialogGerenciarPerfil.open || !document.getElementById('painel-reviews').hidden) {
            renderizarReviews();
        }
    } catch (erro) {
        console.error('Não foi possível publicar a review.', erro);
        statusPostagem.textContent = 'Não foi possível publicar a review.';
    }
});

document.querySelectorAll('.card-stat, .card-restaurante').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.cursor = 'pointer';
    });
});

const cardRestaurante = document.querySelector('.card-restaurante');
if (cardRestaurante) {
    cardRestaurante.addEventListener('click', function() {
        console.log('Restaurante clicado');
    });
}
