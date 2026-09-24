const registerForm = document.getElementById('registerForm');
const nomeRestaurante = document.getElementById('nomeRestaurante');
const cnpj = document.getElementById('cnpj');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const localizacao = document.getElementById('localizacao');
const tipo = document.getElementById('tipo');
const telefone = document.getElementById('telefone');
const historia = document.getElementById('historia');
const imagemRestaurante = document.getElementById('imagemRestaurante');
const imagemPreview = document.getElementById('imagemPreview');
const finalizarBtn = document.getElementById('finalizarBtn');
const formMessage = document.getElementById('formMessage');

const campos = [nomeRestaurante, cnpj, email, senha, localizacao, tipo, telefone, historia];

function validateForm() {
    const valid = {
        nome: nomeRestaurante.value.trim().length >= 3,
        cnpj: cnpj.value.trim().length >= 11,
        email: email.value.includes('@') && email.value.includes('.'),
        senha: senha.value.length >= 6,
        localizacao: localizacao.value.trim().length >= 5,
        tipo: tipo.value !== '',
        telefone: telefone.value.trim().length >= 8,
        historia: historia.value.trim().length >= 10
    };

    finalizarBtn.disabled = !Object.values(valid).every(Boolean);
    return valid;
}

const dadosDemo = {
    nome: 'Sabores da Orla',
    cnpj: '12.345.678/0001-90',
    email: 'sabores.orla@example.com',
    senha: 'senha-demo',
    endereco: 'Orla de Camaçari',
    tipo: 'Restaurante',
    telefone: '(71) 99999-0000',
    historia: 'Restaurante novo com sabores locais, ambiente acolhedor e identidade baiana.',
    imagem: ''
};

function preencherDadosDemo() {
    nomeRestaurante.value = dadosDemo.nome;
    cnpj.value = dadosDemo.cnpj;
    email.value = dadosDemo.email;
    senha.value = dadosDemo.senha;
    localizacao.value = dadosDemo.endereco;
    tipo.value = dadosDemo.tipo;
    telefone.value = dadosDemo.telefone;
    historia.value = dadosDemo.historia;
}

campos.forEach(campo => campo.addEventListener('input', validateForm));

registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!Object.values(validateForm()).every(Boolean)) return;

    const salvarRestaurante = (imagem) => {
        const restaurante = {
        nome: nomeRestaurante.value,
        cnpj: cnpj.value,
        endereco: localizacao.value,
        telefone: telefone.value,
        email: email.value,
        senha: senha.value,
        tipo: tipo.value,
            historia: historia.value,
            imagem
        };

        const restaurantesSalvos = JSON.parse(localStorage.getItem('rotaRaizRestaurantes') || '[]');
        restaurantesSalvos.unshift(restaurante);
        localStorage.setItem('rotaRaizRestaurantes', JSON.stringify(restaurantesSalvos));
        formMessage.textContent = 'Restaurante salvo com sucesso!';
        window.location.href = 'proxima.html#restaurantes-novos';
    };

    const arquivo = imagemRestaurante.files[0];
    if (!arquivo) {
        salvarRestaurante('');
        return;
    }

    const leitor = new FileReader();
    leitor.addEventListener('load', () => salvarRestaurante(leitor.result));
    leitor.readAsDataURL(arquivo);
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

preencherDadosDemo();
validateForm();
