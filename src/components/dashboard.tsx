import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ExpandableCardDemo } from "./quiz-card";
import { QuizCardData } from "@/types";

interface DashboardProps {
  user_id: string;
  username: string;
  userRole?: string;
}

interface Category {
  cat_id: number;
  cat_name: string;
}

const profilePhotos = [
  "/profile-photos/profile1.jpg",
  "/profile-photos/profile2.jpg",
  "/profile-photos/profile3.jpg",
  "/profile-photos/profile4.jpg",
  "/profile-photos/profile5.jpg",
  "/profile-photos/profile6.jpg",
];

export default function Dashboard({ user_id, username, userRole }: DashboardProps) {
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState("");
  const [difficulty, setDifficulty] = useState("any");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("any");
  const [quizCards, setQuizCards] = useState<QuizCardData[]>([]);
  const [allQuizCards, setAllQuizCards] = useState<QuizCardData[]>([]);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isFiltersOpen, setFiltersOpen] = useState(false);

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

  const filterQuizCards = (selectedDifficulty: string, selectedCat: string) => {
    let filteredCards = allQuizCards;

    if (selectedDifficulty !== "any") {
      filteredCards = filteredCards.filter(card => card.difficulty === selectedDifficulty);
    }

    if (selectedCat !== "any") {
      filteredCards = filteredCards.filter(card => card.cat_id.toString() === selectedCat);
    }

    setQuizCards(filteredCards);
  };

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

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header Section */}
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-6">
        <div className="container  mx-auto">
          <div className="flex  mb-6">
            <div className="flex justify-center items-center space-x-6">
              <button
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="p-3 ml-2 rounded-full bg-gray-700 hover:bg-indigo-600 transition-colors duration-300"
              >
                Profile
              </button>
              <button
                onClick={() => setFiltersOpen(!isFiltersOpen)}
                className="p-3 mr-2 float-end rounded-full bg-gray-700 hover:bg-indigo-600 transition-colors duration-300"
              >
                Filters
              </button>
            </div>
          </div>
          {/* Expandable User Profile Section */}
          {isProfileOpen && (
            <div className="bg-gray-800/60 items-center justify-center backdrop-blur-md p-6 rounded-2xl shadow-2xl mt-6">
              <div className="flex items-center justify-center space-x-6">
                {currentProfilePhoto && (
                  <Image
                    src={currentProfilePhoto}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-indigo-500"
                  />
                )}
                <h2 className="text-3xl font-semibold">{username}</h2>
              </div>
            </div>
          )}
          {/* Expandable Filters Section */}
          {isFiltersOpen && (
            <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl shadow-2xl mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Filter */}
                <div>
                  <label htmlFor="difficulty" className="block text-lg font-medium mb-2">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg shadow-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={difficulty}
                    onChange={handleDifficultyChange}
                  >
                    <option value="any">Any</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                {/* Category Filter */}
                <div>
                  <label htmlFor="category" className="block text-lg font-medium mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg shadow-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="any">Any</option>
                    {categories.map(cat => (
                      <option key={cat.cat_id} value={cat.cat_id}>
                        {cat.cat_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/*Quiz Cards */}
      <main className="p-8">
        <div className="container mx-auto">
          <ExpandableCardDemo quizCards={quizCards} userRole={userRole} user_id={user_id} />
        </div>
      </main>
    </div>
  );
}