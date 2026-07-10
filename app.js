
(function () {
  "use strict";

  var PEOPLE = ["Carla", "Lara", "Jovana", "Lorenzo"];

  var TODAY_TASKS = [
    "Alimentar e colocar água para as cachorras",
    "Trocar tapete e recolher cocô",
    "Preparar lancheira",
    "Guardar jogo americano",
    "Tirar o lixo",
    "Lavar roupa",
    "Estender roupa",
    "Tirar roupa do varal",
    "Guardar roupas limpas",
    "Lavar louça",
    "Guardar brinquedos e organizar a bagunça",
    "Preparar mochilas e materiais",
    "Verificar o que falta comprar",
    "Agradecer por algo legal",
    "Cuidar de nós: tempo em família"
  ];
 var JOVANA_TASKS = [
    "Arrumar a cama",
    "Escovar os dentes",
    "Passar creme",
    "Passar perfume",
    "Fazer o lanche",
    "Arrumar a mochila",
      "Uniforme",
      "Calcinha",
      "Toalha",    
    "Cuidar das cachorras"
  ];
   var LORENZO_TASKS = [
    "Arrumar a cama",
    "Escovar os dentes",
    "Passar creme",
    "Passar perfume",
    "Fazer o lanche",
    "Arrumar a mochila",
      "Uniforme",
      "Cueca",
      "Toalha",    
    "Cuidar das cachorras"
  ];
   var DOG_TASKS = [
    "Alimentação e água",
    "Trocar tapete e recolher cocô"
  ];
 var WEEKLY_TASKS = [
    "Planejar cardápio da semana",
    "Preparar refeições",
    "Fazer compras do mês ou mercado",
    "Verificar itens que estão acabando",
    "Limpeza geral da casa"
  ];
  
  var state = loadState();
  var pendingTask = null;

  function defaultState() {
    return {
      todayDate: dateKey(),
      today: {},
      jovana:{},
      lorenzo:{},
      weekKey: weekKey(),
      weekly: {},
      shopping: [],
      dogSwapDate: "",
      dogSwapped: false,
      dogDone: {}
    };
  }

  function loadState() {
    var data;
    try {
      data = JSON.parse(localStorage.getItem("familiaAlmeidaSarcinelli") || "null");
    } catch (e) {
      data = null;
    }
    if (!data) data = defaultState();
    if (!data.jovana) data.jovana = {};
    if (!data.lorenzo) data.lorenzo = {};
    if (!data.weekly) data.weekly = {};
    if (!data.shopping) data.shopping = {};
    if (!data.dogdone) data.dogdone = {};
      
    if (data.todayDate !== dateKey()) {
      data.todayDate = dateKey();
      data.today = {};
      data.jovana = {};
      data.lorenzo = {};
      data.dogDone = {};
      data.dogSwapDate = "";
      data.dogSwapped = false;
    }
    if (data.weekKey !== weekKey()) {
      data.weekKey = weekKey();
      data.weekly = {};
    }
    return data;
  }

  function saveState() {
    try {
      localStorage.setItem("familiaAlmeidaSarcinelli", JSON.stringify(state));
    } catch (e) {
      alert("Não foi possível salvar neste navegador. Verifique se a navegação privada está desativada.");
    }
  }

  function dateKey() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function weekKey() {
    var d = new Date();
    var onejan = new Date(d.getFullYear(), 0, 1);
    var week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return d.getFullYear() + "-W" + week;
  }

  function pad(n) { return n < 10 ? "0" + n : n; }

  function nowTime() {
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function renderAll() {
    renderToday();
    renderChildren();
    renderWeekly();
    renderShopping();
    renderDogs();
  }

  function makeTask(title, doneInfo, onClickText, clickHandler) {
    var div = document.createElement("div");
    div.className = "task" + (doneInfo ? " done" : "");

    var main = document.createElement("div");
    main.className = "task-main";

    var t = document.createElement("span");
    t.className = "task-title";
    t.appendChild(document.createTextNode(title));
    main.appendChild(t);

    var meta = document.createElement("span");
    meta.className = "task-meta";
    meta.appendChild(document.createTextNode(doneInfo ? doneInfo : "Ainda não concluída"));
    main.appendChild(meta);

    var action = document.createElement("div");
    action.className = "task-action";

    var btn = document.createElement("button");
    btn.className = "check-btn";
    btn.appendChild(document.createTextNode(doneInfo ? "Desmarcar" : onClickText));
    btn.onclick = clickHandler;
    action.appendChild(btn);

    div.appendChild(main);
    div.appendChild(action);
    return div;
  }

  function renderToday() {
    var list = document.getElementById("today-list");
    list.innerHTML = "";
    for (var i = 0; i < TODAY_TASKS.length; i++) {
      (function (idx) {
        var rec = state.today[idx];
        var info = rec ? "Feito por " + rec.person + " às " + rec.time : "";
        list.appendChild(makeTask(TODAY_TASKS[idx], info, "Concluir", function () {
          if (state.today[idx]) {
            delete state.today[idx];
            saveState();
            renderToday();
          } else {
            pendingTask = { type: "today", index: idx };
            openModal();
          }
        }));
      })(i);
    }
  }
function renderChildren() {
  renderChildTasks(
    "jovana-list",
    JOVANA_TASKS,
    state.jovana,
    "Jovana"
  );

  renderChildTasks(
    "lorenzo-list",
    LORENZO_TASKS,
    state.lorenzo,
    "Lorenzo"
  );
}

function renderChildTasks(elementId, tasks, childState, childName) {
  var list = document.getElementById(elementId);

  if (!list) return;

  list.innerHTML = "";

  for (var i = 0; i < tasks.length; i++) {
    (function (idx) {
      var rec = childState[idx];

      var info = rec
        ? "Concluído às " + rec.time
        : "Ainda não concluída";

      list.appendChild(
        makeTask(tasks[idx], info, "Concluir", function () {
          if (childState[idx]) {
            delete childState[idx];
          } else {
            childState[idx] = {
              person: childName,
              time: nowTime()
            };
          }

          saveState();
          renderChildren();
        })
      );
    })(i);
  }
}
  function renderWeekly() {
    var list = document.getElementById("weekly-list");
    list.innerHTML = "";
    for (var i = 0; i < WEEKLY_TASKS.length; i++) {
      (function (idx) {
        var person = state.weekly[idx];
        var info = person ? "Escolhida por " + person : "";
        list.appendChild(makeTask(WEEKLY_TASKS[idx], info, "Escolher", function () {
          if (state.weekly[idx]) {
            delete state.weekly[idx];
            saveState();
            renderWeekly();
          } else {
            pendingTask = { type: "weekly", index: idx };
            openModal();
          }
        }));
      })(i);
    }
  }

  function renderShopping() {
    var list = document.getElementById("shopping-list");
    list.innerHTML = "";
    if (!state.shopping.length) {
      var empty = document.createElement("p");
      empty.className = "hint";
      empty.appendChild(document.createTextNode("Nenhum item adicionado."));
      list.appendChild(empty);
      return;
    }

    for (var i = 0; i < state.shopping.length; i++) {
      (function (idx) {
        var item = state.shopping[idx];
        var info = item.bought ? "Comprado" : "Pendente";
        list.appendChild(makeTask(item.name, info, item.bought ? "Desmarcar" : "Comprei", function () {
          item.bought = !item.bought;
          saveState();
          renderShopping();
        }));
      })(i);
    }
  }

  function dogAssignment() {
    var d = new Date();
    var even = d.getDate() % 2 === 0;
    var first = even ? "Jovana" : "Lorenzo";
    var second = even ? "Lorenzo" : "Jovana";
    if (state.dogSwapped) {
      var temp = first;
      first = second;
      second = temp;
    }
    return [first, second];
  }

  function renderDogs() {
    var ass = dogAssignment();
    document.getElementById("dog-duty").innerHTML =
      "<strong>" + ass[0] + "</strong>: alimentação e água<br>" +
      "<strong>" + ass[1] + "</strong>: trocar tapete e recolher cocô";

    var list = document.getElementById("dog-list");
    list.innerHTML = "";

    for (var i = 0; i < DOG_TASKS.length; i++) {
      (function (idx) {
        var rec = state.dogDone[idx];
        var person = ass[idx];
        var info = rec ? "Concluído por " + rec.person + " às " + rec.time : "Responsável de hoje: " + person;
        list.appendChild(makeTask(DOG_TASKS[idx], info, "Concluir", function () {
          if (state.dogDone[idx]) {
            delete state.dogDone[idx];
            saveState();
            renderDogs();
          } else {
            state.dogDone[idx] = { person: person, time: nowTime() };
            saveState();
            renderDogs();
          }
        }));
      })(i);
    }
  }

  function openModal() {
    document.getElementById("person-modal").className = "modal";
  }

  function closeModal() {
    document.getElementById("person-modal").className = "modal hidden";
    pendingTask = null;
  }

  function choosePerson(person) {
    if (!pendingTask) return;
    if (pendingTask.type === "today") {
      state.today[pendingTask.index] = { person: person, time: nowTime() };
    } else if (pendingTask.type === "weekly") {
      state.weekly[pendingTask.index] = person;
    }
    saveState();
    closeModal();
    renderAll();
  }

  function bindEvents() {
    var nav = document.getElementsByClassName("nav-btn");
    for (var i = 0; i < nav.length; i++) {
      nav[i].onclick = function () {
        var screen = this.getAttribute("data-screen");
        var buttons = document.getElementsByClassName("nav-btn");
        var screens = document.getElementsByClassName("screen");
        var j;
        for (j = 0; j < buttons.length; j++) buttons[j].className = "nav-btn";
        for (j = 0; j < screens.length; j++) screens[j].className = "screen";
        this.className = "nav-btn active";
        document.getElementById(screen).className = "screen active";
      };
    }

    var people = document.getElementsByClassName("person");
    for (var p = 0; p < people.length; p++) {
      people[p].onclick = function () {
        choosePerson(this.getAttribute("data-person"));
      };
    }

    document.getElementById("cancel-modal").onclick = closeModal;

    document.getElementById("reset-today").onclick = function () {
      if (confirm("Apagar todas as marcações de hoje?")) {
        state.today = {};
        saveState();
        renderToday();
      }
    };
var resetJovana = document.getElementById("reset-jovana");

if (resetJovana) {
  resetJovana.onclick = function () {
    if (confirm("Apagar todas as marcações da Jovana hoje?")) {
      state.jovana = {};
      saveState();
      renderChildren();
    }
  };
}

var resetLorenzo = document.getElementById("reset-lorenzo");

if (resetLorenzo) {
  resetLorenzo.onclick = function () {
    if (confirm("Apagar todas as marcações do Lorenzo hoje?")) {
      state.lorenzo = {};
      saveState();
      renderChildren();
    }
  };
}
    document.getElementById("reset-week").onclick = function () {
      if (confirm("Apagar todas as escolhas da semana?")) {
        state.weekly = {};
        saveState();
        renderWeekly();
      }
    };

    document.getElementById("shopping-form").onsubmit = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var input = document.getElementById("shopping-input");
      var name = input.value.replace(/^\s+|\s+$/g, "");
      if (name) {
        state.shopping.push({ name: name, bought: false });
        input.value = "";
        saveState();
        renderShopping();
      }
      return false;
    };

    document.getElementById("clear-bought").onclick = function () {
      var next = [];
      for (var i = 0; i < state.shopping.length; i++) {
        if (!state.shopping[i].bought) next.push(state.shopping[i]);
      }
      state.shopping = next;
      saveState();
      renderShopping();
    };

    document.getElementById("swap-dog-duty").onclick = function () {
      state.dogSwapped = !state.dogSwapped;
      state.dogSwapDate = dateKey();
      state.dogDone = {};
      saveState();
      renderDogs();
    };
  }

  bindEvents();
  renderAll();
})();
