document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompleted = document.getElementById('clearCompleted');
    const filterButtons = document.querySelectorAll('.filter');
    const congratsMessage = document.getElementById('congratsMessage'); // For showing the congratulations message
    
    // App State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize
    renderTasks();
    updateTaskCount();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    clearCompleted.addEventListener('click', clearCompletedTasks);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active filter
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
    
    // Functions
    function addTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText !== '') {
            // Create new task object
            const newTask = {
                id: Date.now().toString(),
                text: taskText,
                completed: false,
                createdAt: new Date()
            };
            
            // Add to tasks array
            tasks.push(newTask);
            saveTasks();
            
            // Clear input
            taskInput.value = '';
            
            // Render and focus back on input
            renderTasks();
            updateTaskCount();
            taskInput.focus();
        }
    }
    
    function toggleTaskStatus(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
        updateTaskCount();
        
        // Check if all tasks are completed
        if (tasks.every(task => task.completed)) {
            showCongratulations();
        }
    }
    
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateTaskCount();
        
        // Check if all tasks are completed
        if (tasks.every(task => task.completed)) {
            showCongratulations();
        }
    }
    
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
    
    function renderTasks() {
        // Clear the list
        taskList.innerHTML = '';
        
        // Filter tasks based on current filter
        let filteredTasks = tasks;
        
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Sort by creation date (newest first)
        filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Create task elements
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            
            taskElement.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <button class="delete-btn">×</button>
            `;
            
            // Add hover effect to task item
            taskElement.addEventListener('mouseover', function() {
                taskElement.style.transform = 'scale(1.05)';
                taskElement.style.backgroundColor = '#f0f0f0';
            });
            taskElement.addEventListener('mouseout', function() {
                taskElement.style.transform = 'scale(1)';
                taskElement.style.backgroundColor = '';
            });
            
            // Add event listeners to the task elements
            const checkbox = taskElement.querySelector('.task-checkbox');
            const deleteBtn = taskElement.querySelector('.delete-btn');
            
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            // Append to the list
            taskList.appendChild(taskElement);
        });
        
        // Show message if no tasks
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<p style="text-align: center; color: #999; padding: 20px;">No tasks to show</p>`;
        }
    }
    
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Show congratulations message
    function showCongratulations() {
        congratsMessage.style.display = 'block';
        
        // Trigger confetti animation or a fun effect here
        document.body.classList.add('confetti');
    }
    
    // Helper to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            })[tag]);
    }
});
