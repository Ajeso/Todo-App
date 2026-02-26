import { Todo, Project, TodoApp } from "./index.js";
import "./styles.css";

const app = new TodoApp();
let activeProject = app.projects[0];

const addTodoBtn = document.querySelector(".btn-add");
const dialog = document.querySelector("dialog");
const saveBtn = document.querySelector("#saveTodo");
const closeBtn = document.querySelector("#closeDialog");
const cancelBtn = document.querySelector("#cancelDialog");
const addProjectBtn = document.querySelector(".sidebar-add-project");

addProjectBtn.addEventListener("click", () => {
  const name = prompt("Enter project name:");
  if (name) {
    app.addProject(name);
    app.saveToStorage();
    renderSideBar();
  }
});

function renderSideBar() {
  const projectList = document.querySelector("#projectList");
  projectList.innerHTML = "";

  for (const project of app.projects) {
    const projectItem = document.createElement("div");
    projectItem.classList.add("sidebar-item");
    projectItem.textContent = project.name;

    if (project === activeProject) {
      projectItem.classList.add("active");
    }

    projectItem.addEventListener("click", () => {
      document
        .querySelectorAll("#projectList .sidebar-item")
        .forEach((item) => {
          item.classList.remove("active");
        });
      projectItem.classList.add("active");
      activeProject = project;
      renderTodos(project);
    });

    projectList.appendChild(projectItem);
  }
} // ✅ renderSideBar closes here

function renderTodos(project) {
  const todoList = document.querySelector(".todo-list");
  todoList.innerHTML = "";

  for (const todo of project.todos) {
    const todoCard = document.createElement("div");
    todoCard.classList.add("todo-card");
    todoCard.innerHTML = `
      <div class="priority-bar p-${todo.priority}"></div>
      <div class="todo-checkbox"></div>
      <div class="todo-content">
        <div class="todo-title">${todo.title}</div>
        <div class="todo-desc">${todo.description}</div>
        <div class="todo-meta">
          <span class="meta-tag">📅 ${todo.dueDate}</span>
          <span class="priority-badge badge-${todo.priority}">${todo.priority}</span>
        </div>
      </div>
      <div class="todo-actions">
        <div class="action-btn edit">✏️</div>
        <div class="action-btn delete">🗑</div>
      </div>
    `;

    // ── DELETE ──
    const deleteBtn = todoCard.querySelector(".delete");
    deleteBtn.addEventListener("click", () => {
      activeProject.removeTodo(todo.id);
      app.saveToStorage();
      renderTodos(activeProject);
    });

    // ── EDIT ──
    const editBtn = todoCard.querySelector(".edit");
    editBtn.addEventListener("click", () => {
      document.querySelector("#todoTitle").value = todo.title;
      document.querySelector("#todoDescription").value = todo.description;
      document.querySelector("#todoDueDate").value = todo.dueDate;
      document.querySelector("#todoPriority").value = todo.priority;
      document.querySelector("#todoNotes").value = todo.notes;
      dialog.showModal();

      saveBtn.onclick = () => {
        app.editTodo(todo.id, {
          title: document.querySelector("#todoTitle").value,
          description: document.querySelector("#todoDescription").value,
          dueDate: document.querySelector("#todoDueDate").value,
          priority: document.querySelector("#todoPriority").value,
          notes: document.querySelector("#todoNotes").value,
        });
        app.saveToStorage();
        dialog.close();
        renderTodos(activeProject);
      };
    });

    todoList.appendChild(todoCard);
  }
} // ✅ renderTodos closes here

// ── OPEN DIALOG (new todo) ──
addTodoBtn.addEventListener("click", () => {
  document.querySelector("#todoTitle").value = "";
  document.querySelector("#todoDescription").value = "";
  document.querySelector("#todoDueDate").value = "";
  document.querySelector("#todoNotes").value = "";
  saveBtn.onclick = null;
  document.querySelector("#titleError").classList.remove("visible");

  dialog.showModal();
});

// ── SAVE NEW TODO ──
saveBtn.addEventListener("click", () => {
  const title = document.querySelector("#todoTitle").value;
  const description = document.querySelector("#todoDescription").value;
  const dueDate = document.querySelector("#todoDueDate").value;
  const priority = document.querySelector("#todoPriority").value;
  const notes = document.querySelector("#todoNotes").value;
  const errorMsg = document.querySelector("#titleError");

  if (title.trim() === "") {
    errorMsg.classList.add("visible");
    return;
  }
  errorMsg.classList.remove("visible");

  const todo = new Todo(title, description, dueDate, priority, notes, []);
  activeProject.addTodo(todo);
  app.saveToStorage();
  dialog.close();
  renderTodos(activeProject);
});

// ── CLOSE DIALOG ──
closeBtn.addEventListener("click", () => dialog.close());
cancelBtn.addEventListener("click", () => dialog.close());

// ── INIT ──
function init() {
  renderSideBar();
  renderTodos(activeProject);
}

init();
