const transporter = require("../config/mail");

const sendMail = async (to, subject, text, html = null) => {
  try {
    await transporter.sendMail({
      from: "Your Email <your-email@example.com>",
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log("Sent mail");
    return true; // Return true to indicate success
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return false; // Return false to indicate failure
  }
};

const sendVerifiedEmail = async (to, verifyLink) => {
  const subject = "Email verification";
  const text = `Please verify your email by clicking the following link: ${verifyLink}`;
  const html = `<p>Please verify your email by clicking the following link:</p><a href="${verifyLink}">Verify Email</a>`;

  if (await sendMail(to, subject, text, html)) {
    console.log("Sent verification email");
  } else {
    console.error("Failed to send verification email");
    throw new CustomError("Failed to send verification email", 500);
  }
};

const sendResetPasswordEmail = async (to, resetPasswordLink) => {
  const subject = "Reset Password";
  const text = `Please reset your password by clicking the following link: ${resetPasswordLink}`;
  const html = `<p>Please reset your password by clicking the following link:</p><a href="${resetPasswordLink}">Reset Password</a>`;

  if (await sendMail(to, subject, text, html)) {
    console.log("Sent reset password email");
  } else {
    console.error("Failed to send reset password email");
    throw new CustomError("Failed to send reset password email", 500);
  }
};

module.exports = {
  sendMail,
  sendVerifiedEmail,
  sendResetPasswordEmail,
};
