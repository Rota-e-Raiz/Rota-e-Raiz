// ====================== FILTROS ======================

const botaoAbrirFiltro = document.getElementById('botao-abrir-filtro');
const barraFiltro = document.getElementById('barra-filtro');
const botaoAbrirLista = document.getElementById('botao-abrir-lista');
const barraLista = document.getElementById('barra-lista');
const sobreposicaoFiltro = document.getElementById('sobreposicao-filtro');
const botaoFecharFiltro = document.getElementById('botao-fechar-filtro');
const botaoFecharLista = document.getElementById('botao-fechar-lista');
const botaoLimparFiltro = document.getElementById('botao-limpar-filtro');
const botaoAplicarFiltro = document.getElementById('botao-aplicar-filtro');
const faixaPreco = document.getElementById('faixa-preco');
const valorPreco = document.getElementById('valor-preco');

const barraDetalhes = document.getElementById('barra-detalhes');
const botaoFecharDetalhes = document.getElementById('botao-fechar-detalhes');
const detalhesTitulo = document.getElementById('detalhes-titulo');
const detalhesImagem = document.getElementById('detalhes-imagem');
const detalhesDescricao = document.getElementById('detalhes-descricao');
const detalhesEndereco = document.getElementById('detalhes-endereco');
const detalhesHorario = document.getElementById('detalhes-horario');
const detalhesEspecialidade = document.getElementById('detalhes-especialidade');
const botaoAdicionarComentario = document.getElementById('botao-adicionar-comentario');
const botaoLerHistoria = document.getElementById('botao-ler-historia');
const comentarioInput = document.getElementById('comentario-input');

const chaveFavoritos = 'rota-raiz-restaurantes-favoritos';

// ====================== FAVORITOS ======================

function lerFavoritos() {
    try {
        const favoritos = JSON.parse(localStorage.getItem(chaveFavoritos) || '[]');

        if (!Array.isArray(favoritos) || favoritos.some(nome => typeof nome !== 'string')) {
            throw new Error('A lista de restaurantes favoritos está inválida.');
        }

        return favoritos;
    } catch (erro) {
        console.error('Não foi possível carregar os restaurantes favoritos.', erro);
        return [];
    }
}

function definirEstadoFavorito(botao, ativo, nome) {
    botao.classList.toggle('favorito-ativo', ativo);
    botao.setAttribute('aria-pressed', String(ativo));

    botao.setAttribute(
        'aria-label',
        ativo
            ? `Remover ${nome} dos favoritos`
            : `Adicionar ${nome} aos favoritos`
    );

    const icone = botao.querySelector('svg');

    if (icone) {
        icone.style.fill = ativo ? '#ff4d4d' : '#f5f1dc';
    }
}

function atualizarEstadoFavoritoCard(card, botao) {
    const nome = card.querySelector('.conteudo-cartao h3, h3')?.textContent?.trim();

    if (!nome) return;

    const favorito = lerFavoritos().some(
        item => item.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR')
    );

    definirEstadoFavorito(botao, favorito, nome);
}

function alternarFavorito(card, botao) {
    const nome = card.querySelector('.conteudo-cartao h3, h3')?.textContent?.trim();

    if (!nome) return;

    try {
        const favoritos = lerFavoritos();

        const existe = favoritos.some(
            item => item.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR')
        );

        const atualizados = existe
            ? favoritos.filter(
                item => item.toLocaleLowerCase('pt-BR') !== nome.toLocaleLowerCase('pt-BR')
            )
            : [...favoritos, nome];

        localStorage.setItem(chaveFavoritos, JSON.stringify(atualizados));

        definirEstadoFavorito(botao, !existe, nome);
    } catch (erro) {
        console.error('Não foi possível atualizar os restaurantes favoritos.', erro);
    }
}

// ====================== DADOS DOS RESTAURANTES ======================

