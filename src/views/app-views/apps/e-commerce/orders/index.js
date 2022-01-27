/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Badge,
  Menu,
  Tag,
  Spin,
  Alert,
} from "antd";
import {
  EyeOutlined,
  FileExcelOutlined,
  SearchOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import AvatarStatus from "components/shared-components/AvatarStatus";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import NumberFormat from "react-number-format";
import moment from "moment";
import { DATE_FORMAT_DD_MM_YYYY } from "constants/DateConstant";
import utils from "utils";

import ccfTokenAbi from "../abi/draqle";

import { connect } from "react-redux";
const Web3 = require("web3");
const tokenAddress = "0xdA203998849c654a4fA45abA656896f900A4F19D";

const { Option } = Select;

const getShippingStatus = (status) => {
  if (status === "Confirmed By Seller") {
    return "warning";
  }
  if (status === "Claimed By Seller") {
    return "success";
  }
  if (status === "Refunded By Buyer") {
    return "warning";
  }
  if (status === "Seller won dispute") {
    return "warning";
  }
  if (status === "Bought By Buyer") {
    return "warning";
  }
  if (status === "Accepted By Buyer") {
    return "success";
  }
  if (status === "Disputed By Buyer") {
    return "error";
  }
  if (status === "Disputed By Seller") {
    return "error";
  }
  return "";
};

const paymentStatusList = ["Paid", "Pending", "Expired"];

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

const getPendingLogs = async () => {
  const isMetamask = await ethEnabled();
  if (isMetamask == false) {
    alert("You should install metamask");
    return;
  }
  const currentAccountAddress = await getAccount();
  console.log("current Address", currentAccountAddress);

  const provider = new Web3(window.web3.currentProvider);
  var ccfContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

  const res = await ccfContract.methods
    .getPendingLogOfBuyer(currentAccountAddress.toString())
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

const Orders = ({ metamaskConnection }) => {
  const [list, setList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setToggleLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [dataChanged, setDataChanged] = useState(false);

  useEffect(() => {}, []);

  useEffect(() => {
    if (metamaskConnection === true) {
      async function getAllPendings() {
        setToggleLoading(true);
        const isMetamask = await ethEnabled();
        if (isMetamask == false) {
          alert("You should install metamask");
          return;
        }
        const currentAccountAddress = await getAccount();
        setCurrentAddress(currentAccountAddress);
        const pendings = await getPendingLogs();
        setList(pendings);

        setToggleLoading(false);
      }
      getAllPendings();
    }
  }, [metamaskConnection]);

  useEffect(() => {
    async function getAllPendings() {
      setToggleLoading(true);
      const isMetamask = await ethEnabled();
      if (isMetamask == false) {
        alert("You should install metamask");
        return;
      }
      const currentAccountAddress = await getAccount();
      setCurrentAddress(currentAccountAddress);
      const pendings = await getPendingLogs();
      setList(pendings);

      setToggleLoading(false);
    }
    if (dataChanged === true) {
      getAllPendings();
      setDataChanged(false);
    }
  }, [dataChanged]);

  const acceptActionBuyer = (pendingId, cur_Account) => {
    const provider = new Web3(window.web3.currentProvider);
    const DraqleContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    setToggleLoading(true);

    DraqleContract.methods
      .acceptByBuyer(pendingId)
      .send({ from: cur_Account.toString() })
      .then((res) => {
        console.log(res);
        setToggleLoading(false);
        setDataChanged(true);
      })
      .catch((err) => {
        console.log(err);
        setToggleLoading(false);
      });
  };

  const refundActionBuyer = (pendingId, cur_Account) => {
    const provider = new Web3(window.web3.currentProvider);
    const DraqleContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    setToggleLoading(true);
    DraqleContract.methods
      .refundByBuyer(pendingId)
      .send({ from: cur_Account.toString() })
      .then((res) => {
        console.log(res);
        setToggleLoading(false);
        setDataChanged(true);
      })
      .catch((err) => {
        console.log(err);
        setToggleLoading(false);
      });
  };

  const disputeActionBuyer = (pendingId, cur_Account) => {
    const provider = new Web3(window.web3.currentProvider);
    const DraqleContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    setToggleLoading(true);
    DraqleContract.methods
      .disputeByBuyer(pendingId)
      .send({ from: cur_Account.toString() })
      .then((res) => {
        console.log(res);
        setToggleLoading(false);
        setDataChanged(true);
      })
      .catch((err) => {
        console.log(err);
        setToggleLoading(false);
      });
  };

  const confirmActionSeller = (pendingId, cur_Account) => {
    const provider = new Web3(window.web3.currentProvider);
    const DraqleContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    setToggleLoading(true);
    console.log(pendingId);

    DraqleContract.methods
      .confirmBySeller(pendingId)
      .send({ from: cur_Account })
      .then((res) => {
        console.log(res);
        setToggleLoading(false);
        setDataChanged(true);
      })
      .catch((err) => {
        console.log(err);
        setToggleLoading(false);
      });
  };

  const claimActionSeller = (pendingId, cur_Account) => {
    const provider = new Web3(window.web3.currentProvider);
    const DraqleContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    setToggleLoading(true);
    DraqleContract.methods
      .claimBySeller(pendingId)
      .send({ from: cur_Account })
      .then((res) => {
        console.log(res);
        setToggleLoading(false);
        setDataChanged(true);
      })
      .catch((err) => {
        console.log(err);
        setToggleLoading(false);
      });
  };

  const refundActionSeller = (pendingId, cur_Account) => {
    const provider = new Web3(window.web3.currentProvider);
    const DraqleContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    setToggleLoading(true);
    DraqleContract.methods
      .refundBySeller(pendingId)
      .send({ from: cur_Account })
      .then((res) => {
        console.log(res);
        setToggleLoading(false);
        setDataChanged(true);
      })
      .catch((err) => {
        console.log(err);
        setToggleLoading(false);
      });
  };
  const disputeActionSeller = (pendingId, cur_Account) => {
    const provider = new Web3(window.web3.currentProvider);
    const DraqleContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);

    setToggleLoading(true);
    DraqleContract.methods
      .disputeBySeller(pendingId)
      .send({ from: cur_Account })
      .then((res) => {
        console.log(res);
        setToggleLoading(false);
        setDataChanged(true);
      })
      .catch((err) => {
        console.log(err);
        setToggleLoading(false);
      });
  };

  const handleShowStatus = (value) => {
    if (value !== "All") {
      const key = "paymentStatus";
      const data = utils.filterArray(list, key, value);
      setList(data);
    } else {
      setList(list);
    }
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center">
          <PlusCircleOutlined />
          <span className="ml-2">Add to remark</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    {
      title: "Buying or Selling",
      dataIndex: "buyer",
      render: (_, record) => {
        const addr1 = currentAddress;
        if (
          record.buyer.toString().toUpperCase() ===
          addr1.toString().toUpperCase()
        )
          return "buying";

        return "selling";
      },

      sorter: (a, b) => utils.antdTableSorter(a, b, "buyer"),
    },
    {
      title: "Order ID",
      dataIndex: "pendingId",
    },
    {
      title: "Product Id",
      dataIndex: "productId",
    },
    {
      title: "Comfirmed Date",
      dataIndex: "confirmedTime",
      render: (_, record) => (
        <span>{moment.unix(record.date).format(DATE_FORMAT_DD_MM_YYYY)}</span>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "date"),
    },
    {
      title: "Order status",
      dataIndex: "orderStatus",
      render: (text, record) => {
        let statusString = "Bought By Buyer";
        if (record.refundedBySeller === true) {
          statusString = "Dispute completed";
        } else if (record.disputedBySeller === true) {
          statusString = "Disputed By Seller";
        } else if (record.disputedByBuyer === true) {
          statusString = "Disputed By Buyer";
        } else if (record.claimedBySeller === true) {
          statusString = "Claimed By Seller";
        } else if (record.refundedByBuyer === true) {
          statusString = "Refunded By Buyer";
        } else if (record.acceptedByBuyer === true) {
          statusString = "Accepted By Buyer";
        } else if (record.confirmedBySeller === true) {
          statusString = "Confirmed By Seller";
        }
        return (
          <>
            <Tag color={getShippingStatus(statusString)}>{statusString}</Tag>
          </>
        );
      },
      sorter: (a, b) => utils.antdTableSorter(a, b, "orderStatus"),
    },
    {
      title: "Total",
      dataIndex: "depoAmount",
      render: (_, record) => (
        <span className="font-weight-semibold">
          <NumberFormat
            displayType={"text"}
            value={Math.round(record.depoAmount) / 10 ** 18}
            suffix={"BNB"}
            thousandSeparator={true}
          />
        </span>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "amount"),
    },
    {
      title: "actions",
      dataIndex: "",
      render: (_, record) => {
        let urSeller =
          record.seller.toString().toUpperCase() ===
          currentAddress.toString().toUpperCase();
        let showButton = null;
        if (record.refundedBySeller === true) {
        } else if (record.disputedBySeller === true) {
        } else if (record.disputedByBuyer === true) {
          if (urSeller) {
            showButton = (
              <>
                <Button
                  onClick={() =>
                    disputeActionSeller(record.pendingId, currentAddress)
                  }
                  type="danger"
                >
                  Open Dispute(Seller)
                </Button>
                <Button
                  onClick={() =>
                    refundActionSeller(record.pendingId, currentAddress)
                  }
                  type="danger"
                >
                  Refund to Buyer(Seller)
                </Button>
              </>
            );
          }
        } else if (record.claimedBySeller === true) {
        } else if (record.refundedByBuyer === true) {
        } else if (record.acceptedByBuyer === true) {
        } else if (record.confirmedBySeller === true) {
          if (urSeller) {
            showButton = (
              <Button
                onClick={() =>
                  claimActionSeller(record.pendingId, currentAddress)
                }
                type="primary"
              >
                Claim (Seller)
              </Button>
            );
          } else {
            showButton = (
              <>
                <Button
                  onClick={() =>
                    acceptActionBuyer(record.pendingId, currentAddress)
                  }
                  type="primary"
                >
                  Accept (Buyer)
                </Button>
                <Button
                  onClick={() =>
                    disputeActionBuyer(record.pendingId, currentAddress)
                  }
                  type="danger"
                >
                  Open Dispute(Buyer)
                </Button>
              </>
            );
          }
        } else {
          if (urSeller) {
            showButton = (
              <Button
                onClick={() =>
                  confirmActionSeller(record.pendingId, currentAddress)
                }
                type="primary"
              >
                Confirm (Seller)
              </Button>
            );
          } else {
            showButton = (
              <Button
                onClick={() =>
                  refundActionBuyer(record.pendingId, currentAddress)
                }
                type="danger"
              >
                Refund (Buyer)
              </Button>
            );
          }
        }
        return <div className="text-right">{showButton}</div>;
      },
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
    const searchArray = list;
    const data = utils.wildCardSearch(searchArray, value);
    setList(data);
    setSelectedRowKeys([]);
  };

  return (
    <>
      {metamaskConnection === true ? (
        <Spin tips="pending..." spinning={loading}>
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
                    onChange={handleShowStatus}
                    placeholder="Status"
                  >
                    <Option value="All">All payment </Option>
                    {paymentStatusList.map((elm) => (
                      <Option key={elm} value={elm}>
                        {elm}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Flex>
              <div>
                <Button type="primary" icon={<FileExcelOutlined />} block>
                  Export All
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
    </>
  );
};

const mapStateToProps = ({ theme }) => {
  const { metamaskConnection } = theme;
  return { metamaskConnection };
};

export default connect(mapStateToProps, {})(Orders);
