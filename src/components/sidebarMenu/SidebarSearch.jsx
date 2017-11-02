import React from "react";
import Transition from "react-transition-group/Transition";

// CSS
import "../../css/messageApp/sidebar/sidebarSearch.css";

let duration = 200;
const defaultStyle = {
  opacity: 0,
  transition: "opacity 200ms ease-out"
};
const transitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 }
};

const SidebarSearch = ({ show }) => {
  return (
    <Transition appear unmountOnExit in={show} timeout={duration}>
      {state => (
        <div
          style={{
            ...defaultStyle,
            ...transitionStyles[state]
          }}
          className="sidebar_menu sidebar_menu_search"
        />
      )}
    </Transition>
  );
};

export default SidebarSearch;