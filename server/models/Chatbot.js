import mongoose from "mongoose"

const chatbotSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const Chatbot = mongoose.model("Chatbot", chatbotSchema)

export default Chatbot
