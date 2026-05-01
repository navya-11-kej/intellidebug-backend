const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const nodemailer = require('nodemailer');

// Email configuration (using nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'intellidebug@gmail.com',
        pass: 'your-app-password-here'  // You'll need to set this up
    }
});

// Submit feedback (now requires login - auth middleware)
router.post('/', async (req, res) => {
    try {
        const { name, email, rating, message, userId } = req.body;
        
        if (!name || !email || !rating || !message) {
            return res.status(400).json({ msg: 'All fields are required' });
        }
        
        const feedback = new Feedback({
            name,
            email,
            rating,
            message,
            userId: userId || null,
            approved: false
        });
        
        await feedback.save();
        
        // Send email to intellidebug@gmail.com
        const mailOptions = {
            from: 'intellidebug@gmail.com',
            to: 'intellidebug@gmail.com',
            subject: `New Feedback from ${name}`,
            html: `
                <h3>New Feedback Received!</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Rating:</strong> ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</p>
                <p><strong>Message:</strong> ${message}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            `
        };
        
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailErr) {
            console.log('Email error (non-fatal):', emailErr.message);
        }
        
        res.json({ msg: 'Thank you for your feedback! We will review it soon.' });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get approved feedback for testimonials (public)
router.get('/approved', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ approved: true }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get user's own feedback (for logged in users)
router.get('/my', async (req, res) => {
    try {
        const { userId } = req.query;
        const feedbacks = await Feedback.find({ userId }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Admin: Get all feedback
router.get('/all', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Admin: Approve feedback
router.put('/approve/:id', async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ msg: 'Feedback not found' });
        feedback.approved = true;
        await feedback.save();
        res.json({ msg: 'Feedback approved!' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Admin: Delete feedback
router.delete('/:id', async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Feedback deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;