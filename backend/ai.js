const crypto = require("crypto");

function generateFingerprint(fileBuffer) {
  return crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex");
}

function isNearDuplicate(fileBuffer, existingFiles) {
  const currentSize = fileBuffer.length;

  for (let file of existingFiles) {
    const sizeDifference = Math.abs(currentSize - file.size);

    // If file sizes are very close → possible near duplicate
    if (sizeDifference < 5000) {
      return true;
    }
  }

  return false;
}

module.exports = {
  generateFingerprint,
  isNearDuplicate
};