const dadosRestaurantes = {
    'raízes de dendê': {
        endereco: 'Rua do Terreiro, 18',
        horario: '12h às 22h',
        especialidade: 'Culinária afro-baiana'
    },

    'tacho de iaiá': {
        endereco: 'Av. Central, 100',
        horario: '11h às 23h',
        especialidade: 'Cozinha regional'
    },

    'quintal dos orixás': {
        endereco: 'Praça das Flores, 44',
        horario: '18h às 00h',
        especialidade: 'Petiscos e frutos do mar'
    },

    'moqueca da lua': {
        endereco: 'Travessa da Paz, 9',
        horario: '13h às 21h',
        especialidade: 'Moquecas e peixes'
    },

    'café mandacaru': {
        endereco: 'Rua do Café, 72',
        horario: '08h às 18h',
        especialidade: 'Café e cozinha regional'
    },

    'flor de mandacaru': {
        endereco: 'Rua da Pedra, 57',
        horario: '17h às 00h',
        especialidade: 'Refeições contemporâneas'
    },

    'canto da maré': {
        endereco: 'Av. Beira-Mar, 205',
        horario: '10h às 22h',
        especialidade: 'Frutos do mar e praia'
    },

    'tempero do cacau': {
        endereco: 'Rua das Pedras, 12',
        horario: '12h às 21h',
        especialidade: 'Sabores baianos'
    },

    'maré serena': {
        endereco: 'Orla de Salvador, 210',
        horario: '09h às 23h',
        especialidade: 'Cozinha costeira'
    }
};

// ====================== PESQUISA DE RESTAURANTES ======================

const campoPesquisa = document.getElementById('pesquisa-restaurante');
const botaoPesquisa = document.querySelector('.botao-busca');
const mensagemPesquisa = document.getElementById('mensagem-pesquisa');

// Elementos que mudam durante a pesquisa.
const secaoLocalidades = document.querySelector('.subnavegacao');

const tituloPromocoes = Array.from(
    document.querySelectorAll('.secao-cartoes h2')
).find(titulo => titulo.textContent.trim() === 'Promoções e favoritos');

const nomeOriginalTitulo = 'Promoções e favoritos';

function normalizarTexto(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim();
}

function obterCardsRestaurantes() {
    return Array.from(document.querySelectorAll(
        '#cardsContainer .card, #grade-restaurantes .card, #grade-restaurantes-novos .card'
    ));
}

function prepararDadosPesquisa() {
    obterCardsRestaurantes().forEach(card => {
        const titulo = card.querySelector('h3')?.textContent?.trim() || '';
        const chaveTitulo = titulo.toLocaleLowerCase('pt-BR');
        const dados = dadosRestaurantes[chaveTitulo] || {};

        // Guarda o estado original dos cards extras.
        if (card.dataset.inicialmenteOculto === undefined) {
            card.dataset.inicialmenteOculto =
                card.classList.contains('oculto') ? 'true' : 'false';
        }

        if (dados.endereco && !card.dataset.endereco) {
            card.dataset.endereco = dados.endereco;
        }

        if (dados.especialidade && !card.dataset.especialidade) {
            card.dataset.especialidade = dados.especialidade;
        }
    });
}

