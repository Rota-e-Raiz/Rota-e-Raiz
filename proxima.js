// ====================== FILTROS ======================
// referências de elementos usados pelo painel de filtros/lista e overlay
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

const dadosRestaurantes = {
    'culinária de terreiro': {
        endereco: 'Rua do Terreiro, 18',
        horario: '12h às 22h',
        especialidade: 'Culinária afro-baiana'
    },
    'dona mariquita': {
        endereco: 'Av. Central, 100',
        horario: '11h às 23h',
        especialidade: 'Cozinha regional'
    },
    'paraíso tropical': {
        endereco: 'Praça das Flores, 44',
        horario: '18h às 00h',
        especialidade: 'Petiscos e frutos do mar'
    },
    'ki-mukeka': {
        endereco: 'Travessa da Paz, 9',
        horario: '13h às 21h',
        especialidade: 'Moquecas e peixes'
    },
    'mocotó café': {
        endereco: 'Rua do Café, 72',
        horario: '08h às 18h',
        especialidade: 'Café e cozinha regional'
    },
    'fulô': {
        endereco: 'Rua da Pedra, 57',
        horario: '17h às 00h',
        especialidade: 'Refeições contemporâneas'
    },
    'beira mar': {
        endereco: 'Av. Beira-Mar, 205',
        horario: '10h às 22h',
        especialidade: 'Frutos do mar e praia'
    },
    'sabores locais': {
        endereco: 'Rua das Pedras, 12',
        horario: '12h às 21h',
        especialidade: 'Sabores baianos'
    },
    'orla': {
        endereco: 'Orla de Salvador, 210',
        horario: '09h às 23h',
        especialidade: 'Cozinha costeira'
    }
};

function closePanels() {
    // Fecha todos os painéis laterais e oculta o overlay
    barraFiltro.classList.remove('open');
    barraLista.classList.remove('open');
    if (barraDetalhes) barraDetalhes.classList.remove('open');
    sobreposicaoFiltro.classList.remove('active');
}

function openDetails(card) {
    // abre o painel de detalhes com os dados do card selecionado
    if (!barraDetalhes || !detalhesTitulo || !detalhesImagem || !detalhesDescricao) return;
    closePanels();

    const titulo = card.querySelector('h3')?.textContent?.trim() || 'Restaurante';
    const descricao = card.querySelector('.conteudo-cartao p')?.textContent?.trim() || 'Descrição não disponível.';
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
    detalhesImagem.parentElement.hidden = !imagemSrc;
    if (imagemSrc) {
        detalhesImagem.setAttribute('src', imagemSrc);
    } else {
        detalhesImagem.removeAttribute('src');
    }
    detalhesImagem.setAttribute('alt', imagemAlt);
    detalhesEndereco.textContent = dados.endereco;
    detalhesHorario.textContent = dados.horario;
    detalhesEspecialidade.textContent = dados.especialidade;

    barraDetalhes.classList.add('open');
    sobreposicaoFiltro.classList.add('active');
}

function bindCardDetalhes(card) {
    if (!card || card.dataset.bindDetalhes === 'true') return;

    const botaoFavoritoCard = card.querySelector('.botao-favorito');
    if (botaoFavoritoCard) {
        botaoFavoritoCard.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    card.addEventListener('click', (event) => {
        if (event.target.closest('.botao-favorito')) return;
        openDetails(card);
    });

    card.dataset.bindDetalhes = 'true';
}

// Abrir filtros
botaoAbrirFiltro.addEventListener('click', () => {
    closePanels();
    barraFiltro.classList.add('open');
    sobreposicaoFiltro.classList.add('active');
});

// Abrir painel de lista rápida
botaoAbrirLista.addEventListener('click', () => {
    closePanels();
    barraLista.classList.add('open');
    sobreposicaoFiltro.classList.add('active');
});

botaoFecharFiltro.addEventListener('click', closePanels);
botaoFecharLista.addEventListener('click', closePanels);
sobreposicaoFiltro.addEventListener('click', closePanels);

// Fechar com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closePanels();
});

function atualizarValorPreco() {
    if (!faixaPreco || !valorPreco) return;
    valorPreco.textContent = `R$ ${faixaPreco.value}`;
}

if (faixaPreco) {
    faixaPreco.addEventListener('input', atualizarValorPreco);
    atualizarValorPreco();
}

// ==================== LIMPAR FILTROS (CORRIGIDO) ====================
// reseta todos os controles do painel de filtro
botaoLimparFiltro.addEventListener('click', () => {
    const checkboxes = barraFiltro.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(chk => {
        chk.checked = false;        // Agora desmarca todos
    });

    // Reseta o range de preço para um valor flexível e padrão
    if (faixaPreco) faixaPreco.value = 150;
    atualizarValorPreco();

    // Reseta o seletor de filtro (se existir)
    const seletor = barraFiltro.querySelector('.seletor-filtro');
    if (seletor) seletor.value = '';
});

