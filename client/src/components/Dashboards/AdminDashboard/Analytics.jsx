import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28FFF",
  "#FF6B6B",
];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/student/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data);
        } else {
          console.error("Failed to load stats", data);
        }
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-white">Loading stats...</div>;
  if (!stats) return <div className="text-white">No stats available</div>;

  // Prepare data
  const pieData = stats.hostels.map((h) => ({
    name: h.name,
    value: h.occupied,
  }));
  const barDept = stats.byDept.map((d) => ({
    name: d._id || "Unknown",
    value: d.count,
  }));
  const barHostels = stats.hostels.map((h) => ({
    name: h.name,
    occupied: h.occupied,
    vacant: h.vacant,
  }));

  return (
    <div className="p-6 bg-neutral-950 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-80 bg-neutral-800 p-4 rounded">
          <h3 className="font-semibold mb-2">Occupied Beds by Hostel</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 bg-neutral-800 p-4 rounded">
          <h3 className="font-semibold mb-2">Students by Department</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barDept}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 bg-neutral-800 p-4 rounded col-span-2">
          <h3 className="font-semibold mb-2">Hostel Occupied vs Vacant</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barHostels}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupied" stackId="a" fill="#0088FE" />
              <Bar dataKey="vacant" stackId="a" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
