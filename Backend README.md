Portfolio Analytics Dashboard - Backend API
This is the backend service for the Portfolio Analytics Dashboard. It's a robust Node.js and Express API that serves all the necessary data to the frontend application and performs all required calculations on the fly.

Live API Base URL: https://portfolio-backend-b2r0.onrender.com

Frontend Application Repository: https://github.com/Shriiiiii/portfolio-backend

✨ Features
This backend meets all the server-side requirements of the assignment, focusing on robustness and best practices.

Dynamic Data Calculations: The server takes a raw list of holdings and dynamically calculates all metrics, including total value, gain/loss, percentages, and allocations for each API request.

Robust Error Handling: The API includes a global error-handling middleware. If any internal calculation fails, it sends a proper 500 Internal Server Error status code and a clear JSON error message, preventing the server from crashing.

Data Validation: Before performing calculations, the server validates the internal data source to ensure it's not empty or malformed, making the API more resilient.

RESTful Endpoints: Provides four clean, well-defined endpoints as specified in the assignment.

🛠️ Technology Stack
Runtime: Node.js

Framework: Express.js

Middleware: CORS

Deployment: Hosted on Render

🔌 API Endpoints
The API provides four GET endpoints:

Method

Endpoint

Description

GET

/api/portfolio/summary

Returns key metrics and insights like top performers.

GET

/api/portfolio/holdings

Returns a complete list of all stock investments.

GET

/api/portfolio/allocation

Returns asset distribution by sector, market cap, etc.

GET

/api/portfolio/performance

Returns historical performance and trailing returns.

🚀 Local Setup
To run this backend server on your local machine, follow these steps.

Clone the repository:

git clone https://github.com/Shriiiiii/portfolio-backend
cd portfolio-backend

Install dependencies:

npm install

Start the server:

node server.js

The API will now be running and accessible at http://localhost:5000.

🤖 AI Usage in Development
As encouraged by the assignment, AI tools (specifically Google's Gemini) were utilized to accelerate development. This included generating the initial Express server boilerplate, refactoring the code to perform dynamic calculations, implementing robust error-handling middleware, and documenting the code with clear, explanatory comments.