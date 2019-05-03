import React from "react";
import Note from "./Note";
import Draggable from "./Draggable";
import DraggableMasonryLayout from "./DraggableMasonryLayout";

import "./styles.css";
const maxHeight = 200;
const minHeight = 100;
const randomHeight = () =>
  Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

const nodes = [
  { id: "1", content: "one", height: randomHeight() },
  { id: "2", content: "two", height: randomHeight() },
  { id: "3", content: "three", height: randomHeight() },
  { id: "4", content: "four", height: randomHeight() },
  { id: "5", content: "five", height: randomHeight() },
  { id: "6", content: "six", height: randomHeight() },
  { id: "7", content: "seven", height: randomHeight() },
  { id: "8", content: "eight", height: randomHeight() },
  { id: "9", content: "nine", height: randomHeight() },
  { id: "10", content: "ten", height: randomHeight() },
  { id: "11", content: "eleven", height: randomHeight() },
  { id: "12", content: "twelve", height: randomHeight() },
  { id: "13", content: "thirteen", height: randomHeight() },
  { id: "14", content: "fourteen", height: randomHeight() },
  { id: "15", content: "fifteen", height: randomHeight() },
  { id: "16", content: "sixteen", height: randomHeight() },
  { id: "17", content: "seventeen", height: randomHeight() }
];

function Notes() {
  const notes = nodes.map((node, index) => (
    <Note node={node} index={index} key={node.id}>
      <p>{node.content}</p>
    </Note>
  ));

  return (
    <div className="App">
      <DraggableMasonryLayout>{notes}</DraggableMasonryLayout>
    </div>
  );
}

export default Notes;
