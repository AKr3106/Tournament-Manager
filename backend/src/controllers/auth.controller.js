import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to send token in HTTP-only cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.generateToken();

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        // 'none' is required in production so the cookie is sent with API calls
        // on Vercel (even same-site routes go through different serverless contexts).
        // 'strict' is fine locally since frontend and backend share localhost.
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
        const { name, emailid, password, phonenumber, role, playerName } = req.body;

        // Basic validation
        if (!name || !emailid || !password || !phonenumber) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields (name, emailid, password, phonenumber)",
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ emailid });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "A user with this email ID already exists",
            });
        }

        // Create new user
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
        const { emailid, password } = req.body;

        // Validation
        if (!emailid || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both emailid and password",
            });
        }

        // Check for user
        const user = await User.findOne({ emailid });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Verify password
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
            expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
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
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google ID Token (credential) is required",
            });
        }

        let email, name;
        // Development fallback / decoding without verification for testing
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

        // Find or create user
        let user = await User.findOne({ emailid: email });
        if (!user) {
            // Generate a random password for OAuth users
            const randomPassword = Math.random().toString(36).slice(-8);
            user = await User.create({
                name: name,
                emailid: email,
                password: randomPassword,
                phonenumber: "0000000000", // placeholder phone number
                playerName: "", // initially blank, linked later from profile page
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
        const { playerName, phonenumber, name, myTeam } = req.body;
        
        // Find user by ID and update fields
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
            if (!user.playerName || user.playerName === playerName.trim()) {
                user.playerName = playerName.trim();
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Player name cannot be changed once it has been set.",
                });
            }
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
