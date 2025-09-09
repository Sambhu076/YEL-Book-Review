import React, { useState, useEffect } from 'react';
import { MessageCircle, Edit3, CheckCircle, Star, BookOpen, User, Bot, ArrowRight } from 'lucide-react';

const TOPICS = {
  moon: {
    title: "Trip to the Moon",
    warmUp: "I love looking at the moon at night — have you ever imagined going there?",
    questions: [
      "How do people travel to the moon?",
      "What do astronauts wear to stay safe?",
      "What does the moon look like?",
      "What is it like to walk on the moon?",
      "What do astronauts do there?",
      "Why is visiting the moon important?"
    ],
    wordBank: ["enormous", "protective", "crater", "gravity", "explore", "surface", "oxygen", "magnificent", "scientific"]
  },
  ocean: {
    title: "Deep Sea Adventure",
    warmUp: "The ocean is so mysterious and deep — what do you think we might find at the bottom?",
    questions: [
      "How do explorers travel to the deep ocean?",
      "What equipment do they need to stay safe?",
      "What does the ocean floor look like?",
      "What kinds of creatures live in the deep sea?",
      "What do ocean explorers discover?",
      "Why is ocean exploration important?"
    ],
    wordBank: ["submarine", "pressure", "bioluminescent", "mysterious", "darkness", "creatures", "coral", "fascinating", "depths"]
  },
  forest: {
    title: "Forest Exploration",
    warmUp: "I love walking through forests and hearing all the sounds — what's your favorite thing about being in nature?",
    questions: [
      "How do people explore forests safely?",
      "What should explorers bring with them?",
      "What does a forest look like and sound like?",
      "What animals might you see in a forest?",
      "What do forest explorers learn?",
      "Why are forests important to protect?"
    ],
    wordBank: ["canopy", "wildlife", "ecosystem", "rustling", "towering", "biodiversity", "habitat", "peaceful", "conservation"]
  }
};

const TRANSITIONS = {
  younger: ["First", "Next", "Then", "Finally"],
  older: ["To begin with", "On the surface", "In addition", "Furthermore", "As a result", "Most importantly"]
};

