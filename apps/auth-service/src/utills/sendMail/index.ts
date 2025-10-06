import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();

// Create a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

//Render an EJS mail template
export const renderTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "auth-service",
    "src",
    "utills",
    "email-templates",
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};

// Send an email using nodemailer
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderTemplate(templateName, data);

    const mailOptions = {
      from: `<${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
    //throw new Error("Failed to send email");
  }
};

// import nodemailer from "nodemailer";

// export const sendEmail = async (to: string, subject: string, body: string) => {
//   // Create a test account or replace with real credentials.
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT) || 465,
//     secure: true,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   // Wrap in an async IIFE so we can use await.

//   try {
//     const info = await transporter.sendMail({
//       from: `eSHOP: ${process.env.SMTP_USER}`, // sender address
//       to: to,
//       subject: subject,
//       html: body, // HTML body
//     });
//     console.log("Message sent:", info.messageId);
//     return true;
//   } catch (error) {
//     console.error("Error sending email: ", error);
//     return false;
//   }
// };
