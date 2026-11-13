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
const detalhesLocalidade = document.getElementById('detalhes-localidade');
const detalhesTipo = document.getElementById('detalhes-tipo');
const detalhesPreco = document.getElementById('detalhes-preco');
const detalhesAmbientes = document.getElementById('detalhes-ambientes');
const detalhesTelefone = document.getElementById('detalhes-telefone');
const detalhesHorario = document.getElementById('detalhes-horario');
const detalhesEspecialidade = document.getElementById('detalhes-especialidade');
const botaoAdicionarComentario = document.getElementById('botao-adicionar-comentario');
const botaoLerHistoria = document.getElementById('botao-ler-historia');
const comentarioInput = document.getElementById('comentario-input');
const listaComentarios = document.getElementById('lista-comentarios');
const mensagemComentario = document.getElementById('mensagem-comentario');
const chaveFavoritos = 'rota-raiz-restaurantes-favoritos';
const secaoDestaques = document.getElementById('destaques');
const secaoExplorar = document.getElementById('secao-explorar');
const metadadosRestaurantesDemo = {
    'raizes de dende': { tipo: 'Restaurante', localidade: 'Centro', preco: 120, ambientes: ['Aberto', 'Com música'] },
    'flor de mandacaru': { tipo: 'Restaurante', localidade: 'Inocoop', preco: 80, ambientes: ['Aberto', 'Área kids'] },
    'canto da mare': { tipo: 'Restaurante', localidade: 'Orla de Camaçari', preco: 170, ambientes: ['Aberto'] },
    'tempero do cacau': { tipo: 'Restaurante', localidade: 'Bairro dos 46', preco: 90, ambientes: ['Aberto', 'Com música'] },
    'tacho de iaia': { tipo: 'Restaurante', localidade: 'Centro', preco: 110, ambientes: ['Aberto', 'Com música'] },
    'quintal dos orixas': { tipo: 'Restaurante', localidade: 'Inocoop', preco: 140, ambientes: ['Aberto', 'Área kids', 'Com música'] },
    'moqueca da lua': { tipo: 'Restaurante', localidade: 'Orla de Camaçari', preco: 160, ambientes: ['Aberto', 'Com música'] },
    'cafe mandacaru': { tipo: 'Cafeteria', localidade: 'Orla de Camaçari', preco: 50, ambientes: ['Aberto'] },
    'mare serena': { tipo: 'Restaurante', localidade: 'Orla de Camaçari', preco: 180, ambientes: ['Aberto'] }
};

function normalizarTextoFiltro(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLocaleLowerCase('pt-BR');
}

function obterLocalidade(endereco) {
    const texto = normalizarTextoFiltro(endereco);
    if (texto.includes('bairro dos 46') || /\b46\b/.test(texto)) return 'Bairro dos 46';
    if (texto.includes('orla de camacari')) return 'Orla de Camaçari';
    const localidade = ['Centro', 'Inocoop', 'Bomba', 'Limoeiro']
        .find(item => texto.includes(normalizarTextoFiltro(item)));
    return localidade || 'Orla de Camaçari';
}

function obterMetadadosFiltro(nome, restaurante = {}) {
    if (restaurante.tipo || restaurante.endereco || restaurante.localizacao) {
        return {
            tipo: restaurante.tipo || 'Restaurante',
            localidade: restaurante.localidade || obterLocalidade(restaurante.endereco || restaurante.localizacao),
            preco: restaurante.precoMedio == null || restaurante.precoMedio === ''
                ? null
                : Number(restaurante.precoMedio),
            ambientes: Array.isArray(restaurante.ambientes) ? restaurante.ambientes : []
        };
    }

    const dadosDemo = metadadosRestaurantesDemo[normalizarTextoFiltro(nome)];
    if (dadosDemo) return dadosDemo;

    return {
        tipo: restaurante.tipo || 'Restaurante',
        localidade: restaurante.localidade || obterLocalidade(restaurante.endereco || restaurante.localizacao),
        preco: restaurante.precoMedio == null || restaurante.precoMedio === ''
            ? null
            : Number(restaurante.precoMedio),
        ambientes: Array.isArray(restaurante.ambientes) ? restaurante.ambientes : []
    };
}

