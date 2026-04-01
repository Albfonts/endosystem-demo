const STORAGE_KEYS = {
  history: "endosystem_historial",
  cycle: "endosystem_cycle_pref"
};

const SYMPTOM_META = {
  inflamacao: "Inflamacao",
  dor: "Dor intensa",
  fadiga: "Fadiga",
  depressao: "Peso emocional"
};

const CYCLE_PROTOCOLS = {
  menstrual: {
    title: "Fase menstrual",
    help: "Fase menstrual: calor local, menos exigencia e prioridade total ao descanso.",
    suggestion: "Hoje o foco e proteger sua energia e evitar qualquer esforco desnecessario."
  },
  folicular: {
    title: "Fase folicular",
    help: "Fase folicular: pode haver mais energia, mas nao force se o corpo nao acompanhar.",
    suggestion: "Se a dor diminuir, use sua energia com suavidade. Nao tente compensar tudo de uma vez."
  },
  ovulatoria: {
    title: "Fase ovulatoria",
    help: "Fase ovulatoria: pode haver pontadas ou mais inflamacao. Escute seu corpo antes de exigir dele.",
    suggestion: "Priorize reduzir a irritacao com comida leve e pausas antes que a dor aumente."
  },
  lutea: {
    title: "Fase lutea",
    help: "Fase lutea: o foco hoje e reduzir a inflamacao e descansar. Nao se cobre tanto.",
    suggestion: "Na fase lutea, o calor local e uma agenda mais leve costumam ajudar bastante."
  }
};

const appState = {
  selectedPain: null,
  selectedSymptoms: new Set(),
  context: {
    sleep: null,
    stress: null,
    food: null
  },
  cycle: {
    phase: "lutea",
    day: 22
  },
  history: [],
  lastShareMessage: ""
};

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  loadCyclePreference();
  loadHistory();
  syncCycleInputs();
  updateCycleSelection();
  updateSupportCard();
  updateRegisterButton();
  renderHistory();
  renderInsights();
}

function loadCyclePreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.cycle);
    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved);
    if (parsed && parsed.phase && parsed.day) {
      appState.cycle.phase = parsed.phase;
      appState.cycle.day = parsed.day;
    }
  } catch (error) {
    console.error("Nao foi possivel ler a preferencia do ciclo.", error);
  }
}

function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.history);
    const parsed = saved ? JSON.parse(saved) : [];
    appState.history = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Nao foi possivel ler o historico.", error);
    appState.history = [];
  }
}

function syncCycleInputs() {
  document.getElementById("cycle-phase").value = appState.cycle.phase;
  document.getElementById("cycle-day").value = appState.cycle.day;
  updateCycleBadge();
}

function persistHistory() {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(appState.history));
}

function persistCyclePreference() {
  localStorage.setItem(STORAGE_KEYS.cycle, JSON.stringify(appState.cycle));
}

function selectPain(level) {
  appState.selectedPain = level;

  document.querySelectorAll(".pain-btn").forEach((button) => {
    button.classList.remove("selected");
  });

  const selectedButton = document.querySelector(`[data-level="${level}"]`);
  if (selectedButton) {
    selectedButton.classList.add("selected");
  }

  const feedback = document.getElementById("pain-feedback");
  feedback.classList.add("visible");

  if (level <= 3) {
    feedback.textContent = "Dia estavel. Mesmo assim, seu registro importa.";
  } else if (level <= 6) {
    feedback.textContent = "Dor moderada. Vamos diminuir o ritmo e priorizar hidratacao e pausas.";
  } else if (level <= 9) {
    feedback.textContent = "Dor forte. Menos exigencia, mais calor local e descanso real.";
  } else if (level === 10) {
    feedback.textContent = "Nivel 10. Isso ja e demais para carregar sozinha.";
  } else {
    feedback.textContent = "Nivel 20. Crise real detectada. Ativando apoio imediato...";
    setTimeout(showCrisis, 650);
  }

  updateSupportCard();
  updateRegisterButton();
}

function toggleSymptom(id, activeClass, button) {
  const check = document.getElementById(`check-${id}`);

  if (appState.selectedSymptoms.has(id)) {
    appState.selectedSymptoms.delete(id);
    button.classList.remove(activeClass);
    check.textContent = "";
  } else {
    appState.selectedSymptoms.add(id);
    button.classList.add(activeClass);
    check.textContent = "OK";
  }

  document.getElementById("note-fadiga").textContent = appState.selectedSymptoms.has("fadiga")
    ? "Nao e preguica. E seu corpo lutando. Sempre."
    : "Nao e preguica. E seu corpo lutando.";

  updateSupportCard();
}

