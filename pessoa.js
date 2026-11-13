const cadastroUsuario = document.getElementById('registerForm');
const mensagemCadastro = document.getElementById('formMessage');
const botaoCadastro = document.getElementById('finalizarBtn');

cadastroUsuario.addEventListener('submit', async event => {
    event.preventDefault();
    const nome = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const senha = document.getElementById('regSenha').value;
    if (nome.length < 3 || !email || senha.length < 8) {
        mensagemCadastro.textContent = 'Informe um nome, e-mail válido e senha com pelo menos 8 caracteres.';
        return;
    }

    botaoCadastro.disabled = true;
    mensagemCadastro.textContent = 'Criando sua conta...';
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ nome, email, senha })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Não foi possível criar sua conta.');
        window.location.href = 'proxima.html';
    } catch (error) {
        console.error('Não foi possível criar a conta.', error);
        mensagemCadastro.textContent = error.message || 'Não foi possível conectar ao servidor. Verifique se está online.';
    } finally {
        botaoCadastro.disabled = false;
    }
});
