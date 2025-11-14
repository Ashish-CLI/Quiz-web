import React, { useState, useEffect } from "react";
import { Question, Option, QuizData } from "../types";

interface QuizProps {
  quiz_id: string;
}

export default function Quiz({ quiz_id }: QuizProps) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string | null }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/quiz/${quiz_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        const data: QuizData = responseData.data;
        setQuizData(data);
        setQuestions(data.questions || []);
      } catch (err) {
        setError("Failed to fetch quiz data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quiz_id]);

  const handleAnswerClick = (questionId: string, option: Option) => {
    if (!submittedQuestions[questionId]) {
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: option.option_text }));
      setSubmittedQuestions((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  const getOptionClasses = (questionId: string, option: Option) => {
    let classes = "question_option flex items-center justify-between p-4 border rounded-lg cursor-pointer ";
    const isSubmitted = submittedQuestions[questionId];
    const selectedAnswer = selectedAnswers[questionId];

    if (selectedAnswer === option.option_text) {
      classes += "bg-gray-800 border-purple-500 ";
    } else {
      classes += "border-gray-700 hover:bg-gray-800 ";
    }

    if (isSubmitted) {
      if (option.is_correct) {
        classes += "border-green-500 ";
      } else if (selectedAnswer === option.option_text && !option.is_correct) {
        classes += "border-red-500 ";
      }
    }
    return classes;
  };

  const getIcon = (questionId: string, option: Option) => {
    const isSubmitted = submittedQuestions[questionId];
    const selectedAnswer = selectedAnswers[questionId];

    if (!isSubmitted) {
      return <span className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center"></span>;
    }

    const isCorrectOption = option.is_correct;
    const isSelectedOption = selectedAnswer === option.option_text;

    if (isCorrectOption) {
      return (
        <span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      );
    } else if (isSelectedOption && !isCorrectOption) {
      return (
        <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      );
    }
    return <span className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center"></span>;
  };

  const feedbackMessage = (question: Question) => {
    const isSubmitted = submittedQuestions[question.question_id];
    const selectedAnswer = selectedAnswers[question.question_id];

    if (!isSubmitted) return null;

    const correctOption = question.options.find(opt => opt.is_correct);
    if (selectedAnswer === correctOption?.option_text) {
      return (
        <div className="feedback mt-8 text-lg flex items-center">
          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-blue-400">That's correct! Way to go</span>
        </div>
      );
    } else {
      return (
        <div className="feedback mt-8 text-lg flex items-center">
          <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
          <span className="text-purple-400">The correct answer is {correctOption?.option_text}</span>
        </div>
      );
    }
  };

  if (loading) {
    return <div className="flex min-h-screen justify-center items-center text-white text-2xl">Loading Quiz...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen justify-center items-center text-red-500 text-2xl">Error: {error}</div>;
  }

  if (questions.length === 0) {
    return <div className="flex min-h-screen justify-center items-center text-white text-2xl">No questions available for this quiz.</div>;
  }

  return (
    <div className="flex min-h-screen ">
      <div className="hero_img flex fixed w-1/3 h-full absolute flex-col items-center py-10">
        {/*left part */}
        
        <div className="quiz_title text-4xl font-bold text-white text-center mt-auto mb-10">
          <p>{quizData?.title || "Loading Quiz Title..."}</p>
        </div>
        <div className="hero_bottom text-2xl font-bold text-center w-full px-10 mb-10">
          <p className="mb-4">
            <span className="ans_questions">{Object.keys(submittedQuestions).length}</span>/
            <span className="total_questions">{quizData?.question_no || 0}</span> answered
          </p>
          <div className="progress w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="progress_bar bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(Object.keys(submittedQuestions).length / (quizData?.question_no || 1)) * 100}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
          </div>
        </div>
        </div>


        
      <div className="flex w-2/3 h-full justify-center items-center ml-auto overflow-y-auto">
        {/*right part */}
        <div className="content">
          <div className="question_wrap w-dyn-items">
            <div role="list" className="question_list w-dyn-list">
              {questions.map((question, index) => (
                <div key={question.question_id} role="listitem" className="question_item mb-12">
                  <div className="question_text">
                    <h1 className="text-3xl font-bold text-white mb-8">
                      {question.question_text}
                    </h1>
                  </div>
                  <div className="question_options grid grid-cols-2 gap-4">
                    {question.options.map((option) => (
                      <div
                        key={option.option_id}
                        className={getOptionClasses(question.question_id, option)}
                        onClick={() => handleAnswerClick(question.question_id, option)}
                      >
                        <span className="text-xl text-white">{option.option_text}</span>
                        {getIcon(question.question_id, option)}
                      </div>
                    ))}
                  </div>
                  {feedbackMessage(question)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
