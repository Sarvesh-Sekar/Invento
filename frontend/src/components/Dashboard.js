import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./css/Dashboard.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [shiftContent, setShiftContent] = useState(false);
  const [timeframe, setTimeframe] = useState("weekly");

  // Example data for the bar chart
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Purchases',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Products Added',
        data: [18, 48, 77, 9, 100, 27],
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Graph'
      },
    },
  };

  return (
    <div className="dashboard-layout">
       <Sidebar toggleContentShift={setShiftContent} />
       <div className={`content ${shiftContent ? "shift" : ""}`}>
        <h1>🏠 Dashboard</h1>
        {/* Top Overview Row */}
        <div className="overview-row">
          <div className="card red">
            <h3>Sales</h3>
            <p>$15,000</p>
          </div>
          <div className="card green">
            <h3>Purchases</h3>
            <p>$12,000</p>
          </div>
          <div className="card yellow">
            <h3>Products Added</h3>
            <p>320</p>
          </div>
        </div><br></br>

        {/* Timeframe Selector */}
        <div className="timeframe-select">
          <label htmlFor="timeframe">View:</label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            
          </select>
        </div>
        <br></br>

        {/* Scrollable Containers */}
        <div className="scrollable-container">
          <div className="scroll-box">
            <h3>Recent Orders</h3>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#12345</td>
                  <td>John Doe</td>
                  <td>$200</td>
                </tr>
                <tr>
                  <td>#12346</td>
                  <td>Jane Smith</td>
                  <td>$350</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="scroll-box">
            <h3>Recent Purchases</h3>
            <table>
              <thead>
                <tr>
                  <th>Purchase ID</th>
                  <th>Supplier</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#54321</td>
                  <td>Supplier A</td>
                  <td>$150</td>
                </tr>
                <tr>
                  <td>#54322</td>
                  <td>Supplier B</td>
                  <td>$300</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Graph Section */}
        <div className="graph-container">
          <h3>Performance Graph</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
