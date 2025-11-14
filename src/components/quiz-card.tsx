"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { useRouter } from "next/navigation";
import { QuizCardData } from "@/types";
interface ExpandableCardDemoProps {
  quizCards: QuizCardData[];
  userRole?: string;
}

export function ExpandableCardDemo({ quizCards, userRole }: ExpandableCardDemoProps) {
  const [CurrentCardPhoto, setCurrentCardPhoto] = useState("");
  const [active, setActive] = useState<QuizCardData | boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const router = useRouter();
  useEffect(() => { 
  const cardPhotos = [
    "/card-photos/dummy1.jpg",
    "/card-photos/dummy2.jpg"
];
  const randomIndex = Math.floor(Math.random() * cardPhotos.length);
        setCurrentCardPhoto(cardPhotos[randomIndex]);
  },[]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.quiz_id}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.quiz_id}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl"
            >
              <motion.div layoutId={`image-${active.quiz_id}-${id}`}>
                {/* You might want to add a placeholder image or remove this div if no image is available */}
                <img
                  width={200}
                  height={200}
                  src={CurrentCardPhoto} // Placeholder image
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.quiz_id}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`creator-${active.creatorName}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      By: {active.creatorName}
                    </motion.p>
                  </div>

                  <div className="flex gap-2">
                    {userRole === "admin" && (
                      <motion.button
                        layoutId={`edit-button-${active.quiz_id}-${id}`}
                        className="px-4 py-3 text-sm rounded-full font-bold bg-blue-500 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit functionality
                          console.log("Edit quiz:", active.quiz_id);
                        }}
                      >
                        Edit
                      </motion.button>
                    )}
                    <motion.button
                      layoutId={`button-${active.quiz_id}-${id}`}
                      className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/quiz/${active.quiz_id}`);
                      }}
                    >
                      Start Quiz
                    </motion.button>
                  </div>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    <h4 className="font-bold text-neutral-700 dark:text-neutral-200">
                      Questions:
                    </h4>
                    <ul className="list-disc pl-5">
                      {active.questions.map((q: { question_text: string }, idx: number) => (
                        <li key={idx}>{q.question_text}</li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-3xl mx-auto w-full  gap-4">
        {quizCards.map((card) => (
          <motion.div
            layoutId={`card-${card.quiz_id}-${id}`}
            key={`card-${card.quiz_id}-${id}`}
            onClick={() => setActive(card)}
            className="p-4  flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-col md:flex-row  ">
              <motion.div layoutId={`image-${card.quiz_id}-${id}`}>
                <img
                  width={300}
                  height={300}
                  src={CurrentCardPhoto} // Placeholder image
                  alt={card.title}
                  className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="">
                <motion.h3
                  layoutId={`title-${card.quiz_id}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`creator-${card.creatorName}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                >
                  By: {card.creatorName}
                </motion.p>
              </div>
            </div>
            <div className="flex gap-2">
              {userRole === "admin" && (
                <motion.button
                  layoutId={`edit-button-${card.quiz_id}-${id}`}
                  className="px-4 py-2 text-sm rounded-full font-bold bg-blue-500 text-white mt-4 md:mt-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle edit functionality
                    console.log("Edit quiz:", card.quiz_id);
                  }}
                >
                  Edit
                </motion.button>
              )}
              <motion.button
                layoutId={`button-${card.quiz_id}-${id}`}
                className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/quiz/${card.quiz_id}`);
                }}
              >
                Start
              </motion.button>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

export default ExpandableCardDemo;
