# Bedrock Chat Application

This is a full-stack web application that allows you to interact with AWS Bedrock's Claude models through a ChatGPT-like interface. It supports text-based conversations, image analysis, and PDF document summarization.

## Features

*   **Text Chat:** Engage in conversational AI with the Claude model.
*   **Image Analysis:** Upload images and have the model describe or analyze their content.
*   **PDF Analysis:** Upload PDF documents and receive summaries or insights from the model.
*   **Code Copying:** Easily copy code snippets from the model's responses.
*   **Theme Toggle:** Switch between light and dark modes for a personalized viewing experience.

## Installation Guide

This guide will walk you through setting up and running the Bedrock Chat application, which consists of a Python FastAPI backend and a React frontend.

### Prerequisites:

*   **Python 3.8+** and `pip` (Python package installer)
*   **Node.js** and `npm` (Node Package Manager)
*   **AWS Credentials configured in your environment:** The backend uses `boto3` which automatically picks up AWS credentials from environment variables (e.g., `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION`). Ensure these are set up in your shell or system.

### Steps:

**1. Clone the Repository:**

First, clone the project from your GitHub repository:

```bash
git clone https://github.com/akashiitd/BedrockChat.git
cd BedrockChat
```

**2. Backend Setup (Python FastAPI):**

Navigate into the `backend` directory, create a virtual environment, and install the Python dependencies.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows, use `.\venv\Scripts\activate`
pip install -r requirements.txt
```

**3. Run the Backend Server:**

While still in the `backend` directory and with the virtual environment activated, start the FastAPI server. You can run this in the background if you wish.

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
# To run in the background (Linux/macOS):
# uvicorn main:app --host 0.0.0.0 --port 8000 &
```

The backend server will be accessible at `http://localhost:8000`.

**4. Frontend Setup (React):**

Open a **new terminal window** and navigate to the `frontend` directory. Install the Node.js dependencies.

```bash
cd ../frontend # If you are still in the backend directory
npm install
```

**5. Run the Frontend Application:**

Start the React development server. This will automatically open the application in your default web browser.

```bash
npm start
```

The frontend application will be accessible at `http://localhost:3000`.

---

You should now have the Bedrock Chat application fully running in your browser, allowing you to interact with your AWS Bedrock Claude model.
