import { useEffect, useState } from "react";
import "./App.css";

// =============================
// ICONS
// =============================

function GraduationIcon() {
    return (
        <svg
            viewBox="0 0 64 64"
            width="46"
            height="46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M8 25L32 13L56 25L32 37L8 25Z"
                fill="currentColor"
            />

            <path
                d="M17 30V42C17 47 24 51 32 51C40 51 47 47 47 42V30L32 38L17 30Z"
                fill="currentColor"
            />

            <path
                d="M56 25V39"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="25"
            height="25"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M16 11C18.21 11 20 9.21 20 7C20 4.79 18.21 3 16 3C13.79 3 12 4.79 12 7C12 9.21 13.79 11 16 11Z" />

            <path d="M8 11C10.21 11 12 9.21 12 7C12 4.79 10.21 3 8 3C5.79 3 4 4.79 4 7C4 9.21 5.79 11 8 11Z" />

            <path d="M8 13C4.69 13 2 15.69 2 19V21H14V19C14 15.69 11.31 13 8 13Z" />

            <path d="M16 13C14.95 13 13.96 13.27 13.09 13.74C14.88 15.06 16 17.13 16 19.5V21H22V19C22 15.69 19.31 13 16 13Z" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z" />

            <path d="M4 22C4 17.58 7.58 14 12 14C16.42 14 20 17.58 20 22H4Z" />
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
            />

            <path
                d="M4 7L12 13L20 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4 20L8.5 19L19 8.5C20.1 7.4 20.1 5.6 19 4.5C17.9 3.4 16.1 3.4 15 4.5L4.5 15L4 20Z"
                fill="currentColor"
            />
        </svg>
    );
}

function DeleteIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5 7H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />

            <path
                d="M9 7V4H15V7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />

            <path
                d="M7 7L8 20H16L17 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />

            <path
                d="M10 11V16M14 11V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

// =============================
// APP
// =============================

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
    // GET DANH SÁCH SINH VIÊN
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
    // NHẬP DỮ LIỆU
    // =============================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((oldData) => ({
            ...oldData,
            [name]: value
        }));
    };

    // =============================
    // THÊM / CẬP NHẬT
    // =============================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.studentId.trim() ||
            !formData.name.trim() ||
            !formData.email.trim()
        ) {
            alert("Vui lòng nhập đầy đủ thông tin!");

            return;
        }

        setLoading(true);

        try {
            let response;

            // =============================
            // CẬP NHẬT SINH VIÊN
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
            // THÊM SINH VIÊN
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
            // SAU KHI CẬP NHẬT
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
            // SAU KHI THÊM
            // =============================

            else {
                setStudents((oldStudents) => [
                    ...oldStudents,
                    data
                ]);

                alert("Thêm sinh viên thành công!");
            }

            // =============================
            // RESET FORM
            // =============================

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
    // SỬA SINH VIÊN
    // =============================

    const handleEdit = (student) => {
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
    // HỦY SỬA
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
    // XÓA SINH VIÊN
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

    // =============================
    // GIAO DIỆN
    // =============================

    return (
        <div className="container">

            {/* =============================
                HEADER
            ============================= */}

            <header className="page-header">

                <div className="graduation-icon">
                    <GraduationIcon />
                </div>

                <div className="header-content">

                    <h1>
                        Quản lý sinh viên
                    </h1>

                    <div className="title-line"></div>

                </div>

            </header>


            {/* =============================
                FORM THÊM SINH VIÊN
            ============================= */}

            <form onSubmit={handleSubmit}>

                <h2 className="section-title">

                    <UsersIcon />

                    <span>
                        {editingId
                            ? "Cập nhật sinh viên"
                            : "Thêm sinh viên"}
                    </span>

                </h2>


                {/* MSSV */}

                <div className="input-wrapper">

                    <UserIcon />

                    <input
                        type="text"
                        name="studentId"
                        placeholder="MSSV"
                        value={formData.studentId}
                        onChange={handleChange}
                    />

                </div>


                {/* HỌ TÊN */}

                <div className="input-wrapper">

                    <UserIcon />

                    <input
                        type="text"
                        name="name"
                        placeholder="Họ tên"
                        value={formData.name}
                        onChange={handleChange}
                    />

                </div>


                {/* EMAIL */}

                <div className="input-wrapper">

                    <EmailIcon />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                </div>


                {/* BUTTON */}

                <button
                    type="submit"
                    disabled={loading}
                    className="submit-button"
                >

                    {loading ? (
                        "Đang xử lý..."
                    ) : editingId ? (
                        <>
                            <EditIcon />
                            Cập nhật
                        </>
                    ) : (
                        <>
                            <PlusIcon />
                            Thêm sinh viên
                        </>
                    )}

                </button>


                {/* HỦY SỬA */}

                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="cancel-button"
                    >
                        Hủy sửa
                    </button>
                )}

            </form>


            {/* =============================
                DANH SÁCH SINH VIÊN
            ============================= */}

            <section className="student-list">

                <h2 className="section-title list-title">

                    <UsersIcon />

                    <span>
                        Danh sách sinh viên
                    </span>

                </h2>


                {students.length === 0 ? (

                    <p className="empty-message">
                        Chưa có sinh viên nào.
                    </p>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        STT
                                    </th>

                                    <th>
                                        MSSV
                                    </th>

                                    <th>
                                        Họ tên
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Thao tác
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {students.map(
                                    (student, index) => (

                                        <tr
                                            key={student._id}
                                        >

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

                                            <td className="action-cell">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(student)
                                                    }
                                                    className="edit-button"
                                                >

                                                    <EditIcon />

                                                    Sửa

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            student._id
                                                        )
                                                    }
                                                    className="delete-button"
                                                >

                                                    <DeleteIcon />

                                                    Xóa

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}

export default App;