import React, { useState, useEffect } from "react";

// You can replace with local file in public folder e.g. '/alarm.mp3'
const SOUND_URL =
  "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

export default function App() {
  const [alarmTime, setAlarmTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isRinging, setIsRinging] = useState(false);
  const [audio] = useState(new Audio(SOUND_URL));
  const [problems, setProblems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [theme, setTheme] = useState("dark");

  const REQUIRED_CORRECT = 3;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      const ss = now.getSeconds().toString().padStart(2, "0");
      const time = `${hh}:${mm}:${ss}`;
      setCurrentTime(time);
      if (time === alarmTime && !isRinging) {
        startAlarm();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [alarmTime, isRinging]);

  const startAlarm = () => {
    setIsRinging(true);
    generateProblems();
    audio.loop = true;
    audio.play().catch(() => {
      console.warn("Autoplay blocked. Click Test Sound first.");
    });
  };

  const stopAlarm = () => {
    audio.pause();
    audio.currentTime = 0;
    setIsRinging(false);
    setAnswers({});
  };

  const snoozeAlarm = () => {
    stopAlarm();
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const ss = now.getSeconds().toString().padStart(2, "0");
    setAlarmTime(`${hh}:${mm}:${ss}`);
  };

  const generateProblems = () => {
    const ops = ["+", "-", "*"];
    let newProblems = [];
    for (let i = 0; i < REQUIRED_CORRECT; i++) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const op = ops[Math.floor(Math.random() * ops.length)];
      newProblems.push({ a, b, op });
    }
    setProblems(newProblems);
  };

  const handleAnswerChange = (idx, value) => {
    setAnswers({ ...answers, [idx]: value });
  };

  const checkAnswers = () => {
    let count = 0;
    problems.forEach((p, i) => {
      let correct;
      switch (p.op) {
        case "+":
          correct = p.a + p.b;
          break;
        case "-":
          correct = p.a - p.b;
          break;
        case "*":
          correct = p.a * p.b;
          break;
        default:
          correct = 0;
      }
      if (parseInt(answers[i]) === correct) {
        count++;
      }
    });

    if (count >= REQUIRED_CORRECT) {
      stopAlarm(); // ✅ Stop if solved correctly
      alert("✅ Alarm dismissed! Good job solving the problems.");
    } else {
      alert(`Only ${count}/${REQUIRED_CORRECT} correct. Try again!`);
      generateProblems(); // 🔁 Give new problems again
      setAnswers({});
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const bgColor = theme === "dark" ? "#1a202c" : "#f7fafc";
  const textColor = theme === "dark" ? "#edf2f7" : "#2d3748";

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        transition: "all 0.3s ease",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏰ Smart Alarm</h1>

      <p style={{ marginBottom: "1rem" }}>Current Time: {currentTime}</p>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Set Alarm Time (HH:MM:SS): &nbsp;
          <input
            type="text"
            placeholder="HH:MM:SS"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "2rem" }}>
        {["Set +10 sec", "Test Sound", "Toggle Theme"].map((label) => (
          <button
            key={label}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background:
                label === "Set +10 sec"
                  ? "#48bb78"
                  : label === "Test Sound"
                  ? "#4299e1"
                  : "#ed8936",
              color: "white",
              fontWeight: "bold",
            }}
            onClick={() => {
              if (label === "Set +10 sec") {
                const now = new Date();
                now.setSeconds(now.getSeconds() + 10);
                const hh = now.getHours().toString().padStart(2, "0");
                const mm = now.getMinutes().toString().padStart(2, "0");
                const ss = now.getSeconds().toString().padStart(2, "0");
                setAlarmTime(`${hh}:${mm}:${ss}`);
              } else if (label === "Test Sound") {
                audio.play();
              } else {
                toggleTheme();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {isRinging && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "400px",
              textAlign: "center",
              color: "#2d3748",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>🚨 Alarm Ringing!</h2>
            <p style={{ marginBottom: "1rem" }}>
              Solve {REQUIRED_CORRECT} problems to stop:
            </p>
            {problems.map((p, i) => (
              <div key={i} style={{ marginBottom: "0.5rem" }}>
                <label>
                  {p.a} {p.op} {p.b} ={" "}
                  <input
                    type="number"
                    value={answers[i] || ""}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                    style={{ width: "60px", marginLeft: "0.5rem" }}
                  />
                </label>
              </div>
            ))}
            <button
              onClick={checkAnswers}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "none",
                background: "#48bb78",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Submit Answers
            </button>
            <br />
            <button
              onClick={snoozeAlarm}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "none",
                background: "#ed8936",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Snooze 5 min
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
