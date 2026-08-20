import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [students, setStudents] = useState([]);

    const [formData, setFormData] = useState({
        studentId: "",
        name: "",
        email: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // =============================
    // GET danh sách sinh viên
    // =============================
    const fetchStudents = async () => {
        try {
            const response = await fetch("/api/students");

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Không thể tải danh sách"
                );
            }

            setStudents(data);

        } catch (error) {
            console.error("GET ERROR:", error);
            alert("Không thể tải danh sách sinh viên!");
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // =============================
    // Nhập dữ liệu
    // =============================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((oldData) => ({
            ...oldData,
            [name]: value
        }));
    };

    // =============================
    // POST / PUT
    // =============================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.studentId ||
            !formData.name ||
            !formData.email
        ) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setLoading(true);

        try {
            let response;

            // =============================
            // CẬP NHẬT
            // =============================
            if (editingId) {
                response = await fetch(
                    `/api/students/${editingId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(formData)
                    }
                );
            }

            // =============================
            // THÊM
            // =============================
            else {
                response = await fetch(
                    "/api/students",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(formData)
                    }
                );
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Thao tác thất bại!"
                );
            }

            // =============================
            // Sau khi cập nhật
            // =============================
            if (editingId) {
                setStudents((oldStudents) =>
                    oldStudents.map((student) =>
                        student._id === editingId
                            ? data
                            : student
                    )
                );

                alert("Cập nhật sinh viên thành công!");

                setEditingId(null);
            }

            // =============================
            // Sau khi thêm
            // =============================
            else {
                setStudents((oldStudents) => [
                    ...oldStudents,
                    data
                ]);

                alert("Thêm sinh viên thành công!");
            }

            // Reset form
            setFormData({
                studentId: "",
                name: "",
                email: ""
            });

        } catch (error) {
            console.error("SUBMIT ERROR:", error);

            alert(
                editingId
                    ? `Cập nhật sinh viên thất bại!\n${error.message}`
                    : `Thêm sinh viên thất bại!\n${error.message}`
            );

        } finally {
            setLoading(false);
        }
    };

    // =============================
    // Sửa
    // =============================
    const handleEdit = (student) => {
        console.log("Sinh viên đang sửa:", student);

        setEditingId(student._id);

        setFormData({
            studentId: student.studentId,
            name: student.name,
            email: student.email
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =============================
    // Hủy sửa
    // =============================
    const handleCancelEdit = () => {
        setEditingId(null);

        setFormData({
            studentId: "",
            name: "",
            email: ""
        });
    };

    // =============================
    // Xóa
    // =============================
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Bạn có chắc chắn muốn xóa sinh viên này?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `/api/students/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Xóa thất bại!"
                );
            }

            setStudents((oldStudents) =>
                oldStudents.filter(
                    (student) => student._id !== id
                )
            );

            if (editingId === id) {
                handleCancelEdit();
            }

            alert("Xóa sinh viên thành công!");

        } catch (error) {
            console.error("DELETE ERROR:", error);

            alert(
                `Xóa sinh viên thất bại!\n${error.message}`
            );
        }
    };

    return (
        <div className="container">

            <h1>Quản lý sinh viên</h1>

            <form onSubmit={handleSubmit}>

                <h2>
                    {editingId
                        ? "Cập nhật sinh viên"
                        : "Thêm sinh viên"}
                </h2>

                <input
                    type="text"
                    name="studentId"
                    placeholder="MSSV"
                    value={formData.studentId}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="name"
                    placeholder="Họ tên"
                    value={formData.name}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Đang xử lý..."
                        : editingId
                        ? "Cập nhật"
                        : "Thêm sinh viên"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                    >
                        Hủy sửa
                    </button>
                )}

            </form>

            <h2>Danh sách sinh viên</h2>

            {students.length === 0 ? (
                <p>Chưa có sinh viên nào.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>MSSV</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student._id}>

                                <td>
                                    {index + 1}
                                </td>

                                <td>
                                    {student.studentId}
                                </td>

                                <td>
                                    {student.name}
                                </td>

                                <td>
                                    {student.email}
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(student)
                                        }
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                student._id
                                            )
                                        }
                                    >
                                        Xóa
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    );
}

export default App;