// ==================== APLICAR FILTROS ====================
botaoAplicarFiltro.addEventListener('click', () => {
    // Aqui você pode colocar a lógica de filtragem no futuro
    closePanels();
});

// ==================== BOTÕES DO CARROSSEL DE CARTÕES ====================
// navegação lateral e cards extras que aparecem conforme o usuário avança
const botaoAnteriorCartoes = document.querySelector('.botao-anterior-cartoes');
const botaoProximoCartoes = document.querySelector('.botao-proximo-cartoes');
const gradeCartoes = document.getElementById('grade-restaurantes');
const gradeRestaurantesNovos = document.getElementById('grade-restaurantes-novos');

let indiceExtraVisivel = 0;

function cardWidth() {
    const primeiroCard = gradeCartoes ? gradeCartoes.querySelector('.card') : null;
    if (!primeiroCard) return 296;

    const estilo = getComputedStyle(gradeCartoes);
    const gap = parseFloat(estilo.columnGap || estilo.gap || '16');
    return primeiroCard.getBoundingClientRect().width + gap;
}

function rolarCartoes(direcao) {
    if (!gradeCartoes) return;

    const cardsExtras = Array.from(document.querySelectorAll('.card-extra'));

    if (direcao > 0 && indiceExtraVisivel < cardsExtras.length) {
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
    botaoAnteriorCartoes.addEventListener('click', () => rolarCartoes(-1));
}

if (botaoProximoCartoes && gradeCartoes) {
    botaoProximoCartoes.addEventListener('click', () => rolarCartoes(1));
}

const cardRestaurantes = Array.from(document.querySelectorAll('#grade-restaurantes .card, #cardsContainer .card, .destaque-slide'));
cardRestaurantes.forEach(bindCardDetalhes);

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
    favorito.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="#FF4D4D"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>';

    quadroImagem.append(favorito);

    const conteudo = document.createElement('div');
    conteudo.className = 'conteudo-cartao';

    const titulo = document.createElement('h3');
    titulo.textContent = restaurante.nome_estabelecimento;

    const descricao = document.createElement('p');
    descricao.textContent = restaurante.historia_estabelecimento || 'Novo restaurante cadastrado na Rota & Raiz.';

    const dados = dadosRestaurantes[(restaurante.nome_estabelecimento || '').toLowerCase()] || {
        endereco: 'Rua da Experiência, 50',
        horario: '12h às 22h',
        especialidade: 'Cozinha regional'
    };
    card.dataset.endereco = dados.endereco;
    card.dataset.horario = dados.horario;
    card.dataset.especialidade = dados.especialidade;

    conteudo.append(titulo, descricao);
    card.append(quadroImagem, conteudo);

    favorito.addEventListener('click', (event) => event.stopPropagation());
    bindCardDetalhes(card);

    return card;
}

async function carregarRestaurantesNovos() {
    if (!gradeRestaurantesNovos) return;

    const restaurantes = JSON.parse(localStorage.getItem('rotaRaizRestaurantes') || '[]');
    const estadoVazio = gradeRestaurantesNovos.querySelector('.estado-restaurantes-novos');

    if (!restaurantes.length) return;

    estadoVazio?.remove();
    restaurantes.forEach(restaurante => {
        gradeRestaurantesNovos.append(criarCardRestaurante({
            nome_estabelecimento: restaurante.nome,
            historia_estabelecimento: restaurante.historia,
            imagem_estabelecimento: restaurante.imagem
        }));
    });
}

carregarRestaurantesNovos();

if (botaoFecharDetalhes) {
    botaoFecharDetalhes.addEventListener('click', closePanels);
}

if (botaoLerHistoria) {
    botaoLerHistoria.addEventListener('click', () => {
        alert('Ler sua história em breve. Esta ação pode abrir uma página de perfil ou narrativa.');
    });
}

if (botaoAdicionarComentario && comentarioInput) {
    // ao clicar em adicionar comentário, o foco vai para a textarea
    botaoAdicionarComentario.addEventListener('click', () => {
        comentarioInput.focus();
    });
}

(function () {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.card'));
    if (!cards.length) return;

    const viewport = container.closest('.destaque-viewport');
    let index = 0;
    let paused = false;

    function render() {
        cards.forEach((card, cardIndex) => card.classList.toggle('active', cardIndex === index));
    }

    function move(direction) {
        index = (index + direction + cards.length) % cards.length;
        render();
    }

    viewport?.addEventListener('mouseenter', () => { paused = true; });
    viewport?.addEventListener('mouseleave', () => { paused = false; });
    viewport?.addEventListener('focusin', () => { paused = true; });
    viewport?.addEventListener('focusout', () => { paused = false; });

    window.setInterval(() => {
        if (!paused && document.visibilityState === 'visible') move(1);
    }, 5000);

    render();
    window.addEventListener('resize', render);
})();