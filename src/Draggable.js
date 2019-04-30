import React, { useState, useEffect } from "react";
var longPress;

// Items positioning methods
const getXPos = order => {
  return `${order * 100 + 8 * order + 8}px`;
};

const getYPos = order => {
  return `8px`;
};

function Draggable(props) {
  // General
  const [items, setItems] = useState(
    props.children.map((child, index) => {
      return { id: child.props.id, order: index, index };
    })
  );
  const [cursorPos, setCursorPos] = useState(undefined); // Pos of mouse or touch
  const [lastRearrangedItemId, setLastRearrangedItemId] = useState();
  // Touch events
  const [isTouch, setIsTouch] = useState(false);
  const [touchOverId, setTouchOverId] = useState(undefined);
  // Drag events
  const [dragItem, setDragItem] = useState();
  const [dragPoint, setDragPoint] = useState({ x: 0, y: 0 });

  // Monitors. Could be removed
  const [touchStatus, setTouchStatus] = useState("not active");
  const [dndStatus, setDndStatus] = useState("not active");
  const [UILog, setUILog] = useState();

  /////////////////////
  /* Events' methods */
  /////////////////////

  const getItemById = id => {
    // Return object with required id from items array
    let indexOfItem;
    for (var i = 0, len = props.children.length; i < len; i++) {
      if (props.children[i].props.id === id) {
        indexOfItem = i;
        break;
      }
    }
    // not support IE8
    // let indexOfItem = items.findIndex(item => item.id === id);
    return items[indexOfItem];
  };

  const initDrag = (cursor, item) => {
    /* Initialize dragging via assigning dragPoint and dragItem
    Require arguments: 
      cursor: {x, y} // clientX, clientY of a mouse or a touch
      item: {id, content, order} // Objects from items array
    */
    let dragElement = document.getElementById(item.id);
    setDragPoint({
      x: cursor.x - dragElement.offsetLeft,
      y: cursor.y - dragElement.offsetTop
    });
    setDragItem(item);
  };

  const rearrangeItems = overItem => {
    var newOrder = [];
    var newItems;
    setItems(() => {
      if (overItem !== dragItem && overItem.id !== lastRearrangedItemId) {
        items.forEach((item, index) => {
          newOrder[index] = item.order; // Item is out of range. Keep same order
          // Override for items need to be changed
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

  const cleanupDrag = () => {
    setDndStatus("not active");
    setDragItem(undefined);
    setLastRearrangedItemId(undefined);
    setCursorPos(undefined);
    setDragPoint(undefined);
  };

  //////////////////////////
  /* Touch screens events */
  //////////////////////////

  const onTouchStart = e => {
    e.preventDefault && e.preventDefault();
    const touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const fingers = e.touches.length;
    setTouchStatus("start");
    setIsTouch(true);
    setCursorPos({ x: touchPos.x, y: touchPos.y });
    longPress =
      fingers === 1 &&
      setTimeout(() => {
        let touchElement = document.elementFromPoint(touchPos.x, touchPos.y);
        initDrag(
          { x: touchPos.x, y: touchPos.y },
          getItemById(touchElement.id)
        );
      }, 500);
  };

  const onTouchMove = e => {
    e.preventDefault && e.preventDefault();
    setTouchStatus("move");
    !dragItem && clearTimeout(longPress);
    setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    let overObjectId = document.elementFromPoint(
      e.touches[0].clientX,
      e.touches[0].clientY
    ).id;
    setTouchOverId(overObjectId);
    if (overObjectId && dragItem && lastRearrangedItemId !== overObjectId) {
      setUILog("rearranging");
      let overTouchItem = getItemById(overObjectId);
      rearrangeItems(overTouchItem);
    }
  };

  const onTouchEnd = e => {
    !dragItem && clearTimeout(longPress); // Cancel drag event for touch scn
    dragItem && cleanupDrag();
    setIsTouch(false);
    setTouchStatus("end");
  };

  //////////////////
  /* Mouse events */
  //////////////////

  useEffect(() => {
    document.addEventListener("dragover", onDragOverSpace);
    return () => document.removeEventListener("dragover", onDragOverSpace);
  }, []);

  const onDragStart = (e, note) => {
    isTouch && e.preventDefault();
    setDndStatus(isTouch ? dndStatus : "start");
    setCursorPos({ x: e.clientX, y: e.clientY });
    !isTouch && initDrag({ x: e.clientX, y: e.clientY }, note);
  };

  const onDragOverItem = (e, overItem) => {
    setDndStatus("Over item");
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    rearrangeItems(overItem);
  };

  const onDragOverSpace = e => {
    setDndStatus("Dragging around");
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const onDragEnd = (e, note) => {
    // Cleanup after dragging
    cleanupDrag();
  };
  const renderChilden = React.Children.map(props.children, (child, index) => {
    // console.log(child);
    let newComponent = React.cloneElement(child, {
      onDragStart: e => onDragStart(e, items[index]),
      onDragOver: e => onDragOverItem(e, items[index]),
      onDragEnd: e => onDragEnd(e, items[index]),
      onTouchStart: onTouchStart,
      onTouchMove: onTouchMove,
      onTouchEnd: onTouchEnd,
      style: {
        ...child.props.style,
        opacity: dragItem === items[index] ? 0 : 1,
        left: getXPos(items[index].order),
        top: getYPos(items[index].order)
      }
    });
    return newComponent;
  });

  ///////////////////////////
  /* Prepare render values */
  ///////////////////////////

  let ghost; // Setup ghost on render
  if (dragItem) {
    let pos = {
      x: cursorPos.x - dragPoint.x,
      y: cursorPos.y - dragPoint.y
    };
    ghost = React.cloneElement(props.children[dragItem.index], {
      className: "note ghost",
      style: {
        ...props.children[dragItem.index].props.style,
        transform: `translate(${pos.x}px, ${pos.y}px)`
      }
    });
  }

  return (
    <React.Fragment>
      <div>
        {renderChilden}
        {ghost && ghost}
      </div>
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
    </React.Fragment>
  );
}

export default Draggable;
