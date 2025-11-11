import React, { useState, useEffect } from "react";
import Image from "next/image";


interface DashboardProps {
    user_id: number;
    username: string;
}

const profilePhotos = [
    "/profile-photos/dummy.jpg",
    // Add more profile photo paths here if available
];

export default function Dashboard({ user_id, username }: DashboardProps) {
    const [currentProfilePhoto, setCurrentProfilePhoto] = useState("");

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * profilePhotos.length);
        setCurrentProfilePhoto(profilePhotos[randomIndex]);
    }, []);

    return (
        <div className="dashboard-main flex flex-col  h-full">
            {/* upper part */}
            <div className="dashboard-upper w-full h-1/3 flex flex-col md:flex-row ">
            {/*upper left part pie chart*/}
                <div className="dashboard-upper-left w-full md:w-1/2 bg-[#f0f0f0] flex items-center justify-center p-10">

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
            <div className="dashboard-lower w-full h-2/3 flex flex-col md:flex-row bg-red-600 ">
                </div>
        </div>
    );
}