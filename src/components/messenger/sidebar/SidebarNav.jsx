import React from "react";
import * as icon from "react-feather";
import "../../../css/messageApp/sidebar/sidebarNav.css";
import { TabMenuConsumer } from "../../../context/tabMenuContext";
import { signOutUser } from "../../../API/auth/index";

const SibarNav = () => (
  <TabMenuConsumer>
    {({ switchTab }) => (
      <div className="sidebar-nav-wrap">
        <div className="sidebar-nav">
          <button onClick={() => switchTab("t1")} className="nav-icon">
            <icon.MessageCircle size={18} color="white" />
          </button>
          <button onClick={() => switchTab("t2")} className="nav-icon">
            <icon.Search size={18} color="white" />
          </button>
          <button onClick={() => switchTab("t3")} className="nav-icon">
            <icon.Edit2 size={18} color="white" />
          </button>
        </div>
        <div className="sidebar-nav nav-wrap__bottom">
          <button className="nav-icon">
            <icon.Sliders size={18} color="white" />
          </button>
          <button onClick={() => signOutUser()} className="nav-icon">
            <icon.LogOut size={18} color="white" />
          </button>
        </div>
      </div>
    )}
  </TabMenuConsumer>
);

export default SibarNav;
