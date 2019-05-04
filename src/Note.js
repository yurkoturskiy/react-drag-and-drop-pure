import React from "react";

function Note(props) {
  return (
    <div
      height={props.node.height}
      className="note"
      id={props.node.id}
      style={{ height: `${props.node.height}px` }}
      {...props.draggableItem}
    >
      <p>{props.node.content}</p>
    </div>
  );
}

export default Note;
