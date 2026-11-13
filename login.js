const botaoTipoLogin = document.querySelectorAll('.tipo-login');
const formulariosLogin = document.querySelectorAll('.form-login');

botaoTipoLogin.forEach(botao => {
    botao.addEventListener('click', () => {
        const tipo = botao.dataset.tipo;
        botaoTipoLogin.forEach(item => item.classList.toggle('ativo', item === botao));
        formulariosLogin.forEach(formulario => {
            const ativo = formulario.id === `${tipo}LoginForm`;
            formulario.classList.toggle('ativo', ativo);
            formulario.style.display = ativo ? 'flex' : 'none';
        });
    });
});

async function entrar(event, tipo) {
    event.preventDefault();
    const form = event.currentTarget;
    const mensagem = form.querySelector('p[role="status"], #formMessage, #formMessageRestaurante');
    const botao = form.querySelector('button[type="submit"]');
    const email = form.querySelector('input[type="email"]').value.trim();
    const senha = form.querySelector('input[type="password"]').value;
    botao.disabled = true;
    mensagem.textContent = 'Verificando seus dados...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ email, senha, tipo })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Não foi possível entrar.');
        const destino = new URLSearchParams(window.location.search).get('redirect');
        const paginaInternaPermitida = destino && /^[a-zA-Z0-9_-]+\.html(?:#[-\w]+)?$/.test(destino);
        window.location.href = paginaInternaPermitida
            ? destino
            : tipo === 'restaurante'
                ? 'pagamento.html'
                : 'proxima.html';
    } catch (error) {
        console.error('Não foi possível fazer login.', error);
        mensagem.textContent = error.message || 'Não foi possível conectar ao servidor. Verifique se está online.';
    } finally {
        botao.disabled = false;
    }
}

document.getElementById('clienteLoginForm').addEventListener('submit', event => entrar(event, 'cliente'));
document.getElementById('restauranteLoginForm').addEventListener('submit', event => entrar(event, 'restaurante'));
