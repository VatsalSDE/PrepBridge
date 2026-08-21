const mammoth = require("mammoth");

const WORD_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

/**
 * Resolve the document kind from the mimetype, falling back to the file
 * extension. Browsers frequently upload PDFs/Word docs with an empty or
 * generic mimetype, so mimetype alone is not reliable.
 */
const resolveFileKind = ({ mimetype = "", originalname = "" }) => {
  if (mimetype === "application/pdf") return "pdf";
  if (WORD_MIME_TYPES.includes(mimetype)) return "word";

  const name = originalname.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "word";
  if (name.endsWith(".txt")) return "text";

  if (mimetype === "text/plain") return "text";

  return null;
};

const extractTextFromFile = async (file) => {
  const { buffer } = file;
  const kind = resolveFileKind(file);

  if (kind === "pdf") {
    // Import inside function to avoid pdf-parse startup bug
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const data = await pdfParse(buffer);
    return data.text?.trim() || "";
  }

  if (kind === "word") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() || "";
  }

  if (kind === "text") {
    return buffer.toString("utf8").trim();
  }

  throw new Error("Unsupported file type. Please upload PDF or Word document.");
};

module.exports = { extractTextFromFile, resolveFileKind };
