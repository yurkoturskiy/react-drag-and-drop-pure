import React, { useState, useEffect } from "react";

import "./styles.css";

const initItems = [
  { id: 1, content: "one", order: 0, x: 0 + 15, y: 0 + 15 },
  { id: 2, content: "two", order: 1, x: 100 + 30, y: 0 + 15 },
  { id: 3, content: "three", order: 2, x: 200 + 45, y: 0 + 15 }
];

function Notes() {
  const [isTouch, setIsTouch] = useState(false);
  const [touchPos, setTouchPos] = useState();
  const [touchOver, setTouchOver] = useState();
  const [touchStatus, setTouchStatus] = useState("not active");
  const [dndStatus, setDndStatus] = useState("not active");
  const [dragItem, setDragItem] = useState();
  const [lastOverItem, setLastOverItem] = useState();
  const [dragPoint, setDragPoint] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState(undefined);
  const [items, setItems] = useState(initItems);

  useEffect(() => {
    document.addEventListener("dragover", onDragOverSpace);
    return () => document.removeEventListener("dragover", onDragOverSpace);
  }, []);

  const onTouchStart = e => {
    e.preventDefault && e.preventDefault();
    setTouchStatus("touch start");
    setIsTouch(true);
    setTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    let fingers = e.touches.length;
    let pos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setTouchStatus(
      `touch start. Fingers: ${fingers}. X: ${pos.x}, Y: ${pos.y}`
    );
  };

  const onTouchMove = e => {
    e.preventDefault && e.preventDefault();
    let overObjectId = document.elementFromPoint(
      e.touches[0].clientX,
      e.touches[0].clientY
    ).id;
    if (overObjectId && dragItem) {
      items.forEach(item => {
        if (Object.values(item).indexOf(overObjectId) > -1) {
          overObjectId = Object.values(item).indexOf(overObjectId);
        }
      });
      rearrangeItems(items[overObjectId - 1]);
    }

    setTouchOver(overObjectId);
    setTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    dragItem &&
      setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setTouchStatus("touch move");
  };

  const onTouchEnd = e => {
    setIsTouch(false);
    setTouchStatus("touch end");
    setDragItem(undefined);
  };

  const onDragStart = (e, note) => {
    setDndStatus("drag start");
    setDragItem(note);
    setMousePos({ x: e.clientX, y: e.clientY });
    let x, y;
    if (isTouch) {
      x = touchPos.x - note.x;
      y = touchPos.y - note.y;
    } else {
      x = e.clientX - note.x;
      y = e.clientY - note.y;
    }
    setDragPoint({
      x,
      y
    });
  };

  const rearrangeItems = overItem => {
    var newOrder = [];
    var newItems = undefined;
    setItems(() => {
      if (overItem !== dragItem && overItem !== lastOverItem) {
        setDndStatus("drag over");
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
          item.x = newOrder[index] * 100 + newOrder[index] * 15 + 15;
          item.y = 15;
          return item;
        });
      }
      if (newItems) return newItems;
      return items;
    });
    setLastOverItem(overItem);
  };

  const onDragOver = (e, overItem) => {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    rearrangeItems(overItem);
  };

  const onDragEnd = (e, note) => {
    setDndStatus("drag end");
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
          id={note.id}
          draggable="true"
          className={`note ${!dragItem && "hoverable"}`}
          key={note.content}
          onDragStart={e => onDragStart(e, note)}
          onDragOver={e => onDragOver(e, note)}
          onDragEnd={e => onDragEnd(e, note)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
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
      <h6 style={{ position: "fixed", left: 0, bottom: 60 }}>
        touch over: {touchOver && touchOver}
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
