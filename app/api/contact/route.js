import connectDB from "@/lib/mongodbmongoose";
import Contact from "@/models/contact";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// POST method to save a new contact message
export async function POST(req) {
  const { fullname, email, message } = await req.json();

  try {
    await connectDB();
    await Contact.create({ fullname, email, message });

    return NextResponse.json({
      msg: ["Message sent successfully"],
      success: true,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      let errorList = [];
      for (let e in error.errors) {
        errorList.push(error.errors[e].message);
      }
      console.log(errorList);
      return NextResponse.json({ msg: errorList });
    } else {
      return NextResponse.json({ msg: ["Unable to send message."] });
    }
  }
}

// GET method to retrieve all contact messages
export async function GET() {
  try {
    await connectDB();
    const messages = await Contact.find().sort({ createdAt: -1 }); // Sorted by most recent

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to retrieve messages:", error);
    return NextResponse.json({ msg: ["Unable to fetch messages."] });
  }
}
