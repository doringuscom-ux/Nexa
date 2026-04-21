const Contact = require("../models/Contact");
const { sendAdminEmail } = require("../config/emailConfig");
const { appendPopupLead } = require("../config/googleSheets");

/* CREATE CONTACT */
const createContact = async (req, res) => {
  try {
    const { name, phone, email, message, source } = req.body;

    console.log(`📝 Received ${source || 'direct'} contact form submission:`, { name, email, phone });

    // 1. Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "❌ Name is required.",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "❌ Please provide at least an Email or Phone number.",
      });
    }

    // Optional: Basic email format validation if email is provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "❌ Please provide a valid email address.",
      });
    }

    // No validation for popups - capture whatever is provided - MOVED UP

    // 1. Database mein save karo
    const newMessage = new Contact({
      name: (name || '').trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim().toLowerCase(),
      message: (message || '').trim(),
    });

    await newMessage.save();
    console.log('✅ Contact saved to database. ID:', newMessage._id);

    // 2. Google Sheets Update (Only for Popups)
    if (source === 'popup' && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      console.log('📊 Synchronizing with Google Sheets...');
      // Don't await - let it run in background to keep response fast
      appendPopupLead({ name, email, phone, message }).catch(err => {
        console.error('⚠️ Google Sheets Sync Error:', err.message);
      });
    }

    // 3. Email bhejo admin ko (background mein)
    if (process.env.RESEND_API_KEY) {
      // Don't await - let it run in background
      sendAdminEmail({ name, phone, email, message })
        .then(result => {
          if (result.success) {
            console.log(`✅ Admin email sent for contact ${newMessage._id}. Message ID: ${result.messageId}`);
          } else {
            console.log(`⚠️ Admin email failed for contact ${newMessage._id}:`, result.error);
            console.log('💡 Note: onboarding@resend.dev requires ADMIN_EMAIL to match your Resend account email.');
          }
        })
        .catch(err => {
          console.error(`❌ Email error for contact ${newMessage._id}:`, err);
        });
    } else {
      console.log('⚠️ Skipping email: RESEND_API_KEY is missing in .env');
    }

    // 3. Success response
    res.status(201).json({
      success: true,
      message: "✅ Message Sent Successfully!",
      data: {
        id: newMessage._id,
        name: newMessage.name,
        email: newMessage.email,
        phone: newMessage.phone,
        message: newMessage.message,
        createdAt: newMessage.createdAt
      },
    });

  } catch (error) {
    console.error('❌ Create contact error:', error);

    res.status(500).json({
      success: false,
      message: "❌ Server error. Something went wrong.",
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/* GET ALL CONTACTS */
const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments();

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: contacts,
    });
  } catch (error) {
    console.error('❌ Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* DELETE CONTACT */
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "❌ Contact Not Found",
      });
    }

    await contact.deleteOne();
    console.log(`🗑️ Contact deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "✅ Contact Deleted Successfully",
    });
  } catch (error) {
    console.error('❌ Delete contact error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid contact ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* MARK AS READ */
const markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "❌ Contact Not Found",
      });
    }

    if (contact.isRead) {
      return res.status(200).json({
        success: true,
        message: "Contact already marked as read",
        data: contact,
      });
    }

    contact.isRead = true;
    await contact.save();
    console.log(`✅ Contact marked as read: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "✅ Marked as Read",
      data: contact,
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid contact ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* GET SINGLE CONTACT */
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "❌ Contact Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('❌ Get contact by ID error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid contact ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createContact,
  getContacts,
  deleteContact,
  markAsRead,
  getContactById,
};