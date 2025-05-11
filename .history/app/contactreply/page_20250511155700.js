// app/contactreply/page.js
"use client";

import { useEffect, useState } from "react";

export default function ContactReplyPage() {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/contactreply");
        const { success, data, message } = await res.json();
        if (success) {
          setContacts(data);
        } else {
          setError(message || "Failed to load contacts");
        }
      } catch (err) {
        setError("Error fetching contact data");
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contact Submissions</h1>

      {error && <div className="text-red-600">{error}</div>}

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="px-4 py-2">Full Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Message</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{contact.fullname}</td>
                <td className="px-4 py-2">{contact.email}</td>
                <td className="px-4 py-2">{contact.message}</td>
                <td className="px-4 py-2">
                  {new Date(contact.date).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
