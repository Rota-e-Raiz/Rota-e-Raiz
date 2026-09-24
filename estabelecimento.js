//Cadastro

const registerForm = document.getElementById('registerForm');

const nomeRestaurante = document.getElementById('nomeRestaurante');
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
        isEmailValid,
        isSenhaValid,
        isLocalizacaoValid,
        isFuncionamentoValid,
        isTipoValid,
        isTelefoneValid,
        isHistoriaValid
    };
}
