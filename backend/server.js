import express from "express";
import cors from "cors";
import sgMail from "@sendgrid/mail";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ================= SUPABASE =================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================= SENDGRID =================
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// ================= AUTH MIDDLEWARE =================
function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    req.admin = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running 🚀" });
});

// ================= ADMIN =================
app.post("/admin/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("admins")
      .insert([{ email, password: hashed }]);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= CREATE QUOTE =================
app.post("/request", async (req, res) => {
  const { name, email, pickup, destination, weight, service, details } = req.body;

  const { error } = await supabase.from("quotes").insert([
    {
      name,
      email,
      pickup,
      destination,
      weight,
      service,
      details,
      status: "pending"
    }
  ]);

  if (error) return res.json({ success: false, error: error.message });

  res.json({ success: true });
});

// ================= GET QUOTES (ADMIN) =================
app.get("/quotes", verifyAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.json({ success: false, error: error.message });

  res.json({ success: true, data });
});

// ================= VERIFY QUOTE =================
app.post("/quote/verify", verifyAdmin, async (req, res) => {
  const { id } = req.body;

  try {
    // Generate tracking ID
    const tracking_id =
      "TRK-" + crypto.randomBytes(4).toString("hex").toUpperCase();

    const { data: quote, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !quote) {
      return res.status(404).json({ success: false, error: "Quote not found" });
    }

    await supabase
      .from("quotes")
      .update({ status: "approved", tracking_id })
      .eq("id", id);

    // OPTIONAL EMAIL
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
      try {
        await sgMail.send({
          to: quote.email,
          from: process.env.SENDGRID_FROM,
          subject: "Shipment Approved",
          html: `
            <h3>Your shipment has been approved</h3>
            <p><strong>Tracking ID:</strong> ${tracking_id}</p>
          `,
        });
      } catch (emailErr) {
        console.log("Email error:", emailErr.message);
      }
    }

    res.json({ success: true, tracking_id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= DELETE QUOTE =================
app.post("/quote/delete", verifyAdmin, async (req, res) => {
  const { id } = req.body;

  try {
    const { error } = await supabase.from("quotes").delete().eq("id", id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= TRACKING =================
app.get("/tracking", async (req, res) => {
  const { email } = req.query;

  try {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("email", email);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});