"use client";

import Dashboard from "@/components/dashboard";
import { useState, useEffect } from "react";

interface User {
  id: number;
  userName: string;
  email: string;
  role: string;
}

export default function Sdashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/auth/user");
         // Assuming this endpoint exists
        if (response.ok) {
          const userData = await response.json();
          console.log("Fetched user data:", userData);
          setUser(userData.data);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUserData();
  }, []);

  return (
    <div className="sdashmain flex flex-col relative h-screen md:flex-row">
      {/*left part*/}
      <div className="sdashleft w-full md:w-1/5 bg-[#695ae0] flex-row ">
        <ul className="flex-row  space-y-6 mt-20 mx-5 text-2xl">
          <li className="flex gap-5 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 20 20"
            >
              <path
                fill="#ffffff"
                d="M8 20H3V10H0L10 0l10 10h-3v10h-5v-6H8v6z"
              />
            </svg>
            <button className="mt-0.5">Dashboard</button>
          </li>
          <li className="flex gap-5 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={26}
              height={26}
              viewBox="0 0 16 16"
            >
              <path
                fill="#ffffff"
                fillRule="evenodd"
                d="M4 6.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3ZM7 5a2.99 2.99 0 0 1-.87 2.113A3.997 3.997 0 0 1 8 10.5V12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-1.5c0-1.427.747-2.679 1.87-3.387A3 3 0 1 1 7 5Zm-5.5 5.5a2.5 2.5 0 0 1 5 0V12a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-1.5Zm12.251-7.165c.21.122.462.163.685.07l.313-.133a.5.5 0 0 1 .628.21l.308.535a.5.5 0 0 1-.13.649l-.272.205c-.193.146-.283.387-.283.629s.09.483.283.629l.271.205a.5.5 0 0 1 .131.649l-.308.534a.5.5 0 0 1-.628.21l-.313-.131c-.223-.094-.475-.053-.685.069c-.209.121-.374.32-.404.56l-.042.337a.5.5 0 0 1-.496.438h-.618a.5.5 0 0 1-.496-.438l-.042-.337c-.03-.24-.195-.439-.404-.56c-.21-.122-.462-.163-.685-.07l-.313.133a.5.5 0 0 1-.628-.21l-.308-.535a.5.5 0 0 1 .13-.649l.272-.205C9.91 5.983 10 5.742 10 5.5s-.09-.483-.283-.629l-.271-.205a.5.5 0 0 1-.131-.649l.308-.534a.5.5 0 0 1 .628-.21l.313.131c.223.094.475.053.685-.069c.209-.121.374-.32.404-.56l.042-.337A.5.5 0 0 1 12.191 2h.618a.5.5 0 0 1 .496.438l.042.337c.03.24.195.439.404.56ZM13.5 5.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"
                clipRule="evenodd"
              />
            </svg>
            <button className="mt-0.5">Account</button>
          </li>
          <li className="flex gap-5 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="27"
              height="27"
              viewBox="0 0 20 20"
            >
              <path
                fill="#ffffff"
                d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33l-1.42 1.42l-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"
              />
            </svg>
            <button className="mt-0.5">Search</button>
          </li>
        </ul>
      </div>
      {/*right part*/}
      <div className="sdashright w-full md:w-4/5 h-full">
        {user && <Dashboard user_id={user.id} username={user.userName} />}
      </div>
    </div>
  );
}
