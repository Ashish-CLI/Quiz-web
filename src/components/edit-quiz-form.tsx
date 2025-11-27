"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { QuizData, Question, Option } from "@/types";

interface EditQuizFormProps {
  quiz_id: string;
}

const EditQuizForm: React.FC<EditQuizFormProps> = ({ quiz_id }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(`/api/quiz/${quiz_id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch quiz data");
        }
        const data = await response.json();
        setQuizData(data.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quiz_id]);

  useEffect(() => {
    if (quizData) {
      console.log("Quiz data:", JSON.stringify(quizData, null, 2));
    }
  }, [quizData]);

  if (loading) {
    return <div>Loading quiz editor...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!quizData) {
    return <div>Quiz not found.</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuizData((prevData) => {
      if (!prevData) return null;
      const updatedData = { ...prevData, [name]: value };
      validateForm(updatedData);
      return updatedData;
    });
  };

  const handleQuestionChange = (
    question_id: string,
    field: keyof Question,
    value: string
  ) => {
    setQuizData((prevData) => {
      if (!prevData) return null;
      const updatedQuestions = prevData.questions.map((q) =>
        q.question_id === question_id ? { ...q, [field]: value } : q
      );
      const updatedData = { ...prevData, questions: updatedQuestions };
      validateForm(updatedData);
      return updatedData;
    });
  };

  const handleOptionChange = (
    question_id: string,
    option_id: string,
    field: keyof Option,
    value: string | boolean
  ) => {
    setQuizData((prevData) => {
      if (!prevData) return null;
      const updatedQuestions = prevData.questions.map((q) => {
        if (q.question_id === question_id) {
          const updatedOptions = q.options.map((o) =>
            o.option_id === option_id ? { ...o, [field]: value } : o
          );
          return { ...q, options: updatedOptions };
        }
        return q;
      });
      const updatedData = { ...prevData, questions: updatedQuestions };
      validateForm(updatedData);
      return updatedData;
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fix the errors before saving.");
      return;
    }
    if (!quizData) return;

    try {
      const response = await fetch(`/api/quiz/${quiz_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save changes.");
      }

      alert("Quiz saved successfully!");
      
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const validateForm = (data: QuizData | null = quizData) => {
    if (!data) return false;

    const errors: Record<string, string> = {};
    if (!data.title.trim()) {
      errors.title = "Title is required.";
    }

    data.questions.forEach((q, index) => {
      if (!q.question_id) {
        errors[`question-${index}-id`] = `Question ${index + 1} has a missing ID.`;
      }
      if (!q.question_text.trim()) {
        errors[q.question_id] = "Question text is required.";
      }
      let correctCount = 0;
      const optionTexts = new Set();
      q.options.forEach((o, optionIndex) => {
        if (!o.option_id) {
          errors[`option-${index}-${optionIndex}-id`] = `Option ${optionIndex + 1} in Question ${index + 1} has a missing ID.`;
        }
        if (!o.option_text.trim()) {
          errors[o.option_id] = "Option text is required.";
        }
        if (optionTexts.has(o.option_text.trim().toLowerCase())) {
          errors[`${o.option_id}-duplicate`] =
            "Duplicate options are not allowed.";
        }
        optionTexts.add(o.option_text.trim().toLowerCase());
        if (o.is_correct) {
          correctCount++;
        }
      });
      if (q.options.length > 0 && correctCount !== 1) {
        errors[`${q.question_id}-correct-count`] =
          "Exactly one option must be correct.";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddQuestion = () => {
    setQuizData((prevData) => {
      if (!prevData) return null;
      const newQuestion: Question = {
        question_id: `temp-${Date.now()}`,
        question_text: "",
        quiz_id: quiz_id,
        options: [
          {
            option_id: `temp-${Date.now()}-1`,
            option_text: "",
            is_correct: false,
            question_id: `temp-${Date.now()}`,
          },
          {
            option_id: `temp-${Date.now()}-2`,
            option_text: "",
            is_correct: false,
            question_id: `temp-${Date.now()}`,
          },
          {
            option_id: `temp-${Date.now()}-3`,
            option_text: "",
            is_correct: false,
            question_id: `temp-${Date.now()}`,
          },
          {
            option_id: `temp-${Date.now()}-4`,
            option_text: "",
            is_correct: false,
            question_id: `temp-${Date.now()}`,
          },
        ],
      };
      return { ...prevData, questions: [...prevData.questions, newQuestion] };
    });
  };

  const handleDeleteQuestion = async (question_id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      if (question_id.startsWith("temp-")) {
        setQuizData((prevData) => {
          if (!prevData) return null;
          const updatedQuestions = prevData.questions.filter(
            (q) => q.question_id !== question_id
          );
          return { ...prevData, questions: updatedQuestions };
        });
        return;
      }

      try {
        const response = await fetch(`/api/quiz/question/${question_id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete the question.");
        }

        setQuizData((prevData) => {
          if (!prevData) return null;
          const updatedQuestions = prevData.questions.filter(
            (q) => q.question_id !== question_id
          );
          return { ...prevData, questions: updatedQuestions };
        });
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    setQuizData((prevData) => {
      if (!prevData) return null;
      const reorderedQuestions = Array.from(prevData.questions);
      const [removed] = reorderedQuestions.splice(source.index, 1);
      reorderedQuestions.splice(destination.index, 0, removed);
      return { ...prevData, questions: reorderedQuestions };
    });
  };

  return (
    <div className="min-h-screen bg-blue-100 text-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Edit Quiz</h1>
        <form>
          <div className="mb-6 p-3 sm:p-4 bg-blue-100 rounded-lg border border-gray-200">
            <label
              htmlFor="title"
              className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={quizData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-lg"
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.title}
              </p>
            )}
          </div>
          <div>
            <div className="mb-1 p-3 sm:p-4 ">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
              Questions
            </h2>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {quizData.questions.map((question, index) => (
                      <Draggable
                        key={question.question_id}
                        draggableId={String(question.question_id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="mb-6 p-3 sm:p-4 bg-blue-100 rounded-lg border border-gray-200"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center justify-between mb-4"
                            >
                              <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                                Question {index + 1}
                              </h3>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M4 12h16m-7 6h7"
                                />
                              </svg>
                            </div>
                            <textarea
                              value={question.question_text}
                              onChange={(e) =>
                                handleQuestionChange(
                                  question.question_id,
                                  "question_text",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 sm:p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-lg"
                              aria-label="Question text"
                              placeholder="Enter your question here..."
                            />
                            {validationErrors[question.question_id] && (
                              <p className="text-red-500 text-sm mt-2">
                                {validationErrors[question.question_id]}
                              </p>
                            )}
                            <div className="mt-4">
                              {question.options.map((option, index) => (
                                <div key={option.option_id} className="mb-3">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={option.is_correct}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          question.question_id,
                                          option.option_id,
                                          "is_correct",
                                          e.target.checked
                                        )
                                      }
                                      className="h-5 w-5  text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                      aria-label={`Option ${
                                        index + 1
                                      } correct`}
                                    />
                                    <input
                                      type="text"
                                      value={option.option_text}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          question.question_id,
                                          option.option_id,
                                          "option_text",
                                          e.target.value
                                        )
                                      }
                                      className="flex-grow bg-white p-2 sm:p-3 ml-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-lg"
                                      aria-label={`Option ${index + 1} text`}
                                      placeholder={`Option ${index + 1}`}
                                    />
                                  </div>
                                  {validationErrors[option.option_id] && (
                                    <p className="text-red-500 text-sm mt-1 ml-8">
                                      {validationErrors[option.option_id]}
                                    </p>
                                  )}
                                  {validationErrors[
                                    `${option.option_id}-duplicate`
                                  ] && (
                                    <p className="text-red-500 text-sm mt-1 ml-8">
                                      {
                                        validationErrors[
                                          `${option.option_id}-duplicate`
                                        ]
                                      }
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                            {validationErrors[
                              `${question.question_id}-correct-count`
                            ] && (
                              <p className="text-red-500 text-sm mt-2">
                                {
                                  validationErrors[
                                    `${question.question_id}-correct-count`
                                  ]
                                }
                              </p>
                            )}
                            <div className="flex justify-end mt-4">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteQuestion(question.question_id)
                                }
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm sm:text-base"
                              >
                                Delete Question
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Question
            </button>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuizForm;
