import React, { useEffect, useState } from "react";
import { Button, Table, Space, Upload, message, Switch } from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import "./style.css";
import { useCallback } from "react";
import debounce from "lodash/debounce";

// const API_URL = 'https://cp.suoitien.vn/api/coupon';

const CheckCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  // console.log(coupons);


  const fetchData = useCallback(
    async (search = "", page = 1) => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/coupon/search', {
          params: {
            search: search,
            page: page,
            limit: pagination.pageSize,
          },
          withCredentials: true,
        });

        // console.log("API Response:", response.data);

        const couponData = response.data.data || response.data || [];
        setCoupons(couponData);
        // console.log('data',couponData);
        setPagination({
          ...pagination,
          current: response.data.page || page,
          total: response.data.total || couponData.length,
        });
        setError("");
      } catch (error) {
        console.error("Failed to fetch coupon:", error);
        setError(error.response?.data?.message || "Error fetching coupons");
        if (error.response?.status === 401 || error.response?.status === 403) {
          window.location.href = "/";
        }
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize]
  );

  // useEffect(() => {
  //   const debouncedFetch = debounce((search) => fetchData(search, 1), 300);
  //   debouncedFetch(searchText);
  //   return () => debouncedFetch.cancel();
  // }, [searchText, fetchData]);

  useEffect(() => {
    const debouncedFetch = debounce((search) => fetchData(search, 1), 300);
    debouncedFetch(searchText);
    return () => debouncedFetch.cancel();
  }, [searchText, fetchData]);

  const handleTableChange = useCallback(
    (pagination) => {
      fetchData(searchText, pagination.current);
      setPagination({
        ...pagination,
        current: pagination.current,
      });
    },
    [searchText, fetchData]
  );
  const handleSwitchChange = async (checked, record) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/coupon/${record.Id}`, {
        NameCustomer:record.NameCustomer,
        CodeCoupon: record.CodeCoupon,
        Phone: record.Phone,
        Email: record.Email,
        IsActive: checked ? 1 : 0,
      });
      message.success("Status updated successfully");
      setTimeout(() => {
      fetchData(searchText, pagination.current);
        
      }, 100);
    } catch (err) {
      message.error(err.response?.data?.message || "Error updating status");
    } finally {
      setLoading(false);
    }
  };
  const handleImportExcel = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Chuẩn hóa dữ liệu từ Excel
        const formattedData = jsonData.map((row, index) => {
          const phone = String(row["Phone"]).padStart(10, "0");
          if (!/^\d{10}$/.test(phone)) {
            throw new Error(
              `Row ${index + 2}: Phone must be exactly 10 digits`
            );
          }
          if (!row["Name"]) {
            throw new Error(`Row ${index + 2}: Name is required`);
          }
          if (!row["Coupon Code"]) {
            throw new Error(`Row ${index + 2}: Coupon Code is required`);
          }
          if (!row["Email"] || !row["Email"].includes("@")) {
            throw new Error(`Row ${index + 2}: Valid Email is required`);
          }

          return {
            NameCustomer: row["Name"],
            CodeCoupon: row["Coupon Code"],
            Phone: phone,
            Email: row["Email"],
            IsActive: 0, // Mặc định IsActive = 1 vì file không có cột này
          };
        });

        // Gửi dữ liệu lên backend
        const errors = [];
        for (const [index, coupon] of formattedData.entries()) {
          try {
            await axios.post('http://localhost:5000/api/coupon', coupon);
          } catch (err) {
            errors.push(
              `Row ${index + 2}: ${err.response?.data?.message || "Error"}`
            );
          }
        }

        fetchData(searchText, pagination.current);
        if (errors.length > 0) {
          setError(errors.join("\n"));
        } else {
          setError("Imported successfully");
        }
      } catch (err) {
        setError(err.message || "Error reading file");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "NameCustomer",
      key: "NameCustomer",
    },
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
    {
      title: "Is Active",
      dataIndex: "IsActive",
      key: "IsActive",
      render: (isActive, record) => (
        <Switch
          disabled={isActive === true}
          checked={isActive}
          onChange={(checked) => handleSwitchChange(checked, record)}
          loading={loading}
        />
      ),
    },
  ];

  return (
    <>
      <div className="main">
        <div className="container mt-10 m-auto">
          <div className="coupon">
            <h2 className="text-[24px] py-6">Check Coupons</h2>
            {error && (
              <div
                style={{
                  color: error.includes("successfully") ? "green" : "red",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <Space style={{ marginBottom: 16 }}>
              <Upload
                accept=".xlsx, .xls"
                showUploadList={false}
                beforeUpload={handleImportExcel}
              >
                <Button type="primary">Import from Excel</Button>
              </Upload>
            </Space>
            
                <div className="searchBox w-[600px] px-8 mb-4  flex items-center relative p-2">
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    type="text"
                    placeholder="Search for account..."
                    className="w-full text-[18px] px-6 rounded-[6px]  !bg-[#f1f1f1] h-12 focus:outline-none bg-inherit "
                  />
                </div>
                <Table
                  rowKey="Id"
                  columns={columns}
                  dataSource={coupons}
                  pagination={pagination}
                  loading={loading}
                  onChange={handleTableChange}
                  size="middle"
                  className="!bg-white border px-5 rounded-md"
                />
             
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckCoupons;
