import React from "react";
import ReactDOM from "react-dom";
import Notes from "./Notes";
import "./styles.css";

function App() {
  return (
    <React.Fragment>
      <Notes />
    </React.Fragment>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
