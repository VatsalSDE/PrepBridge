const mammoth = require("mammoth");

const extractTextFromFile = async (file) => {
  const { mimetype, buffer } = file;

  // PDF extraction
  if (mimetype === "application/pdf") {
    // Import inside function to avoid pdf-parse startup bug
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const data = await pdfParse(buffer);
    return data.text?.trim() || "";
  }

  // Word document extraction
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() || "";
  }

  throw new Error("Unsupported file type. Please upload PDF or Word document.");
};

module.exports = { extractTextFromFile };