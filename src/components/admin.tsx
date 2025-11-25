"use client"

import React, { useRef, useState, useEffect } from "react";
import { QuizCardData, QuizData, Question, Option, Category } from '@/types';
import { ExpandableCardDemo } from './quiz-card';


export function Admin({ userId }: { userId: string }) {
    const [quizzes, setQuizzes] = useState<QuizCardData[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newQuiz, setNewQuiz] = useState<Partial<QuizData>>({
        title: '',
        difficulty: 'easy',
        cat_id: '',
        questions: [],
        creator_id: userId,
    });
    const [numQuestions, setNumQuestions] = useState(1);

    useEffect(() => {
        const initialQuestions: Question[] = Array.from({ length: numQuestions }, (_, qIndex) => {
            const newQuestionId = `temp-question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${qIndex}`;
            const options: Option[] = Array.from({ length: 4 }, (_, oIndex) => ({
                option_text: '',
                is_correct: false,
                option_id: `temp-option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${qIndex}-${oIndex}`,
                question_id: newQuestionId,
            }));
            return { question_text: '', options, question_id: newQuestionId, quiz_id: '' };
        });
        setNewQuiz(prev => ({ ...prev, questions: initialQuestions }));
    }, [numQuestions, userId]);

    useEffect(() => {
        fetchQuizzes();
        fetchCategories();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch('/api/quiz-cards');
            if (!response.ok) {
                throw new Error('Failed to fetch quizzes');
            }
            const data = await response.json();
            setQuizzes(data.data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            setCategories(data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAddQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewQuiz(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (qIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updatedQuestions = newQuiz.questions?.map((q, index) => {
            if (index === qIndex) {
                return { ...q, [name]: value };
            }
            return q;
        });
        setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Category name cannot be empty.');
            return;
        }
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cat_name: newCategoryName }),
            });
            if (!response.ok) {
                throw new Error('Failed to add category');
            }
            alert('Category added successfully!');
            setNewCategoryName('');
            fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category.');
        }
    };

    const handleOptionChange = (qIndex: number, oIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const updatedQuestions = newQuiz.questions?.map((q, index) => {
            if (index === qIndex) {
                const updatedOptions = q.options?.map((o, optIndex) => {
                    if (optIndex === oIndex) {
                        return { ...o, [name]: type === 'checkbox' ? checked : value };
                    }
                    return o;
                });
                if (name === 'is_correct' && checked) {
                    updatedOptions?.forEach((o, idx) => {
                        if (idx !== oIndex) {
                            o.is_correct = false;
                        }
                    });
                }
                return { ...q, options: updatedOptions };
            }
            return q;
        });
        setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    };


    const handleSubmitAddQuiz = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!newQuiz.title) {
            alert('Quiz title cannot be empty.');
            return;
        }
        if (!newQuiz.cat_id) {
            alert('Please select a category or add a new one.');
            return;
        }
        if (!newQuiz.questions || newQuiz.questions.length === 0) {
            alert('A quiz must have at least one question.');
            return;
        }

        for (const question of newQuiz.questions) {
            if (!question.question_text.trim()) {
                alert('Question text cannot be empty.');
                return;
            }
            if (!question.options || question.options.length === 0) {
                alert('Each question must have options.');
                return;
            }

            const optionTexts = new Set<string>();
            let correctOptionCount = 0;

            for (const option of question.options) {
                if (!option.option_text.trim()) {
                    alert('Option text cannot be empty.');
                    return;
                }
                if (optionTexts.has(option.option_text.trim().toLowerCase())) {
                    alert('No two options can be the same within a question.');
                    return;
                }
                optionTexts.add(option.option_text.trim().toLowerCase());

                if (option.is_correct) {
                    correctOptionCount++;
                }
            }

            if (correctOptionCount === 0) {
                alert('At least one option must be selected as correct for each question.');
                return;
            }
        }

        try {
            const response = await fetch('/api/quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newQuiz),
            });
            if (!response.ok) {
                throw new Error('Failed to add quiz');
            }
            alert('Quiz added successfully!');
            setNewQuiz({
                title: '',
                difficulty: 'easy',
                cat_id: '',
                questions: [],
                creator_id: userId,
            });
            setNumQuestions(1);
            fetchQuizzes();
        } catch (error) {
            console.error('Error adding quiz:', error);
            alert('Failed to add quiz.');
        }
    };

    const handleDeleteQuiz = async (quiz_id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) {
            return;
        }
        try {
            const response = await fetch(`/api/quiz/${quiz_id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete quiz');
            }
            alert('Quiz deleted successfully!');
            fetchQuizzes();
        } catch (error) {
            console.error('Error deleting quiz:', error);
            alert('Failed to delete quiz.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Admin Panel</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Quiz Section */}
                <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-screen">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">Add New Quiz</h2>
                    <form onSubmit={handleSubmitAddQuiz} className="space-y-4 relative">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newQuiz.title || ''}
                                onChange={handleAddQuizChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={newQuiz.difficulty || 'easy'}
                                onChange={handleAddQuizChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="cat_id" className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                id="cat_id"
                                name="cat_id"
                                value={newQuiz.cat_id || ''}
                                onChange={handleAddQuizChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.cat_id} value={category.cat_id}>
                                        {category.cat_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                placeholder="Or add new category"
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Add Category
                            </button>
                        </div>
                        <div>
                            <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">Number of Questions</label>
                            <input
                                type="number"
                                id="numQuestions"
                                name="numQuestions"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(parseInt(e.target.value, 10) || 1)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            />
                        </div>

                        {newQuiz.questions?.map((question, qIndex) => (
                            <div key={question.question_id} className="border p-4 rounded-md bg-gray-50">
                                <h3 className="text-lg font-medium mb-2 text-gray-900">Question {qIndex + 1}</h3>
                                <div>
                                    <label htmlFor={`question_text_${qIndex}`} className="block text-sm font-medium text-gray-700">Question Text</label>
                                    <textarea
                                        id={`question_text_${qIndex}`}
                                        name="question_text"
                                        value={question.question_text}
                                        onChange={(e) => handleQuestionChange(qIndex, e)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                        rows={2}
                                        required
                                    ></textarea>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <h4 className="text-md font-medium text-gray-700">Options:</h4>
                                    {question.options?.map((option, oIndex) => (
                                        <div key={option.option_id} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                name="option_text"
                                                value={option.option_text}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                                placeholder={`Option ${oIndex + 1}`}
                                                aria-label={`Option ${oIndex + 1} text`}
                                                required
                                            />
                                            <input
                                                title="correct"
                                                type="checkbox"
                                                name="is_correct"
                                                checked={option.is_correct}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                            <label className="text-sm text-gray-700">Correct</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
<div className="flex justify-center mt-4 z-10">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Submit Quiz
                        </button>
</div>
                    </form>
                </div>

                {/* Delete Quiz Section */}
                <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-screen">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">Delete Existing Quiz</h2>
                    {quizzes.length === 0 ? (
                        <p className="text-gray-700">No quizzes available to delete.</p>
                    ) : (
                        <div className="space-y-3">
                            {quizzes.map((quiz) => (
                                <div key={quiz.quiz_id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm">
                                    <span className="text-gray-900">{quiz.title} (ID: {quiz.quiz_id})</span>
                                    <button
                                        onClick={() => handleDeleteQuiz(quiz.quiz_id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}