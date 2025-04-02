import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateFetus.css';
import { useAuth } from '../../constants/AuthContext';
import { toast } from 'react-toastify';
import api from '../../config/api';

const CreateFetus = () => {
    const navigate = useNavigate();
    const { isLoading, user } = useAuth(); // Lấy user từ AuthContext
    const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái gửi form

    // Kiểm tra đăng nhập
    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login'); // Điều hướng nếu chưa đăng nhập
        }
    }, [isLoading, user, navigate]);

 

    const [fetusData, setFetusData] = useState({
        conceptionDate: ''
    });

    const userId = localStorage.getItem('userId');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            toast.error("User ID không tồn tại. Vui lòng đăng nhập lại.");
            return;
        }

        console.log(fetusData);

        setIsSubmitting(true); // Bắt đầu gửi request
        try {
            const response = await api.post(`users/${userId}/fetuses`,fetusData);
            console.log('Form submitted:', response);
            toast.success("Thông tin thai kỳ đã được lưu thành công!");
            localStorage.setItem('fetusId', response.data.id);
            navigate('/create-fetus-health');
        } catch (error) {
            console.error("Lỗi khi gửi request:", error);
            toast.error(error.response?.data?.message || "Lỗi khi lưu thông tin thai kỳ. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false); // Kết thúc gửi request
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFetusData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    if (isLoading) {
        return <div>Đang kiểm tra đăng nhập...</div>;
    }

    return (
        <div className="create-fetus-container">
            <h1 className="page-title">Theo dõi thai kỳ</h1>

            <div className="info-sections">
                <div className="info-card">
                    <h3>Theo dõi thai kỳ</h3>
                    <p>Được thiết kế dành riêng cho mẹ nhằm cung cấp các thông tin hữu ích hằng ngày cũng như theo dõi các chỉ số của bé trong suốt thai kỳ.</p>
                </div>

                <div className="info-box pink">
                    <h4>Theo dõi chỉ số của bé trong suốt thai kỳ</h4>
                    <p>App mẹ bầu Maternity Care sẽ hỗ trợ theo dõi các chỉ số cần thiết của bé như: Cân nặng, 
                        chiều dài, chu vi đầu, chiều dài xương đùi, 
                        đường kính lưỡng đỉnh giúp đề xuất đánh giá sự phát triển của thai nhi trong suốt thai kỳ, đồng thời biết dấu hiệu bất thường.</p>
                </div>

                <div className="info-box blue">
                    <h4>Theo dõi các chỉ số sức khỏe của mẹ</h4>
                    <p>App theo dõi thai kỳ Maternity Care theo dõi các chỉ số sức khỏe của mẹ như: Cân nặng, huyết áp, 
                        số đo đường huyết ngẫu nhiên, đường thai, 
                        xương thai và các vấn đề về thai nghén để giúp mẹ theo dõi và chăm sóc thai kỳ theo đúng quy trình khoa học và đúng theo độ tuổi thai giá.</p>
                </div>

                <div className="info-box purple">
                    <h4>Theo dõi, nhắc nhở lịch khám</h4>
                    <p>App theo dõi thai kỳ Maternity Care cung cấp lịch khám thai tiêu chuẩn giúp mẹ nắm được thời gian phù hợp. 
                        Đặc biệt sẽ đồng thời theo dõi tình trạng sức khỏe của mẹ và phát hiện những dấu hiệu bất thường của bé. 
                        Nhắc nhở tập thể dục, dặm bảo thai kỳ theo từng tuần.</p>
                </div>
            </div>

            <form className="fetus-form" onSubmit={handleSubmit}>
                <div className="form-group3">
                    <label>Ngày thụ thai</label>
                    <input
                        type="date"
                        name="conceptionDate"
                        value={fetusData.conceptionDate}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting} // Vô hiệu hóa khi đang gửi
                    />
                </div>

                <button type="submit" className="submit-button1" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu thông tin"}
                </button>
            </form>
        </div>
    );
};

export default CreateFetus;