import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from './TodoList';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('TodoList Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test('renders todo list header', () => {
    render(<TodoList />);
    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByText('Stay organized and productive!')).toBeInTheDocument();
  });

  test('adds a new task when input is valid', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByText('Add Task');
    
    await user.type(input, 'Test task');
    await user.click(addButton);
    
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  test('shows error for empty task', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const addButton = screen.getByText('Add Task');
    await user.click(addButton);
    
    expect(screen.getByText('Task cannot be empty')).toBeInTheDocument();
  });

  test('shows error for short task', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByText('Add Task');
    
    await user.type(input, 'AB');
    await user.click(addButton);
    
    expect(screen.getByText('Task must be at least 3 characters long')).toBeInTheDocument();
  });

  test('toggles task completion', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    // Add a task
    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'Test task');
    await user.click(screen.getByText('Add Task'));
    
    // Toggle completion
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(checkbox).toBeChecked();
  });

  test('removes a task', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    // Add a task
    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'Test task');
    await user.click(screen.getByText('Add Task'));
    
    // Remove the task
    const removeButton = screen.getByLabelText('Remove task');
    await user.click(removeButton);
    
    expect(screen.queryByText('Test task')).not.toBeInTheDocument();
  });

  test('filters tasks correctly', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    // Add tasks
    const input = screen.getByPlaceholderText('Add a new task...');
    
    await user.type(input, 'Active task');
    await user.click(screen.getByText('Add Task'));
    
    await user.clear(input);
    await user.type(input, 'Completed task');
    await user.click(screen.getByText('Add Task'));
    
    // Complete second task
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    
    // Filter to show only active tasks
    const filterSelect = screen.getByLabelText('Filter:');
    await user.selectOptions(filterSelect, 'active');
    
    expect(screen.getByText('Active task')).toBeInTheDocument();
    expect(screen.queryByText('Completed task')).not.toBeInTheDocument();
  });

  test('sorts tasks alphabetically', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    // Add tasks in reverse alphabetical order
    const input = screen.getByPlaceholderText('Add a new task...');
    
    await user.type(input, 'Zebra task');
    await user.click(screen.getByText('Add Task'));
    
    await user.clear(input);
    await user.type(input, 'Apple task');
    await user.click(screen.getByText('Add Task'));
    
    // Sort alphabetically
    const sortSelect = screen.getByLabelText('Sort by:');
    await user.selectOptions(sortSelect, 'alphabetical');
    
    const tasks = screen.getAllByText(/task/);
    expect(tasks[0]).toHaveTextContent('Apple task');
    expect(tasks[1]).toHaveTextContent('Zebra task');
  });

  test('adds task with Enter key', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'Enter key task{enter}');
    
    expect(screen.getByText('Enter key task')).toBeInTheDocument();
  });
});