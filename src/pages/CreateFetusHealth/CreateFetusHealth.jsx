import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateFetusHealth.css";
import axios from "../../constants/axios";
import { toast } from "react-toastify";
import api from "../../config/api";

const CreateFetusHealth = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const [fetusHealthId, setFetusHealthId] = useState(null);
    const [healthData, setHealthData] = useState({
        week:2,
        headCircumference: 0,
        amnioticFluidLevel: 0,
        crownRumpLength: 0,
        biparietalDiameter: 0,
        femurLength: 0,
        estimatedFetalWeight: 0,
        abdominalCircumference: 0,
        gestationalSacDiameter: 0,
    });

    useEffect(() => {
        const fetchFetusData = async () => {
            try {
                const response = await axios.get(
                    `https://maternitycare.azurewebsites.net/api/users/${userId}/fetuses`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data.length > 0) {
                    const firstFetusId = response.data[0].id;
                    console.log(response);
                    setFetusHealthId(firstFetusId);
                    localStorage.setItem('fetusId', firstFetusId);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin:", error);
            }   
        };
        fetchFetusData();
    }, [userId, token]);

    const sanitizeHealthData = (data) => {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = data[key] === "Không có dữ liệu" || data[key] === 0 ? null : data[key];
            return acc;
        }, {});
    };

    const sendReminder = async (week) => {
        try {
            // Gọi API để lấy danh sách nhắc nhở
            const reminderResponse = await api.get("reminders");
            const reminderList = reminderResponse.data;
            console.log(week)
            // Tìm nhắc nhở phù hợp với tuần hiện tại
            const matchedReminder = reminderList.find((item) => {
                const weekNum = Number(item.week)
                return weekNum === week;
            });
            console.log(matchedReminder)
            if (!matchedReminder) {
                console.log(`Không có nhắc nhở nào cho tuần ${week}, bỏ qua.`);
                return;
            }
            const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
            localStorage.setItem("reminders", JSON.stringify([...reminders, matchedReminder]));
            toast.success(`Nhắc nhở: ${matchedReminder.description}`);
        } catch (error) {
            console.error("Lỗi khi gửi reminder:", error.response?.data || error.message);
            toast.error("Lỗi khi gửi nhắc nhở, vui lòng thử lại!");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedData = { ...healthData, [name]: value };

        if (name === "week") {
            const week = Number(value);
            updatedData = {
                ...updatedData,
                crownRumpLength: week >= 2 && week <= 5 || week >= 16 ? 0 : "",
                headCircumference: week >= 2 && week <= 9 ? 0 : "",
                biparietalDiameter: week >= 2 && week <= 9 ? 0 : "",
                estimatedFetalWeight: week >= 2 && week <= 9 ? 0 : "",
                abdominalCircumference: week >= 2 && week <= 11 ? 0 : "",
                gestationalSacDiameter: week >= 2 && week <= 5 || week >= 14 ? 0 : "",
                femurLength: week >= 2 && week <= 9 ? 0 : "",
                amnioticFluidLevel: week >= 2 && week <= 5 ? 0 : "",
            };
        }

        setHealthData(updatedData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!fetusHealthId) {
            toast.error("Không tìm thấy ID thai nhi, vui lòng thử lại!");
            return;
        }
    
        const cleanedData = sanitizeHealthData(healthData); 
    
        console.log("Dữ liệu sạch gửi đi:", cleanedData);
    
        try {
            console.log("Data being sent:", cleanedData); 
            const response = await api.post(
                `fetuses/${fetusHealthId}/fetus-healths`,
                cleanedData
            );
    
            console.log("Response từ server:", response);
            toast.success("Thông tin sức khỏe thai nhi đã được lưu!");
            navigate(`/pregnancy/${healthData.week}`);
        
        } catch (error) {
            console.error("Lỗi khi gửi request:", error.response?.data || error.message);
            toast.error("Lỗi khi lưu thông tin sức khỏe. Vui lòng thử lại.");
        }
        sendReminder(Number(healthData.week));
    };
    

    return (
        <div className="create-fetus-health-container">
            <h1 className="page-title">Thông tin sức khỏe thai nhi</h1>
            <form className="health-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Tuần (Week)</label>
                        <input
                            type="number"
                            name="week"
                            value={healthData.week}
                            onChange={handleChange}
                            required
                            min="2"
                            max="40"
                        />
                    </div>
                    <div className="form-group">
                        <label>Chu vi đầu (HC) (mm)</label>
                        <input
                            type="number"
                            name="headCircumference"
                            value={healthData.headCircumference}
                            onChange={handleChange}
                            required
                            step="1"
                            placeholder={healthData.week >= 2 && healthData.week <= 9 && "Không có dữ liệu"}
                            disabled={healthData.week >= 2 && healthData.week <= 9}
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group2">
                        <label>Mức độ nước ối (Amniotic Fluid Level)</label>
                        <select
                            name="amnioticFluidLevel"
                            value={healthData.amnioticFluidLevel}
                            onChange={handleChange}
                            required
                            placeholder={healthData.week >= 2 && healthData.week < 6 && "Không có dữ liệu"}
                            disabled={healthData.week < 6}
                        >
                            <option value={0}>Chọn mức độ</option>
                            <option value={1}>Bình thường(1)</option>
                            <option value={2}>Thấp(2)</option>
                            <option value={3}>Cao(3)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label> Chiều dài đầu mông (CRL) (mm)</label>
                        <input
                            type="number"
                            name="crownRumpLength"
                            value={healthData.crownRumpLength}
                            onChange={handleChange}
                            required
                            step="0.5"
                            placeholder={healthData.week >= 2 && healthData.week <= 5 || healthData.week >= 16 && "Không có dữ liệu"}
                            disabled={healthData.week >= 2 && healthData.week <= 5 || healthData.week >= 16}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label> Đường kính lưỡng đỉnh (BD) (mm)</label>
                        <input
                            type="number"
                            name="biparietalDiameter"
                            value={healthData.biparietalDiameter}
                            onChange={handleChange}
                            required
                            step="1"
                            placeholder={healthData.week >= 2 && healthData.week <= 9 && "Không có dữ liệu"}
                            disabled={healthData.week >= 2 && healthData.week <= 9}
                        />
                    </div>
                    <div className="form-group">
                        <label>Chiều dài xương đùi (FL) (mm)</label>
                        <input
                            type="number"
                            name="femurLength"
                            value={healthData.femurLength}
                            onChange={handleChange}
                            required
                            step="0.1"
                            placeholder={healthData.week >= 2 && healthData.week <= 9 && "Không có dữ liệu"}
                            disabled={healthData.week >= 2 && healthData.week <= 9}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Đường kính túi thai (GSD) (mm)</label>
                        <input
                            type="number"
                            name="gestationalSacDiameter"
                            value={healthData.gestationalSacDiameter}
                            onChange={handleChange}
                            required
                            step="0.1"
                            placeholder={healthData.week >= 2 && healthData.week <= 5 || healthData.week >= 14 && "Không có dữ liệu"}
                            disabled={healthData.week >= 2 && healthData.week <= 5 || healthData.week >= 14}
                        />
                    </div>
                    <div className="form-group">
                        <label>Cân nặng thai nhi ước tính (EFW) (g)</label>
                        <input
                            type="number"
                            name="estimatedFetalWeight"
                            value={healthData.estimatedFetalWeight}
                            onChange={handleChange}
                            required
                            step="1"
                            placeholder={healthData.week >= 2 && healthData.week <= 9 && "Không có dữ liệu"}
                            disabled={healthData.week >= 2 && healthData.week <= 9}
                        />
                    </div>
                </div>

                <div className="form-row">
                    
                    <div className="form-group1">
                        <label>Chu vi vòng bụng (AC) (mm)</label>
                        <input
                            type="number"
                            name="abdominalCircumference"
                            value={healthData.abdominalCircumference}
                            onChange={handleChange}
                            required
                            step="0.1"
                            placeholder={healthData.week >= 2 && healthData.week <= 11 && "Không có dữ liệu"}
                            disabled={healthData.week >= 2 && healthData.week <= 11}
                        />
                    </div>
                </div>

                <button type="submit" className="submit-button">Lưu thông tin</button>
            </form>
        </div>
    );
};

export default CreateFetusHealth;