import React, { useState } from "react";

const card: { light: React.CSSProperties; dark: React.CSSProperties } = {
  light: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
  },
  dark: {
    backgroundColor: "#222",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
    padding: "20px",
  },
};

const cardHeader: React.CSSProperties = {
  backgroundColor: "#00bcd4",
  borderRadius: "10px 10px",
  color: "#fff",
  padding: "10px 20px",
};

const cardTitle: React.CSSProperties = {
  margin: "0",
};

const cardBody: React.CSSProperties = {
  color: "#333",
  padding: "20px 0",
};

const Card = () => {
  const [name, setName] = useState("Alex-Programer");

  return (
    <div style={{ maxWidth: "60%", margin: "0 auto" }}>
      <h1>xlog card</h1>
      <div>
        <input
          type="text"
          value={name}
          onInput={(e) => {
            setName((e.target as HTMLInputElement).value);
          }}
        />
        <button>识别</button>
      </div>
      <h2>主题跟随系统</h2>
      <picture>
        <source
          media="(prefers-color-scheme: light)"
          srcSet={`http://localhost:3000/api/${name}?theme=light`}
        />
        <source
          media="(prefers-color-scheme: dark)"
          srcSet={`http://localhost:3000/api/${name}?theme=dark`}
        />
        <img src={`http://localhost:3000/api/${name}?theme=light`} alt="" />
      </picture>
      <div style={card.light}>
        <div style={cardHeader}>
          <h2 style={cardTitle}>Light</h2>
        </div>
        <div style={cardBody}>
          <img src={`http://localhost:3000/api/${name}?theme=light`} alt="" />
        </div>
      </div>
      <div style={{ height: 100 }}></div>
      <div style={card.dark}>
        <div style={cardHeader}>
          <h2 style={cardTitle}>Dark</h2>
        </div>
        <div style={cardBody}>
          <img src={`http://localhost:3000/api/${name}?theme=dark`} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Card;
