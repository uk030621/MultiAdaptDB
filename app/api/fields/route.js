//app/api/fields/route.js
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const DB_NAME = "flexidb1";
const FIELDCOLLECTION_NAME = "fields";
const CUSTOMER_COLLECTION_NAME = "customers";

// Get all fields
export async function GET(_req) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const fields = await db.collection(FIELDCOLLECTION_NAME).find({}).toArray();
  return new Response(JSON.stringify(fields), { status: 200 });
}

// Add a new field
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const newField = await req.json();

  try {
    // Add new field to the fields collection
    await db.collection(FIELDCOLLECTION_NAME).insertOne(newField);

    // Add the new field to all existing customers with a default value
    const defaultValue = null; // Default value for the new field
    await db
      .collection(CUSTOMER_COLLECTION_NAME)
      .updateMany({}, { $set: { [newField.name]: defaultValue } });

    return new Response(
      JSON.stringify({ message: "Field added successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding field:", error);
    return new Response(JSON.stringify({ error: "Failed to add field" }), {
      status: 500,
    });
  }
}

// Update an existing field
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.error("❌ Unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const { id, _id, ...updatedField } = await req.json(); // Exclude `_id`

    console.log("📩 Received PUT request body:", { id, updatedField });

    if (!id) {
      console.error("❌ Missing ID in request");
      return new Response(JSON.stringify({ error: "Missing field ID" }), {
        status: 400,
      });
    }

    let objectId;
    if (ObjectId.isValid(id)) {
      objectId = new ObjectId(id); // Convert valid string to ObjectId
    }

    console.log(
      "🚀 Searching for field to update with queries:",
      [
        { _id: id }, // If stored as string
        objectId ? { _id: objectId } : null, // If stored as ObjectId
      ].filter(Boolean)
    );

    // ✅ Update using BOTH string and ObjectId formats
    const result = await db.collection(FIELDCOLLECTION_NAME).updateOne(
      {
        $or: [{ _id: id }, objectId ? { _id: objectId } : null].filter(Boolean),
      },
      { $set: updatedField }
    );

    if (result.matchedCount === 0) {
      console.error("❌ Field not found:", id);
      return new Response(JSON.stringify({ error: "Field not found" }), {
        status: 404,
      });
    }

    console.log("✅ Field updated successfully:", id);
    return new Response(
      JSON.stringify({ message: "Field updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error updating field:", error);
    return new Response(JSON.stringify({ error: "Failed to update field" }), {
      status: 500,
    });
  }
}

// Delete a field
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.error("❌ Unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const { id, name } = await req.json();

    console.log("📩 Received DELETE request body:", { id, name });

    if (!id) {
      console.error("❌ Missing ID in request");
      return new Response(JSON.stringify({ error: "Missing field ID" }), {
        status: 400,
      });
    }

    let objectId;
    if (ObjectId.isValid(id)) {
      objectId = new ObjectId(id); // Convert valid string to ObjectId
    }

    console.log(
      "🚀 Searching for field with queries:",
      [
        { _id: id }, // If stored as string
        objectId ? { _id: objectId } : null, // If stored as ObjectId
      ].filter(Boolean)
    );

    // ✅ Query using BOTH string and ObjectId formats
    const field = await db.collection(FIELDCOLLECTION_NAME).findOne({
      $or: [{ _id: id }, objectId ? { _id: objectId } : null].filter(Boolean),
    });

    if (!field) {
      console.error("❌ Field not found in DB:", id);
      return new Response(JSON.stringify({ error: "Field not found" }), {
        status: 404,
      });
    }

    // ✅ Delete using the same $or query
    const result = await db.collection(FIELDCOLLECTION_NAME).deleteOne({
      $or: [{ _id: id }, objectId ? { _id: objectId } : null].filter(Boolean),
    });

    if (result.deletedCount === 0) {
      console.error("❌ Field deletion failed:", id);
      return new Response(JSON.stringify({ error: "Field not found" }), {
        status: 404,
      });
    }

    console.log("✅ Field deleted successfully:", id);
    return new Response(
      JSON.stringify({ message: "Field deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error deleting field:", error);
    return new Response(JSON.stringify({ error: "Failed to delete field" }), {
      status: 500,
    });
  }
}
