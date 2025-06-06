import Chatbot from "../models/Chatbot.js"

// Save a new chat conversation
export const saveChatConversation = async (req, res) => {
  try {
    const { question, answer, date } = req.body

    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      })
    }

    // Create new chat entry
    const newChat = new Chatbot({
      question: question.trim(),
      answer: answer.trim(),
      date: date ? new Date(date) : new Date(),
    })

    // Save to database
    const savedChat = await newChat.save()

    res.status(201).json({
      success: true,
      message: "Chat conversation saved successfully",
      data: savedChat,
    })
  } catch (error) {
    console.error("Error saving chat conversation:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

export const saveChat = async (req, res) => {
  try {
    const { question, answer, date } = req.body

    const newChat = new Chatbot({
      question,
      answer,
      date: date || new Date(),
    })

    await newChat.save()

    res.status(201).json({
      success: true,
      message: "Chat saved successfully",
    })
  } catch (error) {
    console.error("Error saving chat:", error)
    res.status(500).json({
      success: false,
      message: "Error saving chat",
    })
  }
}

// Get all chat conversations
export const getAllChats = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = "date", sortOrder = "desc" } = req.query

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    }

    const chats = await Chatbot.find()
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec()

    const total = await Chatbot.countDocuments()

    res.status(200).json({
      success: true,
      data: chats,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalChats: total,
        hasNext: options.page < Math.ceil(total / options.limit),
        hasPrev: options.page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching chat conversations:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Get chat conversations by date range
export const getChatsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      })
    }

    const chats = await Chatbot.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: -1 })

    res.status(200).json({
      success: true,
      data: chats,
      count: chats.length,
    })
  } catch (error) {
    console.error("Error fetching chats by date range:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Get chat statistics
export const getChatStats = async (req, res) => {
  try {
    const totalChats = await Chatbot.countDocuments()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayChats = await Chatbot.countDocuments({
      date: { $gte: today },
    })

    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    const weeklyChats = await Chatbot.countDocuments({
      date: { $gte: thisWeek },
    })

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const monthlyChats = await Chatbot.countDocuments({
      date: { $gte: thisMonth },
    })

    res.status(200).json({
      success: true,
      data: {
        totalChats,
        todayChats,
        weeklyChats,
        monthlyChats,
      },
    })
  } catch (error) {
    console.error("Error fetching chat statistics:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Delete a chat conversation
export const deleteChatConversation = async (req, res) => {
  try {
    const { id } = req.params

    const deletedChat = await Chatbot.findByIdAndDelete(id)

    if (!deletedChat) {
      return res.status(404).json({
        success: false,
        message: "Chat conversation not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Chat conversation deleted successfully",
      data: deletedChat,
    })
  } catch (error) {
    console.error("Error deleting chat conversation:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
