import React from "react";

function Note(props) {
  return (
    <div
      height={props.node.height}
      index={props.index}
      className="note"
      key={props.node.id}
      style={{ height: `${props.node.height}px` }}
    >
      <p>{props.node.content}</p>
    </div>
  );
}

export default Note;
