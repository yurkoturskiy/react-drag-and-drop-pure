import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const initItems = [
  { id: 1, content: "one", order: 0, x: 0, y: 0 },
  { id: 2, content: "two", order: 1, x: 112, y: 0 },
  { id: 3, content: "three", order: 2, x: 224, y: 0 }
];

function Notes() {
  const ghostRef = useRef();
  const [dragItem, setDragItem] = useState();
  const [dragPoint, setDragPoint] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState(undefined);
  const [items, setItems] = useState(initItems);
  useEffect(() => {
    document.addEventListener("dragover", onDragOverSpace);
    return () => document.removeEventListener("dragover", onDragOverSpace);
  }, []);
  async function onDragStart(e, note) {
    setDragItem(note);
    let x = e.clientX - note.x;
    let y = e.clientY - note.y;
    setDragPoint({
      x,
      y
    });
    // document.addEventListener("dragover", onDragOverSpace);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("id", note.id);
  }
  const onDragOver = (e, overItem) => {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    // console.log(e.clientY);
    if (overItem.order !== dragItem.order) {
      // console.log(overItem);
      setItems(() => {
        var newItems = [];
        items.forEach(item => {
          if (dragItem.order < overItem.order) {
            // console.log("drag towart end");
            if (item.order < dragItem.order) newItems[item.order] = item;
            if (item.order > dragItem.order && item.order <= overItem.order)
              newItems[item.order - 1] = item;
            if (item.order > overItem.order) newItems[item.order] = item;
            if (item.order === dragItem.order) newItems[overItem.order] = item;
          } else if (dragItem.order > overItem.order) {
            // console.log("drag toward start");
            if (item.order > dragItem.order) newItems[item.order] = item;
            if (item.order < dragItem.order && item.order >= overItem.order)
              newItems[item.order + 1] = item;
            if (item.order < overItem.order) newItems[item.order] = item;
            if (item.order === dragItem.order) newItems[overItem.order] = item;
          }
        });
        newItems.map((item, index) => {
          item.order = index;
          item.x = index * 112;
          return item;
        });
        return newItems;
      });
    }
  };
  const onDrop = (e, cat) => {
    // console.log(cat);
  };
  const onDragEnd = (e, note) => {
    setDragItem(undefined);
    setMousePos(undefined);
    // document.removeEventListener("dragover", onDragOverSpace);
  };

  const onDragOverSpace = e => {
    // console.log(dragPoint);
    // if (mousePos.x != e.clientX || mousePos.y != e.clientY) {
    setMousePos({ x: e.clientX, y: e.clientY });
    // console.log(mousePos);
    // }
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
          onDrop={e => onDrop(e, "complete")}
          onDragEnd={e => onDragEnd(e, note)}
          style={{
            opacity: dragItem === note ? 0 : 1,
            left: `${note.x}px`,
            top: `${note.y}px`
            // transform: `translate(${note.x}px, ${note.y}px)`
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
