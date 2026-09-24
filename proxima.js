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

    detalhesTitulo.textContent = titulo;
    detalhesDescricao.textContent = descricao;
    detalhesImagem.setAttribute('src', imagemSrc);
    detalhesImagem.setAttribute('alt', imagemAlt);
    detalhesEndereco.textContent = 'Av. Central, 100'; // valor fixo por enquanto
    detalhesHorario.textContent = '11h às 23h';
    detalhesEspecialidade.textContent = titulo.includes('Beira') ? 'Frutos do mar' : 'Cozinha regional';

    barraDetalhes.classList.add('open');
    sobreposicaoFiltro.classList.add('active');
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

// ==================== LIMPAR FILTROS (CORRIGIDO) ====================
// reseta todos os controles do painel de filtro
botaoLimparFiltro.addEventListener('click', () => {
    const checkboxes = barraFiltro.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(chk => {
        chk.checked = false;        // Agora desmarca todos
    });

    // Reseta o range de preço
    const precoRange = barraFiltro.querySelector('.faixa-preco');
    if (precoRange) precoRange.value = 4;

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

const cardRestaurantes = Array.from(document.querySelectorAll('#grade-restaurantes .card'));
cardRestaurantes.forEach(card => {
    // cada card abre o painel de detalhes ao ser clicado
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
});

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