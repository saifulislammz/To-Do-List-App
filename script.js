// script.js
document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const addBtn = document.getElementById('add-btn');
    const searchInput = document.getElementById('search');
    const modal = document.getElementById('modal');
    const noteInput = document.getElementById('note-input');
    const cancelBtn = document.getElementById('cancel-btn');
    const applyBtn = document.getElementById('apply-btn');
    const filterSelect = document.getElementById('filter');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const themeToggle = document.getElementById('theme-toggle');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editingTaskId = null;
    let deletingTaskId = null;

    // Load dark mode state from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️'; // Show sun icon for light mode toggle
    } else {
        themeToggle.textContent = '🌙'; // Show moon icon for dark mode toggle
    }

    // SVG for Delete Icon
    const deleteIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
            <path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="3" d="M29.5,11.5V11c0-3-2.5-5.5-5.5-5.5S18.5,8,18.5,11v0.5"/>
            <line x1="7.5" x2="40.5" y1="11.5" y2="11.5" fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3"/>
            <line x1="36.5" x2="38" y1="27" y2="11.5" fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3"/>
            <path fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M10.7,18.6l2,20.3c0.2,2.1,1.9,3.6,4,3.6h14.7c2.1,0,3.8-1.6,4-3.6l0.5-4.8"/>
        </svg>
    `;

    // SVG for Edit Icon
    const editIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" width="20px" height="20px">
            <path fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" d="M10.5,25.9L5,27l1.1-5.5L21.7,5.9c1.3-1.3,3.1-1.3,4.4,0l0,0c1.3,1.3,1.3,3.1,0,4.4L10.5,25.9z"/>
            <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="20.4" y1="7.4" x2="24.7" y2="11.7"/>
            <path fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" d="M10.8,25.6c-0.5-2.2-2.2-3.9-4.4-4.4"/>
        </svg>
    `;

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Show modal
    addBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        noteInput.value = '';
        editingTaskId = null;
    });

    // Hide modal
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Add or edit task from modal
    applyBtn.addEventListener('click', () => {
        const input = noteInput.value.trim();
        if (input) {
            if (editingTaskId) {
                tasks = tasks.map(task => task.id === editingTaskId ? { ...task, text: input } : task);
                editingTaskId = null;
            } else {
                const task = {
                    id: Date.now(),
                    text: input,
                    completed: false,
                    completedDate: null
                };
                tasks.push(task);
            }
            renderTasks();
            saveTasks();
            modal.style.display = 'none';
        }
    });

    // Check if a task is older than 24 hours
    function isOlderThan24Hours(completedDate) {
        if (!completedDate) return false;
        const now = new Date();
        const completed = new Date(completedDate);
        const diffInMs = now - completed;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        return diffInHours > 24;
    }

    // Render tasks
    function renderTasks() {
        todoList.innerHTML = '';
        const filter = filterSelect.value;
        let tasksToRender = tasks;

        if (filter === 'history') {
            tasksToRender = tasks.filter(task => task.completed);
        } else if (filter === 'all') {
            tasksToRender = tasks.filter(task => !task.completed || (task.completed && !isOlderThan24Hours(task.completedDate)));
        }

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            if (filter === 'history' && task.completed) {
                li.className = 'history-item';
                li.innerHTML = `
                    <span class="task-text">${task.text}</span>
                    <span class="date">${task.completedDate ? new Date(task.completedDate).toLocaleDateString() : ''}</span>
                `;
            } else {
                li.className = 'todo-item' + (task.completed ? ' completed' : '');
                li.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                    <label>${task.text}</label>
                    <div class="actions">
                        <button onclick="editTask(${task.id})">${editIcon}</button>
                        <button onclick="deleteTask(${task.id})">${deleteIcon}</button>
                    </div>
                `;
            }
            todoList.appendChild(li);
        });
    }

    // Toggle task completion
    window.toggleTask = function(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                if (!task.completed) {
                    task.completed = true;
                    task.completedDate = new Date().toISOString();
                }
            }
            return task;
        });
        renderTasks();
        saveTasks();
    };

    // Edit task
    window.editTask = function(id) {
        const task = tasks.find(task => task.id === id);
        if (task) {
            editingTaskId = id;
            noteInput.value = task.text;
            modal.style.display = 'flex';
        }
    };

    // Delete task with custom confirmation
    window.deleteTask = function(id) {
        deletingTaskId = id;
        confirmModal.style.display = 'flex';
    };

    // Cancel delete confirmation
    confirmCancelBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        deletingTaskId = null;
    });

    // Confirm delete
    confirmDeleteBtn.addEventListener('click', () => {
        if (deletingTaskId !== null) {
            tasks = tasks.filter(task => task.id !== deletingTaskId);
            renderTasks();
            saveTasks();
            confirmModal.style.display = 'none';
            deletingTaskId = null;
        }
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filter = filterSelect.value;
        let filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(query));

        if (filter === 'history') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (filter === 'all') {
            filteredTasks = filteredTasks.filter(task => !task.completed || (task.completed && !isOlderThan24Hours(task.completedDate)));
        }

        todoList.innerHTML = '';
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            if (filter === 'history' && task.completed) {
                li.className = 'history-item';
                li.innerHTML = `
                    <span class="task-text">${task.text}</span>
                    <span class="date">${task.completedDate ? new Date(task.completedDate).toLocaleDateString() : ''}</span>
                `;
            } else {
                li.className = 'todo-item' + (task.completed ? ' completed' : '');
                li.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                    <label>${task.text}</label>
                    <div class="actions">
                        <button onclick="editTask(${task.id})">${editIcon}</button>
                        <button onclick="deleteTask(${task.id})">${deleteIcon}</button>
                    </div>
                `;
            }
            todoList.appendChild(li);
        });
    });

    // Filter functionality
    filterSelect.addEventListener('change', renderTasks);

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙'; // Toggle icon
    });

    // Initial render
    renderTasks();
});