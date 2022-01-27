import React from "react";
import ProductForm from "../ProductForm";
import { Alert } from "antd";

import { connect } from "react-redux";
const AddProduct = ({ metamaskConnection }) => {
  return (
    <>
      {metamaskConnection === true ? (
        <ProductForm mode="ADD" />
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

export default connect(mapStateToProps, {})(AddProduct);
