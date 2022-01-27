import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Badge,
  Menu,
  Spin,
  message,
  Modal,
  Alert,
} from "antd";
import ProductListData from "assets/data/product-list.data.json";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import AvatarStatus from "components/shared-components/AvatarStatus";
import Flex from "components/shared-components/Flex";
import NumberFormat from "react-number-format";
import { useHistory } from "react-router-dom";
import utils from "utils";

import ccfTokenAbi from "../abi/draqle";

import { connect } from "react-redux";
const Web3 = require("web3");
const tokenAddress = "0xdA203998849c654a4fA45abA656896f900A4F19D";

const { Option } = Select;

const getStockStatus = (stockCount) => {
  if (stockCount >= 10) {
    return (
      <>
        <Badge status="success" />
        <span>In Stock</span>
      </>
    );
  }
  if (stockCount < 10 && stockCount > 0) {
    return (
      <>
        <Badge status="warning" />
        <span>Limited Stock</span>
      </>
    );
  }
  if (stockCount === 0) {
    return (
      <>
        <Badge status="error" />
        <span>Out of Stock</span>
      </>
    );
  }
  return null;
};

const categories = ["Cloths", "Bags", "Shoes", "Watches", "Devices"];

const ProductList = ({ metamaskConnection }) => {
  let history = useHistory();
  const [list, setList] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setToggleLoading] = useState(false);

  const [walletDisconnected, setWalletDismetamaskConnection] = useState(true);
  const [walletUnavailable, setWalletUnavailable] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [currentAccountAddress, setCurrentAccountAddress] = useState("0");

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

  const getPendingLogs = async (userAddress) => {
    const provider = new Web3(window.web3.currentProvider);
    var ccfContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    const res = await ccfContract.methods
      .getPendingLogOfBuyer(userAddress.toString())
      .call();
    console.log("res---------------", res);

    const logs = await Promise.all(
      res.map(async (pendId) => {
        const logres = await ccfContract.methods.pendinglogs(pendId).call();
        return logres;
      })
    );
    console.log("logs---------------", logs);

    return logs;
    // await ccfContract.methods.getPendingLogOfBuyer(userAddress.toString()).call().then(res => {
    //   res.
    //     map(pendId => {
    //       ccfContract.methods.pendinglogs(pendId).call().then(res => {

    //         this.setPendingLogs(this.state.pendingLogs.push(res));
    //       })
    //   });

    //   return res;
    // }).catch(err => {
    //   console.log(err);
    // });
  };

  const getProducts = async () => {
    const provider = new Web3(window.web3.currentProvider);
    var ccfContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    const productCount = await ccfContract.methods.productCount().call();
    console.log("----productCount-----", productCount);

    const res = [];
    for (var i = 0; i < productCount; i++) res.push(i);
    console.log("res---------------", res);

    const logs = await Promise.all(
      res.map(async (pendId) => {
        const logres = await ccfContract.methods.products(pendId).call();
        return logres;
      })
    );
    console.log("products---------------", logs);

    // this.setPendingLogs(logs);
    return logs;

    // await ccfContract.methods.getPendingLogOfBuyer(userAddress.toString()).call().then(res => {
    //   res.
    //     map(pendId => {
    //       ccfContract.methods.pendinglogs(pendId).call().then(res => {

    //         this.setPendingLogs(this.state.pendingLogs.push(res));
    //       })
    //   });

    //   return res;
    // }).catch(err => {
    //   console.log(err);
    // });
  };

  const clickConnectWallet = async () => {
    if (typeof web3 === "undefined") {
      setWalletUnavailable(true);
      return;
    }
    setWalletUnavailable(false);
    setToggleLoading(true);
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (res) => {
        window.web3 = new Web3(window.ethereum);
        console.log(window.web3);
        setWalletDismetamaskConnection(false);
        setCurrentAccountAddress(res);
        const res1 = await getProducts();
        setList(res1);
        setToggleLoading(false);
      })
      .catch((err) => {
        setWalletDismetamaskConnection(true);
        setToggleLoading(false);
        console.log(err);
      });
  };

  useEffect(() => {
    const isMetamask = typeof web3 === "undefined";
    console.log("product-list connection state", metamaskConnection);
    if (isMetamask == true) {
      setWalletUnavailable(true);
      return;
    }
    setWalletUnavailable(false);
    if (
      currentAccountAddress === undefined ||
      currentAccountAddress === "" ||
      currentAccountAddress === "0"
    )
      return;
    else {
      setWalletDismetamaskConnection(false);
    }
  }, []);

  useEffect(() => {
    if (metamaskConnection === true) {
      clickConnectWallet();
    } else {
      setWalletDismetamaskConnection(true);
    }
  }, [metamaskConnection]);

  useEffect(() => {
    if (walletUnavailable === true) setAlertVisible(true);
    else setAlertVisible(false);
  }, [walletUnavailable]);

  const addProduct = () => {
    history.push(`/app/apps/ecommerce/add-product`);
  };

  const buyProduct = async (id, productOwner) => {
    setToggleLoading(true);
    const proId = id;
    const isMetamask = await ethEnabled();
    if (isMetamask == false) {
      setWalletUnavailable(true);
      return;
    }
    setWalletUnavailable(false);
    const currentAccountAddress = await getAccount();
    console.log("current Address", currentAccountAddress);
    if (
      productOwner.toString().toUpperCase() ===
      currentAccountAddress.toString().toUpperCase()
    ) {
      message.warning(`this is your product, you can't buy yours`);
      setToggleLoading(false);
      return;
    }
    const provider = new Web3(window.web3.currentProvider);
    const DraqleContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    const priceOfProduct = await DraqleContract.methods
      .getPriceOfProduct(Number(proId))
      .call();
    console.log("price of product", priceOfProduct);

    DraqleContract.methods
      .buyProduct(Number(proId))
      .send({
        from: currentAccountAddress,
        gas: 3000000,
        value: priceOfProduct,
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    setToggleLoading(false);
  };

  const tableColumns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "product owner",
      dataIndex: "productOwner",
      render: (text, record) => {
        if (record.productOwner.length <= 0) return text;
        return text.slice(0, 5) + "..." + text.slice(-5);
      },
      sorter: (a, b) => utils.antdTableSorter(a, b, "productOwner"),
    },
    {
      title: "Product",
      dataIndex: "name",
      render: (_, record) => (
        <div className="d-flex">
          <AvatarStatus
            size={60}
            type="square"
            src={record.image}
            name={record.name}
          />
        </div>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Category",
      dataIndex: "category",
      sorter: (a, b) => utils.antdTableSorter(a, b, "category"),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => (
        <div>
          <NumberFormat
            displayType={"text"}
            value={Math.round(price) / 10 ** 18}
            suffix={" BNB"}
            thousandSeparator={true}
          />
        </div>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "price"),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      sorter: (a, b) => utils.antdTableSorter(a, b, "stock"),
    },
    {
      title: "Saled",
      dataIndex: "saled",
      sorter: (a, b) => utils.antdTableSorter(a, b, "saled"),
    },
    {
      title: "Status",
      dataIndex: "stock",
      render: (stock) => (
        <Flex alignItems="center">{getStockStatus(stock)}</Flex>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "stock"),
    },
    {
      title: "",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="text-right">
          <Button
            type="primary"
            onClick={() => buyProduct(record.id, record.productOwner)}
            icon={<ShoppingCartOutlined />}
          >
            Buy Product
          </Button>
        </div>
      ),
    },
  ];

  const rowSelection = {
    onChange: (key, rows) => {
      setSelectedRows(rows);
      setSelectedRowKeys(key);
    },
  };

  const onSearch = (e) => {
    const value = e.currentTarget.value;
    const searchArray = e.currentTarget.value ? list : ProductListData;
    const data = utils.wildCardSearch(searchArray, value);
    setList(data);
    setSelectedRowKeys([]);
  };

  const handleShowCategory = (value) => {
    if (value !== "All") {
      const key = "category";
      const data = utils.filterArray(ProductListData, key, value);
      setList(data);
    } else {
      setList(ProductListData);
    }
  };

  return (
    <div>
      {alertVisible === true
        ? (Modal.warning({
            title: "Metamask info",
            content: "Without metamask this page can't show information.",
          }),
          setAlertVisible(false))
        : null}
      {metamaskConnection === true ? (
        <Spin spinning={loading} tips="Just a moment...">
          <Card>
            <Flex
              alignItems="center"
              justifyContent="between"
              mobileFlex={false}
            >
              <Flex className="mb-1" mobileFlex={false}>
                <div className="mr-md-3 mb-3">
                  <Input
                    placeholder="Search"
                    prefix={<SearchOutlined />}
                    onChange={(e) => onSearch(e)}
                  />
                </div>
                <div className="mb-3">
                  <Select
                    defaultValue="All"
                    className="w-100"
                    style={{ minWidth: 180 }}
                    onChange={handleShowCategory}
                    placeholder="Category"
                  >
                    <Option value="All">All</Option>
                    {categories.map((elm) => (
                      <Option key={elm} value={elm}>
                        {elm}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Flex>
              <div className="mb-3">
                <Button
                  onClick={addProduct}
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  block
                >
                  Add product
                </Button>
              </div>
            </Flex>
            <div className="table-responsive">
              <Table
                columns={tableColumns}
                dataSource={list}
                rowKey="id"
                rowSelection={{
                  selectedRowKeys: selectedRowKeys,
                  type: "checkbox",
                  preserveSelectedRowKeys: false,
                  ...rowSelection,
                }}
              />
            </div>
          </Card>
        </Spin>
      ) : (
        <Alert
          message="Warning"
          description="Plz connect metamask"
          type="warning"
          showIcon
        />
      )}
    </div>
  );
};

const mapStateToProps = ({ theme }) => {
  const { metamaskConnection } = theme;
  return { metamaskConnection };
};

export default connect(mapStateToProps, {})(ProductList);