function selectContextChip(group, value, button) {
  appState.context[group] = value;

  document.querySelectorAll(`.context-chip[data-group="${group}"]`).forEach((chip) => {
    chip.classList.remove("selected");
  });

  button.classList.add("selected");
}

function updateCycleSelection() {
  const phaseInput = document.getElementById("cycle-phase");
  const dayInput = document.getElementById("cycle-day");

  appState.cycle.phase = phaseInput.value;
  appState.cycle.day = Math.max(1, Math.min(Number(dayInput.value) || 1, 40));

  dayInput.value = appState.cycle.day;
  document.getElementById("cycle-help-text").textContent = CYCLE_PROTOCOLS[appState.cycle.phase].help;

  updateCycleBadge();
  persistCyclePreference();
}

function updateCycleBadge() {
  const phaseTitle = CYCLE_PROTOCOLS[appState.cycle.phase].title.replace("Fase ", "");
  document.getElementById("cycle-badge-text").textContent = `${phaseTitle} | dia ${appState.cycle.day}`;
}

function updateRegisterButton() {
  document.getElementById("btn-register").disabled = appState.selectedPain === null;
}

function updateSupportCard() {
  const card = document.getElementById("support-card");

  if (appState.selectedPain === null) {
    card.textContent = "Escolha seu nivel de dor para ver um plano curto e concreto para agora.";
    return;
  }

  const symptoms = Array.from(appState.selectedSymptoms);
  const symptomsText = symptoms.length
    ? `Sintomas presentes: ${symptoms.map((item) => SYMPTOM_META[item]).join(", ")}.`
    : "Se voce nao tiver energia para explicar mais, o nivel de dor ja ajuda bastante.";

  if (appState.selectedPain === 20) {
    card.textContent = `Crise real. Luz baixa, calor local, medicacao de resgate se foi indicada e zero culpa. ${symptomsText}`;
    return;
  }

  if (appState.selectedPain >= 7) {
    card.textContent = `Plano agora: parar exigencias, buscar uma posicao segura e avisar alguem so se voce quiser. ${symptomsText}`;
    return;
  }

  if (appState.selectedPain >= 4) {
    card.textContent = `Plano agora: diminuir o ritmo, se hidratar e observar se isso vem com estresse, sono ruim ou comida gatilho. ${symptomsText}`;
    return;
  }

  card.textContent = `Plano agora: sustentar suavidade e registrar antes de piorar. ${symptomsText}`;
}

function registrar() {
  if (appState.selectedPain === null) {
    return;
  }

  const now = new Date();
  const registro = {
    id: Date.now().toString(),
    fecha: now.toLocaleDateString("pt-BR"),
    hora: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    timestamp: now.toISOString(),
    dolor: appState.selectedPain,
    sintomas: Array.from(appState.selectedSymptoms),
    contexto: { ...appState.context },
    ciclo: { ...appState.cycle }
  };

  appState.history.unshift(registro);
  persistHistory();
  renderHistory();
  renderInsights();
  renderConfirmation(registro);

  document.getElementById("screen-checkin").style.display = "none";
  document.getElementById("screen-confirm").classList.add("active");
}

function renderConfirmation(registro) {
  const confirmText = document.getElementById("confirm-text");
  const validationText = document.getElementById("validation-text");
  const title = document.getElementById("sg-title");
  const text = document.getElementById("sg-text");
  const sharePreview = document.getElementById("share-preview");

  const protocol = CYCLE_PROTOCOLS[registro.ciclo.phase];
  const contextNote = buildContextNote(registro.contexto);

  if (registro.dolor === 20) {
    confirmText.textContent = "Nivel 20 registrado. Isso e uma crise real e merece acolhimento imediato.";
    validationText.textContent = "Voce nao esta exagerando. Sua dor e real.";
    title.textContent = "Protocolo de crise";
    text.textContent = "Primeiro seguranca e alivio: calor local, posicao segura, respiracao guiada e zero exigencia.";
  } else if (registro.dolor >= 7) {
    confirmText.textContent = `Nivel ${registro.dolor} registrado. Seu corpo esta carregando muito hoje.`;
    validationText.textContent = "Descansar tambem e tratamento.";
    title.textContent = `${protocol.title} | reduzir a carga`;
    text.textContent = `${protocol.suggestion} ${contextNote}`.trim();
  } else {
    confirmText.textContent = `Nivel ${registro.dolor} registrado. Obrigado por ouvir seu corpo hoje.`;
    validationText.textContent = "Cada registro devolve informacao real sobre voce.";
    title.textContent = `${protocol.title} | sustentar o cuidado`;
    text.textContent = `${protocol.suggestion} ${contextNote}`.trim();
  }

  appState.lastShareMessage = buildShareMessage(registro);
  sharePreview.textContent = appState.lastShareMessage;
}

