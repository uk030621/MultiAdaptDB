//app/fields/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Fields() {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    options: [],
  });
  const [editingField, setEditingField] = useState(null);
  const [dbName, setDbName] = useState("");

  // ✨ New: Temporary input values for "select" fields
  const [newFieldTempValue, setNewFieldTempValue] = useState("");
  const [editingFieldTempValue, setEditingFieldTempValue] = useState("");

  useEffect(() => {
    fetch("/api/dbnames")
      .then((res) => res.json())
      .then((data) => {
        const dbIndex = 2;
        setDbName(data.dbNames[dbIndex]?.name || `Database ${dbIndex + 1}`);
      })
      .catch((err) => console.error("Failed to fetch database name:", err));
  }, []);

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    if (!editingField) {
      setNewField((prev) => ({
        ...prev,
        name: generateUniqueCode(),
      }));
    }
  }, [editingField]);

  const fetchFields = async () => {
    const response = await fetch("/api/fields3", { method: "GET" });
    const data = await response.json();
    setFields(data);
  };

  const generateUniqueCode = () => {
    return `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  const addField = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/fields3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newField),
    });

    if (response.ok) {
      await fetchFields();
      setNewField({
        name: generateUniqueCode(),
        label: "",
        type: "text",
        options: [],
      });
      setNewFieldTempValue("");
    } else {
      console.error("Failed to add field");
    }
  };

  const updateField = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/fields3", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingField._id, ...editingField }),
    });

    if (response.ok) {
      await fetchFields();
      setEditingField(null);
      setEditingFieldTempValue("");
    } else {
      console.error("Failed to update field");
    }
  };

  const deleteField = async (id, name) => {
    const response = await fetch("/api/fields3", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });

    if (response.ok) {
      await fetchFields();
    } else {
      console.error("Failed to delete field");
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedFields = [...fields];
    const [movedItem] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, movedItem);

    setFields(reorderedFields);

    await fetch("/api/fields3/reorder3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reorderedFields),
    });
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Navigation */}
      <Link
        href="/"
        className="bg-blue-800 hover:bg-blue-600 px-2 py-2 rounded-md mt-4 text-sm text-white"
      >
        Back
      </Link>
      <Link
        href="/customers3"
        className="bg-blue-800 hover:bg-blue-600 px-2 py-2 ml-8 rounded-md mt-4 text-sm text-white"
      >
        Go To {dbName} Records
      </Link>

      {/* Header */}
      <div className="flex items-center gap-1 mt-4 mb-4">
        <h1 className="text-2xl">
          <span className="text-red-600 font-bold">{dbName} Design</span>
        </h1>
      </div>

      {/* Add Field */}
      {!editingField && (
        <form onSubmit={addField} className="mb-6">
          <h2 className="mb-1 text-xl font-semibold">Add New Label</h2>

          <input
            type="text"
            placeholder="Label"
            value={newField.label}
            onChange={(e) =>
              setNewField({ ...newField, label: e.target.value })
            }
            className="bg-white border p-2 rounded mr-2 mb-2"
            required
          />

          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            className="bg-yellow-100 border p-2 rounded mr-2"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="textarea">Long Text</option>
            <option value="select">Dropdown</option>
            <option value="url">URL</option>
          </select>

          {/* 🔧 Augmented Dropdown Options Input */}
          {newField.type === "select" && (
            <div>
              <input
                type="text"
                placeholder="Type option and press comma"
                value={newFieldTempValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.endsWith(",")) {
                    const newOption = value.slice(0, -1).trim();
                    if (newOption && !newField.options.includes(newOption)) {
                      setNewField((prev) => ({
                        ...prev,
                        options: [...prev.options, newOption],
                      }));
                    }
                    setNewFieldTempValue("");
                  } else {
                    setNewFieldTempValue(value);
                  }
                }}
                className="bg-white border p-2 rounded w-full mt-2"
              />

              {newField.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newField.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-sm"
                    >
                      {opt}
                      <button
                        type="button"
                        className="ml-1 text-blue-600 hover:text-red-600"
                        onClick={() => {
                          setNewField((prev) => ({
                            ...prev,
                            options: prev.options.filter((o) => o !== opt),
                          }));
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* URL input */}
          {newField.type === "url" && (
            <div className="hidden">
              <input
                type="text"
                placeholder="Enter A Test URL"
                value={newField.value || "Dummy"}
                onChange={(e) =>
                  setNewField({ ...newField, value: e.target.value })
                }
                className="border p-2 rounded w-full mt-2"
                required
              />
              {newField.value && (
                <p className="mt-2">
                  Preview:{" "}
                  <a
                    href={newField.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {newField.value}
                  </a>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-800 hover:bg-blue-600 text-white mt-3 px-4 py-2 rounded"
          >
            Add Field
          </button>
        </form>
      )}

      {/* Edit Field */}
      {editingField && (
        <form onSubmit={updateField} className="mb-6">
          <h2 className="mb-1 text-xl font-semibold">Edit Field</h2>
          <input
            type="text"
            placeholder="Label"
            value={editingField.label}
            onChange={(e) =>
              setEditingField({ ...editingField, label: e.target.value })
            }
            className="bg-white border p-2 rounded mr-2 mb-2"
            required
          />
          <select
            value={editingField.type}
            onChange={(e) =>
              setEditingField({ ...editingField, type: e.target.value })
            }
            className="bg-yellow-100 border p-2 rounded mr-2"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="textarea">Long Text</option>
            <option value="select">Dropdown</option>
            <option value="url">URL</option>
          </select>

          {/* 🔧 Augmented Dropdown Options Input */}
          {editingField.type === "select" && (
            <div>
              <input
                type="text"
                placeholder="Type option and press comma"
                value={editingFieldTempValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.endsWith(",")) {
                    const newOption = value.slice(0, -1).trim();
                    if (
                      newOption &&
                      !editingField.options.includes(newOption)
                    ) {
                      setEditingField((prev) => ({
                        ...prev,
                        options: [...prev.options, newOption],
                      }));
                    }
                    setEditingFieldTempValue("");
                  } else {
                    setEditingFieldTempValue(value);
                  }
                }}
                className="bg-white border p-2 rounded w-full mt-2"
              />

              {editingField.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingField.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-sm"
                    >
                      {opt}
                      <button
                        type="button"
                        className="ml-1 text-blue-600 hover:text-red-600"
                        onClick={() => {
                          setEditingField((prev) => ({
                            ...prev,
                            options: prev.options.filter((o) => o !== opt),
                          }));
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* URL input */}
          {editingField.type === "url" && (
            <div className="hidden">
              <input
                type="text"
                placeholder="Enter A Test URL"
                value={editingField.value || "Dummy"}
                onChange={(e) =>
                  setEditingField({ ...editingField, value: e.target.value })
                }
                className="border p-2 rounded w-full mt-2"
                required
              />
              {editingField.value && (
                <p className="mt-2">
                  Preview:{" "}
                  <a
                    href={editingField.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {editingField.value}
                  </a>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="bg-green-800 hover:bg-green-600 text-white px-4 py-2 rounded mr-2 mt-3"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => setEditingField(null)}
            className="bg-slate-800 hover:bg-slate-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Field List */}
      <h2 className="text-xl font-semibold mb-2">
        Field List{" "}
        <span className="text-base text-slate-800">(Drag to Reorder)</span>
      </h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <table
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-full border-collapse bg-white rounded shadow"
            >
              <thead className="bg-slate-200">
                <tr>
                  <th className="border p-2">Label</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <Draggable
                    key={field._id}
                    draggableId={field._id}
                    index={index}
                  >
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="hover:bg-gray-100 cursor-pointer"
                      >
                        <td className="border p-2">{field.label}</td>
                        <td className="border p-2">{field.type}</td>
                        <td className="border p-2">
                          <div className="grid columns-1 gap-4">
                            <button
                              onClick={() => {
                                setEditingField(field);
                                setEditingFieldTempValue("");
                              }}
                            >
                              ✍️
                            </button>
                            <button
                              onClick={() => {
                                const confirmed = window.confirm(
                                  `Are you sure you want to delete the "${field.label}" field? This action cannot be undone.`
                                );
                                if (confirmed) {
                                  deleteField(field._id, field.name);
                                }
                              }}
                            >
                              ❌
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