function pesquisarRestaurantes() {
    if (!campoPesquisa || !mensagemPesquisa) return;

    const termo = normalizarTexto(campoPesquisa.value);
    const cards = obterCardsRestaurantes();

    let quantidadeEncontrada = 0;

    prepararDadosPesquisa();

    // Esconde as localidades durante a pesquisa.
    if (secaoLocalidades) {
        secaoLocalidades.style.display = termo !== '' ? 'none' : '';
    }

    // Altera o título da seção durante a pesquisa.
    if (tituloPromocoes) {
        tituloPromocoes.textContent = termo !== ''
            ? 'Restaurantes encontrados'
            : nomeOriginalTitulo;
    }

    cards.forEach(card => {
        const nome = card.querySelector('h3')?.textContent?.trim() || '';
        const nomeNormalizado = normalizarTexto(nome);

        const corresponde = termo === '' || nomeNormalizado.includes(termo);

        // Mostra somente os restaurantes correspondentes.
        card.hidden = !corresponde;
        card.style.display = corresponde ? '' : 'none';

        // Permite que cards extras apareçam durante a pesquisa.
        if (card.closest('#grade-restaurantes')) {
            if (termo !== '' && corresponde) {
                card.classList.remove('oculto');
            } else if (termo === '') {
                card.classList.toggle(
                    'oculto',
                    card.dataset.inicialmenteOculto === 'true'
                );
            }
        }

        if (corresponde) {
            quantidadeEncontrada++;
        }
    });

    // Esconde as seções que não possuem resultados.
    document.querySelectorAll('.secao-cartoes').forEach(secao => {
        const cardsDaSecao = Array.from(secao.querySelectorAll('.card'));

        const possuiResultado = cardsDaSecao.some(card => !card.hidden);

        secao.style.display =
            termo !== '' && !possuiResultado ? 'none' : '';
    });

    // Mostra a quantidade de resultados ou a mensagem de nenhum resultado.
    if (termo !== '' && quantidadeEncontrada === 0) {
        mensagemPesquisa.textContent =
            `Nenhum restaurante encontrado para "${campoPesquisa.value.trim()}".`;

        mensagemPesquisa.hidden = false;

    } else if (termo !== '') {
        mensagemPesquisa.textContent =
            `${quantidadeEncontrada} restaurante(s) encontrado(s).`;

        mensagemPesquisa.hidden = false;

    } else {
        mensagemPesquisa.textContent = '';
        mensagemPesquisa.hidden = true;
    }

    // Volta o carrossel ao início.
    if (gradeCartoes) {
        gradeCartoes.scrollTo({
            left: 0,
            behavior: 'smooth'
        });
    }

    // Atualiza os destaques.
    document.dispatchEvent(
        new CustomEvent('rotaRaizPesquisaAtualizada')
    );
}

// Eventos da pesquisa.
if (campoPesquisa) {
    campoPesquisa.addEventListener('input', pesquisarRestaurantes);

    campoPesquisa.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            pesquisarRestaurantes();
        }
    });
}

if (botaoPesquisa && campoPesquisa) {
    botaoPesquisa.addEventListener('click', () => {
        pesquisarRestaurantes();
        campoPesquisa.focus();
    });
}

// ====================== PAINÉIS LATERAIS ======================

function closePanels() {
    barraFiltro?.classList.remove('open');
    barraLista?.classList.remove('open');
    barraDetalhes?.classList.remove('open');
    sobreposicaoFiltro?.classList.remove('active');
}

function openDetails(card) {
    if (
        !barraDetalhes ||
        !detalhesTitulo ||
        !detalhesImagem ||
        !detalhesDescricao
    ) return;

    closePanels();

    const titulo = card.querySelector('h3')?.textContent?.trim() || 'Restaurante';

    const descricao =
        card.querySelector('.conteudo-cartao p')?.textContent?.trim() ||
        'Descrição não disponível.';

    const imagem = card.querySelector('.imagem-cartao');
    const imagemSrc = imagem?.getAttribute('src') || '';
    const imagemAlt = imagem?.getAttribute('alt') || titulo;

    const chaveTitulo = titulo.toLowerCase();

    const dados = dadosRestaurantes[chaveTitulo] || {
        endereco: 'Rua das Flores, 200',
        horario: '12h às 22h',
        especialidade: 'Cozinha regional'
    };

    detalhesTitulo.textContent = titulo;
    detalhesDescricao.textContent = descricao;

    if (detalhesImagem.parentElement) {
        detalhesImagem.parentElement.hidden = !imagemSrc;
    }

    if (imagemSrc) {
        detalhesImagem.setAttribute('src', imagemSrc);
    } else {
        detalhesImagem.removeAttribute('src');
    }

    detalhesImagem.setAttribute('alt', imagemAlt);

    if (detalhesEndereco) {
        detalhesEndereco.textContent = dados.endereco;
    }

    if (detalhesHorario) {
        detalhesHorario.textContent = dados.horario;
    }

    if (detalhesEspecialidade) {
        detalhesEspecialidade.textContent = dados.especialidade;
    }

    barraDetalhes.classList.add('open');
    sobreposicaoFiltro?.classList.add('active');
}

