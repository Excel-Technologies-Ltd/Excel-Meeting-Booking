

import {
  useFrappeCreateDoc,
  useFrappeDeleteDoc,
  useFrappeGetDocList,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaPlus, FaTrash } from "react-icons/fa";

type ToDoItem = {
  name: string;
  date: string;
  description: string;
  status: "Open" | "Closed";
};

const ToDoPage = () => {
  const { data: todos, mutate, error } = useFrappeGetDocList<ToDoItem>("ToDo", {
    fields: ["name", "description", "date", "status"],
    orderBy: { field: "creation", order: "desc" },
  });

  const { createDoc, loading: createLoading } = useFrappeCreateDoc();
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { deleteDoc, loading: deleteLoading } = useFrappeDeleteDoc();

  const [newTodo, setNewTodo] = useState<{ description: string; date: string }>({
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleAdd = () => {
    if (!newTodo.description) {
      toast.error("Description is required");
      return;
    }
    createDoc("ToDo", {
      description: newTodo.description,
      date: newTodo.date,
      status: "Open",
    })
      .then(() => {
        toast.success("Task added");
        setNewTodo({ description: "", date: new Date().toISOString().split("T")[0] });
        mutate();
      })
      .catch((e) => {
        toast.error("Failed to add task: " + e.message);
      });
  };

  const handleStatusChange = (name: string, currentStatus: string) => {
    const newStatus = currentStatus === "Open" ? "Closed" : "Open";
    updateDoc("ToDo", name, { status: newStatus })
      .then(() => {
        toast.success("Task updated");
        mutate();
      })
      .catch((e) => {
        toast.error("Failed to update task: " + e.message);
      });
  };

  const handleDelete = (name: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteDoc("ToDo", name)
        .then(() => {
          toast.success("Task deleted");
          mutate();
        })
        .catch((e) => {
          toast.error("Failed to delete task: " + e.message);
        });
    }
  };

  if (error) return <div className="text-red-500">Error loading tasks: {error.message}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">To Do List</h1>

      {/* Add New Task */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            placeholder="What needs to be done?"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={newTodo.date}
            onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={createLoading}
        >
          {createLoading ? <span className="loading loading-spinner"></span> : <FaPlus />} Add
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {!todos || todos.length === 0 ? (
          <p className="text-center text-gray-500">No tasks found. Add a new one!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.name}
              className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${
                todo.status === "Open" ? "border-blue-500" : "border-green-500"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={todo.status === "Closed"}
                  onChange={() => handleStatusChange(todo.name, todo.status)}
                  disabled={updateLoading}
                />
                <div className={todo.status === "Closed" ? "line-through text-gray-400" : ""}>
                  <h3 className="font-semibold text-lg">{todo.description}</h3>
                  <p className="text-sm text-gray-500">{todo.date}</p>
                </div>
              </div>
              <button
                className="btn btn-ghost text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                onClick={() => handleDelete(todo.name)}
                disabled={deleteLoading}
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ToDoPage;