export default function AITutorParagraphWriter() {
  const [stage, setStage] = useState('setup'); // setup, warmup, questions, building, assembly, reflection
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentSentence, setCurrentSentence] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [finalParagraph, setFinalParagraph] = useState('');
  const [showWordBank, setShowWordBank] = useState(false);

  const topic = TOPICS[selectedTopic] || {};
  const isYounger = ageGroup === 'younger';

  const addToChat = (speaker, message, type = 'message') => {
    setChatHistory(prev => [...prev, { speaker, message, type, timestamp: Date.now() }]);
  };

  const startWarmUp = () => {
    if (!ageGroup || !selectedTopic) return;
    setStage('warmup');
    addToChat('tutor', topic.warmUp, 'warmup');
  };

  const handleWarmUpResponse = () => {
    if (currentAnswer.trim()) {
      addToChat('student', currentAnswer);
      addToChat('tutor', isYounger 
        ? "That's wonderful! Now let's think step by step about your trip to write an amazing paragraph together! 🚀"
        : "Great thinking! Now let's dive deeper into this topic and build a rich, detailed paragraph with some sophisticated vocabulary! 📝"
      );
      setCurrentAnswer('');
      setStage('questions');
    }
  };

  const handleQuestionAnswer = () => {
    if (currentAnswer.trim()) {
      const newAnswers = [...answers, currentAnswer];
      setAnswers(newAnswers);
      addToChat('student', currentAnswer);
      
      // Guide sentence building
      if (isYounger) {
        addToChat('tutor', `Great! Now let's turn that into a complete sentence. Can you write: "${currentAnswer}" as one full sentence with a capital letter and period?`);
      } else {
        addToChat('tutor', `Excellent answer! Now let's expand on that. Can you add more details? What else can you tell me about this? Try using some words from our word bank!`);
        setShowWordBank(true);
      }
      
      setCurrentAnswer('');
      setStage('building');
    }
  };

  const handleSentenceBuilding = () => {
    if (currentSentence.trim()) {
      const newSentences = [...sentences, currentSentence];
      setSentences(newSentences);
      addToChat('student', currentSentence, 'sentence');
      
      // Check grammar and provide feedback
      const hasCapital = currentSentence[0] === currentSentence[0].toUpperCase();
      const hasPeriod = currentSentence.endsWith('.');
      
      if (hasCapital && hasPeriod) {
        addToChat('tutor', "Perfect! Great sentence structure! 🎉", 'feedback');
      } else {
        let feedback = "Good content! Remember: ";
        if (!hasCapital) feedback += "start with a capital letter, ";
        if (!hasPeriod) feedback += "end with a period";
        addToChat('tutor', feedback, 'feedback');
      }
      
      setCurrentSentence('');
      setShowWordBank(false);
      
      if (currentQuestion < topic.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setStage('questions');
      } else {
        setStage('assembly');
        addToChat('tutor', isYounger 
          ? "Wonderful! We have all our sentences. Now let's put them together to make them flow like a story!"
          : "Excellent work! You've created some sophisticated sentences. Let's review our paragraph and see how it flows!"
        );
      }
    }
  };

  const assembleParagraph = () => {
    const transitions = TRANSITIONS[isYounger ? 'younger' : 'older'];
    let paragraph = '';
    
    sentences.forEach((sentence, index) => {
      if (index === 0) {
        paragraph += sentence;
      } else if (index < transitions.length) {
        paragraph += ` ${transitions[index]}, ${sentence.toLowerCase()}`;
      } else {
        paragraph += ` ${sentence}`;
      }
      if (index < sentences.length - 1) paragraph += ' ';
    });
    
    setFinalParagraph(paragraph);
    addToChat('tutor', "Here's your completed paragraph:", 'paragraph');
    addToChat('system', paragraph, 'paragraph');
    setStage('reflection');
  };

  const renderSetup = () => (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <BookOpen className="mx-auto mb-4 text-blue-600" size={48} />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Writing Tutor</h1>
        <p className="text-gray-600">Let's write an amazing paragraph together!</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">What's your age group?</label>
          <div className="space-y-2">
            <button
              onClick={() => setAgeGroup('younger')}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                ageGroup === 'younger' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Ages 5-7 (Younger Writers)</div>
              <div className="text-sm text-gray-600">Simple sentences, basic transitions</div>
            </button>
            <button
              onClick={() => setAgeGroup('older')}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                ageGroup === 'older' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Ages 8-11 (Advanced Writers)</div>
              <div className="text-sm text-gray-600">Complex sentences, rich vocabulary</div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Choose your writing topic:</label>
          <div className="space-y-2">
            {Object.entries(TOPICS).map(([key, topic]) => (
              <button
                key={key}
                onClick={() => setSelectedTopic(key)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedTopic === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{topic.title}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startWarmUp}
          disabled={!ageGroup || !selectedTopic}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Start Writing Adventure <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b p-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Edit3 className="text-blue-600" size={24} />
            Writing: {topic.title}
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            Stage: {stage.charAt(0).toUpperCase() + stage.slice(1)} | Question {currentQuestion + 1} of {topic.questions?.length}
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex gap-3 ${chat.speaker === 'student' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                chat.speaker === 'tutor' ? 'bg-blue-100' : chat.speaker === 'student' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {chat.speaker === 'tutor' ? <Bot size={16} className="text-blue-600" /> : 
                 chat.speaker === 'student' ? <User size={16} className="text-green-600" /> :
                 <CheckCircle size={16} className="text-gray-600" />}
              </div>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                chat.speaker === 'tutor' ? 'bg-blue-50' :
                chat.speaker === 'student' ? 'bg-green-50' :
                chat.type === 'paragraph' ? 'bg-yellow-50 border-2 border-yellow-200' :
                'bg-gray-50'
              }`}>
                <div className={`${chat.type === 'paragraph' ? 'font-medium' : ''}`}>
                  {chat.message}
                </div>
                {chat.type === 'feedback' && <Star className="inline ml-2 text-yellow-500" size={16} />}
              </div>
            </div>
          ))}
        </div>

        {showWordBank && (
          <div className="border-t bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-800 mb-2">Word Bank - Try using some of these!</h3>
            <div className="flex flex-wrap gap-2">
              {topic.wordBank?.map((word) => (
                <span key={word} className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t p-4">
          {stage === 'warmup' && (
            <div className="space-y-3">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
              />
              <button
                onClick={handleWarmUpResponse}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share My Thoughts
              </button>
            </div>
          )}

          {stage === 'questions' && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <strong>Question {currentQuestion + 1}:</strong> {topic.questions?.[currentQuestion]}
              </div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Tell me your ideas..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
              />
              <button
                onClick={handleQuestionAnswer}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Share My Answer
              </button>
            </div>
          )}

          {stage === 'building' && (
            <div className="space-y-3">
              <textarea
                value={currentSentence}
                onChange={(e) => setCurrentSentence(e.target.value)}
                placeholder={isYounger ? "Write your complete sentence here..." : "Write your expanded sentence with details..."}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
              />
              <button
                onClick={handleSentenceBuilding}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add My Sentence
              </button>
            </div>
          )}

          {stage === 'assembly' && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your sentences so far:</h3>
                {sentences.map((sentence, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-sm text-gray-600">{index + 1}.</span> {sentence}
                  </div>
                ))}
              </div>
              <button
                onClick={assembleParagraph}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create My Paragraph!
              </button>
            </div>
          )}

          {stage === 'reflection' && (
            <div className="space-y-3">
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">🎉 Your Completed Paragraph!</h3>
                <p className="text-gray-800 leading-relaxed">{finalParagraph}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-700">Reflection Questions:</p>
                <p className="text-gray-600">• Which sentence do you like the best, and why?</p>
                <p className="text-gray-600">• What would you add if you could write one more sentence?</p>
                <p className="text-gray-600">• How does your paragraph flow from beginning to end?</p>
              </div>
              <button
                onClick={() => {
                  setStage('setup');
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setSentences([]);
                  setChatHistory([]);
                  setFinalParagraph('');
                  setCurrentAnswer('');
                  setCurrentSentence('');
                  setShowWordBank(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Write Another Paragraph!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6">
      {stage === 'setup' ? renderSetup() : renderChat()}
    </div>
  );
}