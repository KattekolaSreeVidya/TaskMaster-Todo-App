import axios from "axios";
import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Todo.css';

function Todo() {
    const [todoList, setTodoList] = useState([]);
    const [completedList, setCompletedList] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [editableId, setEditableId] = useState(null);
    const [editedTask, setEditedTask] = useState("");
    const [editedStatus, setEditedStatus] = useState("");
    const [editedDeadline, setEditedDeadline] = useState("");
    const [newTask, setNewTask] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [newDeadline, setNewDeadline] = useState("");
    const [showAddTaskForm, setShowAddTaskForm] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const result = await axios.get('http://127.0.0.1:3001/getTodoList');
                const allTasks = result.data;
                const pendingTasks = allTasks.filter(task => task.status !== 'completed');
                const completedTasks = allTasks.filter(task => task.status === 'completed');
                setTodoList(pendingTasks);
                setCompletedList(completedTasks);
                setPendingCount(pendingTasks.length);
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
            }
        };
        fetchTasks();
    }, []);

    const toggleEditable = (id) => {
        const rowData = todoList.find((data) => data._id === id);
        if (rowData) {
            setEditableId(id);
            setEditedTask(rowData.task);
            setEditedStatus(rowData.status);
            setEditedDeadline(rowData.deadline || "");
        } else {
            setEditableId(null);
            setEditedTask("");
            setEditedStatus("");
            setEditedDeadline("");
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask || !newStatus || !newDeadline) {
            alert("All fields must be filled out.");
            return;
        }

        try {
            const res = await axios.post('http://127.0.0.1:3001/addTodoList', { task: newTask, status: newStatus, deadline: newDeadline });
            const updatedList = [...todoList, res.data];
            const pendingTasks = updatedList.filter(task => task.status !== 'completed');
            const completedTasks = updatedList.filter(task => task.status === 'completed');
            setTodoList(pendingTasks);
            setCompletedList(completedTasks);
            setPendingCount(pendingTasks.length);
            setNewTask("");
            setNewStatus("");
            setNewDeadline("");
            setShowAddTaskForm(false);
        } catch (err) {
            console.error("Failed to add task:", err);
        }
    };

    const saveEditedTask = async (id) => {
        const editedData = {
            task: editedTask,
            status: editedStatus,
            deadline: editedDeadline,
        };

        if (!editedTask || !editedStatus || !editedDeadline) {
            alert("All fields must be filled out.");
            return;
        }

        try {
            await axios.post('http://127.0.0.1:3001/updateTodoList/' + id, editedData);
            const updatedList = todoList.map(todo => (todo._id === id ? { ...todo, ...editedData } : todo));
            const pendingTasks = updatedList.filter(task => task.status !== 'completed');
            const completedTasks = updatedList.filter(task => task.status === 'completed');
            setTodoList(pendingTasks);
            setCompletedList(completedTasks);
            setPendingCount(pendingTasks.length);
            setEditableId(null);
            setEditedTask("");
            setEditedStatus("");
            setEditedDeadline("");
        } catch (err) {
            console.error("Failed to update task:", err);
        }
    };

    const markAsCompleted = async (id) => {
        const updatedTask = todoList.find(todo => todo._id === id);
        if (updatedTask) {
            updatedTask.status = 'completed';

            try {
                await axios.post('http://127.0.0.1:3001/updateTodoList/' + id, updatedTask);
                const updatedTodoList = todoList.filter(todo => todo._id !== id);
                const updatedCompletedList = [...completedList, { ...updatedTask, status: 'completed' }];
                setTodoList(updatedTodoList);
                setCompletedList(updatedCompletedList);
                setPendingCount(updatedTodoList.length);
            } catch (err) {
                console.error("Failed to mark task as completed:", err);
            }
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete('http://127.0.0.1:3001/deleteTodoList/' + id);
            const updatedTodoList = todoList.filter(todo => todo._id !== id);
            const updatedCompletedList = completedList.filter(todo => todo._id !== id);
            setTodoList(updatedTodoList);
            setCompletedList(updatedCompletedList);
            setPendingCount(updatedTodoList.length);
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    useEffect(() => {
        document.body.className = darkMode ? 'dark-mode' : '';
    }, [darkMode]);

    return (
        <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={() => setShowAddTaskForm(true)}>Add New Task</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={() => setShowAddTaskForm(false)}>Progress Tracking</a>
                        </li>
                        <li className="nav-item">
                            <button className="btn btn-outline-secondary" type="button" onClick={toggleDarkMode}>
                                {darkMode ? 'Light Mode' : 'Dark Mode'}
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Page Content */}
            <div className="row mt-3">
                <div className="col-md-12">
                    {showAddTaskForm ? (
                        <div className="form-container text-center">
                            <h2>Add New Task</h2>
                            <form onSubmit={addTask}>
                                <div className="form-group">
                                    <label htmlFor="taskName">Task Name:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="taskName"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="taskStatus">Status:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="taskStatus"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="taskDeadline">Deadline:</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        id="taskDeadline"
                                        value={newDeadline}
                                        onChange={(e) => setNewDeadline(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Add Task</button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-center">Pending Tasks</h2>
                            <p className="text-center">Pending Tasks: {pendingCount}</p>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-primary">
                                        <tr>
                                            <th>Task</th>
                                            <th>Status</th>
                                            <th>Deadline</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todoList.length > 0 ? (
                                            todoList.map((data) => (
                                                <tr key={data._id}>
                                                    <td>
                                                        {editableId === data._id ? (
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={editedTask}
                                                                onChange={(e) => setEditedTask(e.target.value)}
                                                            />
                                                        ) : (
                                                            data.task
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editableId === data._id ? (
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={editedStatus}
                                                                onChange={(e) => setEditedStatus(e.target.value)}
                                                            />
                                                        ) : (
                                                            data.status
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editableId === data._id ? (
                                                            <input
                                                                type="datetime-local"
                                                                className="form-control"
                                                                value={editedDeadline}
                                                                onChange={(e) => setEditedDeadline(e.target.value)}
                                                            />
                                                        ) : (
                                                            data.deadline
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editableId === data._id ? (
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => saveEditedTask(data._id)}
                                                            >
                                                                Save
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={() => toggleEditable(data._id)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => markAsCompleted(data._id)}
                                                                >
                                                                    Complete
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => deleteTask(data._id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4">No tasks available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <h2 className="text-center">Completed Tasks</h2>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-success">
                                        <tr>
                                            <th>Task</th>
                                            <th>Status</th>
                                            <th>Deadline</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedList.length > 0 ? (
                                            completedList.map((data) => (
                                                <tr key={data._id}>
                                                    <td>{data.task}</td>
                                                    <td>{data.status}</td>
                                                    <td>{data.deadline}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => deleteTask(data._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4">No completed tasks available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Todo;
