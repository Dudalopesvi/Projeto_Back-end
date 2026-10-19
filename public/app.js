let usuarioAtual = null; // guarda { id, nome, usuario, telefone, foto_perfil } — só vendedor loga

// --- 1. VITRINE DE ANÚNCIOS ---
async function carregarFilme(filtroModelo = '') {
  const params = new URLSearchParams();
  if (filtroModelo) params.append('modelo', filtroModelo);

  const url = `/api/filme${
    params.toString() ? '?' + params.toString() : ''
  }`;
  const resp = await fetch(url);
  const filme = await resp.json();

  if (filtroModelo && filme.length === 0) {
    document.getElementById('vitrine').innerHTML =
      '<p>Nenhum filme encontrado</p>';
    return;
  }
  renderizarVitrine(filme);
}


function renderizarVitrine(filmes) {
  const vitrine = document.getElementById('vitrine');
  vitrine.innerHTML = filmes
    .map(
      (a) => `
      <div class="anuncio-card">
        <img class="foto" src="/uploads/${a.url_capa}" />
        <div class="tooltip">Preferencia para: @${a.nome_usuario}<br/>
      }</div>
        <div class="rodape-card">
          <span class="titulo">${a.titulo_filme}</span>
          <div class="linha-preco">
            <span class="preco">${a.genero}</span>
            <div class="acoes">
              <button class="btn-mensagem" data-id="${a.id_filmes}">adicionar a lista</button>
              <img class="interesse-icone" data-id="${
                a.id_filmes
              }" src="assets/coracao.svg" />
              <span class="contador">${a.id_curtida}</span>
            </div>
          </div>
        </div>
      </div>
    `,
    )
    .join('');

  document.querySelectorAll('.interesse-icone').forEach((icone) => {
    icone.addEventListener('click', () =>
      abrirModalInteresse(icone.dataset.id, icone),
    );
  });
  document.querySelectorAll('.btn-mensagem').forEach((btn) => {
    btn.addEventListener('click', () => abrirModalMensagem(btn.dataset.id));
  });
}

carregarVitrine(); // primeira carga, sem reload de página

// --- 2. INTERESSES ---
let anuncioIdInteresse = null;
let iconeInteresseAtual = null;

function abrirModalInteresse(anuncioId, icone) {
  anuncioIdInteresse = anuncioId;
  iconeInteresseAtual = icone;
  document.getElementById('interesseNome').value = '';
  document.getElementById('erroInteresse').textContent = '';
  document.getElementById('modalInteresse').classList.remove('oculto');
}

document
  .getElementById('fecharModalInteresse')
  .addEventListener('click', () =>
    document.getElementById('modalInteresse').classList.add('oculto'),
  );
