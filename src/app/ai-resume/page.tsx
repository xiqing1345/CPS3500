"use client";

import { useState } from "react";

export default function AIResume() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("resume");
  const [tone, setTone] = useState("Professional");
  const [targetRole, setTargetRole] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, mode, tone, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setOutput(data.text);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div>
      <h1>AI Resume / LinkedIn Helper</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Input:
          <br />
          <textarea
            rows={6}
            style={{ width: "100%" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Output Type:
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="resume">Resume bullets</option>
            <option value="linkedin">LinkedIn summary</option>
            <option value="cover">Cover letter paragraph</option>
          </select>
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Tone:
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Professional</option>
            <option>Confident</option>
            <option>Friendly</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Target Role:
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <button
        onClick={generate}
        disabled={input.length < 20 || loading}
        style={{ marginBottom: "1rem" }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {output && (
        <div>
          <h2>Output</h2>
          <textarea
            rows={6}
            style={{ width: "100%" }}
            value={output}
            readOnly
          />
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={copyOutput}>Copy</button>
            <button onClick={generate} style={{ marginLeft: "0.5rem" }}>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
