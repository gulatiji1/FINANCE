import { useState } from "react";
import { askChat } from "../api/marketApi";

const EXAMPLES = [
  "Compare TCS and Infosys",
  "Explain Reliance business model",
  "What are risks in Tata Motors?",
];

function ChatPanel({ symbol, showExamples = false }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitQuestion = async (inputText) => {
    const cleanInput = inputText.trim();
    if (!cleanInput) return;

    const userMessage = { role: "user", text: cleanInput };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askChat(cleanInput, symbol);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: {
            summary: error?.response?.data?.error || "Unable to process request right now.",
            growth: [],
            risks: [],
            insight: "Please try again in a moment.",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitQuestion(question);
  };

  return (
    <section className="panel chatbot-panel">
      <div className="panel-header">
        <h3>Ask Anything About Stocks</h3>
        <p>AI financial research assistant</p>
      </div>

      {showExamples && (
        <div className="example-chips">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => submitQuestion(example)}>
              {example}
            </button>
          ))}
        </div>
      )}

      <div className="chat-log">
        {messages.length === 0 && (
          <p className="muted">Ask about business model, risks, growth outlook, or stock comparison.</p>
        )}
        {messages.map((message, index) => (
          <article key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
            {message.role === "user" ? (
              <p>{message.text}</p>
            ) : (
              <div>
                <h4>Summary</h4>
                <p>{message.text.summary}</p>
                <h4>Growth</h4>
                <ul>
                  {(message.text.growth || []).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <h4>Risks</h4>
                <ul>
                  {(message.text.risks || []).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <h4>Insight</h4>
                <p>{message.text.insight}</p>
              </div>
            )}
          </article>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={symbol ? `Ask about ${symbol}` : "Ask about any Indian stock"}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </section>
  );
}

export default ChatPanel;

