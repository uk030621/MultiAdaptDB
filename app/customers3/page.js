//app/customers/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // To toggle the dropdown
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Loading state
  const [dbName, setDbName] = useState("");

  // Fetch the database name for this page
  useEffect(() => {
    fetch("/api/dbnames")
      .then((res) => res.json())
      .then((data) => {
        const dbIndex = 2; // Assuming this is for "Database 3"
        setDbName(data.dbNames[dbIndex]?.name || `Database ${dbIndex + 1}`);
      })
      .catch((err) => console.error("Failed to fetch database name:", err));
  }, []);

  // Fetch customers and fields
  useEffect(() => {
    fetchFields();
    fetchCustomers();
  }, []);

  const fetchFields = async () => {
    const response = await fetch("/api/fields3", { method: "GET" });
    const data = await response.json();

    // Sort fields based on saved order
    setFields(data.sort((a, b) => a.order - b.order));
  };

  const fetchCustomers = async () => {
    setLoading(true); // Set loading to true
    const response = await fetch("/api/customers3", { method: "GET" });
    const data = await response.json();
    setCustomers(data);
    setLoading(false); // Set loading to false after fetch
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/customers3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      await fetchCustomers();
      setFormData({});
      setDropdownOpen(false); // Close dropdown after adding
    } else {
      console.error("Failed to add customer");
    }
  };

  const updateCustomer = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/customers3", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingCustomer._id, ...formData }),
    });

    if (response.ok) {
      await fetchCustomers();
      setEditingCustomer(null);
      setFormData({});
      setDropdownOpen(false); // Close dropdown after updating
    } else {
      console.error("Failed to update customer");
    }
  };

  const deleteCustomer = async (id) => {
    const response = await fetch("/api/customers3", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await fetchCustomers();
    } else {
      console.error("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    fields.some((field) =>
      customer[field.name]
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen p-8  bg-background">
      <Link
        href="/"
        className="bg-blue-800 px-2 py-2 rounded-md mt-4 text-sm align-self text-white hover:bg-blue-600"
      >
        Back
      </Link>
      <Link
        href="/fields3"
        className="bg-blue-800 px-2 py-2 ml-8 rounded-md mt-4 text-sm align-self text-white hover:bg-blue-600"
      >
        Go To {dbName} Design
      </Link>

      <div className="flex items-center gap-1 mt-4 mb-4">
        <h1 className="text-2xl  ">
          <span className="text-red-600 font-bold"> {dbName}</span>
        </h1>
        {/*<h1 className=" text-3xl font-bold">Database 3 Records</h1>*/}
        {/*<Image
          src="/Adb.png" // Replace with your image path
          alt="Database Icon"
          width={40} // Adjust width as needed
          height={40} // Adjust height as needed
          className="bg-transparent"
        />*/}
      </div>
      {/* Fast Search */}
      <div className="flex items-center gap-2 mb-4 fix-container">
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white border p-2 rounded flex-grow"
        />
        {searchTerm && ( // Show button only when searchTerm is not empty
          <button
            onClick={() => setSearchTerm("")}
            className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading Message */}
      {loading ? (
        <p className="text-gray-500">Records loading...</p>
      ) : (
        <>
          {/* Toggleable Dropdown for Add/Edit Form */}
          <div className="mb-6">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setEditingCustomer(null);
                setFormData({});
              }}
              className="bg-blue-800 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {dropdownOpen ? "Close Form ▴" : "New Record ▾"}
            </button>
            {dropdownOpen && (
              <div className="mt-4 bg-white shadow-lg rounded p-4">
                <h2 className="text-xl font-semibold mb-4">
                  {editingCustomer ? "Edit Record" : "Add New Record"}
                </h2>
                <form onSubmit={editingCustomer ? updateCustomer : addCustomer}>
                  {fields.map((field) => (
                    <div key={field._id} className="mb-4">
                      <label className="block text-gray-700">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          className="border p-2 rounded w-full"
                          required
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          className="border p-2 rounded w-full"
                          rows="4"
                          required
                        ></textarea>
                      ) : (
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          className="border p-2 rounded w-full"
                          required
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="bg-green-800 hover:bg-green-600 text-white px-4 py-2 rounded mr-4"
                  >
                    {editingCustomer ? "Update Record" : "Add Record"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setEditingCustomer(null);
                      setFormData({});
                    }}
                    className="bg-slate-800 hover:bg-slate-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Responsive Customer Table */}
          <h2 className="text-xl text-red-500 font-bold mb-2 underline">
            Records
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded shadow">
              <thead className="bg-slate-200">
                <tr>
                  {fields.map((field) => (
                    <th key={field._id} className="border p-2 text-left">
                      {field.label}
                    </th>
                  ))}
                  <th className="bg-slate-200 border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    {fields.map((field) => (
                      <td key={field._id} className="border p-2">
                        {/* Make email clickable */}
                        {field.type === "email" ? (
                          <a
                            href={`mailto:${customer[field.name]}`}
                            className="text-blue-600 underline"
                          >
                            {customer[field.name]}
                          </a>
                        ) : field.type === "url" ? (
                          <a
                            href={customer[field.name]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {customer[field.name]}
                          </a>
                        ) : field.type === "date" ? (
                          formatDate(customer[field.name])
                        ) : field.type === "textarea" ? (
                          <div className="textarea-content">
                            {customer[field.name]}
                          </div>
                        ) : (
                          customer[field.name] || ""
                        )}
                      </td>
                    ))}
                    <td className="border p-2">
                      <div className="grid columns-1 gap-4">
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setFormData(customer); // Pre-fill form data
                            setDropdownOpen(true); // Open dropdown for editing
                          }}
                          className=""
                        >
                          ✍️
                        </button>
                        <button
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Are you sure you want to delete this record?`
                            );
                            if (confirmed) {
                              deleteCustomer(customer._id);
                            }
                          }}
                          className=""
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
