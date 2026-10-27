const preferenciasAcessibilidade = {
    contraste: {
        armazenamento: 'rota-raiz-alto-contraste',
        classe: 'alto-contraste',
        controle: 'contraste'
    },
    texto: {
        armazenamento: 'rota-raiz-texto-ampliado',
        classe: 'texto-ampliado',
        controle: 'aumentar-fonte'
    }
};

function lerPreferenciaAcessibilidade(chave) {
    try {
        return localStorage.getItem(chave) === 'true';
    } catch (erro) {
        console.error('Não foi possível ler as preferências de acessibilidade.', erro);
        return false;
    }
}

function salvarPreferenciaAcessibilidade(chave, ativada) {
    try {
        localStorage.setItem(chave, String(ativada));
    } catch (erro) {
        console.error('Não foi possível salvar as preferências de acessibilidade.', erro);
    }
}

function atualizarPreferenciaAcessibilidade(preferencia, ativada) {
    document.body.classList.toggle(preferencia.classe, ativada);
    const controle = document.getElementById(preferencia.controle);
    if (controle) {
        controle.checked = ativada;
    }
}

Object.values(preferenciasAcessibilidade).forEach(preferencia => {
    atualizarPreferenciaAcessibilidade(
        preferencia,
        lerPreferenciaAcessibilidade(preferencia.armazenamento)
    );

    const controle = document.getElementById(preferencia.controle);
    if (controle) {
        controle.addEventListener('change', evento => {
            atualizarPreferenciaAcessibilidade(preferencia, evento.target.checked);
            salvarPreferenciaAcessibilidade(preferencia.armazenamento, evento.target.checked);
        });
    }
});

window.addEventListener('storage', evento => {
    Object.values(preferenciasAcessibilidade)
        .filter(preferencia => preferencia.armazenamento === evento.key)
        .forEach(preferencia => {
            atualizarPreferenciaAcessibilidade(preferencia, evento.newValue === 'true');
        });
});
