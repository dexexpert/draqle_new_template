import React from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Upload,
  InputNumber,
  message,
  Select,
} from "antd";
import { ImageSvg } from "assets/svg/icon";
import CustomIcon from "components/util-components/CustomIcon";
import { LoadingOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Option } = Select;

const rules = {
  name: [
    {
      required: false,
      message: "Please enter product name",
    },
  ],
  priceBNB: [
    {
      required: true,
      message: "Please enter the product price",
    },
  ],
  description: [
    {
      required: false,
      message: "Please enter product description",
    },
  ],
  price: [
    {
      required: false,
      message: "Please enter product price",
    },
  ],
  comparePrice: [],
  taxRate: [
    {
      required: false,
      message: "Please enter tax rate",
    },
  ],
  cost: [
    {
      required: false,
      message: "Please enter item cost",
    },
  ],
};

const imageUploadProps = {
  name: "file",
  multiple: true,
  listType: "picture-card",
  showUploadList: false,
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

const categories = ["Cloths", "Bags", "Shoes", "Watches", "Devices"];
const tags = [
  "Cotton",
  "Nike",
  "Sales",
  "Sports",
  "Outdoor",
  "Toys",
  "Hobbies",
];

const GeneralField = (props) => (
  <Row gutter={16}>
    <Col xs={24} sm={24} md={17}>
      <Card title="Basic Info">
        <Form.Item name="priceBNB" label="price in BNB" rules={rules.priceBNB}>
          <InputNumber
            className="w-100"
            value={0}
            precision={3}
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
      </Card>
    </Col>
  </Row>
);

export default GeneralField;
