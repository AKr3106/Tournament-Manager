import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import connectDB from "../db/db.js"; // <-- Added database import
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to send token in HTTP-only cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.generateToken();

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Remove password from response payload
    const userResponse = {
        _id: user._id,
        name: user.name,
        emailid: user.emailid,
        phonenumber: user.phonenumber,
        role: user.role,
        playerName: user.playerName,
        myTeam: user.myTeam,
        createdAt: user.createdAt,
    };

    res.status(statusCode)
        .cookie("token", token, cookieOptions)
        .json({
            success: true,
            message: statusCode === 201 ? "Registration successful" : "Login successful",
            user: userResponse,
        });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        await connectDB(); // <-- Added to prevent serverless crash

        const { name, emailid, password, phonenumber, role, playerName } = req.body;

        if (!name || !emailid || !password || !phonenumber) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields (name, emailid, password, phonenumber)",
            });
        }

        const userExists = await User.findOne({ emailid });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "A user with this email ID already exists",
            });
        }

        const user = await User.create({
            name,
            emailid,
            password,
            phonenumber,
            role: role || "user",
            playerName: playerName || "",
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        await connectDB(); // <-- Added to prevent serverless crash

        const { emailid, password } = req.body;

        if (!emailid || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both emailid and password",
            });
        }

        const user = await User.findOne({ emailid });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", "none", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "strict",
            expires: new Date(Date.now() + 10 * 1000), 
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};

// @desc    Google Sign In / Register
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
    try {
        await connectDB(); // <-- Added to prevent serverless crash

        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google ID Token (credential) is required",
            });
        }

        let email, name;
        if (!process.env.GOOGLE_CLIENT_ID) {
            const jwt = await import("jsonwebtoken");
            const decoded = jwt.default.decode(credential);
            if (!decoded) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credential token format",
                });
            }
            email = decoded.email;
            name = decoded.name;
        } else {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        }

        let user = await User.findOne({ emailid: email });
        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8);
            user = await User.create({
                name: name,
                emailid: email,
                password: randomPassword,
                phonenumber: "0000000000", 
                playerName: "", 
                role: "user"
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Error in Google login:", error);
        res.status(500).json({
            success: false,
            message: "Google login failed",
            error: error.message,
        });
    }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Protected
export const updateProfile = async (req, res) => {
    try {
        await connectDB(); // <-- Added to prevent serverless crash

        const { playerName, phonenumber, name, myTeam } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (name !== undefined && name.trim() !== '') {
            user.name = name.trim();
        }

        if (playerName !== undefined) {
            user.playerName = playerName.trim();
        }
        if (phonenumber !== undefined) {
            user.phonenumber = phonenumber.trim();
        }
        
        if (myTeam !== undefined) {
            user.myTeam = myTeam.trim();
        }

        await user.save();

        const userResponse = {
            _id: user._id,
            name: user.name,
            emailid: user.emailid,
            phonenumber: user.phonenumber,
            role: user.role,
            playerName: user.playerName,
            myTeam: user.myTeam,
            createdAt: user.createdAt,
        };

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: userResponse,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message,
        });
    }
};

// @desc    Forgot Password - Send reset link to email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        await connectDB();
        
        const { emailid } = req.body;
        if (!emailid) {
            return res.status(400).json({ success: false, message: "Please provide an email ID" });
        }

        const user = await User.findOne({ emailid });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with this email" });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Set token and expiry (1 hour) on user model
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "Gmail", // You can configure this via env vars later if needed
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Prioritize a forced URL from .env, then check headers.
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        
        let frontendUrl = process.env.FRONTEND_URL || req.headers.origin;
        if (!frontendUrl && req.headers.referer) {
            frontendUrl = new URL(req.headers.referer).origin;
        }
        if (!frontendUrl || (frontendUrl.includes('localhost') && process.env.FRONTEND_URL)) {
            frontendUrl = process.env.FRONTEND_URL || (host ? `${protocol}://${host}` : 'http://localhost:5173');
        }

        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.emailid,
            subject: "RKM Legacy League - Password Reset Request",
            html: `
                <div style="font-family: sans-serif; padding: 20px; background: #0F172A; color: #F8FAFC; border-radius: 10px;">
                    <h2 style="color: #818CF8;">Password Reset Request</h2>
                    <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
                    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background: #6366F1; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    <p style="color: #94A3B8; font-size: 12px;">This link will expire in 1 hour.</p>
                    <p style="color: #94A3B8; font-size: 12px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ success: false, message: "Error sending email", error: error.message });
    }
};

// @desc    Reset Password - Verify token and update password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        await connectDB();
        
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired" });
        }

        // Set the new password (model pre-save hook handles hashing)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ success: false, message: "Failed to reset password", error: error.message });
    }
};