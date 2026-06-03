const mongoose = require("mongoose")

const interviewSchema = new mongoose.Schema({
  candidate:{
    id:String,
    name:String,
    email:String
  },
  mcqQuestions:[
    {
      question:String,
      options:[String],
      correct:Number,
      difficulty:String,
      category:String
    }
  ],
  codingChallenges:[
    {
      title:String,
      description:String,
      difficulty:String,
      timeLimit:Number
    }
  ],
  settings:{
    duration:Number
  }
})

module.exports = mongoose.model("Interview", interviewSchema)