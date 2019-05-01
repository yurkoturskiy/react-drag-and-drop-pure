import React from "react";
import DraggableMasonryLayout from "./DraggableMasonryLayout";

import "./styles.css";

const nodes = [
  { id: "1", content: "one" },
  { id: "2", content: "two" },
  { id: "3", content: "three" }
];

function Notes() {
  const notes = nodes.map((node, index) => (
    <div
      id={node.id}
      index={index}
      order={index}
      draggable="true"
      className={`note`}
      key={node.id}
    >
      <p>{node.content}</p>
    </div>
  ));

  return (
    <div className="App">
      <DraggableMasonryLayout>{notes}</DraggableMasonryLayout>
    </div>
  );
}

export default Notes;
