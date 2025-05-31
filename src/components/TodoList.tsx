import React, { useState, useEffect } from 'react';
import './TodoList.css';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type SortOption = 'none' | 'alphabetical' | 'date' | 'completed';
type FilterOption = 'all' | 'active' | 'completed';

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Input validation
  const validateInput = (text: string): string => {
    if (!text.trim()) {
      return 'Task cannot be empty';
    }
    if (text.trim().length < 3) {
      return 'Task must be at least 3 characters long';
    }
    if (text.trim().length > 100) {
      return 'Task cannot exceed 100 characters';
    }
    if (tasks.some(task => task.text.toLowerCase() === text.trim().toLowerCase())) {
      return 'Task already exists';
    }
    return '';
  };

  // Add new task
  const addTask = () => {
    const trimmedInput = inputValue.trim();
    const error = validateInput(trimmedInput);
    
    if (error) {
      setInputError(error);
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      text: trimmedInput,
      completed: false,
      createdAt: new Date()
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    setInputValue('');
    setInputError('');
  };

  // Remove task
  const removeTask = (id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // Toggle task completion
  const toggleCompletion = (id: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (inputError) {
      setInputError('');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  // Sort tasks
  const getSortedTasks = (tasks: Task[]): Task[] => {
    switch (sortBy) {
      case 'alphabetical':
        return [...tasks].sort((a, b) => a.text.localeCompare(b.text));
      case 'date':
        return [...tasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'completed':
        return [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));
      default:
        return tasks;
    }
  };

  // Filter tasks
  const getFilteredTasks = (tasks: Task[]): Task[] => {
    switch (filterBy) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  // Get processed tasks (sorted and filtered)
  const processedTasks = getFilteredTasks(getSortedTasks(tasks));

  // Clear all completed tasks
  const clearCompleted = () => {
    setTasks(prevTasks => prevTasks.filter(task => !task.completed));
  };

  // Clear all tasks
  const clearAll = () => {
    setTasks([]);
  };

  return (
    <div className="todo-container">
      <header className="todo-header">
        <h1>Todo List</h1>
        <p>Stay organized and productive!</p>
      </header>

      {/* Input Section */}
      <div className="todo-input-section">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className={`todo-input ${inputError ? 'error' : ''}`}
            maxLength={100}
          />
          <button onClick={addTask} className="add-button">
            Add Task
          </button>
        </div>
        {inputError && <div className="error-message">{inputError}</div>}
      </div>

      {/* Controls Section */}
      <div className="todo-controls">
        <div className="control-group">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="control-select"
          >
            <option value="none">Default</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="date">Date Created</option>
            <option value="completed">Completion Status</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="filter-select">Filter:</label>
          <select
            id="filter-select"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="control-select"
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="action-buttons">
          <button
            onClick={clearCompleted}
            className="clear-button"
            disabled={!tasks.some(task => task.completed)}
          >
            Clear Completed
          </button>
          <button
            onClick={clearAll}
            className="clear-all-button"
            disabled={tasks.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="todo-stats">
        <span>Total: {tasks.length}</span>
        <span>Active: {tasks.filter(task => !task.completed).length}</span>
        <span>Completed: {tasks.filter(task => task.completed).length}</span>
      </div>

      {/* Tasks List */}
      <div className="todo-list">
        {processedTasks.length === 0 ? (
          <div className="empty-state">
            {tasks.length === 0 ? (
              <p>No tasks yet. Add one above to get started!</p>
            ) : (
              <p>No tasks match the current filter.</p>
            )}
          </div>
        ) : (
          processedTasks.map(task => (
            <div key={task.id} className={`todo-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-content">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleCompletion(task.id)}
                  className="task-checkbox"
                />
                <span className="task-text">{task.text}</span>
                <span className="task-date">
                  {task.createdAt.toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => removeTask(task.id)}
                className="remove-button"
                aria-label="Remove task"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;