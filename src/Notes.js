import React from "react";
import Draggable from "./Draggable";

import "./styles.css";

const nodes = [
  { id: "1", content: "one" },
  { id: "2", content: "two" },
  { id: "3", content: "three" }
];

function Notes() {
  const notes = nodes.map(note => (
    <div
      id={note.id}
      node={note}
      draggable="true"
      className={`note`}
      key={note.content}
    >
      <p>{note.content}</p>
    </div>
  ));

  return (
    <div className="App">
      <Draggable>{notes}</Draggable>
    </div>
  );
}

export default Notes;
