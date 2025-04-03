//app/api/fields/reorder/route.js
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const DB_NAME = "flexidb1";
const FIELDCOLLECTION_NAME = "fields";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const updatedFields = await req.json();

  try {
    // Replace existing fields with reordered fields
    await db.collection(FIELDCOLLECTION_NAME).deleteMany({});
    await db.collection(FIELDCOLLECTION_NAME).insertMany(updatedFields);

    return new Response(
      JSON.stringify({ message: "Fields reordered successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reordering fields:", error);
    return new Response(JSON.stringify({ error: "Failed to reorder fields" }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const { id, name } = await req.json(); // ✅ Ensure both values are coming

  try {
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid field ID" }), {
        status: 400,
      });
    }

    // ✅ Convert `id` to ObjectId before querying MongoDB
    const objectId = new ObjectId(id);

    // ✅ Try finding the field before deleting
    const field = await db
      .collection(FIELDCOLLECTION_NAME)
      .findOne({ _id: objectId });

    if (!field) {
      return new Response(JSON.stringify({ error: "Field not found" }), {
        status: 404,
      });
    }

    // ✅ Delete field from fields collection
    const result = await db
      .collection(FIELDCOLLECTION_NAME)
      .deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Field not found" }), {
        status: 404,
      });
    }

    // ✅ Remove the field from all customers
    await db
      .collection(CUSTOMER_COLLECTION_NAME)
      .updateMany({}, { $unset: { [name]: "" } });

    return new Response(
      JSON.stringify({ message: "Field deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting field:", error);
    return new Response(JSON.stringify({ error: "Failed to delete field" }), {
      status: 500,
    });
  }
}
