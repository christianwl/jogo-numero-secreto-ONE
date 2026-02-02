let listaDeNumerosSorteados = [];
let numeroMaximo = 10;
let numeroSecreto = gerarNumeroAleatorio(numeroMaximo);
let tentativas = 1;
let informouVoz = false;
let voices = [];
let newVoices = [];
let selectTag = document.getElementById("voices");
let input = document.getElementById("input");

input.focus();

input.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, ""); // Remove qualquer caractere que não seja número
});

function gerarNumeroAleatorio(max) {
  let numeroEscolhido;
  let quantidadeDeElementosNaLista = listaDeNumerosSorteados.length;
  if (quantidadeDeElementosNaLista === max) listaDeNumerosSorteados = [];

  do {
    numeroEscolhido = parseInt(Math.random() * max + 1);
  } while (listaDeNumerosSorteados.includes(numeroEscolhido));

  listaDeNumerosSorteados.push(numeroEscolhido);

  return numeroEscolhido;
}

// Chama a função para esperar as vozes e prosseguir

function criarOptionsVoices(voicesArray) {
  let novaOption;
  for (let i = 0; i < voicesArray.length; i++) {
    if (
      voicesArray[i].name.includes("Brazil") ||
      voicesArray[i].name.includes("Brasil")
    ) {
      novaOption = document.createElement("option");
      novaOption.value = i;
      novaOption.textContent = `${voicesArray[i].name}`;
      selectTag.appendChild(novaOption);
      newVoices.push(voicesArray[i]);
    }
  }
}

// Função para esperar as vozes carregarem
function esperarVoices() {
  const interval = setInterval(() => {
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      clearInterval(interval); // Para o intervalo quando as vozes estiverem carregadas
      criarOptionsVoices(voices);
      definirVozSelecionada();
    }
  }, 100); // Verifica a cada 100ms
}

// Função para definir a voz selecionada
function definirVozSelecionada() {
  let vozSelecionada = sessionStorage.getItem("vozSelecionada");
  if (vozSelecionada) {
    selectTag.value = vozSelecionada; // Define a voz selecionada
    return;
  }
}

esperarVoices();

// Adiciona um evento para salvar a voz selecionada
selectTag.addEventListener("change", function () {
  window.speechSynthesis.cancel();
  sessionStorage.setItem("vozSelecionada", selectTag.value); // Salva a voz selecionada
  fazerLeitura(retornarTag("h1").textContent);
  fazerLeitura(retornarTag("p").textContent);
});

function possibilitarLeitura(texto) {
  if (voices.length > 0) {
    fazerLeitura(texto);
  } else {
    const interval = setInterval(() => {
      if (voices.length > 0) {
        clearInterval(interval);
        fazerLeitura(texto); // Faz a leitura assim que as vozes estão disponíveis
      }
    }, 100);
  }
}

function fazerLeitura(texto) {
  if ("speechSynthesis" in window) {
    let utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.rate = 1.2;
    // Aqui você pode escolher a voz desejada
    utterance.voice = newVoices[selectTag.value];
    if (!informouVoz) {
      console.log(`Voz escolhida para leitura foi: ${voices[0].name}`);
      informouVoz = true;
    }
    window.speechSynthesis.speak(utterance);
  } else {
    console.log("Web Speech API não suportada neste navegador.");
  }
}

function retornarTag(tag) {
  return document.querySelector(tag);
}

function exibirTextoNaTela(tag, texto) {
  let campo = retornarTag(tag);
  campo.innerHTML = texto;
  // responsiveVoice.speak(texto, "Brazilian Portuguese Female", {rate: 1.2});
  possibilitarLeitura(texto);
}

function exibirMensagemInicial() {
  exibirTextoNaTela("h1", "Jogo do número secreto");
  exibirTextoNaTela("p", `Escolha um número entre 1 e ${numeroMaximo}`);
}

exibirMensagemInicial();

function verificarChute() {
  let chute = parseInt(document.querySelector("input").value);

  window.speechSynthesis.cancel();
  if (!isNaN(chute)) {
    if (chute === numeroSecreto) {
      exibirTextoNaTela("h1", "Acertou!");
      let mensagemTentativas = `Você descobriu o número secreto em ${tentativas} tentativa${
        tentativas > 1 ? "s" : ""
      }. Parabéns!`;
      exibirTextoNaTela("p", mensagemTentativas);
      document.getElementById("reiniciar").removeAttribute("disabled");
      document.getElementById("chute").setAttribute("disabled", true);
    } else {
      tentativas++;
      let mensagemDica = `O número secreto é ${
        chute > numeroSecreto ? "menor" : "maior"
      }`;
      exibirTextoNaTela("p", mensagemDica);
      limparCampo();
    }
  } else {
    possibilitarLeitura("Você não colocou nenhum número");
  }
}

function limparCampo() {
  chute = document.querySelector("input");
  chute.value = "";
}

function reiniciarJogo() {
  window.speechSynthesis.cancel();
  numeroSecreto = gerarNumeroAleatorio(numeroMaximo);
  limparCampo();
  tentativas = 1;
  exibirMensagemInicial();
  document.getElementById("reiniciar").setAttribute("disabled", true);
  document.getElementById("chute").removeAttribute("disabled");
}

document.addEventListener("keydown", function (event) {
  let permitir = true;
  if (event.key === "Enter" || event.key === " ") {
    if (!document.getElementById("chute").disabled && permitir) {
      verificarChute();
    } else {
      permitir = false;
    }
    if (!document.getElementById("reiniciar").disabled && !permitir) {
      reiniciarJogo();
      permitir = true;
    }
  }
});
