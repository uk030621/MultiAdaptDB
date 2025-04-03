"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const [showGuide, setShowGuide] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  const [dbNames, setDbNames] = useState([]);
  const [newDbNames, setNewDbNames] = useState(["", "", ""]); // State for individual inputs

  useEffect(() => {
    fetch("/api/dbnames")
      .then((res) => res.json())
      .then((data) => setDbNames(data.dbNames))
      .catch((err) => console.error("Failed to fetch database names:", err));
  }, []);

  const updateDbName = async (index) => {
    const name = newDbNames[index].trim(); // Get the name for the specific index
    if (!name) {
      alert("Database name cannot be empty!");
      return;
    }

    const response = await fetch("/api/dbnames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, name }),
    });

    if (response.ok) {
      const updatedDbNames = await response.json();
      setDbNames(updatedDbNames.dbNames);
      const updatedNewDbNames = [...newDbNames];
      updatedNewDbNames[index] = ""; // Clear the input field for this index
      setNewDbNames(updatedNewDbNames);
    } else {
      alert("Failed to update database name!");
    }
  };

  const handleInputChange = (index, value) => {
    const updatedNewDbNames = [...newDbNames];
    updatedNewDbNames[index] = value;
    setNewDbNames(updatedNewDbNames);
  };

  useEffect(() => {
    if (session?.user.email === adminEmail) {
      fetch("/api/emails")
        .then((res) => res.json())
        .then((data) => setAllowedEmails(data.allowedEmails))
        .catch((err) => console.error("Failed to fetch allowed emails:", err));
    }
  }, [session, adminEmail]);

  const addEmail = async () => {
    if (!newEmail.trim()) return alert("Email cannot be empty.");

    const response = await fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail.trim() }),
    });

    if (response.ok) {
      const data = await response.json();
      setAllowedEmails(data.allowedEmails);
      setNewEmail("");
    } else {
      alert("Failed to add email.");
    }
  };

  const removeEmail = async (email) => {
    const response = await fetch("/api/emails", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = await response.json();
      setAllowedEmails(data.allowedEmails);
    } else {
      alert("Failed to remove email.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col py-4 items-center justify-start bg-background">
      <h1 className="text-slate-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">
        Adaptable Database System
      </h1>
      <Image
        src="/Adb.png" // Replace with your image path
        alt="Database Icon"
        width={120} // Adjust width as needed
        height={120} // Adjust height as needed
        className="bg-transparent mb-1 mt-1"
      />
      <div className="mt-2 mb-3 px-4">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-fit text-sm bg-slate-900 hover:bg-slate-600 text-white px-14 py-2 rounded text-center"
        >
          {showGuide ? "Hide User Guide ▴" : "User Guide ▾"}
        </button>
        {showGuide && (
          <div className="mt-2 bg-white shadow-lg rounded p-4">
            <h2 className="text-lg font-semibold mb-4">
              How to Use the System
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Sign In:</strong> Use your Google account to sign in
                securely.
              </li>
              <li>
                <strong>Database Records:</strong> Navigate to view, add, edit,
                and delete records.
              </li>
              <li>
                <strong>Database Design:</strong> Modify fields dynamically.
              </li>
              <li>
                <strong>Fast Search:</strong> Quickly find data using the search
                bar.
              </li>
            </ul>
          </div>
        )}
      </div>

      {status === "loading" ? (
        <p>Loading...</p>
      ) : session ? (
        <>
          <p>Welcome, {session.user.name}!</p>
          {session.user.email === adminEmail && (
            <div className="mt-2 w-fit max-w-md px-6 py-2 bg-yellow-100 border-2 shadow-md rounded">
              <h2 className="text-lg font-bold mb-2">
                Admin - Manage Allowed Emails
              </h2>
              <ul className="mb-4">
                {allowedEmails.map((email) => (
                  <li
                    key={email}
                    className="flex justify-between items-center mb-2"
                  >
                    <span>{email}</span>
                    {email !== adminEmail && (
                      <button
                        onClick={() => removeEmail(email)}
                        className="text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <input
                type="email"
                placeholder="Enter email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-white border p-2 rounded w-full mb-2"
              />
              <button
                onClick={addEmail}
                className="bg-green-800 hover:bg-green-600 text-sm text-white px-4 py-2 rounded w-full"
              >
                Add Email
              </button>
            </div>
          )}
          {/* Display and update database names in a dropdown */}
          <div className="mt-3 sm:w-3/4 md:w-1/2 lg:w-1/3 mx-auto">
            <details className="bg-yellow-100 border-2 shadow-md rounded p-4 ml-5 mr-5">
              <summary className="cursor-pointer text-lg font-bold text-center text-blue-700">
                Assign Database Name
              </summary>
              <div className="mt-4">
                {dbNames.map((db, index) => (
                  <div
                    key={index}
                    className="mb-4 bg-yellow-50 p-4 border rounded shadow-sm"
                  >
                    <h2 className="text-base sm:text-lg md:text-xl font-bold mb-4 text-center">
                      {db.name || `Database ${index + 1}`}
                    </h2>
                    <input
                      type="text"
                      placeholder={`Enter name for Database ${index + 1}`}
                      value={newDbNames[index]} // Each input uses its corresponding state
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className="border rounded p-2 w-full text-sm md:text-base"
                    />
                    <button
                      onClick={() => updateDbName(index)}
                      className="bg-blue-700 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 w-full md:w-auto"
                    >
                      Update Name
                    </button>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Navigation links */}
          {dbNames.map((db, index) => (
            <div
              key={index}
              className="flex flex-col items-start mt-4 space-y-2"
            >
              {/* Database name displayed above */}
              <h2 className="font-bold text-blue-700 underline mb-1">
                {db.name || `Database ${index + 1}`}
              </h2>

              {/* Buttons side by side */}
              <div className="flex space-x-4">
                <h2 className="text-blue-700 self-center">Pages:</h2>
                {/* Conditional logic for routes */}
                <Link href={index === 0 ? `/fields` : `/fields${index + 1}`}>
                  <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded">
                    Design {/*{index === 0 ? "" : index + 1}*/}
                  </button>
                </Link>
                <Link
                  href={index === 0 ? `/customers` : `/customers${index + 1}`}
                >
                  <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded">
                    Records {/*{index === 0 ? "" : index + 1}*/}
                  </button>
                </Link>
              </div>
            </div>
          ))}

          {/*<div className="flex mt-4 space-x-4 items-center">
            <h2 className="font-bold">Database 1: </h2>
            <Link href="/fields">
              <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded">
                Design 1
              </button>
            </Link>
            <Link href="/customers">
              <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded">
                Records 1
              </button>
            </Link>
          </div>
          *<div className="flex mt-4 space-x-4 items-center">
            <h2 className="font-bold">Database 2: </h2>
            <Link href="/fields2">
              <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded ">
                Design 2
              </button>
            </Link>
            <Link href="/customers2">
              <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded ">
                Records 2
              </button>
            </Link>
          </div>
          <div className="flex mt-4 space-x-4 items-center">
            <h2 className="font-bold">Database 3: </h2>
            <Link href="/fields3">
              <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded ">
                Design 3
              </button>
            </Link>
            <Link href="/customers3">
              <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded ">
                Records 3
              </button>
            </Link>
          </div>*/}
          <button
            onClick={() => signOut()}
            className="w-3/5  text-sm mt-4 px-4 py-2 bg-red-700 hover:bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-500 text-white rounded flex items-center"
        >
          <Image
            src="/G.png" // Replace with the path to your Google logo
            alt="Google logo"
            width={30} // Set the width of the image
            height={30} // Set the height of the image
            className="rounded-md mr-2"
          />
          Sign In with Google
        </button>
      )}
    </div>
  );
}
