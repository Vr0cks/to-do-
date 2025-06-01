// LocalStorage'dan todo'ları al veya boş dizi başlat
let todo = JSON.parse(localStorage.getItem("todo")) || [];

// Gerekli DOM elemanlarını seç
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const addButton = document.querySelector(".btn");
const deleteButton = document.getElementById("deleteButton");

// Dil verileri
const LANG = {
  tr: {
    title: "To Do Listesi",
    placeholder: "Yapılacak bir şey ekle...",
    datePlaceholder: "Tarih/Saat",
    add: "Ekle",
    deleteAll: "Tümünü Sil",
    taskCount: (n) => `${n} görev var`,
    footer: 'Hazırlayan <b>Yiğit (vRocks)</b>',
    editPlaceholder: "Görev düzenle...",
  },
  en: {
    title: "To Do List",
    placeholder: "Add a task...",
    datePlaceholder: "Date/Time",
    add: "Add",
    deleteAll: "Delete All",
    taskCount: (n) => `${n} task${n === 1 ? '' : 's'}`,
    footer: 'Created by <b>Yiğit (vRocks)</b>',
    editPlaceholder: "Edit task...",
  }
};

let currentLang = localStorage.getItem("lang") || "tr";

// Dil değiştirici
const langSelect = document.getElementById("langSelect");
langSelect.value = currentLang;
langSelect.addEventListener("change", function() {
  currentLang = langSelect.value;
  localStorage.setItem("lang", currentLang);
  updateLang();
  displayTasks();
});

// Arayüzdeki metinleri güncelle
function updateLang() {
  const l = LANG[currentLang];
  document.getElementById("title").textContent = l.title;
  todoInput.placeholder = l.placeholder;
  document.getElementById("todo-date").placeholder = l.datePlaceholder;
  document.getElementById("addBtn").textContent = l.add;
  document.getElementById("deleteButton").textContent = l.deleteAll;
  document.getElementById("footerText").innerHTML = l.footer;
  // Sayaç güncellemesi displayTasks içinde
}

// LibreTranslate API ile otomatik çeviri (ücretsiz)
async function libreTranslate(text, targetLang) {
  const res = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    body: JSON.stringify({
      q: text,
      source: "auto",
      target: targetLang,
      format: "text"
    }),
    headers: { "Content-Type": "application/json" }
  });
  const data = await res.json();
  return data.translatedText;
}

// Görev ekle (her zaman seçili dile çevirerek ekler)
async function addTask(e) {
  e.preventDefault(); // Form submitte sayfa yenilenmesin

  const newTask = todoInput.value.trim();
  if (newTask !== "") {
    let translatedText = newTask;
    try {
      translatedText = await libreTranslate(newTask, currentLang === "tr" ? "tr" : "en");
    } catch (err) {
      translatedText = newTask;
    }
    todo.push({ text: translatedText, disabled: false, lang: currentLang });
    saveToLocalStorage();
    todoInput.value = "";
    displayTasks();
  }
}

// Görevleri ekrana yazdır (artık çeviri gerekmez, çünkü eklerken çeviriyoruz)
function displayTasks() {
  todoList.innerHTML = "";
  for (let index = 0; index < todo.length; index++) {
    let item = todo[index];
    let taskText = item.text;

    const p = document.createElement("p");
    p.innerHTML = `
      <div class="todo-container">
        <input type="checkbox" class="todo-checkbox" id="input-${index}" ${item.disabled ? "checked" : ""}>
        <p id="todo-${index}" class="${item.disabled ? "disabled" : ""}" onclick="editTask(${index})">${taskText}</p>
      </div>
    `;
    p.querySelector(".todo-checkbox").addEventListener("change", () =>
      toggleTask(index)
    );
    todoList.appendChild(p);
  }
  todoCount.textContent = LANG[currentLang].taskCount(todo.length);
}

// Görev düzenleme (tıklayınca input'a dönüşür)
function editTask(index) {
  const todoItem = document.getElementById(`todo-${index}`);
  const existingText = todo[index].text;
  const inputElement = document.createElement("input");

  inputElement.value = existingText;
  todoItem.replaceWith(inputElement);
  inputElement.focus();

  // Düzenleme bitince kaydet
  inputElement.addEventListener("blur", function () {
    const updatedText = inputElement.value.trim();
    if (updatedText) {
      todo[index].text = updatedText;
      todo[index].lang = currentLang; // Düzenlenen görevin dilini güncelle
      saveToLocalStorage();
    }
    displayTasks();
  });
}

// Görev tamamlandı/tamamlanmadı olarak değiştir
function toggleTask(index) {
  todo[index].disabled = !todo[index].disabled;
  saveToLocalStorage();
  displayTasks();
}

// Tüm görevleri sil
function deleteAllTasks() {
  todo = [];
  saveToLocalStorage();
  displayTasks();
}

// LocalStorage'a kaydet
function saveToLocalStorage() {
  localStorage.setItem("todo", JSON.stringify(todo));
}

// Sayfa yüklenince dili uygula
document.addEventListener("DOMContentLoaded", function () {
  // addButton.addEventListener("click", function(e) {
  //   e.preventDefault();
  //   addTask();
  // });
  addButton.addEventListener("click", addTask);
  document.getElementById("todo-form").addEventListener("submit", addTask);
  todoInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  });
  deleteButton.addEventListener("click", deleteAllTasks);
  updateLang();
  displayTasks();
});