import React, { useState, useEffect } from "react";

import "./styles.css";

const initItems = [
  { id: 1, content: "one", order: 0 },
  { id: 2, content: "two", order: 1 },
  { id: 3, content: "three", order: 2 }
];

// Items positioning methods
const getXPos = item => {
  return `${item.order * 100 + 8 * item.order + 8}px`;
};

const getYPos = item => {
  return `8px`;
};

function Notes() {
  // General
  const [items, setItems] = useState(initItems);
  const [cursorPos, setCursorPos] = useState(undefined); // Pos of mouse or touch
  const [lastRearrangedItemId, setLastRearrangedItemId] = useState();
  const [UILog, setUILog] = useState();
  // Touch events
  const [isTouch, setIsTouch] = useState(false);
  const [touchStatus, setTouchStatus] = useState("not active");
  const [touchOverId, setTouchOverId] = useState(undefined);
  // Drag events
  const [dndStatus, setDndStatus] = useState("not active");
  const [dragItem, setDragItem] = useState();
  const [dragPoint, setDragPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.addEventListener("dragover", onDragOverSpace);
    return () => document.removeEventListener("dragover", onDragOverSpace);
  }, []);

  const onTouchStart = e => {
    e.preventDefault && e.preventDefault();
    setTouchStatus("touch start");
    setIsTouch(true);
    setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    let fingers = e.touches.length;
    let pos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setTouchStatus(
      `touch start. Fingers: ${fingers}. X: ${pos.x}, Y: ${pos.y}`
    );
  };

  const onTouchMove = e => {
    e.preventDefault && e.preventDefault();
    setTouchStatus("touch move");
    setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    let overObjectId = document.elementFromPoint(
      e.touches[0].clientX,
      e.touches[0].clientY
    ).id;
    setTouchOverId(overObjectId);
    setUILog("Note Rearranging");
    if (overObjectId && dragItem && lastRearrangedItemId !== overObjectId) {
      setUILog("rearranging");
      items.forEach(item => {
        if (Object.values(item).indexOf(overObjectId) > -1) {
          overObjectId = Object.values(item).indexOf(overObjectId);
        }
      });
      rearrangeItems(items[overObjectId - 1]);
    }
  };

  const onTouchEnd = e => {
    setIsTouch(false);
    setTouchStatus("touch end");
    setDragItem(undefined);
  };

  const onDragStart = (e, note) => {
    setDndStatus("drag start");
    setDragItem(note);

    const dragElement = document.getElementById(note.id);
    console.log(e.clientX - (e.clientX - dragElement.offsetLeft));
    setDragPoint({
      x: (isTouch ? cursorPos.x : e.clientX) - dragElement.offsetLeft,
      y: (isTouch ? cursorPos.y : e.clientY) - dragElement.offsetTop
    });

    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const rearrangeItems = overItem => {
    var newOrder = [];
    var newItems = undefined;
    setItems(() => {
      if (overItem !== dragItem && overItem.id !== lastRearrangedItemId) {
        setDndStatus("drag over");
        items.forEach((item, index) => {
          newOrder[index] = item.order; // Item is out of range. Keep same order
          // For item needs to be changed
          if (dragItem.order < overItem.order) {
            // Drag toward the end
            if (item.order > dragItem.order && item.order <= overItem.order)
              // Inbetween notes. Replace on one to the start
              newOrder[index] = item.order - 1;
            if (item.order === dragItem.order)
              // Assign new order to the draggable
              newOrder[index] = overItem.order;
          }
          if (dragItem.order > overItem.order) {
            // Drag toward the start
            if (item.order < dragItem.order && item.order >= overItem.order)
              // Inbetween notes. Replace on one to the end
              newOrder[index] = item.order + 1;
            if (item.order === dragItem.order)
              // Assign new order to the draggable
              newOrder[index] = overItem.order;
          }
        });
        newItems = items.map((item, index) => {
          item.order = newOrder[index];
          return item;
        });
      }
      if (newItems) return newItems;
      return items;
    });
    setLastRearrangedItemId(overItem.id);
  };

  const onDragOverItem = (e, overItem) => {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    rearrangeItems(overItem);
  };

  const onDragOverSpace = e => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const onDragEnd = (e, note) => {
    setDndStatus("drag end");
    // Cleanup after dragging
    setDragItem(undefined);
    setLastRearrangedItemId(undefined);
    setDragPoint(undefined);
    setCursorPos(undefined);
  };

  // Setup ghost on render
  let ghost;
  if (dragItem) {
    ghost = {
      item: dragItem,
      x: cursorPos.x - dragPoint.x,
      y: cursorPos.y - dragPoint.y
    };
  }

  return (
    <div className="App">
      {items.map(note => (
        <div
          id={note.id}
          draggable="true"
          className={`note ${!dragItem && "hoverable"}`}
          key={note.content}
          onDragStart={e => onDragStart(e, note)}
          onDragOver={e => onDragOverItem(e, note)}
          onDragEnd={e => onDragEnd(e, note)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            opacity: dragItem === note ? 0 : 1,
            left: getXPos(note),
            top: getYPos(note)
          }}
        >
          <p>{note.content}</p>
        </div>
      ))}
      {ghost && (
        <div
          className="note ghost"
          style={{
            transform: `translate(${ghost.x}px, ${ghost.y}px)`
          }}
        >
          <p>{ghost.item.content}</p>
        </div>
      )}
      <h6 style={{ position: "fixed", left: 0, bottom: 100 }}>
        UI log : {UILog && UILog.toString()}
      </h6>
      <h6 style={{ position: "fixed", left: 0, bottom: 80 }}>
        rearranged item: {lastRearrangedItemId && lastRearrangedItemId}
      </h6>
      <h6 style={{ position: "fixed", left: 0, bottom: 60 }}>
        touch over id: {touchOverId}
      </h6>
      <h6 style={{ position: "fixed", left: 0, bottom: 40 }}>
        touch status: {touchStatus}
      </h6>
      <h6 style={{ position: "fixed", left: 0, bottom: 20 }}>
        dnd status: {dndStatus}
      </h6>
    </div>
  );
}

export default Notes;