function buildContextNote(context) {
  const notes = [];

  if (context.sleep === "ruim") {
    notes.push("Voce dormiu mal, entao o corpo pode estar ainda mais sensivel.");
  }

  if (context.stress === "alto") {
    notes.push("O estresse esta alto hoje, e isso pode amplificar a dor.");
  }

  if (context.food === "sim") {
    notes.push("Tambem houve comida gatilho, entao vale observar se a inflamacao subiu.");
  }

  return notes.join(" ");
}

function buildShareMessage(registro) {
  const symptomsText = registro.sintomas.length
    ? registro.sintomas.map((item) => SYMPTOM_META[item]).join(", ")
    : "sem sintomas extras marcados";

  let actionText = "Preciso apenas que voce esteja presente e me ajude a reduzir a carga hoje.";

  if (registro.dolor >= 7 && registro.dolor < 20) {
    actionText = "Preciso de poucas palavras, calor local se estiver disponivel e zero exigencia.";
  }

  if (registro.dolor === 20) {
    actionText = "Estou em crise. Preciso de calma, ajuda pratica e que nao minimizem o que estou sentindo.";
  }

  return `EndoSystem | Registro de hoje: nivel ${registro.dolor}, sintomas ${symptomsText}. ${actionText}`;
}

function copyShareMessage() {
  if (!appState.lastShareMessage) {
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(appState.lastShareMessage)
      .then(() => {
        document.getElementById("share-preview").textContent = "Mensagem copiada. Voce decide se quer compartilhar ou nao.";
      })
      .catch(() => {
        document.getElementById("share-preview").textContent = appState.lastShareMessage;
      });
    return;
  }

  document.getElementById("share-preview").textContent = appState.lastShareMessage;
}

function renderHistory() {
  const container = document.getElementById("history-list");

  if (!appState.history.length) {
    container.innerHTML = `
      <article class="history-empty">
        Seu historico vai aparecer aqui. O objetivo e entender o corpo sem obrigar voce a explicar tudo sempre.
      </article>
    `;
    return;
  }

  container.innerHTML = appState.history.slice(0, 8).map((item) => {
    const symptomTags = item.sintomas && item.sintomas.length
      ? item.sintomas.map((symptom) => `<span class="history-tag">${SYMPTOM_META[symptom]}</span>`).join("")
      : '<span class="history-tag">So dor</span>';

    const contextParts = [];
    if (item.contexto && item.contexto.sleep) {
      contextParts.push(`sono: ${item.contexto.sleep}`);
    }
    if (item.contexto && item.contexto.stress) {
      contextParts.push(`estresse: ${item.contexto.stress}`);
    }
    if (item.contexto && item.contexto.food) {
      contextParts.push(`comida: ${item.contexto.food}`);
    }

    const cycle = item.ciclo || { phase: "lutea", day: "-" };
    const cycleTitle = CYCLE_PROTOCOLS[cycle.phase] ? CYCLE_PROTOCOLS[cycle.phase].title : "Fase nao definida";

    return `
      <article class="history-item">
        <div class="history-title">Nivel ${item.dolor} | ${item.fecha} ${item.hora}</div>
        <div class="history-meta">${cycleTitle} | dia ${cycle.day}</div>
        <div class="history-tags">${symptomTags}</div>
        <p class="history-note">${contextParts.length ? `Contexto ${contextParts.join(" | ")}` : "Sem contexto extra carregado"}</p>
      </article>
    `;
  }).join("");
}

function renderInsights() {
  const container = document.getElementById("insights-grid");

  if (!appState.history.length) {
    container.innerHTML = `
      <article class="insight-card">
        <span class="insight-label">Status</span>
        <strong class="insight-value">Sem dados ainda</strong>
        <p class="insight-text">Quando voce registrar alguns dias, o EndoSystem vai mostrar padroes simples e honestos.</p>
      </article>
    `;
    return;
  }

  const avgPain = calculateAveragePain();
  const highPainCount = appState.history.filter((item) => Number(item.dolor) >= 7).length;
  const topSymptom = getMostFrequentSymptom();
  const correlation = getStrongestCorrelation();

  container.innerHTML = `
    <article class="insight-card">
      <span class="insight-label">Media</span>
      <strong class="insight-value">${avgPain}</strong>
      <p class="insight-text">Dor media registrada ate agora.</p>
    </article>
    <article class="insight-card">
      <span class="insight-label">Dor alta</span>
      <strong class="insight-value">${highPainCount} dias</strong>
      <p class="insight-text">Registros com nivel 7 ou maior.</p>
    </article>
    <article class="insight-card">
      <span class="insight-label">Sintoma mais frequente</span>
      <strong class="insight-value">${topSymptom}</strong>
      <p class="insight-text">O que mais aparece junto da dor.</p>
    </article>
    <article class="insight-card">
      <span class="insight-label">Correlacao base</span>
      <strong class="insight-value">Insight honesto</strong>
      <p class="insight-text">${correlation}</p>
    </article>
  `;
}

