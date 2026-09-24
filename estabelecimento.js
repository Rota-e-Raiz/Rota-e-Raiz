//Cadastro

const registerForm = document.getElementById('registerForm');

const nomeRestaurante = document.getElementById('nomeRestaurante');
const cnpj = document.getElementById('cnpj');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const localizacao = document.getElementById('localizacao');
const funcionamento = document.getElementById('funcionamento');
const tipo = document.getElementById('tipo');
const telefone = document.getElementById('telefone');
const historia = document.getElementById('historia');

const finalizarBtn = document.getElementById('finalizarBtn');
const formMessage = document.getElementById('formMessage');


// validação formulario

const campos = [
    nomeRestaurante,
    cnpj,
    email,
    senha,
    localizacao,
    funcionamento,
    tipo,
    telefone,
    historia
];

campos.forEach(campo => {
    campo.addEventListener('input', validateForm);
});

function validateForm() {

    const isNomeValid = nomeRestaurante.value.trim().length >= 3;
    const isCnpjValid = cnpj.value.trim().length >= 11;

    const isEmailValid =
        email.value.includes('@') &&
        email.value.includes('.');

    const isSenhaValid = senha.value.length >= 6;

    const isLocalizacaoValid =
        localizacao.value.trim().length >= 5;

    const isFuncionamentoValid =
        funcionamento.value.trim().length >= 3;

    const isTipoValid =
        tipo.value !== '';

    const isTelefoneValid =
        telefone.value.trim().length >= 8;

    const isHistoriaValid =
        historia.value.trim().length >= 10;


    // Liberação dos botões

    if (
        isNomeValid &&
        isCnpjValid &&
        isEmailValid &&
        isSenhaValid &&
        isLocalizacaoValid &&
        isFuncionamentoValid &&
        isTipoValid &&
        isTelefoneValid &&
        isHistoriaValid
    ) {

        finalizarBtn.disabled = false;

    } else {

        finalizarBtn.disabled = true;

    }


    return {
        isNomeValid,
        isCnpjValid,
        isEmailValid,
        isSenhaValid,
        isLocalizacaoValid,
        isFuncionamentoValid,
        isTipoValid,
        isTelefoneValid,
        isHistoriaValid
    };
}

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const validation = validateForm();
    if (!Object.values(validation).every(Boolean)) return;

    finalizarBtn.disabled = true;
    formMessage.textContent = 'Enviando cadastro...';

    const payload = {
        nome: nomeRestaurante.value,
        cnpj: cnpj.value,
        endereco: localizacao.value,
        telefone: telefone.value,
        email: email.value,
        senha: senha.value,
        horario: funcionamento.value,
        tipo: tipo.value,
        historia: historia.value
    };

    try {
        const response = await fetch('/api/estabelecimentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Erro ao cadastrar restaurante.');

        formMessage.textContent = 'Restaurante cadastrado com sucesso!';
        registerForm.reset();
    } catch (error) {
        formMessage.textContent = error.message;
        finalizarBtn.disabled = false;
    }
});

validateForm();
