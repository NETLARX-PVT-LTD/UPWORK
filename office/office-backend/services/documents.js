// C:\UPWORK\office\office-backend\services\documents.js

const Document = require('../models/Document'); // Adjust the path if necessary

// @desc      Get all documents for a user
// @route     GET /api/documents
// @access    Private
exports.getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ owner: req.user.id });
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

// @desc      Create a new document
// @route     POST /api/documents
// @access    Private
exports.createDocument = async (req, res, next) => {
  try {
    // Add the user's ID to the request body before creation
    req.body.owner = req.user.id;
    const document = await Document.create(req.body);
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

