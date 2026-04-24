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

// Middleware
app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// In-memory fingerprint storage (demo only)
const uploadedFiles = [];

// Risk Level Helper
function getRiskLevel(score) {
  if (score >= 80) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

// Test Gemini Route
app.get("/test-ai", async (req, res) => {
  try {
    console.log("Testing Gemini connection...");

    const result = await generateExplanation("unique", 100);

    console.log("Gemini response received");

    res.json({
      success: true,
      aiResponse: result
    });

  } catch (err) {
    console.error("Gemini Error:", err);

    res.json({
      success: false,
      error: err.message
    });
  }
});

// Home Route
app.get("/", (req, res) => {
  res.send("TruthTrace Backend Running");
});

// Upload Route (Core Logic)
app.post("/upload", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    // Generate fingerprint
    const fingerprint = generateFingerprint(fileBuffer);

    // Check duplicate
    const exactMatch = uploadedFiles.find(
  file => file.fingerprint === fingerprint
);

const nearDuplicate = isNearDuplicate(
  fileBuffer,
  uploadedFiles
);

    let status = "unique";
    let truthScore = 100;

    if (exactMatch) {
  status = "duplicate";
  truthScore = 20;
}
  else if (nearDuplicate) {
  status = "near-duplicate";
  truthScore = 55;
}

    // Gemini AI Explanation
    const explanation = await generateExplanation(status, truthScore);

    // Risk Level
    const riskLevel = getRiskLevel(truthScore);
    let certificatePath = null;

if (status === "unique") {
  const fullPath = generateCertificate({
    fileName: req.file.filename,
    fingerprint,
    truthScore,
    status,
    riskLevel
  });

  // Convert to browser-accessible path
  certificatePath = "/" + fullPath.split("uploads")[1].replace(/\\\\/g, "/");
  certificatePath = "/uploads" + certificatePath;
}

    // Store only unique fingerprints
    if (!exactMatch) {
    uploadedFiles.push({
    fingerprint,
    size: fileBuffer.length
  });
}

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

// Start Server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});