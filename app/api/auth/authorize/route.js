import clientPromise from "@/lib/mongodb";

const DB_NAME = "flexidb1";
const ALLOWED_EMAIL_COLLECTION_NAME = "allowedEmails";

export async function POST(req) {
  const { email } = await req.json(); // Extract user's email from the request body
  const client = await clientPromise;
  const db = client.db(DB_NAME); // Replace with your database name

  // Check if the email exists in the allowedEmails collection
  const allowedEmail = await db
    .collection(ALLOWED_EMAIL_COLLECTION_NAME)
    .findOne({ email });

  if (!allowedEmail) {
    return new Response("Unauthorized", { status: 401 }); // If not allowed, return 401
  }

  return new Response("Authorized", { status: 200 }); // If allowed, return 200
}
