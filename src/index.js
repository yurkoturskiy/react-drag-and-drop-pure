import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Notes from "./Notes";
import "./styles.css";

const initItems = [
  { id: 1, content: "one", order: 0, x: 0, y: 0 },
  { id: 2, content: "two", order: 1, x: 112, y: 0 },
  { id: 3, content: "three", order: 2, x: 224, y: 0 }
];

function App() {
  return (
    <React.Fragment>
      <Notes />
    </React.Fragment>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
