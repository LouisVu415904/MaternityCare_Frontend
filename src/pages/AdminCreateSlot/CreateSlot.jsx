import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../constants/axios";
import moment from "moment";
import "moment/locale/vi";
import { Modal, Form, Input, Button } from "antd";

const ViewSlot = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctors, setDoctors] = useState([]);
  const [pageNumber, setPageNumber1] = useState(1);
  const pageSize = 100;
  const [specialties, setSpecialties] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token");
        return;
      }

      try {
        const response = await api.get(
          `https://maternitycare.azurewebsites.net/api/doctors/active-doctors?PageNumber=${pageNumber}&PageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDoctors(response.data);
        extractSpecialties(response.data);
      } catch (error) {
        console.error(
          "Lỗi khi lấy danh sách bác sĩ:",
          error.response?.data || error.message
        );
        toast.error(
          "Lỗi khi lấy danh sách bác sĩ: " +
          (error.response?.data?.message || error.message)
        );
      }
    };

    fetchDoctors();
  }, [pageNumber]);

  const fetchSlots = async (doctorId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token");
      return;
    }

    try {
      const response = await api.get(
        `https://maternitycare.azurewebsites.net/api/doctors/${doctorId}/slots?Date=2025-03-12&PageNumber=1&PageSize=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSlots(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách slot:", error);
      toast.error(
        "Lỗi khi lấy danh sách slot: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const handleCreateSlot = async (values) => {
    const { date, startTime, endTime } = values;

    if (!selectedDoctorId || !date || !startTime || !endTime) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token");
      return;
    }
    try {
      const response = await api.post(
        `https://maternitycare.azurewebsites.net/api/doctors/${selectedDoctorId}/slots`,
        {
          date: date,
          startTime: startTime,
          endTime: endTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Tạo slot thành công");
      setIsModalOpen(false);
      form.resetFields();
      fetchSlots(selectedDoctorId);
      console.log(response.data);
    } catch (error) {
      console.error("Lỗi khi tạo slot:", error);
      toast.error(
        "Lỗi khi tạo slot: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDeleteSlot = async (doctorId, slotId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token");
      return;
    }
    try {
      await api.delete(
        `https://maternitycare.azurewebsites.net/api/doctors/${doctorId}/slots/${slotId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchSlots(doctorId);
    } catch (error) {
      console.log(error);
    }
  };

  const extractSpecialties = (doctorsList) => {
    const uniqueSpecialties = [
      ...new Set(doctorsList.map((doctor) => doctor.specialization)),
    ];
    setSpecialties(uniqueSpecialties);
  };

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (specialtyFilter === "all" || doctor.specialization === specialtyFilter)
  );

  return (
    <div>
      <h1>Chọn bác sĩ</h1>
      <input
        type="text"
        placeholder="Tìm kiếm bác sĩ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "8px 12px",
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          outline: "none",
          transition: "border-color 0.3s ease",
        }}
      />
      <select
        value={specialtyFilter}
        onChange={(e) => setSpecialtyFilter(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "200px",
          padding: "8px 12px",
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          outline: "none",
          backgroundColor: "#fff",
          cursor: "pointer",
        }}
      >
        <option value="all">Toàn bộ</option>
        {specialties.map((specialty, index) => (
          <option key={index} value={specialty}>
            {specialty}
          </option>
        ))}
      </select>

      <div>
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
              onClick={() => {
                const newSelectedId = selectedDoctorId === doctor.id ? null : doctor.id;
                setSelectedDoctorId(newSelectedId);
                if (newSelectedId) {
                  fetchSlots(doctor.id);
                }
              }}
            >
              <img
                src={doctor.avatar}
                alt={doctor.fullName}
                style={{
                  width: "20%",
                  borderRadius: "10%",
                  marginRight: "20px",
                }}
              />
              <div style={{ flexGrow: 1, marginLeft: "35px" }}>
                <h3>{doctor.fullName}</h3>
                <p>Email: {doctor.email}</p>
                <p>Số điện thoại: {doctor.phoneNumber}</p>
                <p>Chuyên môn: {doctor.specialization}</p>
                <p>Kinh nghiệm: {doctor.yearsOfExperience} năm</p>
              </div>
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDoctorId(doctor.id);
                    setIsModalOpen(true);
                  }}
                  style={{
                    marginRight: "40px",
                    backgroundColor: "#4caf93",
                    borderColor: "#4caf93",
                    fontSize: "14px",
                    height: "45px",
                    padding: "0px 30px",
                    borderRadius: "6px",
                    color: "#fff",
                  }}
                >
                  Tạo Slot
                </button>
              </div>
            </div>

            {selectedDoctorId === doctor.id &&
              slots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    marginTop: "10px",
                    padding: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <p>Ngày: {slot.date}</p>
                  <p>Giờ bắt đầu: {slot.startTime}</p>
                  <p>Giờ kết thúc: {slot.endTime}</p>
                  <button
                    style={{
                      marginRight: "40px",
                      backgroundColor: "rgb(218 21 46)",
                      borderColor: "rgb(218 21 46)",
                      fontSize: "14px",
                      height: "30px",
                      padding: "0px 20px",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                    onClick={() => handleDeleteSlot(doctor.id, slot.id)}
                  >
                    Xóa Slot
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>
      <button
        style={{
          marginRight: "40px",
          backgroundColor: "rgb(27 173 236)",
          borderColor: "rgb(88 178 237)",
          fontSize: "14px",
          height: "30px",
          padding: "0px 20px",
          borderRadius: "6px",
          color: "#fff",
        }}
        onClick={() => handlePageChange(pageNumber - 1)}
        disabled={pageNumber === 1}
      >
        Trước
      </button>
      <button
        style={{
          marginRight: "40px",
          backgroundColor: "rgb(27 173 236)",
          borderColor: "rgb(88 178 237)",
          fontSize: "14px",
          height: "30px",
          padding: "0px 20px",
          borderRadius: "6px",
          color: "#fff",
        }}
        onClick={() => handlePageChange(pageNumber + 1)}
      >
        Sau
      </button>

      <Modal
        title="Tạo Slot"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateSlot}>
          <Form.Item
            name="date"
            label="Ngày"
            rules={[{ required: true, message: "Vui lòng nhập ngày" }]}
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="Giờ bắt đầu"
            rules={[{ required: true, message: "Vui lòng nhập giờ bắt đầu" }]}
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="Giờ kết thúc"
            rules={[{ required: true, message: "Vui lòng nhập giờ kết thúc" }]}
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item>
            <Button onClick={() => setIsModalOpen(false)}>Quay lại</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginLeft: "10px" }}
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewSlot;