function calculateAveragePain() {
  const total = appState.history.reduce((sum, item) => sum + Number(item.dolor || 0), 0);
  return (total / appState.history.length).toFixed(1);
}

function getMostFrequentSymptom() {
  const counts = {
    inflamacao: 0,
    dor: 0,
    fadiga: 0,
    depressao: 0
  };

  appState.history.forEach((item) => {
    (item.sintomas || []).forEach((symptom) => {
      if (counts[symptom] !== undefined) {
        counts[symptom] += 1;
      }
    });
  });

  let topKey = null;
  let topCount = 0;

  Object.keys(counts).forEach((key) => {
    if (counts[key] > topCount) {
      topKey = key;
      topCount = counts[key];
    }
  });

  return topKey ? SYMPTOM_META[topKey] : "Sem tendencia clara";
}

function getStrongestCorrelation() {
  const highPainRecords = appState.history.filter((item) => Number(item.dolor) >= 7);

  if (!highPainRecords.length) {
    return "Ainda nao ha dor alta suficiente para uma conclusao.";
  }

  const badSleepCount = highPainRecords.filter((item) => item.contexto && item.contexto.sleep === "ruim").length;
  const highStressCount = highPainRecords.filter((item) => item.contexto && item.contexto.stress === "alto").length;
  const foodTriggerCount = highPainRecords.filter((item) => item.contexto && item.contexto.food === "sim").length;

  if (badSleepCount >= highStressCount && badSleepCount >= foodTriggerCount && badSleepCount > 0) {
    return "Os dias de dor alta aparecem varias vezes junto de sono ruim. Vale olhar isso com carinho.";
  }

  if (highStressCount >= foodTriggerCount && highStressCount > 0) {
    return "O estresse alto se repete bastante nos registros mais duros.";
  }

  if (foodTriggerCount > 0) {
    return "A comida gatilho aparece varias vezes quando a dor sobe.";
  }

  const byPhase = {};
  highPainRecords.forEach((item) => {
    const phase = item.ciclo && item.ciclo.phase ? item.ciclo.phase : "lutea";
    byPhase[phase] = (byPhase[phase] || 0) + 1;
  });

  const topPhase = Object.keys(byPhase).sort((a, b) => byPhase[b] - byPhase[a])[0];
  const title = CYCLE_PROTOCOLS[topPhase] ? CYCLE_PROTOCOLS[topPhase].title.toLowerCase() : "fase mais registrada";
  return `Por enquanto, a dor alta aparece mais em ${title}.`;
}

function showCrisis() {
  document.getElementById("screen-checkin").style.display = "none";
  document.getElementById("screen-confirm").classList.remove("active");
  document.getElementById("screen-crisis").classList.add("active");
}

function hideCrisis() {
  document.getElementById("screen-crisis").classList.remove("active");
  document.getElementById("screen-checkin").style.display = "flex";
}

function resetApp() {
  appState.selectedPain = null;
  appState.selectedSymptoms.clear();
  appState.context = {
    sleep: null,
    stress: null,
    food: null
  };

  document.querySelectorAll(".pain-btn").forEach((button) => {
    button.classList.remove("selected");
  });

  document.querySelectorAll(".symptom-tag").forEach((tag) => {
    tag.className = "symptom-tag";
  });

  document.querySelectorAll(".tag-check").forEach((check) => {
    check.textContent = "";
  });

  document.querySelectorAll(".context-chip").forEach((chip) => {
    chip.classList.remove("selected");
  });

  document.getElementById("note-fadiga").textContent = "Nao e preguica. E seu corpo lutando.";
  document.getElementById("pain-feedback").classList.remove("visible");
  document.getElementById("pain-feedback").textContent = "";
  document.getElementById("screen-confirm").classList.remove("active");
  document.getElementById("screen-crisis").classList.remove("active");
  document.getElementById("screen-checkin").style.display = "flex";

  updateSupportCard();
  updateRegisterButton();
}
