//app/api/customers/route.js
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const DB_NAME = "flexidb1";
const COLLECTION_NAME = "customers3";

export async function GET(_req) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const customers = await db.collection(COLLECTION_NAME).find({}).toArray();
  return new Response(JSON.stringify(customers), { status: 200 });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const newCustomer = await req.json();
  await db.collection(COLLECTION_NAME).insertOne(newCustomer);
  return new Response(JSON.stringify({ message: "Customer added" }), {
    status: 201,
  });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Parse request body
    const { id, _id, ...updatedCustomer } = await req.json(); // Exclude `_id`

    // Debugging: Check received data
    console.log("Received PUT request - ID:", id);
    console.log("Updated Customer Data:", updatedCustomer);

    // Ensure the ID is valid before querying MongoDB
    if (!id || !ObjectId.isValid(id)) {
      console.error("Invalid customer ID:", id);
      return new Response(JSON.stringify({ error: "Invalid customer ID" }), {
        status: 400,
      });
    }

    // Convert string ID to MongoDB ObjectId
    const objectId = new ObjectId(id);

    // Attempt update operation
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: objectId },
      { $set: updatedCustomer } // `_id` is no longer in the update data
    );

    // Debugging: Check update result
    console.log("MongoDB Update Result:", result);

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Customer not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Customer updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating customer:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update customer" }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const { id } = await req.json();

  try {
    // Convert the ID to an ObjectId before using it in the query
    const result = await db
      .collection(COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response("Customer not found", { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: "Customer deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to delete customer" }),
      { status: 500 }
    );
  }
}
