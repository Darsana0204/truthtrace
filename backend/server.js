const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const {
  generateFingerprint,
  isNearDuplicate
} = require("./ai");

const { generateExplanation } = require("./gemini");
const { generateCertificate } = require("./certificate");

const app = express();


// ===================== MIDDLEWARE =====================

// Allow frontend (Vercel) to access backend
app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));


// ===================== UPLOAD FOLDER =====================

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}


// ===================== MULTER CONFIG =====================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


// ===================== MEMORY STORAGE =====================

const uploadedFiles = [];


// ===================== HELPER =====================

function getRiskLevel(score) {
  if (score >= 80) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}


// ===================== ROUTES =====================

// Health check
app.get("/", (req, res) => {
  res.send("TruthTrace Backend Running 🚀");
});


// AI test route
app.get("/test-ai", async (req, res) => {
  try {
    const result = await generateExplanation("unique", 100);

    res.json({
      success: true,
      aiResponse: result
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});


// ===================== CORE UPLOAD ROUTE =====================

app.post("/upload", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    // Fingerprint
    const fingerprint = generateFingerprint(fileBuffer);

    // Duplicate check
    const exactMatch = uploadedFiles.find(
      file => file.fingerprint === fingerprint
    );

    const nearDuplicate = isNearDuplicate(fileBuffer, uploadedFiles);

    // Default values
    let status = "unique";
    let truthScore = 100;

    if (exactMatch) {
      status = "duplicate";
      truthScore = 20;
    } else if (nearDuplicate) {
      status = "near-duplicate";
      truthScore = 55;
    }

    // AI explanation
    const explanation = await generateExplanation(status, truthScore);

    const riskLevel = getRiskLevel(truthScore);

    // Certificate generation
    let certificatePath = null;

    if (status === "unique") {
      const fullPath = generateCertificate({
        fileName: req.file.filename,
        fingerprint,
        truthScore,
        status,
        riskLevel
      });

      certificatePath = "/" + fullPath.split("uploads")[1].replace(/\\/g, "/");
      certificatePath = "/uploads" + certificatePath;
    }

    // Store fingerprint (only if not duplicate)
    if (!exactMatch) {
      uploadedFiles.push({
        fingerprint,
        size: fileBuffer.length
      });
    }

    // Response
    return res.json({
      status,
      message:
        status === "duplicate"
          ? "⚠ Exact duplicate detected!"
          : status === "near-duplicate"
          ? "⚠ Similar modified content detected!"
          : "✔ New unique content uploaded",
      file: req.file.filename,
      fingerprint,
      truthScore,
      riskLevel,
      explanation,
      certificatePath
    });

  } catch (error) {
    console.error("Upload Error:", error.message);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});


// ===================== START SERVER =====================

// IMPORTANT for cloud deployment
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});