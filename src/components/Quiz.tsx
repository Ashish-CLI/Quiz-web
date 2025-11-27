import React, { useState, useEffect } from "react";
import { Question, Option, QuizData } from "../types";
import { useRouter } from "next/navigation";

interface QuizProps {
  quiz_id: string;
  user_id: string;
}

export default function Quiz({ quiz_id, user_id }: QuizProps) {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string | null }>({});
  const [questionTimes, setQuestionTimes] = useState<{ [key: string]: number }>({});
  const [lastQuestionTime, setLastQuestionTime] = useState<number | null>(null);
  const [submittedQuestions, setSubmittedQuestions] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    console.log("[Quiz.tsx] Component mounted or updated.");
    console.log("[Quiz.tsx] Current loading state:", loading);
    console.log("[Quiz.tsx] Current error state:", error);
    console.log("[Quiz.tsx] Quiz Data (on update):", quizData);
    console.log("[Quiz.tsx] Questions (on update):", questions);
  }, [loading, error, quizData, questions]);

  useEffect(() => {
    const startQuizTime = Date.now();
    setStartTime(startQuizTime);
    setLastQuestionTime(startQuizTime);
  }, []);

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

    console.log("[useEffect-fetchQuizData] Calling fetchQuizData for quiz_id:", quiz_id);
    fetchQuizData();
  }, [quiz_id]);

  useEffect(() => {
    console.log("[useEffect-startTime] Quiz start time set:", startTime);
  }, [startTime]);

  const handleAnswerClick = (questionId: string, option: Option) => {
    if (!submittedQuestions[questionId]) {
      const now = Date.now();
      if (lastQuestionTime) {
        const timeTaken = Math.round((now - lastQuestionTime) / 1000);
        setQuestionTimes((prev) => ({ ...prev, [questionId]: timeTaken }));
      }
      setLastQuestionTime(now);
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: option.option_text }));
      setSubmittedQuestions((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      alert("Please attempt all questions before submitting.");
      return;
    }

    if (!startTime) {
      alert("Quiz start time not recorded. Please refresh and try again.");
      return;
    }

    let correctAnswers = 0;
    const attempt_details = questions.map((question) => {
      const selectedOptionText = selectedAnswers[question.question_id];
      const correctOption = question.options.find((opt) => opt.is_correct);
      if (selectedOptionText && correctOption && selectedOptionText === correctOption.option_text) {
        correctAnswers++;
      }
      const selectedOption = question.options.find(opt => opt.option_text === selectedOptionText);
      return {
        question_id: question.question_id,
        att_answer_id: selectedOption ? selectedOption.option_id : null,
        time_taken: questionTimes[question.question_id] || 0,
      };
    });

    const score = (correctAnswers / questions.length) * 100;
    const time_taken = Math.round((Date.now() - startTime) / 1000); // in seconds

    if (!user_id) {
      alert("User ID not provided. Please log in again.");
      return;
    }

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quiz_id,
          user_id: user_id,
          score: score,
          time_taken: time_taken,
          attempt_details: attempt_details,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setQuizSubmitted(true);
        router.push("/sdashboard");
      } else {
        alert(`Failed to submit quiz: ${result.message}`);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("An error occurred while submitting the quiz. Please try again.");
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
          {!quizSubmitted && (
            <button
              onClick={handleSubmit}
              className="mt-8 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Submit Quiz
            </button>
          )}
          {quizSubmitted && (
            <div className="mt-8 p-4 bg-green-700 text-white text-xl rounded-lg">
              Quiz submitted successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