// ====================== EVENTOS DOS CARDS ======================

function bindCardDetalhes(card) {
    if (!card || card.dataset.bindDetalhes === 'true') return;

    const botaoFavoritoCard = card.querySelector('.botao-favorito');

    if (botaoFavoritoCard) {
        atualizarEstadoFavoritoCard(card, botaoFavoritoCard);

        botaoFavoritoCard.addEventListener('click', event => {
            event.stopPropagation();
            alternarFavorito(card, botaoFavoritoCard);
        });
    }

    card.addEventListener('click', event => {
        if (event.target.closest('.botao-favorito')) return;

        openDetails(card);
    });

    card.dataset.bindDetalhes = 'true';
}

// ====================== ABRIR E FECHAR FILTROS ======================

if (botaoAbrirFiltro) {
    botaoAbrirFiltro.addEventListener('click', () => {
        closePanels();
        barraFiltro?.classList.add('open');
        sobreposicaoFiltro?.classList.add('active');
    });
}

if (botaoAbrirLista) {
    botaoAbrirLista.addEventListener('click', () => {
        closePanels();
        barraLista?.classList.add('open');
        sobreposicaoFiltro?.classList.add('active');
    });
}

botaoFecharFiltro?.addEventListener('click', closePanels);
botaoFecharLista?.addEventListener('click', closePanels);
sobreposicaoFiltro?.addEventListener('click', closePanels);

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closePanels();
    }
});

// ====================== PREÇO ======================

function atualizarValorPreco() {
    if (!faixaPreco || !valorPreco) return;

    valorPreco.textContent = `R$ ${faixaPreco.value}`;
}

if (faixaPreco) {
    faixaPreco.addEventListener('input', atualizarValorPreco);
    atualizarValorPreco();
}

// ====================== LIMPAR FILTROS ======================

if (botaoLimparFiltro && barraFiltro) {
    botaoLimparFiltro.addEventListener('click', () => {
        const checkboxes = barraFiltro.querySelectorAll(
            'input[type="checkbox"]'
        );

        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        if (faixaPreco) {
            faixaPreco.value = 150;
        }

        atualizarValorPreco();

        const seletor = barraFiltro.querySelector('.seletor-filtro');

        if (seletor) {
            seletor.value = '';
        }
    });
}

// ====================== APLICAR FILTROS ======================

if (botaoAplicarFiltro) {
    botaoAplicarFiltro.addEventListener('click', () => {
        closePanels();
    });
}

// ====================== CARROSSEL DE CARTÕES ======================

const botaoAnteriorCartoes = document.querySelector('.botao-anterior-cartoes');
const botaoProximoCartoes = document.querySelector('.botao-proximo-cartoes');

const gradeCartoes = document.getElementById('grade-restaurantes');
const gradeRestaurantesNovos = document.getElementById('grade-restaurantes-novos');

const imagensRestaurantes = {
    'raízes de dendê': 'imagem restaurantes/raizes-de-dende.jpg',
    'tacho de iaiá': 'imagem restaurantes/tacho-de-iaia.jpg',
    'maré serena': 'imagem restaurantes/mare-serena.jpg',
    'flor de mandacaru': 'imagem restaurantes/flor-de-mandacaru.jpg',
    'canto da maré': 'imagem restaurantes/canto-da-mare.jpg',
    'tempero do cacau': 'imagem restaurantes/tempero-do-cacau.jpg',
    'quintal dos orixás': 'imagem restaurantes/quintal-dos-orixas.jpg',
    'moqueca da lua': 'imagem restaurantes/moqueca-da-lua.jpg',
    'café mandacaru': 'imagem restaurantes/cafe-mandacaru.jpg'
};

