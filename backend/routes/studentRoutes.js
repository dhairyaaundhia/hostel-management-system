const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { validationResult } = require("express-validator");
const Student = require("../models/student");
const QRCode = require("qrcode");

// @route  GET api/student/:id/qr
// @desc   Generate QR for student
router.get("/:id/qr", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const qrData = {
      id: student._id,
      cms_id: student.cms_id,
      name: student.name,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    res.json({ qrCode, cms_id: student.cms_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET api/student/stats

const {
  registerStudent,
  getStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  csvStudent,
  getStats,
} = require("../controllers/studentController");

// @route  POST api/student/register-student
// @desc   Register student
// @access Public
// router.post(
//   "/register-student",
//   [
//     check("name", "Name is required").not().isEmpty(),
//     check("cms_id", "Gr no. of at least 6 digit is required").isLength(6),
//     check("room_no", "Room number is required").isLength(1),
//     check("batch", "Batch is required").not().isEmpty(),
//     check("dept", "Department is required").not().isEmpty(),
//     check("course", "Course is required").not().isEmpty(),
//     check("email", "Please include a valid email").isEmail(),
//     check("father_name", "Father name is required").not().isEmpty(),
//     check("contact", "Enter a valid contact number").isLength(11),
//     check("address", "Address is required").not().isEmpty(),
//     check("dob", "Date of birth is required").not().isEmpty(),
//     check("cnic", "Enter valid Aadhar no of 12 digits").matches(/^\d{12}$/),
//     check("hostel", "Hostel is required").not().isEmpty(),
//     check(
//       "password",
//       "Please enter a password with 8 or more characters"
//     ).isLength({ min: 8 }),
//   ],
//   registerStudent
// );
router.post(
  "/register-student",
  [
    check("name", "Name is required").not().isEmpty(),
    check("cms_id", "Gr no. of at least 6 digits is required").isLength({
      min: 6,
    }),
    check("room_no", "Room number is required").isLength({ min: 1 }),
    check("batch", "Batch is required").not().isEmpty(),
    check("dept", "Department is required").not().isEmpty(),
    check("course", "Course is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("father_name", "Father name is required").not().isEmpty(),
    check("contact", "Enter a valid contact number").isLength({
      min: 11,
      max: 11,
    }),
    check("address", "Address is required").not().isEmpty(),
    check("dob", "Date of birth is required").not().isEmpty(),
    check("cnic", "Enter valid Aadhar no of 12 digits").matches(/^\d{12}$/),
    check("hostel", "Hostel is required").not().isEmpty(),
    check(
      "password",
      "Please enter a password with 8 or more characters"
    ).isLength({ min: 8 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 👇 Instead of crashing, respond with 400
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  registerStudent
);
// @route  POST api/student/get-student
// @desc   Get student by CMS ID
// @access Public
router.post(
  "/get-student",
  [
    check("isAdmin", "isAdmin is required").notEmpty(),
    check("token", "You donot have a valid token").notEmpty(),
  ],
  getStudent
);

// @route  POST api/student/get-all-students
// @access Public
router.post(
  "/get-all-students",
  [check("hostel", "Hostel is required").not().isEmpty()],
  getAllStudents
);

router.get("/stats", getStats);
// @route  POST api/student/update-student
// @desc   Update student
// @access Public
router.post(
  "/update-student",
  [
    check("cms_id", "CMS ID is required").not().isEmpty(),
    check("room_no", "Room number is required").not().isEmpty(),
    check("batch", "Batch is required").not().isEmpty(),
    check("dept", "Department is required").not().isEmpty(),
    check("course", "Course is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("father_name", "Father name is required").not().isEmpty(),
    check("contact", "Contact is required").not().isEmpty(),
    check("address", "Address is required").not().isEmpty(),
    check("dob", "Date of birth is required").not().isEmpty(),
    check("cnic", "CNIC is required").not().isEmpty(),
    check("user", "User is required").not().isEmpty(),
    check("hostel", "Hostel is required").not().isEmpty(),
  ],
  updateStudent
);

// @route  POST api/student/delete-student
// @desc   Delete student
// @access Public
router.delete(
  "/delete-student",
  [check("id", "Enter a valid ID").not().isEmpty()],
  deleteStudent
);

// @route  POST api/student/csv
// @desc   Get CSV of students
// @access Public
router.post(
  "/csv",
  [check("hostel", "Hostel is required").not().isEmpty()],
  csvStudent
);
// Get single student by ID
router.get("/get-student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