function adicionarMetadadosFiltro(card, restaurante = {}) {
    const nome = card.querySelector('h3')?.textContent?.trim() || restaurante.nome || '';
    const dados = obterMetadadosFiltro(nome, restaurante);
    card.dataset.tipo = dados.tipo;
    card.dataset.localidade = dados.localidade;
    card.dataset.preco = dados.preco == null ? '' : String(dados.preco);
    card.dataset.ambientes = dados.ambientes.join('|');
}

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
    botao.setAttribute('aria-label', ativo
        ? `Remover ${nome} dos favoritos`
        : `Adicionar ${nome} aos favoritos`);
    const icone = botao.querySelector('svg');
    if (icone) {
        icone.style.fill = ativo ? '#ff4d4d' : '#f5f1dc';
    }
}

function atualizarEstadoFavoritoCard(card, botao) {
    const nome = card.querySelector('.conteudo-cartao h3, h3')?.textContent?.trim();
    if (!nome) return;
    const favorito = lerFavoritos().some(item => item.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'));
    definirEstadoFavorito(botao, favorito, nome);
}

function alternarFavorito(card, botao) {
    const nome = card.querySelector('.conteudo-cartao h3, h3')?.textContent?.trim();
    if (!nome) return;

    try {
        const favoritos = lerFavoritos();
        const existe = favoritos.some(item => item.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'));
        const atualizados = existe
            ? favoritos.filter(item => item.toLocaleLowerCase('pt-BR') !== nome.toLocaleLowerCase('pt-BR'))
            : [...favoritos, nome];
        localStorage.setItem(chaveFavoritos, JSON.stringify(atualizados));
        definirEstadoFavorito(botao, !existe, nome);
    } catch (erro) {
        console.error('Não foi possível atualizar os restaurantes favoritos.', erro);
    }
}

const dadosRestaurantes = {
    'raízes de dendê': {
        endereco: 'Rua do Terreiro, 18 - Centro',
        horario: '12h às 22h',
        especialidade: 'Culinária afro-baiana',
        ...metadadosRestaurantesDemo['raizes de dende']
    },
    'tacho de iaiá': {
        endereco: 'Av. Central, 100 - Centro',
        horario: '11h às 23h',
        especialidade: 'Cozinha regional',
        ...metadadosRestaurantesDemo['tacho de iaia']
    },
    'quintal dos orixás': {
        endereco: 'Praça das Flores, 44 - Inocoop',
        horario: '18h às 00h',
        especialidade: 'Petiscos e frutos do mar',
        ...metadadosRestaurantesDemo['quintal dos orixas']
    },
    'moqueca da lua': {
        endereco: 'Travessa da Paz, 9 - Orla de Camaçari',
        horario: '13h às 21h',
        especialidade: 'Moquecas e peixes',
        ...metadadosRestaurantesDemo['moqueca da lua']
    },
    'café mandacaru': {
        endereco: 'Rua do Café, 72 - Orla de Camaçari',
        horario: '08h às 18h',
        especialidade: 'Café e cozinha regional',
        ...metadadosRestaurantesDemo['cafe mandacaru']
    },
    'flor de mandacaru': {
        endereco: 'Rua da Pedra, 57 - Inocoop',
        horario: '17h às 00h',
        especialidade: 'Refeições contemporâneas',
        ...metadadosRestaurantesDemo['flor de mandacaru']
    },
    'canto da maré': {
        endereco: 'Av. Beira-Mar, 205 - Orla de Camaçari',
        horario: '10h às 22h',
        especialidade: 'Frutos do mar e praia',
        ...metadadosRestaurantesDemo['canto da mare']
    },
    'tempero do cacau': {
        endereco: 'Rua das Pedras, 12 - Bairro dos 46',
        horario: '12h às 21h',
        especialidade: 'Sabores baianos',
        ...metadadosRestaurantesDemo['tempero do cacau']
    },
    'maré serena': {
        endereco: 'Av. Beira-Mar, 210 - Orla de Camaçari',
        horario: '09h às 23h',
        especialidade: 'Cozinha costeira',
        ...metadadosRestaurantesDemo['mare serena']
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
    const chaveTitulo = normalizarTextoFiltro(titulo);
    const dados = Object.entries(dadosRestaurantes)
        .find(([nome]) => normalizarTextoFiltro(nome) === chaveTitulo)?.[1] || {
        endereco: 'Rua das Flores, 200',
        horario: '12h às 22h',
        especialidade: 'Cozinha regional',
        localidade: card.dataset.localidade || 'Orla de Camaçari',
        tipo: card.dataset.tipo || 'Restaurante',
        preco: Number(card.dataset.preco) || 0,
        ambientes: (card.dataset.ambientes || '').split('|').filter(Boolean)
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
    detalhesEndereco.textContent = card.dataset.endereco || dados.endereco;
    detalhesLocalidade.textContent = card.dataset.localidade || dados.localidade || 'Orla de Camaçari';
    detalhesTipo.textContent = card.dataset.tipo || dados.tipo || 'Restaurante';
    detalhesPreco.textContent = card.dataset.preco
        ? `R$ ${card.dataset.preco} por pessoa`
        : dados.preco
            ? `R$ ${dados.preco} por pessoa`
            : 'Não informado';
    const ambientes = (card.dataset.ambientes || '').split('|').filter(Boolean);
    detalhesAmbientes.textContent = ambientes.length
        ? ambientes.join(', ')
        : (dados.ambientes || []).join(', ') || 'Não informado';
    detalhesTelefone.textContent = card.dataset.telefone || 'Não informado';
    detalhesHorario.textContent = card.dataset.horario || dados.horario || 'Não informado';
    detalhesEspecialidade.textContent = card.dataset.especialidade || dados.especialidade || 'Culinária regional';
    carregarComentarios(card.dataset.id);

    barraDetalhes.classList.add('open');
    sobreposicaoFiltro.classList.add('active');
}

function bindCardDetalhes(card) {
    if (!card || card.dataset.bindDetalhes === 'true') return;

    const botaoFavoritoCard = card.querySelector('.botao-favorito');
    if (botaoFavoritoCard) {
        atualizarEstadoFavoritoCard(card, botaoFavoritoCard);
        botaoFavoritoCard.addEventListener('click', (event) => {
            event.stopPropagation();
            alternarFavorito(card, botaoFavoritoCard);
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

// ==================== BOTÕES DO CARROSSEL DE CARTÕES ====================
// navegação lateral e cards extras que aparecem conforme o usuário avança
const botaoAnteriorCartoes = document.querySelector('.botao-anterior-cartoes');
const botaoProximoCartoes = document.querySelector('.botao-proximo-cartoes');
const gradeCartoes = document.getElementById('grade-restaurantes');
const gradeRestaurantesNovos = document.getElementById('grade-restaurantes-novos');
const cardsContainer = document.getElementById('cardsContainer');
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

document.querySelectorAll('.quadro-imagem-cartao.sem-imagem').forEach((quadro) => {
    const nomeRestaurante = quadro.closest('.card')?.querySelector('h3')?.textContent?.trim();
    const caminhoImagem = imagensRestaurantes[nomeRestaurante?.toLocaleLowerCase('pt-BR')];
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

function criarCardDestaque(restaurante) {
    const card = document.createElement('article');
    card.className = 'card destaque-slide';
    card.dataset.id = String(restaurante.id);
    card.dataset.endereco = restaurante.endereco || '';
    card.dataset.horario = restaurante.horario || '';
    card.dataset.especialidade = restaurante.especialidade || '';
    card.dataset.telefone = restaurante.telefone || '';

    const quadroImagem = document.createElement('div');
    quadroImagem.className = 'quadro-imagem-cartao';
    const imagem = document.createElement('img');
    imagem.className = 'imagem-cartao';
    imagem.src = restaurante.imagem || imagensRestaurantes[restaurante.nome?.toLocaleLowerCase('pt-BR')] || '';
    imagem.alt = `Imagem do restaurante ${restaurante.nome}`;
    quadroImagem.append(imagem);

    const favorito = document.createElement('button');
    favorito.className = 'botao-favorito';
    favorito.type = 'button';
    favorito.setAttribute('aria-label', 'Favorito');
    favorito.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="#FF4D4D"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>';
    quadroImagem.append(favorito);

    const conteudo = document.createElement('div');
    conteudo.className = 'conteudo-cartao';
    const titulo = document.createElement('h3');
    titulo.textContent = restaurante.nome;
    const descricao = document.createElement('p');
    descricao.textContent = restaurante.historia || 'Restaurante em destaque na Rota & Raiz.';
    conteudo.append(titulo, descricao);
    card.append(quadroImagem, conteudo);
    adicionarMetadadosFiltro(card, restaurante);
    bindCardDetalhes(card);
    return card;
}

async function carregarDestaquesDoBanco() {
    try {
        const response = await fetch('/api/destaques', { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Não foi possível carregar os destaques confirmados.');
        const { destaques } = await response.json();
        if (destaques.length) {
            cardsContainer.replaceChildren(...destaques.map(criarCardDestaque));
        }
    } catch (error) {
        console.error('Não foi possível carregar os destaques pagos.', error);
    }
}

const cardRestaurantes = Array.from(document.querySelectorAll('#grade-restaurantes .card, #cardsContainer .card, .destaque-slide'));
cardRestaurantes.forEach(card => {
    adicionarMetadadosFiltro(card);
    bindCardDetalhes(card);
});

function criarCardRestaurante(restaurante) {
    const card = document.createElement('article');
    const nomeRestaurante = restaurante.nome_estabelecimento || 'Restaurante';
    const imagem = restaurante.imagem_estabelecimento
        || imagensRestaurantes[nomeRestaurante.toLocaleLowerCase('pt-BR')]
        || '';
    card.className = 'card card-novo';
    card.dataset.nome = nomeRestaurante;
    if (restaurante.id) card.dataset.id = String(restaurante.id);

    const quadroImagem = document.createElement('div');
    quadroImagem.className = 'quadro-imagem-cartao';

    if (imagem) {
        const imagemElemento = document.createElement('img');
        imagemElemento.className = 'imagem-cartao';
        imagemElemento.src = imagem;
        imagemElemento.alt = nomeRestaurante;
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
    titulo.textContent = nomeRestaurante;

    const descricao = document.createElement('p');
    descricao.textContent = restaurante.historia_estabelecimento || 'Novo restaurante cadastrado na Rota & Raiz.';

    const nomeNormalizado = normalizarTextoFiltro(restaurante.nome_estabelecimento);
    const dados = Object.entries(dadosRestaurantes)
        .find(([nome]) => normalizarTextoFiltro(nome) === nomeNormalizado)?.[1] || {
        endereco: restaurante.endereco || restaurante.localidade || 'Endereço não informado',
        horario: restaurante.horario || 'Não informado',
        especialidade: restaurante.especialidade || 'Cozinha regional'
    };
    card.dataset.endereco = restaurante.endereco || dados.endereco;
    card.dataset.horario = restaurante.horario || dados.horario;
    card.dataset.especialidade = restaurante.especialidade || dados.especialidade;
    card.dataset.telefone = restaurante.telefone || '';
    adicionarMetadadosFiltro(card, restaurante);

    conteudo.append(titulo, descricao);
    card.append(quadroImagem, conteudo);

    favorito.addEventListener('click', (event) => event.stopPropagation());
    bindCardDetalhes(card);

    return card;
}

async function carregarRestaurantesNovos(restaurantes) {
    if (!gradeRestaurantesNovos) return;
    const estadoVazio = gradeRestaurantesNovos.querySelector('.estado-restaurantes-novos');
    const cadastrados = restaurantes.filter(restaurante => !restaurante.codigoDemo);

    if (!cadastrados.length) return;

    estadoVazio?.remove();
    gradeRestaurantesNovos.replaceChildren(...cadastrados.map(restaurante =>
        criarCardRestaurante({
            id: restaurante.id,
            nome_estabelecimento: restaurante.nome,
            historia_estabelecimento: restaurante.historia,
            imagem_estabelecimento: restaurante.imagem,
            tipo: restaurante.tipo,
            endereco: restaurante.endereco,
            localidade: restaurante.localidade,
            precoMedio: restaurante.precoMedio,
            ambientes: restaurante.ambientes,
            telefone: restaurante.telefone,
            horario: restaurante.horario,
            especialidade: restaurante.especialidade
        })
    ));
}

async function carregarRestaurantesDoBanco() {
    try {
        const response = await fetch('/api/restaurantes', { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Não foi possível carregar os restaurantes do banco de dados.');
        const { restaurantes } = await response.json();
        gradeCartoes.replaceChildren(...restaurantes.map(restaurante => criarCardRestaurante({
            id: restaurante.id,
            nome_estabelecimento: restaurante.nome,
            historia_estabelecimento: restaurante.historia,
            imagem_estabelecimento: restaurante.imagem,
            tipo: restaurante.tipo,
            endereco: restaurante.endereco,
            localidade: restaurante.localidade,
            precoMedio: restaurante.precoMedio,
            ambientes: restaurante.ambientes,
            telefone: restaurante.telefone,
            horario: restaurante.horario,
            especialidade: restaurante.especialidade
        })));
        await carregarRestaurantesNovos(restaurantes);
        aplicarFiltrosRestaurantes();
        carregarRestaurantesDoBanco();
        carregarDestaquesDoBanco();
    } catch (error) {
        console.error('Não foi possível carregar os dados do restaurante.', error);
        const aviso = document.createElement('p');
        aviso.className = 'estado-restaurantes-novos';
        aviso.textContent = 'Não foi possível conectar ao banco de dados. Verifique se o servidor está em execução.';
        gradeCartoes.replaceChildren(aviso);
    }
}

function aplicarFiltrosRestaurantes() {
    const tiposSelecionados = Array.from(barraFiltro.querySelectorAll('input[name="tipo"]:checked'))
        .map(input => normalizarTextoFiltro(input.value));
    const ambientesSelecionados = Array.from(barraFiltro.querySelectorAll('input[name="ambiente"]:checked'))
        .map(input => normalizarTextoFiltro(input.value));
    const localidadesSelecionadas = Array.from(document.querySelectorAll('input[name="localidade"]:checked'))
        .map(input => normalizarTextoFiltro(input.value));
    const totalLocalidades = document.querySelectorAll('input[name="localidade"]').length;
    const precoMaximo = Number(faixaPreco.value);
    const filtroPrecoAtivo = precoMaximo < Number(faixaPreco.max);
    const busca = normalizarTextoFiltro(document.querySelector('.entrada-busca').value);
    const cartoes = Array.from(document.querySelectorAll(
        '#cardsContainer .destaque-slide, #grade-restaurantes .card, #grade-restaurantes-novos .card'
    ));
    const restaurantesVisiveis = new Set();

    cartoes.forEach(card => {
        const tipo = normalizarTextoFiltro(card.dataset.tipo);
        const localidade = normalizarTextoFiltro(card.dataset.localidade);
        const ambientes = (card.dataset.ambientes || '').split('|').map(normalizarTextoFiltro);
        const preco = card.dataset.preco === '' ? null : Number(card.dataset.preco);
        const textoCartao = normalizarTextoFiltro(card.textContent);
        const corresponde =
            (!tiposSelecionados.length || tiposSelecionados.includes(tipo))
            && (!ambientesSelecionados.length || ambientesSelecionados.some(ambiente => ambientes.includes(ambiente)))
            && localidadesSelecionadas.includes(localidade)
            && (preco === null ? !filtroPrecoAtivo : preco <= precoMaximo)
            && (!busca || textoCartao.includes(busca));

        card.classList.toggle('oculto-filtro', !corresponde);
        if (corresponde) {
            const nome = card.querySelector('h3')?.textContent?.trim() || '';
            restaurantesVisiveis.add(normalizarTextoFiltro(nome));
        }
    });

    const statusFiltros = document.getElementById('status-filtros');
    const quantidadeVisivel = restaurantesVisiveis.size;
    statusFiltros.textContent = quantidadeVisivel === 0
        ? 'Nenhum restaurante encontrado com esses filtros.'
        : `${quantidadeVisivel} ${quantidadeVisivel === 1 ? 'restaurante encontrado' : 'restaurantes encontrados'}.`;

    const filtrosAtivos =
        localidadesSelecionadas.length !== totalLocalidades
        || tiposSelecionados.length > 0
        || ambientesSelecionados.length > 0
        || filtroPrecoAtivo
        || Boolean(busca);
    const destaquesEstaoAbaixo = secaoDestaques.previousElementSibling === secaoExplorar;

    if (filtrosAtivos && !destaquesEstaoAbaixo) {
        secaoExplorar.insertAdjacentElement('afterend', secaoDestaques);
        secaoExplorar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!filtrosAtivos && destaquesEstaoAbaixo) {
        secaoExplorar.insertAdjacentElement('beforebegin', secaoDestaques);
    }
}

document.querySelectorAll('input[name="localidade"]').forEach(input => {
    input.addEventListener('change', aplicarFiltrosRestaurantes);
});

document.querySelector('.entrada-busca').addEventListener('input', aplicarFiltrosRestaurantes);
document.querySelector('.botao-busca').addEventListener('click', () => {
    aplicarFiltrosRestaurantes();
    document.getElementById('destaques').scrollIntoView({ behavior: 'smooth' });
});

botaoAplicarFiltro.addEventListener('click', () => {
    aplicarFiltrosRestaurantes();
    closePanels();
});

botaoLimparFiltro.addEventListener('click', () => {
    barraFiltro.querySelectorAll('input[name="tipo"], input[name="ambiente"]').forEach(input => {
        input.checked = false;
    });
    document.querySelectorAll('input[name="localidade"]').forEach(input => {
        input.checked = true;
    });
    faixaPreco.value = faixaPreco.max;
    document.querySelector('.entrada-busca').value = '';
    atualizarValorPreco();
    aplicarFiltrosRestaurantes();
});

aplicarFiltrosRestaurantes();

if (botaoFecharDetalhes) {
    botaoFecharDetalhes.addEventListener('click', closePanels);
}

if (botaoLerHistoria) {
    botaoLerHistoria.addEventListener('click', () => {
        alert('Ler sua história em breve. Esta ação pode abrir uma página de perfil ou narrativa.');
    });
}

if (botaoAdicionarComentario && comentarioInput) {
    botaoAdicionarComentario.addEventListener('click', async () => {
        const restauranteId = barraDetalhes.dataset.restauranteId;
        const texto = comentarioInput.value.trim();
        if (!restauranteId) {
            mensagemComentario.textContent = 'Este restaurante ainda não está conectado ao banco de dados.';
            return;
        }
        if (texto.length < 2) {
            mensagemComentario.textContent = 'Escreva um comentário antes de publicar.';
            comentarioInput.focus();
            return;
        }
        botaoAdicionarComentario.disabled = true;
        mensagemComentario.textContent = 'Publicando comentário...';
        try {
            const response = await fetch(`/api/restaurantes/${restauranteId}/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ texto })
            });
            const result = await response.json();
            if (response.status === 401) {
                window.location.href = 'login.html?redirect=proxima.html';
                return;
            }
            if (!response.ok) throw new Error(result.message || 'Não foi possível publicar o comentário.');
            comentarioInput.value = '';
            mensagemComentario.textContent = 'Comentário publicado.';
            await carregarComentarios(restauranteId);
        } catch (error) {
            console.error('Não foi possível publicar o comentário.', error);
            mensagemComentario.textContent = error.message || 'Não foi possível conectar ao servidor.';
        } finally {
            botaoAdicionarComentario.disabled = false;
        }
    });
}

async function carregarComentarios(restauranteId) {
    barraDetalhes.dataset.restauranteId = restauranteId || '';
    listaComentarios.replaceChildren();
    if (!restauranteId) {
        listaComentarios.textContent = 'Comentários indisponíveis para este restaurante.';
        return;
    }
    try {
        const response = await fetch(`/api/restaurantes/${restauranteId}/comentarios`);
        if (!response.ok) throw new Error('Não foi possível carregar os comentários.');
        const { comentarios } = await response.json();
        if (!comentarios.length) {
            listaComentarios.textContent = 'Ainda não há comentários.';
            return;
        }
        comentarios.forEach(comentario => {
            const item = document.createElement('article');
            const autor = document.createElement('strong');
            autor.textContent = comentario.autor;
            const texto = document.createElement('p');
            texto.textContent = comentario.texto;
            item.append(autor, texto);
            listaComentarios.append(item);
        });
    } catch (error) {
        console.error('Não foi possível carregar os comentários.', error);
        listaComentarios.textContent = 'Não foi possível carregar os comentários.';
    }
}

(function () {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    const viewport = container.closest('.destaque-viewport');
    let index = 0;
    let paused = false;

    function render() {
        const cardsVisiveis = Array.from(container.querySelectorAll('.card:not(.oculto-filtro)'));
        const indiceAtivo = cardsVisiveis.length ? index % cardsVisiveis.length : -1;
        container.querySelectorAll('.card').forEach(card => {
            card.classList.toggle('active', cardsVisiveis[indiceAtivo] === card);
        });
    }

    function move(direction) {
        const quantidadeVisivel = container.querySelectorAll('.card:not(.oculto-filtro)').length;
        if (!quantidadeVisivel) {
            render();
            return;
        }
        index = (index + direction + quantidadeVisivel) % quantidadeVisivel;
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
