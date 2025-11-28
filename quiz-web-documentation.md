
# Quiz Web Application Documentation

## 1. Project Title and Requirements

### Project Title

Quiz Web Application

### Functional Requirements

*   **User Authentication:**
    *   Users can register for a new account.
    *   Users can log in and log out.
    *   The system distinguishes between 'admin' and 'student' roles, with different permissions for each.
*   **Quiz Management (Admin):**
    *   Admins can create new quizzes, specifying the title, difficulty, and category.
    *   Admins can add multiple-choice questions to a quiz, with one or more correct answers.
    *   Admins can view, edit, and delete existing quizzes.
*   **Quiz Taking (Student):**
    *   Students can view a list of available quizzes.
    *   Students can take a quiz and submit their answers.
    *   The system provides immediate feedback on the quiz results.
*   **Results Tracking:**
    *   The system records each quiz attempt, including the score and time taken.
    *   Users can view their past quiz results.

### Non-Functional Requirements

*   **Security:**
    *   User passwords are securely hashed and stored.
    *   The application is protected against common web vulnerabilities.
*   **Performance:**
    *   The application is responsive and loads quickly.
    *   Database queries are optimized for performance.
*   **Usability:**
    *   The user interface is intuitive and easy to navigate.
*   **Scalability:**
    *   The application can handle a growing number of users and quizzes.

## 2. Database Design

The database is designed to support all the functionalities of the quiz application. Here are the main tables and their relationships:

### Tables

*   **`users`**: Stores user information.
    *   `user_id` (Primary Key)
    *   `user_name`
    *   `email` (Unique)
    *   `password`
    *   `registration_date`
    *   `role` ('admin' or 'student')
    *   `is_admin`
*   **`quizzes`**: Stores information about each quiz.
    *   `quiz_id` (Primary Key)
    *   `title`
    *   `difficulty`
    *   `cat_id` (Foreign Key to `categories`)
    *   `creator_id` (Foreign Key to `users`)
    *   `creation_date`
    *   `question_no`
*   **`questions`**: Stores the questions for each quiz.
    *   `question_id` (Primary Key)
    *   `question_text`
    *   `quiz_id` (Foreign Key to `quizzes`)
*   **`options`**: Stores the answer options for each question.
    *   `option_id` (Primary Key)
    *   `option_text`
    *   `is_correct`
    *   `question_id` (Foreign Key to `questions`)
*   **`categories`**: Stores quiz categories.
    *   `cat_id` (Primary Key)
    *   `cat_name`
*   **`results`**: Stores the results of each quiz attempt.
    *   `attempt_id` (Primary Key)
    *   `user_id` (Foreign Key to `users`)
    *   `quiz_id` (Foreign Key to `quizzes`)
    *   `score`
    *   `date`
    *   `time_taken`

### Relationships

*   A **user** can create multiple **quizzes** (`users` to `quizzes` is one-to-many).
*   A **quiz** belongs to one **category** and has one **creator** (`quizzes` to `categories` and `users` are many-to-one).
*   A **quiz** has multiple **questions** (`quizzes` to `questions` is one-to-many).
*   A **question** has multiple **options** (`questions` to `options` is one-to-many).
*   A **user** can have multiple **results** (`users` to `results` is one-to-many).

## 3. Use of Transactions

The application uses database transactions to ensure data integrity, especially in critical operations like creating a new quiz. For example, when an admin creates a quiz, the system needs to insert data into three different tables (`quizzes`, `questions`, and `options`). A transaction ensures that all these operations are completed successfully; otherwise, the entire transaction is rolled back, preventing partial data from being saved.

## 4. GUI Demonstration (User Flow)

Since I cannot run the GUI, here is a step-by-step description of how a user would interact with the application:

1.  **Registration and Login:**
    *   A new user visits the registration page and creates an account.
    *   The user then logs in with their credentials.
2.  **Dashboard:**
    *   After logging in, the user is redirected to the dashboard, where they can see a list of available quizzes.
3.  **Taking a Quiz:**
    *   The user selects a quiz and starts it.
    *   The user answers each question and submits the quiz.
4.  **Viewing Results:**
    *   After submitting the quiz, the user sees their score and the time taken.
    *   The user can also view their past results on the results page.
5.  **Admin Functions:**
    *   An admin user has access to an admin panel where they can create, edit, and delete quizzes.

## 5. API Endpoints

This section provides a detailed explanation of the application's API endpoints.

### Authentication

*   **`POST /api/auth/login`**: Authenticates a user and returns a JSON Web Token (JWT).
*   **`POST /api/auth/logout`**: Logs out the currently authenticated user.
*   **`GET /api/auth/user`**: Retrieves the details of the currently authenticated user.
*   **`POST /api/register`**: Registers a new user.

### Categories

*   **`GET /api/categories`**: Retrieves a list of all quiz categories.
*   **`POST /api/categories`**: Creates a new quiz category.

### Quizzes

*   **`POST /api/quiz`**: Creates a new quiz.
*   **`GET /api/quiz/{quiz_id}`**: Retrieves the details of a specific quiz.
*   **`GET /api/quiz-cards`**: Retrieves a list of quizzes for display on the dashboard.

### Questions and Options

*   **`POST /api/quiz/question`**: Adds a new question to a quiz.
*   **`GET /api/quiz/question/{question_id}`**: Retrieves a specific question.
*   **`PUT /api/quiz/question/{question_id}`**: Updates a specific question.
*   **`DELETE /api/quiz/question/{question_id}`**: Deletes a specific question.
*   **`PUT /api/quiz/option/{option_id}`**: Updates a specific option.
*   **`DELETE /api/quiz/option/{option_id}`**: Deletes a specific option.

### Quiz Submission and Results

*   **`POST /api/quiz/submit`**: Submits a user's answers for a quiz.
*   **`GET /api/results`**: Retrieves the quiz results for a specific user.
*   **`GET /api/results/{attempt_id}`**: Retrieves the details of a specific quiz attempt.

## 6. Application Flow Diagram

The following diagram illustrates the overall flow of the application, from the user's interaction with the frontend to the backend processing and database operations.

:::mermaid
graph TD
    subgraph User_Interface
        A[User]
    end

    subgraph Frontend_Nextjs_React
        B[Login/Register]
        C[Student Dashboard]
        D[Admin Dashboard]
        E[Take Quiz]
    end

    subgraph Backend_Nextjs_API_Routes
        F[Auth API]
        G[Quiz API]
        H[Category API]
        I[Results API]
    end

    subgraph Database_MySQL
        J[Users Table]
        K[Quizzes Table]
        L[Questions Table]
        M[Options Table]
        N[Categories Table]
        O[Results Table]
    end

    A --> B
    B -- Credentials --> F
    F -- JWT --> B
    F -- User Data --> J

    B -- Role --> C
    B -- Role --> D

    C --> G
    G -- Quiz List --> C
    C --> E
    E -- Quiz Data --> G
    G -- Questions/Options --> E
    E -- Answers --> I
    I -- Score --> E
    I -- Results Data --> O

    D -- CRUD Operations --> G
    G -- Quiz Data --> K
    G -- Question Data --> L
    G -- Option Data --> M

    D -- CRUD Operations --> H
    H -- Category Data --> N

:::