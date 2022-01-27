import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button, Layout } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Logo from "./Logo";
import NavNotification from "./NavNotification";
import NavProfile from "./NavProfile";
import NavLanguage from "./NavLanguage";
import NavPanel from "./NavPanel";
import NavSearch from "./NavSearch";
import SearchInput from "./NavSearch/SearchInput.js";
import {
  toggleCollapsedNav,
  onMobileNavToggle,
  onMetamaskConnect,
} from "redux/actions/Theme";
import {
  NAV_TYPE_TOP,
  SIDE_NAV_COLLAPSED_WIDTH,
  SIDE_NAV_WIDTH,
} from "constants/ThemeConstant";
import utils from "utils";

const Web3 = require("web3");

const ethEnabled = async () => {
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    window.web3 = new Web3(window.ethereum);
    return true;
  }
  return false;
};

const getAccount = async () => {
  var accounts, account;
  accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  account = accounts[0];
  return account;
};
const { Header } = Layout;

export const HeaderNav = (props) => {
  const {
    navCollapsed,
    mobileNav,
    navType,
    headerNavColor,
    toggleCollapsedNav,
    onMobileNavToggle,
    onMetamaskConnect,
    isMobile,
    currentTheme,
    direction,
  } = props;
  const [searchActive, setSearchActive] = useState(false);
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const [curMetamaskAddress, setCurrentMetamaskAddress] = useState("");

  const onSearchActive = () => {
    setSearchActive(true);
  };

  const onSearchClose = () => {
    setSearchActive(false);
  };

  const onToggle = () => {
    if (!isMobile) {
      toggleCollapsedNav(!navCollapsed);
    } else {
      onMobileNavToggle(!mobileNav);
    }
  };

  const onClickMetamask = async () => {
    const res = await ethEnabled();
    if (res === false) {
      alert("please install metamask");
      return;
    }
    const addr1 = await getAccount();
    if (addr1 === undefined || addr1 === null || addr1 === "") return;
    onMetamaskConnect(true);
    setMetamaskConnected(true);
    setCurrentMetamaskAddress(addr1);
    console.log("metamask connection nav", res);
  };

  const isNavTop = navType === NAV_TYPE_TOP ? true : false;
  const mode = () => {
    if (!headerNavColor) {
      return utils.getColorContrast(
        currentTheme === "dark" ? "#00000" : "#ffffff"
      );
    }
    return utils.getColorContrast(headerNavColor);
  };
  const navMode = mode();
  const getNavWidth = () => {
    if (isNavTop || isMobile) {
      return "0px";
    }
    if (navCollapsed) {
      return `${SIDE_NAV_COLLAPSED_WIDTH}px`;
    } else {
      return `${SIDE_NAV_WIDTH}px`;
    }
  };

  useEffect(() => {
    if (!isMobile) {
      onSearchClose();
    }
  });

  return (
    <Header
      className={`app-header ${navMode}`}
      style={{ backgroundColor: headerNavColor }}
    >
      <div className={`app-header-wrapper ${isNavTop ? "layout-top-nav" : ""}`}>
        <Logo logoType={navMode} />
        <div className="nav" style={{ width: `calc(100% - ${getNavWidth()})` }}>
          <div className="nav-left">
            <ul className="ant-menu ant-menu-root ant-menu-horizontal">
              {isNavTop && !isMobile ? null : (
                <li
                  className="ant-menu-item ant-menu-item-only-child"
                  onClick={() => {
                    onToggle();
                  }}
                >
                  {navCollapsed || isMobile ? (
                    <MenuUnfoldOutlined className="nav-icon" />
                  ) : (
                    <MenuFoldOutlined className="nav-icon" />
                  )}
                </li>
              )}
              {isMobile ? (
                <li
                  className="ant-menu-item ant-menu-item-only-child"
                  onClick={() => {
                    onSearchActive();
                  }}
                >
                  <SearchOutlined />
                </li>
              ) : (
                <li
                  className="ant-menu-item ant-menu-item-only-child"
                  style={{ cursor: "auto" }}
                >
                  <SearchInput mode={mode} isMobile={isMobile} />
                </li>
              )}
            </ul>
          </div>
          <div className="nav-right">
            <div className="nav-center">
              {metamaskConnected === true ? (
                <Button type="ghost" disabled={true}>
                  {curMetamaskAddress.slice(0, 5) +
                    "..." +
                    curMetamaskAddress.slice(-5)}
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    onClickMetamask();
                  }}
                >
                  Connect Metamask
                </Button>
              )}
            </div>
            <NavPanel direction={direction} />
          </div>
          <NavSearch active={searchActive} close={onSearchClose} />
        </div>
      </div>
    </Header>
  );
};

const mapStateToProps = ({ theme }) => {
  const {
    navCollapsed,
    navType,
    headerNavColor,
    mobileNav,
    currentTheme,
    direction,
    metamaskConnection,
  } = theme;
  return {
    navCollapsed,
    navType,
    headerNavColor,
    mobileNav,
    currentTheme,
    direction,
    metamaskConnection,
  };
};

export default connect(mapStateToProps, {
  toggleCollapsedNav,
  onMobileNavToggle,
  onMetamaskConnect,
})(HeaderNav);
