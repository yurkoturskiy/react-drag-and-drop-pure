import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

/////////////////////////
/* Draggable component */
/////////////////////////
var longPress;
var renderChildren;

//   return (
//     <React.Fragment>
//       <div>
//         {renderChilden}
//         {ghost && ghost}
//       </div>
//       <h6 style={{ position: "fixed", left: 0, bottom: 100 }}>
//         UI log : {UILog && UILog.toString()}
//       </h6>
//       <h6 style={{ position: "fixed", left: 0, bottom: 80 }}>
//         rearranged item: {lastRearrangedItemId && lastRearrangedItemId}
//       </h6>
//       <h6 style={{ position: "fixed", left: 0, bottom: 60 }}>
//         touch over id: {touchOverId}
//       </h6>
//       <h6 style={{ position: "fixed", left: 0, bottom: 40 }}>
//         touch status: {touchStatus}
//       </h6>
//       <h6 style={{ position: "fixed", left: 0, bottom: 20 }}>
//         dnd status: {dndStatus}
//       </h6>
//     </React.Fragment>
//   );
// }

//////////////////////////////
/* Masonry layout component */
//////////////////////////////

var elementRefMeasures = {};

function DraggableMasonryLayout(props) {
  // General
  const [order, setOrder] = useState(undefined);
  const [cursorPos, setCursorPos] = useState(undefined); // Pos of mouse or touch
  const [lastRearrangedChild, setLastRearrangedChild] = useState();
  // Touch events
  const [isTouch, setIsTouch] = useState(false);
  const [touchOverId, setTouchOverId] = useState(undefined);
  // Drag events
  const [dragItem, setDragItem] = useState();
  const [dragPoint, setDragPoint] = useState({ x: 0, y: 0 });

  /////////////////////
  /* Events' methods */
  /////////////////////

  const getChildById = id => {
    // Return object with required id from items array
    let indexOfChild;
    for (var i = 0, len = props.children.length; i < len; i++) {
      if (props.children[i].props.id === id) {
        indexOfChild = i;
        break;
      }
    }
    // not support IE8
    // let indexOfItem = items.findIndex(item => item.id === id);
    return props.children[indexOfChild];
  };

  const initDrag = (cursor, item) => {
    /* Initialize dragging via assigning dragPoint and dragItem
    Require arguments: 
      cursor: {x, y} // clientX, clientY of a mouse or a touch
      item: {id, content, order} // Objects from items array
    */
    let dragElement = document.getElementById(item.props.id);
    setDragPoint({
      x: cursor.x - dragElement.offsetLeft,
      y: cursor.y - dragElement.offsetTop
    });
    setDragItem(item);
  };

  const rearrangeItems = overItem => {
    var newOrder;
    if (overItem !== dragItem && overItem !== lastRearrangedChild) {
      newOrder = [];
      renderChildren.forEach((child, index) => {
        newOrder[child.props.index] = child.props.order; // Item is out of range. Keep same order
        // Override for items need to be changed
        if (dragItem.props.order < overItem.props.order) {
          // Drag toward the end
          if (
            child.props.order > dragItem.props.order &&
            child.props.order <= overItem.props.order
          )
            // Inbetween notes. Replace on one to the start
            newOrder[child.props.index] = child.props.order - 1;
          if (child.props.order === dragItem.props.order)
            // Assign new order to the draggable
            newOrder[child.props.index] = overItem.props.order;
        }
        if (dragItem.props.order > overItem.props.order) {
          // Drag toward the start
          if (
            child.props.order < dragItem.props.order &&
            child.props.order >= overItem.props.order
          )
            // Inbetween notes. Replace on one to the end
            newOrder[child.props.index] = child.props.order + 1;
          if (child.props.order === dragItem.props.order)
            // Assign new order to the draggable
            newOrder[child.props.index] = overItem.props.order;
        }
      });
      // console.log(newOrder);
      // console.log(renderChildren);
    }
    setOrder(newOrder ? newOrder : order);
    setLastRearrangedChild(overItem);
  };

  const cleanupDrag = () => {
    setDragItem(undefined);
    setLastRearrangedChild(undefined);
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
    setIsTouch(true);
    setCursorPos({ x: touchPos.x, y: touchPos.y });
    longPress =
      fingers === 1 &&
      setTimeout(() => {
        let touchElement = document.elementFromPoint(touchPos.x, touchPos.y);
        initDrag(
          { x: touchPos.x, y: touchPos.y },
          getChildById(touchElement.id)
        );
      }, 500);
  };

  const onTouchMove = e => {
    e.preventDefault && e.preventDefault();
    !dragItem && clearTimeout(longPress);
    setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    let overObjectId = document.elementFromPoint(
      e.touches[0].clientX,
      e.touches[0].clientY
    ).id;
    setTouchOverId(overObjectId);
    if (overObjectId && dragItem && lastRearrangedChild !== overObjectId) {
      let overTouchItem = getChildById(overObjectId);
      rearrangeItems(overTouchItem);
    }
  };

  const onTouchEnd = e => {
    !dragItem && clearTimeout(longPress); // Cancel drag event for touch scn
    dragItem && cleanupDrag();
    setIsTouch(false);
  };

  //////////////////
  /* Mouse events */
  //////////////////

  useEffect(() => {
    document.addEventListener("dragover", onDragOverSpace);
    return () => document.removeEventListener("dragover", onDragOverSpace);
  }, []);

  const onDragStart = (e, item) => {
    isTouch && e.preventDefault();
    setCursorPos({ x: e.clientX, y: e.clientY });
    !isTouch && initDrag({ x: e.clientX, y: e.clientY }, item);
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
    // Cleanup after dragging
    cleanupDrag();
  };

  ///////////////////////////
  /* Prepare render values */
  ///////////////////////////

  let ghost; // Setup ghost on render
  if (dragItem) {
    let pos = {
      x: cursorPos.x - dragPoint.x,
      y: cursorPos.y - dragPoint.y
    };
    ghost = React.cloneElement(dragItem, {
      className: "note ghost",
      style: {
        ...dragItem.props.style,
        margin: 0,
        position: "absolute",
        transform: `translate(${pos.x}px, ${pos.y}px)`
      }
    });
  }

  ////////////////////
  /* Masonry Layout */
  ////////////////////

  const [columns, setColumns] = useState(0);
  const [transition, setTransition] = useState(false);
  const [layout, setLayout] = useState({
    elements: [],
    width: 0,
    height: 0,
    endline: {
      start: { x: undefined, y: undefined },
      end: { x: undefined, y: undefined },
      byColumns: [],
      enterEvent: {
        elementsNum: 0,
        eventHandler: props.onEndlineEnter && props.onEndlineEnter
      }
    }
  });
  const [onErrorCount, setOnErrorCount] = useState(0);
  const [onLoadCount, setOnLoadCount] = useState(0);

  const masonryLayout = useRef(); // Top wrapper
  const elementRef = useRef(); // Asign on a first element for representing general styles
  const endlineStartRef = useRef(); // Endline start sensor
  const endlineEndRef = useRef(); // Endline end sensor

  useEffect(() => {
    // Mount and unmount only
    // Add/remove event listeners
    checkLayout();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleResize = evt => {
    checkLayout(evt);
  };

  const checkLayout = evt => {
    updateCardRefMeasures();
    const wrapperWidth = masonryLayout.current.offsetWidth;
    setColumns(Math.floor(wrapperWidth / elementRefMeasures.totalWidth));
    // turn on transition if window resizing
    setTransition(evt !== undefined);
  };

  const handleScroll = () => {
    checkEndlineEnterEvent();
  };

  const checkEndlineEnterEvent = () => {
    setLayout(layout => {
      if (
        endlineStartRef.current &&
        endlineStartRef.current.getBoundingClientRect().top -
          window.innerHeight <=
          0 &&
        layout.endline.enterEvent.elementsNum !== layout.elements.length
      ) {
        // enter endline event
        layout.endline.enterEvent.elementsNum = layout.elements.length;
        // execute enter endline event handler
        layout.endline.enterEvent.eventHandler &&
          layout.endline.enterEvent.eventHandler();
      }
      return layout;
    });
  };

  useEffect(() => {
    // component did mount or update
    if (masonryLayout.current.offsetHeight > 0) {
      // if layout rendered
      checkEndlineEnterEvent();
      setTransition(true);
    }
  });

  useEffect(
    () => {
      // if number of children changed
      setTransition(() => {
        if (props.children.length > layout.elements.length) {
          // disable transition for infinite scroll
          return false;
        } else if (props.children.length === layout.elements.length) {
          // enable for creation or change
          return true;
        } else if (props.children.length < layout.elements.length) {
          // enable for deletion
          return true;
        }
      });
    },
    [props.children.length]
  );

  const updateCardRefMeasures = () => {
    const style = window.getComputedStyle(elementRef.current);
    elementRefMeasures = {
      width: elementRef.current.offsetWidth,
      marginTop: Number(style.marginTop.replace(/[^0-9]/g, "")),
      marginRight: Number(style.marginRight.replace(/[^0-9]/g, "")),
      marginBottom: Number(style.marginBottom.replace(/[^0-9]/g, "")),
      marginLeft: Number(style.marginLeft.replace(/[^0-9]/g, "")),
      totalWidth:
        elementRef.current.offsetWidth +
        Number(style.marginRight.replace(/[^0-9]/g, "")) +
        Number(style.marginLeft.replace(/[^0-9]/g, ""))
    };
  };

  useEffect(
    () => {
      // set layout
      var elements = [];
      var endline = layout.endline;
      endline.byColumns = [];
      for (let i = 0; i < columns; i++) {
        endline.byColumns[i] = 0;
      }
      updateCardRefMeasures();
      let childrenSortedByOrder = renderChildren.sort(
        (a, b) => a.props.order - b.props.order
      );
      console.log(childrenSortedByOrder);
      childrenSortedByOrder.forEach((child, index) => {
        // Calculate positions of each element
        let height =
          document.getElementById(child.props.id).offsetHeight +
          elementRefMeasures.marginTop +
          elementRefMeasures.marginBottom;
        let leastNum = Math.min(...endline.byColumns);
        let leastNumIndex = endline.byColumns.indexOf(leastNum);
        var posX = leastNumIndex * elementRefMeasures.totalWidth;
        var posY = endline.byColumns[leastNumIndex];
        elements[child.props.index] = { x: posX, y: posY };
        endline.byColumns[leastNumIndex] += height;
      });
      endline.start.x =
        elementRefMeasures.totalWidth *
        endline.byColumns.indexOf(Math.min(...endline.byColumns));
      endline.start.y = Math.min(...endline.byColumns);
      endline.end.x =
        elementRefMeasures.totalWidth *
        endline.byColumns.indexOf(Math.max(...endline.byColumns));
      endline.end.y = Math.max(...endline.byColumns);
      setLayout({
        elements: elements, // list of all elements with coorditares
        width: elementRefMeasures.totalWidth * columns, // width of the whole layout
        height: endline.end.y, // height of the whole layout
        endline: endline
      });
    },
    [columns, onLoadCount, onErrorCount, props.children, order]
  );

  const errorHandler = index => {
    setOnErrorCount(onErrorCount + 1);
    console.log("can't load: ", index);
  };

  const loadHandler = index => {
    setOnLoadCount(onLoadCount + 1);
  };

  renderChildren = React.Children.map(props.children, (child, index) => {
    // Change eash child
    let newComponent = React.cloneElement(child, {
      id: child.key,
      order: order ? order[index] : child.props.order,
      style: {
        ...child.props.style,
        position: "absolute",
        top: `${layout.elements[index] ? layout.elements[index].y : 0}px`,
        left: `${layout.elements[index] ? layout.elements[index].x : 0}px`,
        transition: `${transition ? "top 0.4s, left 0.4s" : "none"}`,
        visibility: layout.elements[index] ? "visible" : "hidden",
        opacity: dragItem === child ? 0 : 1
      },
      onLoad: loadHandler,
      onError: errorHandler,
      onDragStart: e => onDragStart(e, child),
      onDragOver: e => onDragOverItem(e, child),
      onDragEnd: e => onDragEnd(e, child),
      onTouchStart: onTouchStart,
      onTouchMove: onTouchMove,
      onTouchEnd: onTouchEnd,
      ref: index === 0 ? elementRef : null
    });
    return newComponent;
  });
  return (
    <div className="masonry" ref={masonryLayout}>
      <div
        style={{
          position: "relative",
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          margin: "0 auto 0 auto"
        }}
        className="boundry-box"
      >
        {renderChildren}
        {ghost && ghost}
        {layout.endline.start.y !== undefined && (
          <React.Fragment>
            <div
              id="MasonryLayoutEndlineStart"
              ref={endlineStartRef}
              style={{
                position: "absolute",
                top: `${layout.endline.start.y}px`,
                left: `${layout.endline.start.x}px`
              }}
            />
            <div
              id="MasonryLayoutEndlineEnd"
              ref={endlineEndRef}
              style={{
                position: "absolute",
                top: `${layout.endline.end.y}px`,
                left: `${layout.endline.end.x}px`
              }}
            />
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

DraggableMasonryLayout.propTypes = {
  onEndlineEnter: PropTypes.func
};

export default DraggableMasonryLayout;
