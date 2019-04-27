import React, { useState, useEffect } from "react";

import "./styles.css";

const initItems = [
  { id: 1, content: "one", order: 0, x: 0, y: 0 },
  { id: 2, content: "two", order: 1, x: 112, y: 0 },
  { id: 3, content: "three", order: 2, x: 224, y: 0 }
];

function Notes() {
  const [dragItem, setDragItem] = useState();
  const [lastOverItem, setLastOverItem] = useState();
  const [dragPoint, setDragPoint] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState(undefined);
  const [items, setItems] = useState(initItems);
  
  useEffect(() => {
    document.addEventListener("dragover", onDragOverSpace);
    return () => document.removeEventListener("dragover", onDragOverSpace);
  }, []);

  const onDragStart = (e, note) => {
    setDragItem(note);
    let x = e.clientX - note.x;
    let y = e.clientY - note.y;
    setDragPoint({
      x,
      y
    });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("id", note.id);
  };

  const onDragOver = (e, overItem) => {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    var newOrder = [];
    var newItems = undefined;
    setItems(() => {
      if (overItem !== dragItem && overItem !== lastOverItem) {
        items.forEach((item, index) => {
          // Iterate through each item and assign order
          if (dragItem.order < overItem.order) {
            // Drag toward end
            // keep same order
            if (item.order < dragItem.order) newOrder[index] = item.order;
            // Inbetween notes. Replace on one to start
            if (item.order > dragItem.order && item.order <= overItem.order)
              newOrder[index] = item.order - 1;
            // Keep same order. Note is out for range
            if (item.order > overItem.order) newOrder[index] = item.order;
            // Assign new order to draggable
            if (item.order === dragItem.order) newOrder[index] = overItem.order;
          }
          if (dragItem.order > overItem.order) {
            // Drag toward start
            // keep same order
            if (item.order > dragItem.order) newOrder[index] = item.order;
            // Inbetween notes. Replace on one to start
            if (item.order < dragItem.order && item.order >= overItem.order)
              newOrder[index] = item.order + 1;
            // Keep same order. Note is out for range
            if (item.order < overItem.order) newOrder[index] = item.order;
            // Assign new order to draggable
            if (item.order === dragItem.order) newOrder[index] = overItem.order;
          }
        });
        newItems = items.map((item, index) => {
          item.order = newOrder[index];
          item.x = newOrder[index] * 112;
          return item;
        });
      }
      if (newItems) return newItems;
      return items;
    });
    setLastOverItem(overItem);
  };

  const onDragEnd = (e, note) => {
    // Cleanup after dragging
    setDragItem(undefined);
    setLastOverItem(undefined);
    setDragPoint(undefined);
    setMousePos(undefined);
  };

  const onDragOverSpace = e => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="App">
      {items.map(note => (
        <div
          draggable="true"
          className={`note ${!dragItem && "hoverable"}`}
          key={note.content}
          onDragStart={e => onDragStart(e, note)}
          onDragOver={e => onDragOver(e, note)}
          onDragEnd={e => onDragEnd(e, note)}
          style={{
            opacity: dragItem === note ? 0 : 1,
            left: `${note.x}px`,
            top: `${note.y}px`
          }}
        >
          <p>{note.content}</p>
        </div>
      ))}
      {dragItem && (
        <div
          className="ghost"
          style={
            mousePos && {
              visibility: "visible",
              transform: `translate(${mousePos.x -
                dragPoint.x}px, ${mousePos.y - dragPoint.y}px)`
            }
          }
        >
          <p>{dragItem.content}</p>
        </div>
      )}
    </div>
  );
}

export default Notes;
