require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using Service Role Key for backend operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Rate Limiting (Best practice: limit attempts to prevent brute-force)
const forgotPasswordLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

// Nodemailer Transporter Setup
// In production, use your actual SMTP details (e.g., Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Example: 'gmail', 'SendGrid', etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. FORGOT PASSWORD API
app.post('/api/forgot-password', forgotPasswordLimit, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Step 1: Check if the user exists in the 'registrations' table
        const { data: user, error: findError } = await supabase
            .from('registrations')
            .select('email') // Choosing only email for security (already known)
            .eq('email', email)
            .single();

        // Security best practice: Always return same message even if email doesn't exist
        const successMessage = { message: "If an account with that email exists, we've sent a code to reset your password" };

        if (findError || !user) {
            console.log(`Email look-up failed or not found for: ${email}`);
            return res.json(successMessage);
        }

        // Step 2: Generate a secure random reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Step 3: Set expiration time (15 minutes from now)
        const expirationTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Step 4: Store token & expiration in DB (registrations table)
        const { error: updateError } = await supabase
            .from('registrations')
            .update({
                reset_token: resetToken,
                reset_token_expires: expirationTime
            })
            .eq('email', email);

        if (updateError) {
            throw new Error(`Database error: ${updateError.message}`);
        }

        // Step 5: Send password reset link to user's email
        const resetLink = `https://your-app-domain.com/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Campus Event App',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Click the button below to proceed:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>This link will expire in 15 minutes.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        };

        console.log(`Attempting to send email to: ${email}...`);
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully handed off to SMTP server for: ${email}`);
        return res.json(successMessage);

    } catch (error) {
        console.error("DETAILED ERROR LOG:");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.code === 'EAUTH') {
            console.error("AUTH FAILURE: Your EMAIL_USER or EMAIL_PASS in backend/.env is incorrect.");
        }
        return res.status(500).json({ message: "An unexpected error occurred" });
    }
});

// 2. RESET PASSWORD API
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
        // Step 1: Validate token and check for expiration
        const { data: user, error: findError } = await supabase
            .from('registrations')
            .select('email, reset_token_expires')
            .eq('reset_token', token)
            .single();

        if (findError || !user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const now = new Date();
        const expiration = new Date(user.reset_token_expires);

        if (now > expiration) {
            return res.status(400).json({ message: "Reset token has expired" });
        }

        // Step 2: Hash the new password securely
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Step 3: Update password and invalidate the token
        const { error: updateError } = await supabase
            .from('registrations')
            .update({
                password: hashedPassword,
                reset_token: null,          // Remove the token after successful reset
                reset_token_expires: null   // Remove expiration after successful reset
            })
            .eq('email', user.email);

        if (updateError) {
            throw new Error(`Database update error: ${updateError.message}`);
        }

        return res.json({ message: "Password has been successfully reset" });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "An unexpected error occurred" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
