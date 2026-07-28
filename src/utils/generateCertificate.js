const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const ORG_NAME = "Swabhiman Shiksha Sanskriti Samajotthan Nyas";

// Expects: { name, memberId, membershipType, validTill }
module.exports = async (user) => {
  const dir = path.join("uploads", "certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${user.memberId}-certificate.pdf`);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const PAGE_W = 595;
  const PAGE_H = 842;

  // ---------- Background ----------
  doc.rect(0, 0, PAGE_W, PAGE_H).fill("#fdfdfb");

  // ---------- Header gradient ----------
  const header = doc.linearGradient(0, 0, PAGE_W, 0);
  header.stop(0, "#0C2C55").stop(1, "#296374");
  doc.rect(0, 0, PAGE_W, 150).fill(header);
  doc.rect(0, 150, PAGE_W, 6).fill("#E1B12C");

  // ---------- Ornamental double border ----------
  doc
    .lineWidth(2.5)
    .strokeColor("#0C2C55")
    .rect(18, 18, PAGE_W - 36, PAGE_H - 36)
    .stroke();

  doc
    .lineWidth(1)
    .strokeColor("#E1B12C")
    .rect(26, 26, PAGE_W - 52, PAGE_H - 52)
    .stroke();

  // corner flourishes (simple quarter-circle accents)
  const cornerSize = 22;
  [
    [26, 26],
    [PAGE_W - 26 - cornerSize, 26],
    [26, PAGE_H - 26 - cornerSize],
    [PAGE_W - 26 - cornerSize, PAGE_H - 26 - cornerSize],
  ].forEach(([x, y]) => {
    doc.circle(x + cornerSize / 2, y + cornerSize / 2, 4).fill("#E1B12C");
  });

  // ---------- Logo ----------
  const logoPath = path.join("uploads", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, PAGE_W / 2 - 40, 25, { width: 80 });
  }

  // ---------- Org name ----------
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(21)
    .text(ORG_NAME, 40, 105, {
      align: "center",
      width: PAGE_W - 80,
    });

  // ---------- Title ----------
  doc
    .fillColor("#0C2C55")
    .font("Helvetica-Bold")
    .fontSize(26)
    .text("CERTIFICATE OF MEMBERSHIP", 0, 190, { align: "center" });

  doc
    .moveTo(PAGE_W / 2 - 90, 225)
    .lineTo(PAGE_W / 2 + 90, 225)
    .lineWidth(1.5)
    .strokeColor("#E1B12C")
    .stroke();

  // ---------- Body ----------
  doc
    .moveDown(3)
    .fillColor("#444")
    .font("Helvetica")
    .fontSize(14)
    .text("This is to certify that", 0, 260, { align: "center" });

  doc
    .fillColor("#0C2C55")
    .font("Helvetica-Bold")
    .fontSize(30)
    .text(user.name, 0, 290, { align: "center" });

  // underline beneath name
  const nameWidth = doc.widthOfString(user.name, {
    font: "Helvetica-Bold",
    fontSize: 30,
  });
  doc
    .moveTo(PAGE_W / 2 - nameWidth / 2 - 10, 330)
    .lineTo(PAGE_W / 2 + nameWidth / 2 + 10, 330)
    .lineWidth(0.75)
    .strokeColor("#296374")
    .stroke();

  doc
    .fillColor("#444")
    .font("Helvetica")
    .fontSize(14)
    .text("has been officially registered as a member of", 0, 350, {
      align: "center",
    });

  doc
    .fillColor("#296374")
    .font("Helvetica-Bold")
    .fontSize(17)
    .text(ORG_NAME, 60, 375, { align: "center", width: PAGE_W - 120 });

  const membershipLabel =
    user.membershipType === "permanent"
      ? "Permanent Membership"
      : "Annual Membership";

  doc
    .fillColor("#444")
    .font("Helvetica")
    .fontSize(13)
    .text(`Membership Type: ${membershipLabel}`, 0, 420, { align: "center" });

  doc
    .fillColor("#0C2C55")
    .font("Helvetica-Bold")
    .fontSize(15)
    .text(`Member ID: ${user.memberId}`, 0, 445, { align: "center" });

  if (user.validTill) {
    doc
      .fillColor("#444")
      .font("Helvetica")
      .fontSize(12)
      .text(
        `Valid Till: ${new Date(user.validTill).toLocaleDateString("en-IN")}`,
        0,
        470,
        { align: "center" }
      );
  }

  // ---------- Seal ----------
  const sealX = PAGE_W / 2;
  const sealY = 560;
  doc
    .circle(sealX, sealY, 45)
    .lineWidth(2)
    .strokeColor("#E1B12C")
    .stroke();
  doc
    .circle(sealX, sealY, 38)
    .lineWidth(1)
    .strokeColor("#0C2C55")
    .stroke();
  doc
    .fillColor("#0C2C55")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("OFFICIAL", sealX - 40, sealY - 12, { width: 80, align: "center" })
    .fontSize(9)
    .text("SEAL", sealX - 40, sealY + 2, { width: 80, align: "center" });

  // ---------- Date issued ----------
  doc
    .fillColor("#444")
    .font("Helvetica")
    .fontSize(11)
    .text(
      `Issued on: ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      0,
      630,
      { align: "center" }
    );

  // ---------- Signatures ----------
  const y = 700;

  doc.moveTo(80, y).lineTo(230, y).lineWidth(1).strokeColor("#000").stroke();
  doc
    .fillColor("#000")
    .fontSize(12)
    .font("Helvetica")
    .text("Authorized Signatory", 80, y + 6, { width: 150, align: "center" });

  doc.moveTo(PAGE_W - 230, y).lineTo(PAGE_W - 80, y).stroke();
  doc.text("President", PAGE_W - 230, y + 6, { width: 150, align: "center" });

  // ---------- Footer ----------
  doc
    .fillColor("#888")
    .fontSize(9)
    .text(
      `${ORG_NAME} · This certificate is issued electronically and is valid without a physical signature.`,
      40,
      PAGE_H - 45,
      { width: PAGE_W - 80, align: "center" }
    );

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
};