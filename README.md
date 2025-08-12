# abhiruAI - The Best AI | LK

This project is a web-based AI chat application with a client-server architecture. The frontend is built with HTML, CSS, and vanilla JavaScript, and the backend is a Python server using the Flask framework. The application uses the Google Gemini API for its AI capabilities and Firebase for user authentication.

## Project Structure

- `/`: Contains the frontend files (`app.html`, `style.css`, `script.js`, etc.).
- `/backend`: Contains the backend Flask application (`app.py`, `requirements.txt`).

## Setup and Running the Application

To run this application, you need to run both the backend server and the frontend client.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    It's recommended to use a virtual environment to manage dependencies.

    ```bash
    # For Unix/macOS
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    venv\Scripts\activate
    ```

3.  **Install dependencies:**
    Install the required Python packages using pip.
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file:**
    Create a `.env` file in the `backend` directory and add your Google Gemini API key to it. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

5.  **Run the Flask server:**
    ```bash
    python app.py
    ```
    The backend server will start on `http://127.0.0.1:5001`.

### Frontend Setup

1.  **Open `app.html` in your browser:**
    You can open the `app.html` file directly in your web browser.

2.  **(Recommended) Use a Live Server:**
    For a better development experience with automatic reloading, you can use a live server. If you are using Visual Studio Code, you can use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension. Right-click on `app.html` and choose "Open with Live Server". This will typically open the application on a local server like `http://127.0.0.1:5500`.

Once both the backend and frontend are running, you can interact with the AI assistant in your browser.
