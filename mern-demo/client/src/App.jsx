import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Lấy danh sách sinh viên từ Backend
  const getStudents = () => {
    fetch("/api/students")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể lấy danh sách sinh viên");
        }

        return response.json();
      })
      .then((data) => {
        setStudents(data);
      })
      .catch((error) => {
        console.error("Lỗi GET:", error);
      });
  };

  // Chạy khi mở trang
  useEffect(() => {
    getStudents();
  }, []);

  // Thêm sinh viên
  const handleSubmit = (e) => {
    e.preventDefault();

    const newStudent = {
      studentId: studentId,
      name: name,
      email: email,
    };

    fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể thêm sinh viên");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Sinh viên đã thêm:", data);

        alert("Thêm sinh viên thành công!");

        // Xóa dữ liệu trong Form
        setStudentId("");
        setName("");
        setEmail("");

        // Tải lại danh sách
        getStudents();
      })
      .catch((error) => {
        console.error("Lỗi POST:", error);
        alert("Thêm sinh viên thất bại!");
      });
  };

  return (
    <div>
      <h1>Quản lý sinh viên</h1>

      <h2>Thêm sinh viên</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>MSSV: </label>

          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Nhập MSSV"
            required
          />
        </div>

        <br />

        <div>
          <label>Họ tên: </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập họ tên"
            required
          />
        </div>

        <br />

        <div>
          <label>Email: </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            required
          />
        </div>

        <br />

        <button type="submit">Thêm sinh viên</button>
      </form>

      <hr />

      <h2>Danh sách sinh viên</h2>

      {students.length === 0 ? (
        <p>Chưa có sinh viên.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>MSSV</th>
              <th>Họ tên</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;