// Funcionalidade de busca
const searchInput = document.querySelector('.search-input');
const botoesMenu = document.querySelectorAll('.botao-menu-config');

// Placeholder para funcionalidade de busca futura
searchInput.addEventListener('focus', function() {
    this.style.boxShadow = '0 0 10px rgba(61, 90, 71, 0.3)';
});

searchInput.addEventListener('blur', function() {
    this.style.boxShadow = 'none';
});

// Adicionar efeito visual aos botões do menu
botoesMenu.forEach(botao => {
    botao.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(5px)';
    });
    botao.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Funcionalidade futura: adicionar comportamento aos cards de configuração
const cards = document.querySelectorAll('.card-config');
cards.forEach(card => {
    card.addEventListener('click', function() {
        // Adicione aqui a funcionalidade desejada quando um card for clicado
        console.log('Card clicado:', this);
    });
});

const listaRestaurantesCriados = document.getElementById('lista-restaurantes-criados');

function carregarRestaurantesCriados() {
    if (!listaRestaurantesCriados) return;

    const restaurantes = JSON.parse(localStorage.getItem('rotaRaizRestaurantes') || '[]');
    listaRestaurantesCriados.replaceChildren();

    if (!restaurantes.length) {
        const vazio = document.createElement('p');
        vazio.className = 'lista-vazia';
        vazio.textContent = 'Nenhum restaurante criado ainda.';
        listaRestaurantesCriados.append(vazio);
        return;
    }

    restaurantes.forEach((restaurante, index) => {
        const item = document.createElement('div');
        item.className = 'restaurante-criado';

        const nome = document.createElement('strong');
        nome.textContent = restaurante.nome;

        const apagar = document.createElement('button');
        apagar.type = 'button';
        apagar.className = 'botao-apagar-restaurante';
        apagar.textContent = 'Apagar';
        apagar.addEventListener('click', () => {
            const restaurantesAtualizados = JSON.parse(localStorage.getItem('rotaRaizRestaurantes') || '[]');
            restaurantesAtualizados.splice(index, 1);
            localStorage.setItem('rotaRaizRestaurantes', JSON.stringify(restaurantesAtualizados));
            carregarRestaurantesCriados();
        });

        item.append(nome, apagar);
        listaRestaurantesCriados.append(item);
    });
}

carregarRestaurantesCriados();

const listaDestaquesCriados = document.getElementById('lista-destaques-criados');
const chaveDestaqueSelecionado = 'rota-raiz-destaque-selecionado';

function carregarDestaqueCriado() {
    if (!listaDestaquesCriados) return;
    listaDestaquesCriados.replaceChildren();

    let destaque;
    try {
        destaque = JSON.parse(localStorage.getItem(chaveDestaqueSelecionado) || 'null');
    } catch (error) {
        console.error('Não foi possível carregar o destaque criado.', error);
        const mensagem = document.createElement('p');
        mensagem.className = 'lista-destaques-vazia';
        mensagem.textContent = 'Não foi possível carregar o destaque.';
        listaDestaquesCriados.append(mensagem);
        return;
    }

    if (!destaque || !destaque.nome) {
        const vazio = document.createElement('p');
        vazio.className = 'lista-destaques-vazia';
        vazio.textContent = 'Nenhum destaque criado.';
        listaDestaquesCriados.append(vazio);
        return;
    }

    const item = document.createElement('div');
    item.className = 'destaque-criado';

    const informacoes = document.createElement('div');
    informacoes.className = 'informacoes-destaque-criado';

    const nome = document.createElement('strong');
    nome.textContent = destaque.nome;

    const plano = document.createElement('span');
    plano.textContent = `Plano de R$ ${destaque.plano || '—'} / mês`;

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.className = 'botao-remover-destaque';
    remover.textContent = 'Remover destaque';
    remover.addEventListener('click', () => {
        try {
            localStorage.removeItem(chaveDestaqueSelecionado);
            carregarDestaqueCriado();
        } catch (error) {
            console.error('Não foi possível remover o destaque.', error);
            remover.textContent = 'Erro ao remover';
        }
    });

    informacoes.append(nome, plano);
    item.append(informacoes, remover);
    listaDestaquesCriados.append(item);
}

carregarDestaqueCriado();
