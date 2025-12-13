import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
}

const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);
  };

  if (quizFinished) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center animate-fade-in">
        <div className="w-20 h-20 bg-tan rounded-full mx-auto flex items-center justify-center mb-6">
          <i className="fa-solid fa-trophy text-3xl text-cherry"></i>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h3>
        <p className="text-slate-500 mb-6">You scored {score} out of {questions.length}</p>
        <button 
          onClick={handleRestart}
          className="px-6 py-3 bg-cherry text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg border border-slate-100 animate-slide-up max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Question {currentIndex + 1} of {questions.length}</span>
        <span className="bg-sand text-slate-800 text-xs font-bold px-3 py-1 rounded-full">Score: {score}</span>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
        {currentQuestion.question}
      </h3>

      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((option, index) => {
          let buttonStyle = "border-slate-200 text-slate-800 hover:bg-slate-50"; // Default: High contrast text and border
          
          if (isAnswered) {
            if (index === currentQuestion.correctAnswerIndex) {
              buttonStyle = "bg-green-100 border-green-500 text-green-800 font-bold";
            } else if (index === selectedOption) {
              buttonStyle = "bg-red-50 border-red-300 text-red-800";
            } else {
              buttonStyle = "border-slate-100 text-slate-400 opacity-60";
            }
          } else if (selectedOption === index) {
            buttonStyle = "border-cherry bg-cherry/5 text-cherry font-bold";
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${buttonStyle}`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center text-xs
                  ${isAnswered && index === currentQuestion.correctAnswerIndex ? 'border-green-600 bg-green-600 text-white' : 
                    isAnswered && index === selectedOption ? 'border-red-500 bg-red-500 text-white' : 
                    'border-slate-300 text-slate-400'}
                `}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="animate-fade-in">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-bold mr-1"><i className="fa-solid fa-circle-info"></i> Explanation:</span>
              {currentQuestion.explanation}
            </p>
          </div>
          <button
            onClick={handleNext}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;