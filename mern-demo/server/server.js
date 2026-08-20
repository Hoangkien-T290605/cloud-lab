const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();

// =============================
// Middleware
// =============================
app.use(cors());
app.use(express.json());

// =============================
// Port
// =============================
const PORT = process.env.PORT || 5000;

// =============================
// Câu 22: API kiểm tra Backend
// =============================
app.get("/api/hello", (req, res) => {
    res.json({
        message: "Backend MERN đang hoạt động!"
    });
});

// =============================
// Câu 36: GET danh sách sinh viên
// =============================
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find();

        res.status(200).json(students);

    } catch (error) {
        console.error("Lỗi GET students:", error);

        res.status(500).json({
            message: "Không thể tải danh sách sinh viên!",
            error: error.message
        });
    }
});

// =============================
// Câu 37: POST thêm sinh viên
// =============================
app.post("/api/students", async (req, res) => {
    try {
        const { studentId, name, email } = req.body;

        // Kiểm tra dữ liệu
        if (!studentId || !name || !email) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ MSSV, họ tên và email!"
            });
        }

        const student = await Student.create({
            studentId,
            name,
            email
        });

        res.status(201).json(student);

    } catch (error) {
        console.error("Lỗi POST students:", error);

        res.status(500).json({
            message: "Thêm sinh viên thất bại!",
            error: error.message
        });
    }
});

// =============================
// Câu 38 + Câu 61:
// PUT cập nhật sinh viên
// =============================
app.put("/api/students/:id", async (req, res) => {
    try {
        console.log("=================================");
        console.log("PUT UPDATE STUDENT");
        console.log("ID:", req.params.id);
        console.log("DATA:", req.body);

        // Kiểm tra MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "ID sinh viên không hợp lệ!"
            });
        }

        const { studentId, name, email } = req.body;

        // Kiểm tra dữ liệu
        if (!studentId || !name || !email) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin sinh viên!"
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                studentId: studentId,
                name: name,
                email: email
            },
            {
                new: true,
                runValidators: true
            }
        );

        // Không tìm thấy sinh viên
        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên!"
            });
        }

        console.log("Cập nhật thành công:", student);

        res.status(200).json(student);

    } catch (error) {
        console.error("LỖI PUT:", error);

        res.status(500).json({
            message: "Cập nhật sinh viên thất bại!",
            error: error.message
        });
    }
});

// =============================
// Câu 39 + Câu 62:
// DELETE xóa sinh viên
// =============================
app.delete("/api/students/:id", async (req, res) => {
    try {
        console.log("=================================");
        console.log("DELETE STUDENT");
        console.log("ID:", req.params.id);

        // Kiểm tra ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "ID sinh viên không hợp lệ!"
            });
        }

        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        // Không tìm thấy sinh viên
        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên!"
            });
        }

        console.log("Xóa thành công:", student);

        res.status(200).json({
            message: "Xóa sinh viên thành công!",
            student: student
        });

    } catch (error) {
        console.error("Lỗi DELETE:", error);

        res.status(500).json({
            message: "Xóa sinh viên thất bại!",
            error: error.message
        });
    }
});

// =============================
// Kết nối MongoDB Atlas
// =============================
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("=================================");
        console.log("MongoDB Atlas kết nối thành công!");
        console.log("=================================");
    })
    .catch((error) => {
        console.error("=================================");
        console.error("LỖI KẾT NỐI MONGODB:");
        console.error(error.message);
        console.error("=================================");
    });

// =============================
// Khởi động Server
// =============================
app.listen(PORT, () => {
    console.log("=================================");
    console.log(`Server đang chạy tại port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log("=================================");
});