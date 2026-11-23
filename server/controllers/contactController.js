import ContactMessage from "../models/ContactMessage.js";

export const createContactMessage = async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const subject = typeof req.body.subject === "string" ? req.body.subject.trim() : "";
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !subject || subject.length > 120 || message.length < 10 || message.length > 3000) {
      return res.status(400).json({ success: false, message: "Enter a valid name, email, subject, and message (10 to 3000 characters)." });
    }

    await ContactMessage.create({ name, email, subject, message });
    return res.status(201).json({ success: true, message: "Your message was received. Our team will review it." });
  } catch (error) {
    next(error);
  }
};
