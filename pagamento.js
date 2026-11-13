const formPagamento = document.getElementById('form-pagamento');
const menuPagamento = document.getElementById('menu-pagamento');
const botaoMenu = document.getElementById('botao-menu');
const documento = document.getElementById('documento');
const imagemRestaurante = document.getElementById('imagem-restaurante');
const previaImagemRestaurante = document.getElementById('previa-imagem-restaurante');
const mensagemFormulario = document.getElementById('mensagem-formulario');
const erroPlano = document.getElementById('erro-plano');
const linkCarrossel = document.getElementById('link-carrossel');
const botaoAtivar = formPagamento.querySelector('.botao-ativar');
let urlPreviaImagem;
let imagemSalva = '';

function apenasDigitos(valor) {
    return valor.replace(/\D/g, '');
}

async function lerResposta(response) {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Não foi possível concluir a solicitação.');
    return result;
}

botaoMenu.addEventListener('click', () => {
    const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
    botaoMenu.setAttribute('aria-expanded', String(!aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
    menuPagamento.hidden = aberto;
});

documento.addEventListener('input', () => {
    const digitos = apenasDigitos(documento.value).slice(0, 14);
    documento.value = digitos.length <= 11
        ? digitos
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        : digitos
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
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

async function carregarContaRestaurante() {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (response.status === 401) {
            window.location.href = 'login.html?redirect=pagamento.html';
            return;
        }
        const { usuario } = await lerResposta(response);
        if (usuario.tipo !== 'restaurante') {
            mensagemFormulario.textContent = 'Entre com uma conta de restaurante para solicitar o destaque.';
            botaoAtivar.disabled = true;
            return;
        }

        const respostaRestaurante = await fetch('/api/meus-restaurantes', { credentials: 'same-origin' });
        const { restaurantes } = await lerResposta(respostaRestaurante);
        const restaurante = restaurantes[0];
        if (!restaurante) {
            mensagemFormulario.textContent = 'Cadastre os dados do restaurante antes de solicitar um destaque.';
            botaoAtivar.disabled = true;
            return;
        }
        formPagamento.elements.restaurante.value = restaurante.nome;
        documento.value = restaurante.cnpj || '';
        if (restaurante.imagem) {
            imagemSalva = restaurante.imagem;
            previaImagemRestaurante.src = restaurante.imagem;
            previaImagemRestaurante.hidden = false;
        }
    } catch (error) {
        console.error('Não foi possível validar a conta do restaurante.', error);
        mensagemFormulario.textContent = error.message || 'Não foi possível conectar ao servidor.';
        botaoAtivar.disabled = true;
    }
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

    const numeroDocumento = apenasDigitos(documento.value);
    if (![11, 14].includes(numeroDocumento.length)) {
        documento.setCustomValidity('Informe um CPF ou CNPJ válido.');
        documento.reportValidity();
        documento.addEventListener('input', () => documento.setCustomValidity(''), { once: true });
        return;
    }

    const arquivoImagem = imagemRestaurante.files[0];
    if (!arquivoImagem && !imagemSalva) {
        imagemRestaurante.setCustomValidity('Envie uma imagem do restaurante.');
        imagemRestaurante.reportValidity();
        return;
    }

    botaoAtivar.disabled = true;
    mensagemFormulario.textContent = 'Salvando a solicitação...';
    try {
        const imagem = arquivoImagem
            ? await converterImagemParaArmazenamento(arquivoImagem)
            : imagemSalva;
        await lerResposta(await fetch('/api/me/restaurante/destaque', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                nome: formPagamento.elements.restaurante.value.trim(),
                cnpj: documento.value.trim(),
                imagem
            })
        }));
        imagemSalva = imagem;
        const result = await lerResposta(await fetch('/api/destaques', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ plano: planoSelecionado.value })
        }));
        mensagemFormulario.textContent = result.message;
        botaoAtivar.textContent = 'Solicitação registrada';
        linkCarrossel.hidden = false;
    } catch (error) {
        console.error('Não foi possível solicitar o destaque.', error);
        mensagemFormulario.textContent = error.message || 'Não foi possível conectar ao servidor.';
        botaoAtivar.disabled = false;
    }
});

carregarContaRestaurante();
