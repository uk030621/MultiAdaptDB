// app/api/contactreply/route.js
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODBMONGOOSE_URI;
const client = new MongoClient(uri);
const dbName = "ContactForm";

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("contacts");

    const contacts = await collection.find().sort({ date: -1 }).toArray();

    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch contacts" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
