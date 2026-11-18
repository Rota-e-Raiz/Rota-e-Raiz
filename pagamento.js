const formPagamento = document.getElementById('form-pagamento');
const menuPagamento = document.getElementById('menu-pagamento');
const botaoMenu = document.getElementById('botao-menu');
const imagemRestaurante = document.getElementById('imagem-restaurante');
const previaImagemRestaurante = document.getElementById('previa-imagem-restaurante');
const mensagemFormulario = document.getElementById('mensagem-formulario');
const erroPlano = document.getElementById('erro-plano');
const linkCarrossel = document.getElementById('link-carrossel');
const botaoAtivar = formPagamento.querySelector('.botao-ativar');
const notificacaoPagamento = document.getElementById('notificacao-pagamento');
let urlPreviaImagem;

botaoMenu.addEventListener('click', () => {
    const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
    botaoMenu.setAttribute('aria-expanded', String(!aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
    menuPagamento.hidden = aberto;
});

imagemRestaurante.addEventListener('change', () => {
    const arquivo = imagemRestaurante.files[0];
    if (urlPreviaImagem) URL.revokeObjectURL(urlPreviaImagem);
    previaImagemRestaurante.hidden = true;
    previaImagemRestaurante.removeAttribute('src');
    imagemRestaurante.setCustomValidity('');
    mensagemFormulario.textContent = '';
    linkCarrossel.hidden = true;

    if (!arquivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) {
        imagemRestaurante.setCustomValidity('Escolha uma imagem JPG, PNG ou WEBP.');
        imagemRestaurante.reportValidity();
        return;
    }
    if (arquivo.size > 8 * 1024 * 1024) {
        imagemRestaurante.setCustomValidity('A imagem deve ter no máximo 8 MB.');
        imagemRestaurante.reportValidity();
        return;
    }

    urlPreviaImagem = URL.createObjectURL(arquivo);
    previaImagemRestaurante.src = urlPreviaImagem;
    previaImagemRestaurante.hidden = false;
});

function converterImagemParaArmazenamento(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.addEventListener('error', () => reject(new Error('Não foi possível ler a imagem selecionada.')));
        leitor.addEventListener('load', () => {
            const imagem = new Image();
            imagem.addEventListener('error', () => reject(new Error('O arquivo selecionado não pôde ser aberto como imagem.')));
            imagem.addEventListener('load', () => {
                const escala = Math.min(1, 1000 / Math.max(imagem.naturalWidth, imagem.naturalHeight));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
                canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));
                const contexto = canvas.getContext('2d');
                if (!contexto) {
                    reject(new Error('Não foi possível preparar a imagem para o destaque.'));
                    return;
                }

                contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
                const imagemCompactada = canvas.toDataURL('image/jpeg', 0.75);
                if (imagemCompactada.length > 1_000_000) {
                    reject(new Error('Não foi possível reduzir a imagem. Escolha um arquivo menor.'));
                    return;
                }
                resolve(imagemCompactada);
            });
            imagem.src = leitor.result;
        });
        leitor.readAsDataURL(arquivo);
    });
}

formPagamento.addEventListener('submit', async event => {
    event.preventDefault();
    mensagemFormulario.textContent = '';
    erroPlano.textContent = '';
    linkCarrossel.hidden = true;

    const planoSelecionado = formPagamento.querySelector('input[name="plano"]:checked');
    if (!planoSelecionado) {
        erroPlano.textContent = 'Escolha um plano para continuar.';
        formPagamento.querySelector('input[name="plano"]').focus();
        return;
    }
    if (!formPagamento.reportValidity()) return;

    const arquivoImagem = imagemRestaurante.files[0];
    if (!arquivoImagem) {
        imagemRestaurante.setCustomValidity('Envie uma imagem do restaurante.');
        imagemRestaurante.reportValidity();
        return;
    }

    botaoAtivar.disabled = true;
    botaoAtivar.textContent = 'Processando pagamento...';
    mensagemFormulario.textContent = 'Aguarde enquanto confirmamos o pagamento.';
    try {
        const imagem = arquivoImagem ? await converterImagemParaArmazenamento(arquivoImagem) : '';
        localStorage.setItem('rota-raiz-destaque-selecionado', JSON.stringify({
            nome: formPagamento.elements.restaurante.value.trim(),
            cpf: formPagamento.elements.cpf.value.trim(),
            plano: planoSelecionado.value,
            imagem
        }));
        mensagemFormulario.textContent = 'Pagamento confirmado.';
        botaoAtivar.textContent = 'Pagamento efetuado';
        linkCarrossel.hidden = false;
        await new Promise(resolve => window.setTimeout(resolve, 3000));
        notificacaoPagamento.hidden = false;
        window.setTimeout(() => {
            window.location.href = 'proxima.html#destaques';
        }, 1200);
    } catch (error) {
        console.error('Não foi possível solicitar o destaque.', error);
        mensagemFormulario.textContent = error.message || 'Não foi possível conectar ao servidor.';
        botaoAtivar.disabled = false;
    }
});
