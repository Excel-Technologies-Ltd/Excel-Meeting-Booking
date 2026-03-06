

import { Button, Heading, Input, Spinner, Text } from "@chakra-ui/react";
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
      <Heading as="h1" size="xl" className="mb-6 ">To Do List</Heading>

      {/* Add New Task */}
      <div className="bg-white/20 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <Input
            type="text"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            placeholder="What needs to be done?"
            className="w-full border-gray-300 dark:border-gray-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <Input
            type="date"
            value={newTodo.date}
            onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
            className="w-full border-gray-300 dark:border-gray-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
        </div>
        <Button
          colorPalette="primary"
          onClick={handleAdd}
          disabled={createLoading}
        >
          {createLoading ? <Spinner size="sm" /> : <FaPlus />} Add
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {!todos || todos.length === 0 ? (
          <Text className="text-center text-white/90">No tasks found. Add a new one!</Text>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.name}
              className={`flex items-center justify-between p-4 bg-white/20! dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${
                todo.status === "Open" ? "border-blue-500" : "border-green-500"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[var(--color-primary)]_ cursor-pointer"
                  checked={todo.status === "Closed"}
                  onChange={() => handleStatusChange(todo.name, todo.status)}
                  disabled={updateLoading}
                />
                <div className={todo.status === "Closed" ? "line-through text-gray-400" : ""}>
                  <Text className="font-semibold text-lg">{todo.description}</Text>
                  <Text className="text-sm text-gray-500">{todo.date}</Text>
                </div>
              </div>
              <Button
                variant="ghost"
                colorPalette="red"
                onClick={() => handleDelete(todo.name)}
                disabled={deleteLoading}
                className="hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <FaTrash />
              </Button>
            </div>
          ))
        )}

        <Button bg={"primary"}>Click me</Button>
      </div>
    </div>
  );
};

export default ToDoPage;