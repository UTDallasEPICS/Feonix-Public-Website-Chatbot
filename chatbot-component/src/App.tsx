import "./App.css";
import { Chatbot } from "./components/Chatbot";
import logoPng from "./assets/catch-a-ride-icon.svg";

function App() {
  const exampleQuestions = [
    { id: "1", question: "What is Catch a Ride?" },
    { id: "2", question: "Am I eligible to use Catch a Ride?" },
    { id: "3", question: "How do I book a ride?" },
  ];

  const logoElement = (
    <img src={logoPng} alt="Chatbot Icon" className="w-14 h-8" />
  );

  return (
    <>
      <Chatbot
        apiEndpoint="http://localhost:3000/api/chatbot"
        exampleQuestions={exampleQuestions}
        privacyPolicyUrl="https://google.com"
        logoElement={logoElement}
        welcomeMessage="Hi there! I'm Catch-A-Ride's AI assistant. How can I help you today?"
      />
    </>
  );
}

export default App;
