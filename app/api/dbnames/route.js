import clientPromise from "@/lib/mongodb";

const DB_NAME = "flexidb1";
const COLLECTION_NAME = "dbname"; // MongoDB collection for database names

// Fetch database names from MongoDB
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const dbNames = await db.collection(COLLECTION_NAME).find({}).toArray();

    // Ensure default database names exist if the collection is empty
    if (dbNames.length === 0) {
      const defaultDbNames = [
        { index: 0, name: "Database 1" },
        { index: 1, name: "Database 2" },
        { index: 2, name: "Database 3" },
      ];
      await db.collection(COLLECTION_NAME).insertMany(defaultDbNames);
      return new Response(JSON.stringify({ dbNames: defaultDbNames }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ dbNames }), { status: 200 });
  } catch (error) {
    console.error("Error fetching database names:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch database names" }),
      { status: 500 }
    );
  }
}

// Update or add database names in MongoDB
export async function POST(req) {
  try {
    const { index, name } = await req.json();

    // Validate input
    if (index < 0 || !name.trim()) {
      return new Response(JSON.stringify({ error: "Invalid database name!" }), {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Update the database name based on the index
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { index }, // Find by index
      { $set: { name } }, // Update name
      { upsert: true } // Insert if it doesn't exist
    );
    console.log(result); // Log or use the result

    // Fetch updated database names
    const updatedDbNames = await db
      .collection(COLLECTION_NAME)
      .find({})
      .toArray();

    return new Response(JSON.stringify({ dbNames: updatedDbNames }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating database name:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update database name" }),
      { status: 500 }
    );
  }
}