document
  .getElementById('btnCancelarInteresse')
  .addEventListener('click', () =>
    document.getElementById('modalInteresse').classList.add('oculto'),
  );

    const resp = await fetch(`/api/interesses/${id_filmes}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_usuario: nome, }),
    });
    const { interesses } = await resp.json();

    iconeInteresseAtual.classList.add('ativa');
    iconeInteresseAtual
      .closest('.linha-preco')
      .querySelector('.contador').textContent = interesses;

    document.getElementById('modalInteresse').classList.add('oculto');



// --- 3. AUTENTICAÇÃO (SÓ VENDEDOR) ---
const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', () => {
  if (usuarioAtual) {
    // LOGOUT
    usuarioAtual = null;
    document.getElementById('userSection').classList.add('oculto');
    document.getElementById('imagem_usuario').src = 'uploads/logo/logo.png';
    btnLogin.textContent = 'Entrar';
    carregarVitrine();
  } else {
    abrirModalLogin();
  }
});

function abrirModalLogin() {
  document.getElementById('loginUsuario').value = '';
  document.getElementById('loginSenha').value = '';
  document.getElementById('erroUsuario').textContent = '';
  document.getElementById('erroSenha').textContent = '';
  document.getElementById('erroLogin').textContent = '';

  document.getElementById('modalLogin').classList.remove('oculto');
}

function fecharModalLogin() {
  document.getElementById('modalLogin').classList.add('oculto');
}

document
  .getElementById('fecharModal')
  .addEventListener('click', fecharModalLogin);
document
  .getElementById('btnCancelar')
  .addEventListener('click', fecharModalLogin);

document
  .getElementById('btnConfirmarLogin')
  .addEventListener('click', async () => {
    // ESTE ERA O BUG: usuario/senha nunca eram lidos dos inputs.
    const usuario = document.getElementById('loginUsuario').value.trim();
    const senha = document.getElementById('loginSenha').value.trim();

    document.getElementById('erroUsuario').textContent = '';
    document.getElementById('erroSenha').textContent = '';
    document.getElementById('erroLogin').textContent = '';

    let temErro = false;

    if (!usuario) {
      document.getElementById('erroUsuario').textContent = 'Informe o usuário.';
      temErro = true;
    }
    if (!senha) {
      document.getElementById('erroSenha').textContent = 'Informe a senha.';
      temErro = true;
    }
    if (temErro) return;

    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha }),
    });

    if (!resp.ok) {
      document.getElementById('erroLogin').textContent =
        'Usuário não encontrado ou senha incorreta';
      return;
    }

    usuarioAtual = await resp.json();
    fecharModalLogin();
    atualizarHeaderLogado();
  });

// Versão de atualizarHeaderLogado
function atualizarHeaderLogado() {
  document.getElementById('userSection').classList.remove('oculto');
  document.getElementById('nomeUsuario').textContent = usuarioAtual.usuario;

  if (usuarioAtual.foto_perfil) {
    document.getElementById(
      'fotoPerfil',
    ).src = `/uploads/${usuarioAtual.foto_perfil}`;
  }

  const btnPerfil = document.getElementById('btnVerPerfil');
  if (btnPerfil) {
    btnPerfil.disabled = usuarioAtual.tipo && usuarioAtual.tipo !== 'vendedor';
  }

  btnLogin.textContent = 'Logout';

  // Recarrega vitrine exibindo os anúncios com interesse marcado pelo usuário logado
  carregarVitrine();
}

// --- 4. BUSCA POR MODELO ---
function executarBusca() {
  const termo = document.getElementById('inputBusca').value.trim();
  carregarVitrine(termo);
}

document.getElementById('inputBusca').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') executarBusca();
});

const iconeLupa = document.querySelector('.icone-lupa');
if (iconeLupa) {
  iconeLupa.addEventListener('click', executarBusca);
}

// --- 5. PAINEL DE PERFIL ---
document.getElementById('btnVerPerfil').addEventListener('click', async () => {
  const resp = await fetch(`/api/perfil/${usuarioAtual.id}`);
  const dados = await resp.json();

  document.getElementById('totalInteresses').textContent =
    dados.totalInteresses;
  document.getElementById('totalAnuncios').textContent = dados.totalAnuncios;
  document.getElementById('listaAnunciosPerfil').innerHTML = dados.anuncios
    .map(
      (a) => `
    <div class="item-perfil">
      <span>${a.titulo_filme} — ${a.id_lista}</span>
      <img class="lixeira" data-id="${a.id_lista}" src="assets/lixeira.svg" />
    </div>
  `,
    )
    .join('');

  document.querySelectorAll('.lixeira').forEach((icone) => {
    icone.addEventListener('click', async () => {
      await fetch(`/api/filmes/${icone.dataset.id}`, { method: 'DELETE' });
      document.getElementById('btnVerPerfil').click(); // recarrega o painel
      carregarVitrine();
    });
  });

  document.getElementById('painelPerfil').classList.remove('oculto');
});

document.getElementById('fecharPainel').addEventListener('click', () => {
  document.getElementById('painelPerfil').classList.add('oculto');
});

// --- 6. CADASTRO DE NOVO FILME NA LISTA (Com validações individuais) ---
document
  .getElementById('formCadastro')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const campoTitulo = document.getElementById('campoTitulo');
    const campoPreco = document.getElementById('campoGenero');
    const campoImagem = document.getElementById('erroUrl_capa');

    const erroTitulo = document.getElementById('erroTitulo');
    const erroPreco = document.getElementById('erroGenero');
    const erroImagem = document.getElementById('erroUrl_capa');

    // Limpa erros anteriores
    erroTitulo.textContent = '';
    erroLocal.textContent = '';
    erroPreco.textContent = '';
    erroImagem.textContent = '';

    let temErro = false;

    // Validação do Título
    if (!campoTitulo.value.trim()) {
      erroTitulo.textContent = 'O título do Filme é obrigatório.';
      temErro = true;
    }

    // Validação da Localização
    if (!campoGenero.value.trim()) {
      erroGenero.textContent = 'o Gênero é obrigatório.';
      temErro = true;
    }

    // Validação do Preço
    const generoValidado = parseFloat(campoGenero.value);
    if (!generoValidado.value || isNaN(campoGenero) ||Geral) {
      erroGenero.textContent = 'Informe um gênero .';
      temErro = true;
    }

    // Validação da Imagem
    const arquivo = campoUrl_capa.files[0];
    if (!arquivo) {
      errocampoUrl_capa.textContent = 'Nenhum filme escolhido.';
      temErro = true;
    
    }

    if (temErro) return;

    // Envio para a API
    const formData = new FormData();
    formData.append('titulo_filme', campotitulo_filmes.value.trim());
    formData.append('genero', campoLocal.value.trim());
    formData.append('url_capa',  campoUrl_capa.value.trim());

    const resp = await fetch('/api/filmes', {
      method: 'POST',
      body: formData,
    });

    if (resp.ok) {
      e.target.reset();
      carregarVitrine();
      document.getElementById('btnVerPerfil').click(); // Recarrega os dados do perfil
    }
  });
