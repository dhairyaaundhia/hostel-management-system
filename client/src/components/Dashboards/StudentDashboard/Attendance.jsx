// import { useEffect, useState } from "react";
// import { Doughnut } from "react-chartjs-2";

// function Attendance() {
//   const [totalDays, setTotalDays] = useState(0);
//   const getAttendance = async () => {
//       let student = JSON.parse(localStorage.getItem("student"));
//       const res = await fetch("http://localhost:3000/api/attendance/get", {
//         method: "POST",
//         headers:{
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({student:student._id}),
//       });
//       const data = await res.json();
//       if(data.success){
//         let daysOff = 0;
//         let thisWeek = [];
//         data.attendance.map((day) => {
//           if(day.status === "absent"){
//             daysOff++;
//           }
//           if (new Date(day.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
//             thisWeek.push(
//               { weekdate: new Date(day.date).toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'}), weekday: new Date(day.date).toLocaleDateString('en-PK', {weekday:"long"}), present: day.status === "present" }
//             );
//           }
//         });
//         setDaysOff(daysOff);
//         setThisWeek(thisWeek);
//         setTotalDays(data.attendance.length);
//       }
//       else{
//         // console.log("Error");
//       }
//     };
//   const [daysOff, setDaysOff] = useState(0); //!Fetch from database
//   const [thisWeek, setThisWeek] = useState([]); //!Fetch from database

//   const labels = ["Days off", "Days present"];

//   useEffect(() => {
//     getAttendance();
//   }, [ daysOff.length, thisWeek.length ]);
//   return (
//     <div className="w-full h-screen flex flex-col gap-5 items-center justify-center max-h-screen overflow-y-auto pt-20 md:pt-0 ">
//       <h1 className="text-white font-bold text-5xl">Attendance</h1>
//       <ul className="flex gap-5 text-white text-xl px-5 sm:p-0 text-center">
//         <li>Total Days: {totalDays}</li>
//         <li>Present Days: {totalDays - daysOff}</li>
//         <li>Absent days: {daysOff}</li>
//       </ul>
//       <div className="flex gap-5 flex-wrap max-h-96 justify-center items-center">
//         <Doughnut
//           datasetIdKey="id"
//           data={{
//             labels,
//             datasets: [
//               {
//                 label: "days",
//                 data: [daysOff, totalDays - daysOff],
//                 backgroundColor: ["#F26916", "#1D4ED8"],
//                 barThickness: 40,
//                 borderRadius: 5,
//                 borderColor: "rgba(0,0,0,0)",
//                 hoverOffset: 10,
//               },
//             ],
//           }}
//         />
//         <div className="flow-root bg-neutral-950 rounded-lg shadow-xl w-full mx-5 sm:m-0 sm:w-80 p-5">
//           <p className="text-white text-xl font-bold ">This Week</p>
//           <ul role="list" className="divide-y divide-gray-700">
//             {thisWeek.map((day) => (
//               <li className="py-3 sm:py-4" key={day.weekdate}>
//                 <div className="flex items-center space-x-4">
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium truncate text-white">
//                       {day.weekday} -- {day.weekdate}
//                     </p>
//                     <p className="text-sm truncate text-gray-400">{day.present?"Present":"Absent"}</p>
//                   </div>
//                   <div className="flex flex-col items-center text-base font-semibold text-white">
//                     {day.present ? (
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth={1.5}
//                         stroke="currentColor"
//                         className="w-6 h-6"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M4.5 12.75l6 6 9-13.5"
//                         />
//                       </svg>
//                     ) : (
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth={1.5}
//                         stroke="currentColor"
//                         className="w-6 h-6"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Attendance;
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";

function Attendance() {
  const [totalDays, setTotalDays] = useState(0);
  const [daysOff, setDaysOff] = useState(0);
  const [thisWeek, setThisWeek] = useState([]);
  const [student, setStudent] = useState(null);

  const labels = ["Days off", "Days present"];

  const getAttendance = async (studentId) => {
    try {
      const res = await fetch("http://localhost:3000/api/attendance/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student: studentId }),
      });

      const data = await res.json();
      if (data.success) {
        let daysOffCount = 0;
        let weekly = [];

        data.attendance.forEach((day) => {
          const dayDate = new Date(day.date);
          if (day.status === "absent") daysOffCount++;
          if (dayDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
            weekly.push({
              weekdate: dayDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
              weekday: dayDate.toLocaleDateString("en-PK", { weekday: "long" }),
              present: day.status === "present",
            });
          }
        });

        setDaysOff(daysOffCount);
        setThisWeek(weekly);
        setTotalDays(data.attendance.length);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem("student"));
    if (!storedStudent || !storedStudent._id) {
      setStudent(null);
      return;
    }
    setStudent(storedStudent);
    getAttendance(storedStudent._id);
  }, []);

  if (!student) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white text-xl">
        Student not logged in. Please log in again.
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col gap-5 items-center justify-center max-h-screen overflow-y-auto pt-20 md:pt-0 ">
      <h1 className="text-white font-bold text-5xl">Attendance</h1>
      <ul className="flex gap-5 text-white text-xl px-5 sm:p-0 text-center">
        <li>Total Days: {totalDays}</li>
        <li>Present Days: {totalDays - daysOff}</li>
        <li>Absent Days: {daysOff}</li>
      </ul>

      <div className="flex gap-5 flex-wrap max-h-96 justify-center items-center">
        <Doughnut
          datasetIdKey="id"
          data={{
            labels,
            datasets: [
              {
                label: "Days",
                data: [daysOff, totalDays - daysOff],
                backgroundColor: ["#F26916", "#1D4ED8"],
                barThickness: 40,
                borderRadius: 5,
                borderColor: "rgba(0,0,0,0)",
                hoverOffset: 10,
              },
            ],
          }}
        />

        <div className="flow-root bg-neutral-950 rounded-lg shadow-xl w-full mx-5 sm:m-0 sm:w-80 p-5">
          <p className="text-white text-xl font-bold">This Week</p>
          <ul role="list" className="divide-y divide-gray-700">
            {thisWeek.length === 0 ? (
              <p className="text-gray-400 mt-4">No attendance this week.</p>
            ) : (
              thisWeek.map((day) => (
                <li className="py-3 sm:py-4" key={day.weekdate}>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {day.weekday} — {day.weekdate}
                      </p>
                      <p className="text-sm truncate text-gray-400">
                        {day.present ? "Present" : "Absent"}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-base font-semibold text-white">
                      {day.present ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
