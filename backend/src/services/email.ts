import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  try {
    const data = await resend.emails.send({
      from: "Hepfol <onboarding@resend.dev>", // Update with your verified domain later
      to: [email],
      subject: "Welcome to Hepfol! Here are your 3 free credits 🚀",
      html: `<p>Hi there,</p><p>Welcome to Hepfol! We've automatically credited your account with 3 free generation credits so you can start repurposing your content right away.</p><p>Happy creating!</p>`,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}
