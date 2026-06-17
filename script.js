const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const errorMessage = document.querySelector("#error-message");
const emptyState = document.querySelector("#empty-state");
const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const filterButtons = document.querySelectorAll(".filter-btn");

const STORAGE_KEY = "vanillaTodoApp.todos";

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = "all";

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function updateStats() {
  totalCount.textContent = todos.length;
  completedCount.textContent = todos.filter((todo) => todo.completed).length;
}

function renderTodos() {
  todoList.innerHTML = "";

  const filteredTodos = getFilteredTodos();

  emptyState.classList.toggle("show", filteredTodos.length === 0);

  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input
        class="todo-checkbox"
        type="checkbox"
        ${todo.completed ? "checked" : ""}
        aria-label="Mark ${todo.text} as completed"
      />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="action-group">
        <button type="button" class="edit-btn">Edit</button>
        <button type="button" class="delete-btn">Delete</button>
      </div>
    `;

    todoList.appendChild(li);
  });

  updateStats();
}

function addTodo(text) {
  todos.push({
    id: crypto.randomUUID(),
    text,
    completed: false
  });

  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );

  saveTodos();
  renderTodos();
}

function startEditMode(todoItem, id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  todoItem.innerHTML = `
    <input class="edit-input" type="text" value="${escapeHtml(todo.text)}" maxlength="80" />
    <div class="action-group">
      <button type="button" class="save-btn">Save</button>
      <button type="button" class="cancel-btn">Cancel</button>
    </div>
  `;

  const editInput = todoItem.querySelector(".edit-input");
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);
}

function saveEditedTodo(id, newText) {
  const cleanText = newText.trim();

  if (!cleanText) {
    showError("Task cannot be empty.");
    return;
  }

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: cleanText } : todo
  );

  clearError();
  saveTodos();
  renderTodos();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskText = input.value.trim();

  if (!taskText) {
    showError("Please enter a task before adding.");
    input.focus();
    return;
  }

  clearError();
  addTodo(taskText);
  input.value = "";
  input.focus();
});

todoList.addEventListener("click", (event) => {
  const todoItem = event.target.closest(".todo-item");
  if (!todoItem) return;

  const id = todoItem.dataset.id;

  if (event.target.classList.contains("delete-btn")) {
    deleteTodo(id);
  }

  if (event.target.classList.contains("edit-btn")) {
    startEditMode(todoItem, id);
  }

  if (event.target.classList.contains("save-btn")) {
    const editInput = todoItem.querySelector(".edit-input");
    saveEditedTodo(id, editInput.value);
  }

  if (event.target.classList.contains("cancel-btn")) {
    clearError();
    renderTodos();
  }
});

todoList.addEventListener("change", (event) => {
  if (!event.target.classList.contains("todo-checkbox")) return;

  const todoItem = event.target.closest(".todo-item");
  toggleTodo(todoItem.dataset.id);
});

todoList.addEventListener("keydown", (event) => {
  if (!event.target.classList.contains("edit-input")) return;

  const todoItem = event.target.closest(".todo-item");
  const id = todoItem.dataset.id;

  if (event.key === "Enter") {
    saveEditedTodo(id, event.target.value);
  }

  if (event.key === "Escape") {
    clearError();
    renderTodos();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTodos();
  });
});

renderTodos();
