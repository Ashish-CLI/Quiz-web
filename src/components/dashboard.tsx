import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ExpandableCardDemo } from "./quiz-card";
import { QuizCardData } from "@/types";


interface DashboardProps {
    user_id: number;
    username: string;
    userRole?: string;
}

interface Category {
    cat_id: number;
    cat_name: string;
}

const profilePhotos = [
    "/profile-photos/dummy.jpg",
    // Add more profile photo paths here if available
];

export default function Dashboard({ user_id, username, userRole }: DashboardProps) {
    const [currentProfilePhoto, setCurrentProfilePhoto] = useState("");
    const [difficulty, setDifficulty] = useState("any");
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("any");
    const [quizCards, setQuizCards] = useState<QuizCardData[]>([]);
    const [allQuizCards, setAllQuizCards] = useState<QuizCardData[]>([]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * profilePhotos.length);
        setCurrentProfilePhoto(profilePhotos[randomIndex]);

        async function fetchCategories() {
            try {
                const response = await fetch("/api/categories");
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.data);
                } else {
                    console.error("Failed to fetch categories");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }

        async function fetchQuizCards() {
            try {
                const response = await fetch("/api/quiz-cards");
                if (response.ok) {
                    const data = await response.json();
                    setAllQuizCards(data.data);
                    setQuizCards(data.data);
                } else {
                    console.error("Failed to fetch quiz cards");
                }
            } catch (error) {
                console.error("Error fetching quiz cards:", error);
            }
        }

        fetchCategories();
        fetchQuizCards();
    }, []);

    const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDifficulty = event.target.value;
        setDifficulty(newDifficulty);
        filterQuizCards(newDifficulty, selectedCategory);
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = event.target.value;
        setSelectedCategory(newCategory);
        filterQuizCards(difficulty, newCategory);
    };

    const filterQuizCards = (selectedDifficulty: string, selectedCat: string) => {
        let filteredCards = allQuizCards;

        if (selectedDifficulty !== "any") {
            filteredCards = filteredCards.filter(card => card.difficulty === selectedDifficulty);
        }

        if (selectedCat !== "any") {
            filteredCards = filteredCards.filter(card => card.cat_id === selectedCat);
        }

        setQuizCards(filteredCards);
    };

    return (
        <div className="dashboard-main flex flex-col  h-full">
            {/* upper part */}
            <div className="dashboard-upper w-full h-1/3 flex flex-col md:flex-row ">
            {/*upper left part pie chart*/}
                <div className="dashboard-upper-left w-full md:w-1/2 bg-cyan-400 flex flex-row items-center justify-center gap-4 p-10">
                    <div className="difficulty-selector mb-4">
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty:</label>
                        <select
                            id="difficulty"
                            name="difficulty"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={difficulty}
                            onChange={handleDifficultyChange}
                        >
                            <option value="any">Any</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="category-selector mb-4">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category:</label>
                        <select
                            id="category"
                            name="category"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="any">Any</option>
                            {categories.map((cat) => (
                                <option key={cat.cat_id} value={cat.cat_id}>
                                    {cat.cat_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/*upper right part profile*/}
                <div className="dashboard-upper-right w-full md:w-1/2 bg-blue-500 flex flex-col items-center justify-center text-black">
                    {currentProfilePhoto && (
                        <Image
                            src={currentProfilePhoto}
                            alt="Profile"
                            width={250}
                            height={250}
                            className="rounded-xl"
                        />
                    )}
                    <p className="text-xl font-bold">{username}</p>
                </div>

            </div>
            {/* lower part */}
            <div className="dashboard-lower w-full h-2/3 flex  md:flex-row bg-emerald-200 p-4 overflow-y-auto">
              <div className="items-center w-full"><ExpandableCardDemo quizCards={quizCards} userRole={userRole} />
            </div></div>
                
        </div>
    );
}