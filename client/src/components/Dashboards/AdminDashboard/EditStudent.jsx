// // src/components/Dashboards/AdminDashboard/EditStudent.jsx
// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// function EditStudent() {
//   const { id } = useParams(); // Get student ID from URL
//   const [student, setStudent] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetch(`http://localhost:3000/api/student/get-student/${id}`)
//       .then((res) => res.json())
//       .then((data) => setStudent(data.student));
//   }, [id]);

//   const handleUpdate = async () => {
//     const res = await fetch(
//       "http://localhost:3000/api/student/update-student",
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(student),
//       }
//     );
//     const data = await res.json();
//     if (data.success) {
//       alert("Student updated!");
//       navigate("/admin-dashboard/all-students");
//     } else {
//       alert("Update failed");
//     }
//   };

//   return (
//     <div className="p-5 text-white">
//       <h1 className="text-2xl font-bold mb-4">Edit Student</h1>
//       <input
//         value={student.name || ""}
//         onChange={(e) => setStudent({ ...student, name: e.target.value })}
//         placeholder="Name"
//         className="block border p-2 my-2 w-full bg-black text-white"
//       />
//       <input
//         value={student.cms_id || ""}
//         onChange={(e) => setStudent({ ...student, cms_id: e.target.value })}
//         placeholder="CMS ID"
//         className="block border p-2 my-2 w-full bg-black text-white"
//       />
//       <input
//         value={student.room_no || ""}
//         onChange={(e) => setStudent({ ...student, room_no: e.target.value })}
//         placeholder="Room Number"
//         className="block border p-2 my-2 w-full bg-black text-white"
//       />
//       <button onClick={handleUpdate} className="bg-green-600 p-2 rounded">
//         Update Student
//       </button>
//     </div>
//   );
// }

// export default EditStudent;
// src/components/Dashboards/AdminDashboard/EditStudent.jsx
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EditStudent() {
  const { id } = useParams(); // /edit-student/:id
  const navigate = useNavigate();
  const location = useLocation(); // to read passed state
  const [student, setStudent] = useState(location.state?.student || null);
  const [loading, setLoading] = useState(!student);
  const [error, setError] = useState("");

  // ① If student is not passed via state, fetch it
  useEffect(() => {
    if (!student) {
      fetch(`http://localhost:3000/api/student/get-student/${id}`)
        .then((res) => (res.ok ? res.json() : Promise.reject("404")))
        .then((data) => {
          setStudent(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch failed:", err);
          setError("Couldn’t load student data.");
          setLoading(false);
        });
    }
  }, [id, student]);

  // ② Handle updates
  const save = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/student/update-student",
        {
          method: "POST", // your backend uses POST
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...student,
            _id: student._id,
            cnic: student.aadhaar || student.cnic,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Student updated!");
        navigate("/admin-dashboard/all-students");
      } else {
        alert(data.errors?.[0]?.msg || "Update failed");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  // ③ Render states
  if (loading) return <div className="p-6 text-white">Loading…</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!student)
    return <div className="p-6 text-red-400">No student found.</div>;

  // ④ Normal form
  return (
    <div className="p-6 text-white max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Student</h1>

      <label className="block mb-2">Name</label>
      <input
        value={student.name || ""}
        onChange={(e) => setStudent({ ...student, name: e.target.value })}
        className="w-full p-2 mb-4 bg-neutral-800 border border-neutral-600 rounded"
      />

      <label className="block mb-2">Gr No</label>
      <input
        value={student.cms_id || ""}
        onChange={(e) => setStudent({ ...student, cms_id: e.target.value })}
        className="w-full p-2 mb-4 bg-neutral-800 border border-neutral-600 rounded"
      />

      <label className="block mb-2">Room No</label>
      <input
        value={student.room_no || ""}
        onChange={(e) => setStudent({ ...student, room_no: e.target.value })}
        className="w-full p-2 mb-6 bg-neutral-800 border border-neutral-600 rounded"
      />

      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="px-6 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