// Adiciona imagens aos cards que ainda não possuem imagem.
document.querySelectorAll('.quadro-imagem-cartao.sem-imagem').forEach(quadro => {
    const nomeRestaurante = quadro
        .closest('.card')
        ?.querySelector('h3')
        ?.textContent
        ?.trim();

    const caminhoImagem =
        imagensRestaurantes[nomeRestaurante?.toLocaleLowerCase('pt-BR')];

    if (!caminhoImagem) return;

    const imagem = document.createElement('img');

    imagem.className = 'imagem-cartao';
    imagem.src = caminhoImagem;
    imagem.alt = nomeRestaurante;

    quadro.classList.remove('sem-imagem');
    quadro.prepend(imagem);
});

let indiceExtraVisivel = 0;

function cardWidth() {
    const primeiroCard = gradeCartoes
        ? gradeCartoes.querySelector('.card')
        : null;

    if (!primeiroCard) return 296;

    const estilo = getComputedStyle(gradeCartoes);
    const gap = parseFloat(estilo.columnGap || estilo.gap || '16');

    return primeiroCard.getBoundingClientRect().width + gap;
}

function rolarCartoes(direcao) {
    if (!gradeCartoes) return;

    const cardsExtras = Array.from(
        document.querySelectorAll('.card-extra')
    );

    if (
        direcao > 0 &&
        indiceExtraVisivel < cardsExtras.length
    ) {
        cardsExtras[indiceExtraVisivel].classList.remove('oculto');
        indiceExtraVisivel += 1;
    }

    if (direcao < 0 && indiceExtraVisivel > 0) {
        indiceExtraVisivel -= 1;
        cardsExtras[indiceExtraVisivel].classList.add('oculto');
    }

    gradeCartoes.scrollBy({
        left: direcao * cardWidth(),
        behavior: 'smooth'
    });
}

if (botaoAnteriorCartoes && gradeCartoes) {
    botaoAnteriorCartoes.addEventListener('click', () => {
        rolarCartoes(-1);
    });
}

if (botaoProximoCartoes && gradeCartoes) {
    botaoProximoCartoes.addEventListener('click', () => {
        rolarCartoes(1);
    });
}

// ====================== CARDS DE RESTAURANTES ======================

const cardRestaurantes = Array.from(
    document.querySelectorAll(
        '#grade-restaurantes .card, #cardsContainer .card, .destaque-slide'
    )
);

cardRestaurantes.forEach(bindCardDetalhes);

// ====================== CRIAR CARD DE RESTAURANTE ======================

function criarCardRestaurante(restaurante) {
    const card = document.createElement('article');

    const imagem = restaurante.imagem_estabelecimento;

    card.className = 'card card-novo';
    card.dataset.nome = restaurante.nome_estabelecimento || 'Restaurante';

    const quadroImagem = document.createElement('div');
    quadroImagem.className = 'quadro-imagem-cartao';

    if (imagem) {
        const imagemElemento = document.createElement('img');

        imagemElemento.className = 'imagem-cartao';
        imagemElemento.src = imagem;
        imagemElemento.alt = restaurante.nome_estabelecimento;

        quadroImagem.append(imagemElemento);
    } else {
        quadroImagem.classList.add('sem-imagem');
    }

    const favorito = document.createElement('button');

    favorito.className = 'botao-favorito';
    favorito.type = 'button';
    favorito.setAttribute('aria-label', 'Favorito');

    favorito.innerHTML = `
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#FF4D4D">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
            2 5.42 4.42 3 7.5 3c1.74 0 3.41.81
            4.5 2.09C13.09 3.81 14.76 3 16.5
            3 19.58 3 22 5.42 22 8.5c0 3.78-3.4
            6.86-8.55 11.54L12 21.35z" />
        </svg>
    `;

    quadroImagem.append(favorito);

    const conteudo = document.createElement('div');
    conteudo.className = 'conteudo-cartao';

    const titulo = document.createElement('h3');
    titulo.textContent = restaurante.nome_estabelecimento;

    const descricao = document.createElement('p');

    descricao.textContent =
        restaurante.historia_estabelecimento ||
        'Novo restaurante cadastrado na Rota & Raiz.';

    const dados = dadosRestaurantes[
        (restaurante.nome_estabelecimento || '').toLowerCase()
    ] || {
        endereco: 'Rua da Experiência, 50',
        horario: '12h às 22h',
        especialidade: 'Cozinha regional'
    };

    card.dataset.endereco = dados.endereco;
    card.dataset.horario = dados.horario;
    card.dataset.especialidade = dados.especialidade;

    conteudo.append(titulo, descricao);
    card.append(quadroImagem, conteudo);

    favorito.addEventListener('click', event => {
        event.stopPropagation();
    });

    bindCardDetalhes(card);

    return card;
}

