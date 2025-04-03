import clientPromise from "@/lib/mongodb";

let cachedAllowedEmails = null;

export async function loadAllowedEmails() {
  if (!cachedAllowedEmails) {
    const client = await clientPromise;
    const db = client.db("flexidb1");
    const emails = await db.collection("allowedEmails").find({}).toArray();
    cachedAllowedEmails = emails.map((e) => e.email);
  }
  return cachedAllowedEmails;
}
