import { Checkbox, Input } from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";

const container: React.CSSProperties = {
  maxWidth: "1000px",
  height: "100%",
  margin: "40px auto 0 auto",
};

const form: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
};

const card: { light: React.CSSProperties; dark: React.CSSProperties } = {
  light: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    marginTop: 40,
  },
  dark: {
    backgroundColor: "#222",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
    padding: "20px",
    marginTop: 40,
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
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const cardBody: React.CSSProperties = {
  color: "#333",
  padding: "20px 0",
};

const layoutConfig = ["article", "comment", "follower", "viewCount", "site"];

const Card = () => {
  const [name, setName] = useState("diygod");
  const [host, setHOST] = useState("");
  const [layout, setLayout] = useState([...layoutConfig]);

  const cardLayout = useMemo(() => {
    if (layout.length === layoutConfig.length) {
      return "";
    } else {
      return layout.join("-");
    }
  }, [layout]);

  const light = useMemo(() => {
    if (!host) return "";
    const url = new URL(`/api/${name}`, location.origin);
    url.searchParams.set("theme", "light");
    cardLayout && url.searchParams.set("layout", cardLayout);
    return url.toString();
  }, [name, host, cardLayout]);

  const dark = useMemo(() => {
    if (!host) return "";
    const url = new URL(`/api/${name}`, location.origin);
    url.searchParams.set("theme", "dark");
    cardLayout && url.searchParams.set("layout", cardLayout);
    return url.toString();
  }, [name, host, cardLayout]);

  const code = useMemo(() => {
    return `<picture>
  <source
    media="(prefers-color-scheme: light)"
    srcSet="${light}"
  />
  <source
    media="(prefers-color-scheme: dark)"
    srcSet="${dark}"
  />
  <img src="${light}" alt="" />
</picture>`;
  }, [light, dark]);

  useEffect(() => {
    setHOST(location.origin);
  }, []);

  return (
    <div style={container}>
      <div style={form}>
        <Input
          underlined
          value={name}
          label="Name"
          onInput={(e) => {
            setName((e.target as HTMLInputElement).value);
          }}
        />
        <div style={{ width: 40 }}></div>
        <Checkbox.Group
          color="secondary"
          orientation="horizontal"
          value={layout}
          onChange={(layout) => {
            layout.length && setLayout(layout);
          }}
          label="Layout"
          size="sm"
        >
          <Checkbox value="article">article</Checkbox>
          <Checkbox value="comment">comment</Checkbox>
          <Checkbox value="follower">follower</Checkbox>
          <Checkbox value="viewCount">viewCount</Checkbox>
          <Checkbox value="site">site</Checkbox>
        </Checkbox.Group>
      </div>

      <div style={card.light}>
        <div style={cardHeader}>
          <h2 style={cardTitle}>
            Light
            <p>{light}</p>
          </h2>
        </div>
        <div style={cardBody}>
          <img src={light} alt="" />
        </div>
      </div>
      <div style={card.dark}>
        <div style={cardHeader}>
          <h2 style={cardTitle}>
            Dark
            <p>{dark}</p>
          </h2>
        </div>
        <div style={cardBody}>
          <img src={dark} alt="" />
        </div>
      </div>
      <div style={{ height: 40 }}></div>
      <h2 style={cardTitle}>Use system theme for markdown</h2>
      <pre style={{ background: "#000" }}>
        <code style={{ background: "transparent", color: "#fff" }}>{code}</code>
      </pre>
    </div>
  );
};

export default Card;
