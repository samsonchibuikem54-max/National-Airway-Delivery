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

// ================= AUTH =================
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
  res.json({ success: true, message: "Backend running " });
});

// ================= ADMIN =================
app.post("/admin/register", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from("admins")
    .insert([{ email, password: hashed }]);

  if (error) return res.status(500).json({ success: false, error: error.message });

  res.json({ success: true });
});

app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .single();

  if (!admin) return res.status(401).json({ success: false });

  const match = await bcrypt.compare(password, admin.password);

  if (!match) return res.status(401).json({ success: false });

  const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  res.json({ success: true, token });
});

// ================= CREATE REQUEST (and alias) =================
async function createRequestPayload(req, res) {
  const { name, email, pickup, destination, weight, service, details } = req.body;

  const { error } = await supabase.from("requests").insert([
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
}

// Primary route
app.post("/request", createRequestPayload);

// Alias route to support /request/create as a compatibility layer
app.post("/request/create", createRequestPayload);

// ================= GET REQUESTS =================
app.get("/requests", verifyAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.json({ success: false });

  res.json({ success: true, data });
});

// ================= APPROVE REQUEST =================
app.post("/request/approve", verifyAdmin, async (req, res) => {
  const { id } = req.body;

  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) return res.status(404).json({ success: false });

  const trackingId = "FL-" + crypto.randomBytes(4).toString("hex");

  await supabase
    .from("requests")
    .update({
      status: "approved",
      tracking_id: trackingId
    })
    .eq("id", id);

  // OPTIONAL EMAIL
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
    try {
      await sgMail.send({
        to: request.email,
        from: process.env.SENDGRID_FROM,
        subject: "Shipment Approved",
        html: `<p>Your tracking ID: <b>${trackingId}</b></p>`
      });
    } catch {}
  }

  res.json({ success: true, trackingId });
});

// ================= DELETE REQUEST =================
app.post("/request/delete", verifyAdmin, async (req, res) => {
  const { id } = req.body;

  await supabase.from("requests").delete().eq("id", id);

  res.json({ success: true });
});

// ================= TRACK =================
app.get("/tracking", async (req, res) => {
  const { email } = req.query;

  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("email", email);

  res.json({ success: true, data });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
