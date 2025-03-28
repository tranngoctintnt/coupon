import React, { useState } from "react";
import { Button, message, Table, Input, Spin, Card, Tag } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";

const Coupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const columns = [
    {
      title: "Coupon Code",
      dataIndex: "CodeCoupon",
      key: "CodeCoupon",
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      key: "Phone",
    },
    {
      title: "Email",
      dataIndex: "Email",
      key: "Email",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/coupon-user?search=${searchText}`);
      const data = await response.json();
      if (data.length === 0) {
        message.error("Số điện thoại không trong danh sách áp dụng coupon hoặc bạn đã sử dụng.");
      } else {
        setCoupons(data);
      }
      // const response = await axios.get(`${API_URL}?search=${query}`);
      // setCoupons(response.data);
      // setError("");
    } catch (err) {
      setError(err.response.data || "Error fetching data");
    }
    setLoading(false);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const handleSearch = () => {
   
      setCoupons([]);

if (searchText.length !== 10) {
      message.error("Số điện thoại phải có đúng 10 số!"); // Hiển thị cảnh báo
      return;
    }
    fetchData(searchText); // Chỉ gọi API khi số điện thoại hợp lệ
  };
  return (
    <>
     

<div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#1d7f33] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">Suối Tiên</h1>
          <nav className="flex gap-4">
            <a href="#" className="hover:underline">Trang chủ</a>
            <a href="#" className="hover:underline">Hỗ trợ</a>
            <a href="#" className="hover:underline">Liên hệ</a>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="flex-grow p-4">
        <div className="container mx-auto max-w-5xl">
          <Card
            title={
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                  Tra cứu Coupon
                </h2>
                <InfoCircleOutlined className="text-gray-500" />
              </div>
            }
            className="shadow-lg rounded-lg"
          >
            <div className="p-6">
              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  value={searchText}
                  onChange={(e) => {
                    const inputVal = e.target.value.replace(/\D/g, "");
                    if (inputVal.length <= 10) {
                      setSearchText(inputVal);
                    }
                  }}
                  maxLength={10}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập số điện thoại (10 số)"  
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="rounded-md h-12 text-lg"
                  addonAfter={
                    <span className="text-gray-500">{searchText.length}/10</span>
                  }
                />
                <Button
                  type="primary"
                  onClick={handleSearch}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? <Spin /> : "Tìm kiếm"}
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-center">
                  {error}
                </div>
              )}

              {/* Additional Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-lg font-semibold text-blue-800">Hướng dẫn sử dụng</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Nhập số điện thoại 10 chữ số để tra cứu.</li>
                  <li>Coupon chỉ áp dụng cho tài khoản chưa sử dụng trước đó.</li>
                  <li>Liên hệ hỗ trợ nếu gặp vấn đề: <a href="mailto:support@example.com" className="text-blue-600">support@example.com</a></li>
                </ul>
              </div>

              {/* Table */}
              <Table
                rowKey="Id"
                columns={columns}
                dataSource={coupons}
                loading={loading}
                size="middle"
                className="rounded-md overflow-hidden"
                scroll={{ x: "max-content" }}
                locale={{
                  emptyText: "Không tìm thấy coupon nào.",
                }}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                  pageSizeOptions: ["5", "10", "20"],
                }}
              />
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Coupon System. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="text-blue-300 hover:underline">Điều khoản dịch vụ</a> | 
            <a href="#" className="text-blue-300 hover:underline ml-2">Chính sách bảo mật</a>
          </p>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Coupon;