// ====================== CARREGAR RESTAURANTES NOVOS ======================

async function carregarRestaurantesNovos() {
    if (!gradeRestaurantesNovos) return;

    let restaurantes = [];

    try {
        restaurantes = JSON.parse(
            localStorage.getItem('rotaRaizRestaurantes') || '[]'
        );
    } catch (erro) {
        console.error('Erro ao carregar restaurantes cadastrados.', erro);
        return;
    }

    const estadoVazio = gradeRestaurantesNovos.querySelector(
        '.estado-restaurantes-novos'
    );

    if (!restaurantes.length) return;

    estadoVazio?.remove();

    restaurantes.forEach(restaurante => {
        const card = criarCardRestaurante({
            nome_estabelecimento: restaurante.nome,
            historia_estabelecimento: restaurante.historia,
            imagem_estabelecimento: restaurante.imagem
        });

        gradeRestaurantesNovos.append(card);
    });

    // Atualiza os dados da pesquisa para incluir os novos cards.
    prepararDadosPesquisa();

    // Se já existir uma pesquisa, aplica o termo aos novos restaurantes.
    if (campoPesquisa?.value.trim()) {
        pesquisarRestaurantes();
    }
}

carregarRestaurantesNovos();
prepararDadosPesquisa();

// ====================== DETALHES DO RESTAURANTE ======================

if (botaoFecharDetalhes) {
    botaoFecharDetalhes.addEventListener('click', closePanels);
}

if (botaoLerHistoria) {
    botaoLerHistoria.addEventListener('click', () => {
        alert(
            'Ler sua história em breve. Esta ação pode abrir uma página de perfil ou narrativa.'
        );
    });
}

if (botaoAdicionarComentario && comentarioInput) {
    botaoAdicionarComentario.addEventListener('click', () => {
        comentarioInput.focus();
    });
}

// ====================== DESTAQUES AUTOMÁTICOS ======================

(function () {
    const container = document.getElementById('cardsContainer');

    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.card'));

    if (!cards.length) return;

    const viewport = container.closest('.destaque-viewport');

    let index = 0;
    let paused = false;

    function obterCardsVisiveis() {
        return cards.filter(card => !card.hidden);
    }

    function render() {
        const cardsVisiveis = obterCardsVisiveis();

        cards.forEach(card => {
            card.classList.remove('active');
        });

        if (!cardsVisiveis.length) return;

        if (index >= cardsVisiveis.length) {
            index = 0;
        }

        cardsVisiveis[index].classList.add('active');
    }

    function move(direction) {
        const cardsVisiveis = obterCardsVisiveis();

        if (!cardsVisiveis.length) return;

        index = (
            index + direction + cardsVisiveis.length
        ) % cardsVisiveis.length;

        render();
    }

    document.addEventListener('rotaRaizPesquisaAtualizada', () => {
        index = 0;
        render();
    });

    viewport?.addEventListener('mouseenter', () => {
        paused = true;
    });

    viewport?.addEventListener('mouseleave', () => {
        paused = false;
    });

    viewport?.addEventListener('focusin', () => {
        paused = true;
    });

    viewport?.addEventListener('focusout', () => {
        paused = false;
    });

    window.setInterval(() => {
        if (!paused && document.visibilityState === 'visible') {
            move(1);
        }
    }, 5000);

    render();

    window.addEventListener('resize', render);
})();
