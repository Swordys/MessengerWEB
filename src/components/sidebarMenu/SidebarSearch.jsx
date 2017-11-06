import React from "react";
import PropTypes from "prop-types";
import Transition from "react-transition-group/Transition";

// CSS
import "../../css/messageApp/sidebar/sidebarSearch.css";
import tr from "../../helpers/transitionPannel";

const SidebarSearch = ({ show }) => (
  <Transition appear unmountOnExit in={show} timeout={tr.duration}>
    {state => (
      <div
        style={{
          ...tr.defaultStyle,
          ...tr.transitionStyles[state]
        }}
        className="sidebar_menu sidebar_menu_search"
      >
        Search
      </div>
    )}
  </Transition>
);

SidebarSearch.propTypes = {
  show: PropTypes.bool.isRequired
};
export default SidebarSearch;
