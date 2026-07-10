(function () {
  "use strict";

  var STORAGE_KEY = "familiaAlmeidaSarcinelli";

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
    "ARrumar o cabelo",
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
    "ARrumar o cabelo",
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

  function pad(number) {
    return number < 10 ? "0" + number : String(number);
  }

  function dateKey() {
    var date = new Date();
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function weekKey() {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), 0, 1);
    var week = Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);
    return date.getFullYear() + "-W" + week;
  }

  function nowTime() {
    var date = new Date();
    return pad(date.getHours()) + ":" + pad(date.getMinutes());
  }

  function defaultState() {
    return {
      todayDate: dateKey(),
      today: {},
      jovana: {},
      lorenzo: {},
      weekKey: weekKey(),
      weekly: {},
      shopping: [],
      dogSwapDate: "",
      dogSwapped: false,
      dogDone: {}
    };
  }

  function isArray(value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  }

  function loadState() {
    var data = null;

    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      data = null;
    }

    if (!data || typeof data !== "object") {
      data = defaultState();
    }

    data.today = data.today && typeof data.today === "object" ? data.today : {};
    data.jovana = data.jovana && typeof data.jovana === "object" ? data.jovana : {};
    data.lorenzo = data.lorenzo && typeof data.lorenzo === "object" ? data.lorenzo : {};
    data.weekly = data.weekly && typeof data.weekly === "object" ? data.weekly : {};
    data.shopping = isArray(data.shopping) ? data.shopping : [];

    /* Migra dados de versões antigas que usavam "dogdone". */
    if (!data.dogDone || typeof data.dogDone !== "object") {
      data.dogDone = data.dogdone && typeof data.dogdone === "object" ? data.dogdone : {};
    }
    if (data.dogdone) {
      delete data.dogdone;
    }

    data.dogSwapped = data.dogSwapped === true;
    data.dogSwapDate = typeof data.dogSwapDate === "string" ? data.dogSwapDate : "";

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      alert("Não foi possível salvar neste navegador. Verifique se a navegação privada está desativada.");
    }
  }

  function makeTask(title, isDone, infoText, actionText, clickHandler) {
    var task = document.createElement("div");
    var main = document.createElement("div");
    var titleElement = document.createElement("span");
    var meta = document.createElement("span");
    var action = document.createElement("div");
    var button = document.createElement("button");

    task.className = "task" + (isDone ? " done" : "");
    main.className = "task-main";
    titleElement.className = "task-title";
    meta.className = "task-meta";
    action.className = "task-action";
    button.className = "check-btn";
    button.type = "button";

    titleElement.appendChild(document.createTextNode(title));
    meta.appendChild(document.createTextNode(infoText || "Ainda não concluída"));
    button.appendChild(document.createTextNode(isDone ? "Desmarcar" : actionText));
    button.onclick = clickHandler;

    main.appendChild(titleElement);
    main.appendChild(meta);
    action.appendChild(button);
    task.appendChild(main);
    task.appendChild(action);

    return task;
  }

  function renderToday() {
    var list = document.getElementById("today-list");
    var i;

    if (!list) return;
    list.innerHTML = "";

    for (i = 0; i < TODAY_TASKS.length; i++) {
      (function (index) {
        var record = state.today[index];
        var info = record ? "Feito por " + record.person + " às " + record.time : "";

        list.appendChild(makeTask(TODAY_TASKS[index], !!record, info, "Concluir", function () {
          if (state.today[index]) {
            delete state.today[index];
            saveState();
            renderToday();
          } else {
            pendingTask = { type: "today", index: index };
            openModal();
          }
        }));
      })(i);
    }
  }

  function renderChildTasks(elementId, tasks, childState, childName) {
    var list = document.getElementById(elementId);
    var i;

    if (!list) return;
    list.innerHTML = "";

    for (i = 0; i < tasks.length; i++) {
      (function (index) {
        var record = childState[index];
        var info = record ? "Concluído às " + record.time : "Ainda não concluída";

        list.appendChild(makeTask(tasks[index], !!record, info, "Concluir", function () {
          if (childState[index]) {
            delete childState[index];
          } else {
            childState[index] = { person: childName, time: nowTime() };
          }
          saveState();
          renderChildren();
        }));
      })(i);
    }
  }

  function renderChildren() {
    renderChildTasks("jovana-list", JOVANA_TASKS, state.jovana, "Jovana");
    renderChildTasks("lorenzo-list", LORENZO_TASKS, state.lorenzo, "Lorenzo");
  }

  function renderWeekly() {
    var list = document.getElementById("weekly-list");
    var i;

    if (!list) return;
    list.innerHTML = "";

    for (i = 0; i < WEEKLY_TASKS.length; i++) {
      (function (index) {
        var person = state.weekly[index];
        var info = person ? "Escolhida por " + person : "Ainda não escolhida";

        list.appendChild(makeTask(WEEKLY_TASKS[index], !!person, info, "Escolher", function () {
          if (state.weekly[index]) {
            delete state.weekly[index];
            saveState();
            renderWeekly();
          } else {
            pendingTask = { type: "weekly", index: index };
            openModal();
          }
        }));
      })(i);
    }
  }

  function renderShopping() {
    var list = document.getElementById("shopping-list");
    var i;

    if (!list) return;
    list.innerHTML = "";

    if (!state.shopping.length) {
      var empty = document.createElement("p");
      empty.className = "hint";
      empty.appendChild(document.createTextNode("Nenhum item adicionado."));
      list.appendChild(empty);
      return;
    }

    for (i = 0; i < state.shopping.length; i++) {
      (function (index) {
        var item = state.shopping[index];
        var info = item.bought ? "Comprado" : "Pendente";

        list.appendChild(makeTask(item.name, item.bought, info, "Comprei", function () {
          item.bought = !item.bought;
          saveState();
          renderShopping();
        }));
      })(i);
    }
  }

  function dogAssignment() {
    var date = new Date();
    var evenDay = date.getDate() % 2 === 0;
    var first = evenDay ? "Jovana" : "Lorenzo";
    var second = evenDay ? "Lorenzo" : "Jovana";
    var temporary;

    if (state.dogSwapped) {
      temporary = first;
      first = second;
      second = temporary;
    }

    return [first, second];
  }

  function renderDogs() {
    var duty = document.getElementById("dog-duty");
    var list = document.getElementById("dog-list");
    var assignment;
    var i;

    if (!duty || !list) return;

    assignment = dogAssignment();
    duty.innerHTML = "<strong>Revezamento de hoje</strong><br>🐶 Alimentação e água: " +
      assignment[0] + "<br>🧹 Tapete e cocô: " + assignment[1];
    list.innerHTML = "";

    for (i = 0; i < DOG_TASKS.length; i++) {
      (function (index) {
        var record = state.dogDone[index];
        var info = record ? "Concluído às " + record.time + " por " + record.person : "Ainda não concluída";

        list.appendChild(makeTask(DOG_TASKS[index], !!record, info, "Concluir", function () {
          if (state.dogDone[index]) {
            delete state.dogDone[index];
          } else {
            state.dogDone[index] = { person: assignment[index], time: nowTime() };
          }
          saveState();
          renderDogs();
        }));
      })(i);
    }
  }

  function renderAll() {
    renderToday();
    renderChildren();
    renderWeekly();
    renderShopping();
    renderDogs();
  }

  function openModal() {
    var modal = document.getElementById("person-modal");
    if (modal) modal.className = "modal";
  }

  function closeModal() {
    var modal = document.getElementById("person-modal");
    if (modal) modal.className = "modal hidden";
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

  function bindNavigation() {
    var buttons = document.getElementsByClassName("nav-btn");
    var i;

    for (i = 0; i < buttons.length; i++) {
      buttons[i].onclick = function () {
        var targetScreen = this.getAttribute("data-screen");
        var allButtons = document.getElementsByClassName("nav-btn");
        var screens = document.getElementsByClassName("screen");
        var j;

        for (j = 0; j < allButtons.length; j++) allButtons[j].className = "nav-btn";
        for (j = 0; j < screens.length; j++) screens[j].className = "screen";

        this.className = "nav-btn active";
        document.getElementById(targetScreen).className = "screen active";
      };
    }
  }

  function bindEvents() {
    var people = document.getElementsByClassName("person");
    var i;
    var element;

    bindNavigation();

    for (i = 0; i < people.length; i++) {
      people[i].onclick = function () {
        choosePerson(this.getAttribute("data-person"));
      };
    }

    element = document.getElementById("cancel-modal");
    if (element) element.onclick = closeModal;

    element = document.getElementById("reset-today");
    if (element) {
      element.onclick = function () {
        if (confirm("Apagar todas as marcações de hoje?")) {
          state.today = {};
          saveState();
          renderToday();
        }
      };
    }

    element = document.getElementById("reset-jovana");
    if (element) {
      element.onclick = function () {
        if (confirm("Apagar todas as marcações da Jovana hoje?")) {
          state.jovana = {};
          saveState();
          renderChildren();
        }
      };
    }

    element = document.getElementById("reset-lorenzo");
    if (element) {
      element.onclick = function () {
        if (confirm("Apagar todas as marcações do Lorenzo hoje?")) {
          state.lorenzo = {};
          saveState();
          renderChildren();
        }
      };
    }

    element = document.getElementById("reset-week");
    if (element) {
      element.onclick = function () {
        if (confirm("Apagar todas as escolhas da semana?")) {
          state.weekly = {};
          saveState();
          renderWeekly();
        }
      };
    }

    element = document.getElementById("shopping-form");
    if (element) {
      element.onsubmit = function (event) {
        var input = document.getElementById("shopping-input");
        var name;

        if (event && event.preventDefault) event.preventDefault();
        name = input.value.replace(/^\s+|\s+$/g, "");

        if (name) {
          state.shopping.push({ name: name, bought: false });
          input.value = "";
          saveState();
          renderShopping();
        }
        return false;
      };
    }

    element = document.getElementById("clear-bought");
    if (element) {
      element.onclick = function () {
        var pendingItems = [];
        var index;

        for (index = 0; index < state.shopping.length; index++) {
          if (!state.shopping[index].bought) pendingItems.push(state.shopping[index]);
        }

        state.shopping = pendingItems;
        saveState();
        renderShopping();
      };
    }

    element = document.getElementById("swap-dog-duty");
    if (element) {
      element.onclick = function () {
        state.dogSwapped = !state.dogSwapped;
        state.dogSwapDate = dateKey();
        state.dogDone = {};
        saveState();
        renderDogs();
      };
    }
  }

  bindEvents();
  saveState();
  renderAll();
})();
