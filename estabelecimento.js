const registerForm = document.getElementById('registerForm');
const nomeRestaurante = document.getElementById('nomeRestaurante');
const cnpj = document.getElementById('cnpj');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const localizacao = document.getElementById('localizacao');
const bairroRestaurante = document.getElementById('bairroRestaurante');
const precoMedio = document.getElementById('precoMedio');
const tipo = document.getElementById('tipo');
const telefone = document.getElementById('telefone');
const historia = document.getElementById('historia');
const imagemRestaurante = document.getElementById('imagemRestaurante');
const imagemPreview = document.getElementById('imagemPreview');
const finalizarBtn = document.getElementById('finalizarBtn');
const formMessage = document.getElementById('formMessage');
const ambientesMensagem = document.getElementById('ambientesMensagem');

const campos = [nomeRestaurante, cnpj, email, senha, localizacao, bairroRestaurante, precoMedio, tipo, telefone, historia];

function validateForm() {
    const temAmbiente = registerForm.querySelector('input[name="ambientes"]:checked') !== null;
    const valid = {
        nome: nomeRestaurante.value.trim().length >= 3,
        cnpj: cnpj.value.trim().length >= 11,
        email: email.value.includes('@') && email.value.includes('.'),
        senha: senha.value.length >= 8,
        localizacao: localizacao.value.trim().length >= 5,
        bairro: bairroRestaurante.value !== '',
        preco: Number(precoMedio.value) >= 1 && Number(precoMedio.value) <= 250,
        tipo: tipo.value !== '',
        telefone: telefone.value.trim().length >= 8,
        historia: historia.value.trim().length >= 10,
        ambiente: temAmbiente
    };

    ambientesMensagem.textContent = temAmbiente ? '' : 'Selecione pelo menos um ambiente.';
    finalizarBtn.disabled = !Object.values(valid).every(Boolean);
    return valid;
}

campos.forEach(campo => {
    campo.addEventListener('input', validateForm);
    campo.addEventListener('change', validateForm);
});
registerForm.querySelectorAll('input[name="ambientes"]').forEach(campo => {
    campo.addEventListener('change', validateForm);
});

function converterImagem(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.addEventListener('error', () => reject(new Error('Não foi possível ler a imagem.')));
        leitor.addEventListener('load', () => {
            const imagem = new Image();
            imagem.addEventListener('error', () => reject(new Error('O arquivo selecionado não é uma imagem válida.')));
            imagem.addEventListener('load', () => {
                const escala = Math.min(1, 1000 / Math.max(imagem.naturalWidth, imagem.naturalHeight));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
                canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));
                const contexto = canvas.getContext('2d');
                if (!contexto) {
                    reject(new Error('Não foi possível preparar a imagem.'));
                    return;
                }
                contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
                const imagemFinal = canvas.toDataURL('image/jpeg', 0.75);
                if (imagemFinal.length > 1_000_000) {
                    reject(new Error('A imagem é muito grande. Escolha um arquivo menor.'));
                    return;
                }
                resolve(imagemFinal);
            });
            imagem.src = leitor.result;
        });
        leitor.readAsDataURL(arquivo);
    });
}

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!Object.values(validateForm()).every(Boolean)) return;
    finalizarBtn.disabled = true;
    formMessage.textContent = 'Salvando seu restaurante...';
    try {
        const arquivo = imagemRestaurante.files[0];
        const imagem = arquivo ? await converterImagem(arquivo) : '';
        const response = await fetch('/api/auth/register-restaurante', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                nome: nomeRestaurante.value.trim(),
                cnpj: cnpj.value.trim(),
                email: email.value.trim(),
                senha: senha.value,
                endereco: localizacao.value.trim(),
                localidade: bairroRestaurante.value,
                precoMedio: Number(precoMedio.value),
                tipo: tipo.value,
                ambientes: Array.from(registerForm.querySelectorAll('input[name="ambientes"]:checked'))
                    .map(input => input.value),
                telefone: telefone.value.trim(),
                historia: historia.value.trim(),
                imagem
            })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Não foi possível cadastrar o restaurante.');
        formMessage.textContent = 'Restaurante cadastrado e salvo no banco de dados!';
        window.location.href = 'proxima.html#restaurantes-novos';
    } catch (error) {
        console.error('Não foi possível cadastrar o restaurante.', error);
        formMessage.textContent = error.message || 'Não foi possível conectar ao servidor. Verifique se está online.';
    } finally {
        finalizarBtn.disabled = false;
        validateForm();
    }
});

imagemRestaurante.addEventListener('change', () => {
    const arquivo = imagemRestaurante.files[0];
    if (!arquivo) {
        imagemPreview.hidden = true;
        imagemPreview.removeAttribute('src');
        return;
    }

    imagemPreview.src = URL.createObjectURL(arquivo);
    imagemPreview.hidden = false;
});

validateForm();
