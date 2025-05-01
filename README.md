# AI Trip Planner

AI Trip Planner is an intelligent, AI-powered web application designed to streamline and personalize your travel planning experience. Leveraging advanced artificial intelligence and third-party APIs, this project helps users generate custom travel itineraries, discover places to visit, and find accommodations-all tailored to their preferences.

---

## Features

- **AI-Powered Itinerary Generation:** Instantly create detailed, day-by-day travel plans based on your destination, interests, and budget.
- **Personalized Recommendations:** Get suggestions for attractions, restaurants, and hotels that match your style and needs.
- **Dynamic Place & Hotel Information:** Access up-to-date details and photos for destinations and accommodations.
- **Expense Tracking:** Monitor your travel expenses and plan within your budget.
- **Collaborative Planning:** Invite friends or colleagues to collaborate on trip plans.
- **Secure Authentication:** Sign in securely, typically via Google OAuth.
- **Persistent Data Storage:** Save and revisit your trip plans anytime.

---

## Technologies Used

| Technology               | Purpose                                   |
|--------------------------|-------------------------------------------|
| React                    | Frontend UI framework                     |
| TailwindCSS              | Modern, responsive styling                |
| Node.js                  | Backend server and API integration        |
| Firebase                 | Authentication and real-time data storage |
| Google Generative AI / Gemini | AI-powered itinerary generation     |
| Google Places API        | Fetching place and hotel details          |
| Axios                    | HTTP requests to APIs                     |

---

## Getting Started

### Prerequisites

- Node.js & npm installed
- Firebase project with Firestore and Authentication enabled
- API keys for Google Generative AI (or Gemini) and Google Places API

### Installation

1. **Clone the repository:**
- git clone https://github.com/aaaryan2150/ai-trip-planner.git
- cd ai-trip-planner


2. **Install dependencies:**


3. **Configure environment variables:**
- Create a `.env` file in the root directory.
- Add your Firebase configuration and API keys:
  ```
  REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
  REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
  REACT_APP_FIREBASE_PROJECT_ID=your_project_id
  REACT_APP_GOOGLE_PLACES_API_KEY=your_google_places_api_key
  REACT_APP_GENAI_API_KEY=your_genai_api_key
  ```

4. **Start the development server:**
- npm start


---

## Usage

- Sign in using your Google account.
- Enter your trip details (destination, dates, interests, budget).
- Review the AI-generated itinerary and recommendations.
- Customize your plan, add or remove activities, and invite collaborators.
- Track your expenses and save your trip for future reference.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and test them.
4. Commit and push your branch.
5. Open a pull request describing your changes.

---

## License

This project is open source and available under the MIT License.

---


*Ready to plan your next adventure? Start exploring with AI Trip Planner!*
