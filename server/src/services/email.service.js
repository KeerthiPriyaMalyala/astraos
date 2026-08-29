const nodemailer = require("nodemailer");

// =====================================================
// ASTRAOS EMAIL SERVICE
// =====================================================

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// =====================================================
// SEND COMPLAINT RESOLVED EMAIL
// =====================================================

const sendComplaintResolvedEmail = async ({
  citizenEmail,
  citizenName,
  complaintId,
  complaintTitle,
}) => {
  if (!citizenEmail) {
    console.log(
      "⚠️ [AstraOS Email] Citizen email not available"
    );

    return;
  }

  const mailOptions = {
    from: `"AstraOS Smart Governance" <${process.env.EMAIL_USER}>`,

    to: citizenEmail,

    subject: "AstraOS - Your Complaint Has Been Resolved",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        padding: 30px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background-color: #ffffff;
      ">

        <h2 style="
          color: #2563eb;
          margin-bottom: 10px;
        ">
          AstraOS - Complaint Resolution Update
        </h2>

        <p>
          Hello <strong>${citizenName || "Citizen"}</strong>,
        </p>

        <p>
          The concerned government department has marked your
          complaint as <strong>RESOLVED</strong>.
        </p>

        <div style="
          background-color: #f3f4f6;
          padding: 18px;
          border-radius: 8px;
          margin: 20px 0;
        ">

          <p style="margin: 6px 0;">
            <strong>Complaint:</strong>
            ${complaintTitle}
          </p>

          <p style="margin: 6px 0;">
            <strong>Complaint ID:</strong>
            ${complaintId}
          </p>

        </div>

        <p>
          Please verify whether the problem has actually been
          solved.
        </p>

        <p>
          If the issue is completely resolved, you can verify
          the complaint from your AstraOS account.
        </p>

        <p>
          If the problem is still present or has not been
          properly resolved, you can reopen the complaint.
        </p>

        <div style="
          margin: 25px 0;
          padding: 15px;
          background-color: #eff6ff;
          border-radius: 8px;
        ">

          <strong>
            Your verification is important.
          </strong>

          <p style="margin-bottom: 0;">
            AstraOS does not consider the complaint completely
            closed until the citizen verifies the resolution.
          </p>

        </div>

        <p>
          Thank you for helping improve public infrastructure.
        </p>

        <p>
          <strong>AstraOS Smart Governance</strong>
        </p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);

  console.log(
    `📧 [AstraOS Email] Resolution email sent to ${citizenEmail}`
  );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  sendComplaintResolvedEmail,
};