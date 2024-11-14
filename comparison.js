import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import BreadcrumbList from "../../component/BreadCrumbs/BreadCrumbsList";
import SearchBar from "../../component/SearchBar/SearchBar";
import { getAuth, signOut, getIdToken } from "firebase/auth";
import { EditOutlined, SettingFilled } from "@ant-design/icons"; // Import your icon
import { Popover, Checkbox } from "antd";
import { Modal } from "antd"; // Import Modal for pop-ups

import {
  BarChart,
  Bar,
  Rectangle,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./ReportLists.css";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Grid,
} from '@mui/material';

const Comparison = () => {
  const navigate = useNavigate();
  const [reportList, setReportList] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]); // Track selected reports
  const [selectAll, setSelectAll] = useState(false); // State for "Select All" checkbox
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);
  const [companyName, setCompanyName] = useState(null);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [originalReportList, setOriginalReportList] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // New state
  const [data, setData] = useState([]);
  const [formattedData, setFormattedData] = useState([]); // Separate formatted data

  const [firstDate, setFirstDate] = useState(null);
  const [secondDate, setSecondDate] = useState(null);
  const [dimension, setDimension] = useState(null);

  const [isExpanded, setIsExpanded] = useState(false); // State for expanded options
  const [selectedDimension, setSelectedDimension] = useState(""); // Selected dimension
  const [dimensions] = useState(["channel_group", "page_path"]); // Example dimensions

  // Saved date state for the table
  const [savedFirstDate, setSavedFirstDate] = useState("");
  const [savedSecondDate, setSavedSecondDate] = useState("");
  // State for hiding/showing charts
  const [showTotalUsersChart, setShowTotalUsersChart] = useState(true);
  const [showViewsChart, setShowViewsChart] = useState(true);
  const [showEventCountsChart, setShowEventCountsChart] = useState(true);

  const [weeklyData, setWeeklyData] = useState([]); // State to hold weekly data

  const [pagePaths, setPagePaths] = useState([]); // State to hold page paths data

  const [showCharts, setShowCharts] = useState({
    totalUsers: true,
    views: true,
    eventCounts: true,
  });

  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCompanyName = async () => {
    try {
      const token = localStorage.getItem("authToken"); // or document.cookie if using cookies

      // const user = getAuth().currentUser;

      // if (token) {
      const response = await fetch("/api/get-company-name", {
        // New backend endpoint
        headers: {
          credentials: "include", // Important: Include cookies in the request
          // "Content-Type": "application/json",
          // Authorization: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyName(data.companyName);
      } else {
        console.log("Failed to fetch company name.");
        // Handle the error appropriately (e.g., display an error message to the user)
      }
      // }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };

  async function postComparison(dimensionArray, secondDate) {
    try {
      const response = await fetch("/query-comparison", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: "enhanced-ecommerce-16cef",
          datasetId: "analytics_180168674",
          dimensions: dimensionArray, // Pass dimension as array
          date: secondDate, // Pass secondDate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.error("Failed to fetch latest acquisition");
      }
    } catch (error) {
      console.error("Error fetching latest acquisition:", error);
    }
  }

  async function postComparisonLast(dimensionArray, firstDate) {
    try {
      const response = await fetch("/query-comparison-last", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: "enhanced-ecommerce-16cef",
          datasetId: "analytics_180168674",
          dimensions: dimensionArray, // Pass dimension as array
          date: firstDate, // Pass secondDate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.error("Failed to fetch latest acquisition");
      }
    } catch (error) {
      console.error("Error fetching latest acquisition:", error);
    }
  }

  useEffect(() => {
    // Validate token every 3 minutes (180000 milliseconds)
    // postComparisonLast();
    // postComparison();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch("/api/getComparisonData", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
      });

      const result = await response.json();
      result.sort((a, b) => parseInt(a.time) - parseInt(b.time)); // Sort by time in ascending order
      setData(result);

      if (result.length > 0) {
        const firstEntry = result.find(
          (row) => row.firstDate && row.secondDate
        ); // Find a valid entry
        if (firstEntry) {
          setSavedFirstDate(firstEntry.secondDate?.date || "Unknown Date 1"); // Save the selected first date
          setSavedSecondDate(firstEntry.firstDate?.date || "Unknown Date 2"); // Save the selected second date

          setSelectedDimension(
            firstEntry.secondDate?.dimension || "Unknown Date 2"
          );
        }
      }

      const newFormattedData = data.map((entry) => ({
        time: entry.time,
        total_users_first: entry.firstDate?.total_users || 0,
        total_users_second: entry.secondDate?.total_users || 0,
        [`views - ${firstDate}`]: entry.firstDate?.views || 0,
        [`views - ${secondDate}`]: entry.secondDate?.views || 0,
        [`event_count - ${firstDate}`]: entry.firstDate?.event_count || 0,
        [`event_count - ${secondDate}`]: entry.secondDate?.event_count || 0,
      }));
      setFormattedData(newFormattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const PostWeeklySummary = async () => {
    try {
      const response = await fetch("/api/save-weekly-data", {
        // New backend endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include", // Important: Include cookies in the request
          // "Content-Type": "application/json",
          // Authorization: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.log("Failed to fetch company name.");
        // Handle the error appropriately (e.g., display an error message to the user)
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };

  const PostTopPagePath = async () => {
    try {
      const response = await fetch("/query-page-paths", {
        // New backend endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Content-Type": "application/json",
          // Authorization: token,
        },
        body: JSON.stringify({
          projectId: "enhanced-ecommerce-16cef",
          datasetId: "analytics_180168674",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.log("Failed to fetch company name.");
        // Handle the error appropriately (e.g., display an error message to the user)
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };

  useEffect(() => {
    // const intervalId = setInterval(fetchData, 3000);
    // return () => clearInterval(intervalId);
    // PostTopPagePath();
  }, []);

  const fetchWeeklySummary = async () => {
    try {
      const response = await fetch("/api/get-weekly-data", {
        // New backend endpoint
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          credentials: "include", // Important: Include cookies in the request
          // "Content-Type": "application/json",
          // Authorization: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWeeklyData(data); // Save the weekly data to state
      } else {
        console.log("Failed to fetch company name.");
        // Handle the error appropriately (e.g., display an error message to the user)
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };

  const fetcTopPageTitle = async () => {
    try {
      const response = await fetch("/api/get-page-paths", {
        // New backend endpoint
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          credentials: "include", // Important: Include cookies in the request
          // "Content-Type": "application/json",
          // Authorization: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPagePaths(data); // Set the fetched data to state
      } else {
        console.log("Failed to fetch company name.");
        // Handle the error appropriately (e.g., display an error message to the user)
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };

  useEffect(() => {
    fetcTopPageTitle();
  });

  useEffect(() => {
    // const intervalId = setInterval(fetchData, 3000);
    // return () => clearInterval(intervalId);
    // PostWeeklySummary();
  }, []);

  useEffect(() => {
    // const intervalId = setInterval(fetchData, 3000);
    // return () => clearInterval(intervalId);
    fetchWeeklySummary();
  }, []);

  useEffect(() => {
    fetchData();
    // const intervalId = setInterval(fetchData, 3000);
    // return () => clearInterval(intervalId);
  }, []);

  const validateToken = async () => {
    try {
      const response = await fetch("/api/validate-token", {
        headers: {
          credentials: "include", // Important: Include cookies in the request
          // "Content-Type": "application/json",
          // Authorization: localStorage.getItem("authToken"), // Retrieve token from localStorage or context
        },
      });

      if (response.status === 401) {
        // Token is invalid or expired
        // localStorage.removeItem("authToken"); // Clear token from localStorage
        navigate("/login");

        // navigate("/login");
      }
      // else if (response.ok) {
      //   console.log("Token is valid");
      // }
    } catch (error) {
      console.error("Error validating token:", error);
    }
  };

  useEffect(() => {
    // Validate token every 3 minutes (180000 milliseconds)
    const intervalId = setInterval(validateToken, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Validate token every 3 minutes (180000 milliseconds)
    validateToken();
  }, []);

  useEffect(() => {
    fetchCompanyName();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const getYesterday = new Date();
  getYesterday.setDate(getYesterday.getDate() - 1);
  const yesterday = getYesterday.toISOString().split("T")[0];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDimensionChange = (event) => {
    setSelectedDimension(event.target.value);
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    setSecondDate(today); // Automatically set secondDate
  }, []); // Empty dependency array to run only once when the component mounts

  const handleSave = async () => {
    if (!selectedDimension || !firstDate) {
      alert("Please select a dimension and first date.");
      return;
    }

    setIsLoading(true); // Start loading

    setSavedFirstDate(firstDate); // Save the selected first date
    setSavedSecondDate(secondDate); // Save the selected second date

    const dimensionArray = [selectedDimension]; // Wrap dimension in an array

    // Format the date to include current time (hour, minute, second, millisecond)
    const formatDateWithCurrentTime = (date) => {
      const currentTime = new Date();
      const currentHour = currentTime.getUTCHours();
      const currentMinute = currentTime.getUTCMinutes();
      const currentSecond = currentTime.getUTCSeconds();
      const currentMillisecond = currentTime.getUTCMilliseconds();

      const formattedDate = new Date(date);
      formattedDate.setUTCHours(
        currentHour,
        currentMinute,
        currentSecond,
        currentMillisecond
      );

      return formattedDate.toISOString(); // Return the date in ISO string format
    };

    // Convert dates with the current time
    const formattedFirstDate = formatDateWithCurrentTime(firstDate);
    const formattedSecondDate = formatDateWithCurrentTime(secondDate);

    postComparisonLast(dimensionArray, formattedFirstDate).catch((error) => {
      console.error("Error during comparison process:", error);
    });

    postComparison(dimensionArray, formattedSecondDate)
      .then(() => fetchData())
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error("Error during comparison process:", error);
      });

    // await postComparisonLast(dimensionArray, formattedFirstDate); // Pass dimensionArray and formatted firstDate
    // await postComparison(dimensionArray, formattedSecondDate); // Pass dimensionArray and formatted secondDate
    // await fetchData();
    // setIsLoading(false); // Stop loading
  };

  // Function to toggle chart visibility
  const handleChartToggle = (chartType) => {
    switch (chartType) {
      case "totalUsers":
        setShowTotalUsersChart(!showTotalUsersChart);
        break;
      case "views":
        setShowViewsChart(!showViewsChart);
        break;
      case "eventCounts":
        setShowEventCountsChart(!showEventCountsChart);
        break;
      default:
        break;
    }
  };

  const chartOptionsContent = (
    <div>
      <Checkbox
        checked={showTotalUsersChart}
        onChange={() => handleChartToggle("totalUsers")}
      >
        Total Users
      </Checkbox>
      <Checkbox
        checked={showViewsChart}
        onChange={() => handleChartToggle("views")}
      >
        Views
      </Checkbox>
      <Checkbox
        checked={showEventCountsChart}
        onChange={() => handleChartToggle("eventCounts")}
      >
        Event Counts
      </Checkbox>
    </div>
  );

  const pagePathsColumns = [
    {
      title: "Page Title",
      dataIndex: "page_title",
      key: "page_title",
      sorter: (a, b) => a.page_title.localeCompare(b.page_title), // Sort by page title alphabetically
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      sorter: (a, b) => a.views - b.views, // Sort by views numerically
    },
  ];

  // console.log(data);

  return (
    <div>
      <div className="comparison-header">
        <h2>
          Comparison Table
          <EditOutlined className="edit-icon" onClick={toggleExpand} />{" "}
        </h2>
        {/* Popover for chart toggle */}

        <Popover
          content={chartOptionsContent}
          title="Show Chart"
          trigger="click"
          placement="bottomRight" // Adjust the placement as needed
        >
          <SettingFilled
            style={{ fontSize: "24px", cursor: "pointer" }}
            className="chart-icon"
          />
        </Popover>
      </div>

      {isExpanded && (
        <div className="options-container">
          <div className="dimension-select">
            <label htmlFor="dimensions">Choose a Dimension:</label>
            <select
              id="dimensions"
              value={selectedDimension}
              onChange={handleDimensionChange}
            >
              <option value="">Select...</option>
              {dimensions.map((dimension, index) => (
                <option key={index} value={dimension}>
                  {dimension}
                </option>
              ))}
            </select>
          </div>

          <div className="date-select">
            <label htmlFor="firstDate">From:</label>
            <input
              type="date"
              id="firstDate"
              value={firstDate || ""}
              max={yesterday}
              onChange={(e) => setFirstDate(e.target.value)}
            />
          </div>

          {/* <div className="date-select">
            <label htmlFor="secondDate">To:</label>
            <input
              type="date"
              id="secondDate"
              value={secondDate}
              max={today}
              min={today}
              readOnly
              // disabled={!firstDate} // Disable until firstDate is selected
              // onChange={(e) => setSecondDate(e.target.value)}
            />
          </div> */}

          <div className="date-select">
            <label htmlFor="secondDate">To:</label>
          </div>

          <div style={{
             border: '1px solid #ccc',
             borderRadius: '5px',
             padding: '10px',
             minWidth: '80px',
             display: 'inline-block',
             fontSize: '16px',
             textAlign: 'center',
          }}>
            <span>Today</span>
          </div>


          {/* Save Button */}
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {isLoading ? (
        <p>Loading data, please wait...</p>
      ) : data.length === 0 ? (
        <p>No data available to display.</p>
      ) : (
        <div>
          {/* Mini Line Charts */}
          {/* Line Charts Section */}
          <div className="charts-container">
            {showTotalUsersChart && (
              <div className="large-chart">
                <br />
                <h3>Total Users</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data}>
                    <Legend />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="secondDate.total_users"
                      stroke="#82ca9d"
                      stackId="0"
                      fill="#82ca9d"
                      name={`${savedFirstDate}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="firstDate.total_users"
                      stroke="#8884d8"
                      stackId="1"
                      fill="#8884d8"
                      name={`Today`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Half Size Charts */}
            <div className="half-charts">
              {showViewsChart && (
                <div className="half-chart">
                  <br />
                  <h3>Views</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <Legend />
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="secondDate.views"
                        fill="#82ca9d"
                        activeBar={<Rectangle fill="gold" stroke="purple" />}
                        name={`${savedFirstDate}`}
                      />
                      <Bar
                        dataKey="firstDate.views"
                        fill="#8884d8"
                        activeBar={<Rectangle fill="pink" stroke="blue" />}
                        name={`Today`}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {showEventCountsChart && (
                <div className="half-chart">
                  <br />
                  <h3>Event Counts</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                      <Legend />
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="secondDate.event_count"
                        stroke="#82ca9d"
                        name={`${savedFirstDate}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="firstDate.event_count"
                        stroke="#8884d8"
                        name={`Today`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
          {/* table section */}
          <table className="comparison-table">
            <thead>
              <tr>
                <th rowSpan="2">Time</th>
                <th colSpan="2">Total Users</th>
                <th colSpan="2">Views</th>
                <th colSpan="2">Event Counts</th>
              </tr>
              <tr>
                {/* <th>{firstDate || "Unknown Date 1"}</th>
                <th>{secondDate || "Unknown Date 2"}</th>
                <th>{firstDate || "Unknown Date 1"}</th>
                <th>{secondDate || "Unknown Date 2"}</th>
                <th>{firstDate || "Unknown Date 1"}</th>
                <th>{secondDate || "Unknown Date 2"}</th> */}
                <th>{savedFirstDate || "Unknown Date 1"}</th>
                <th>{"Today"}</th>
                <th>{savedFirstDate || "Unknown Date 1"}</th>
                <th>{"Today"}</th>
                <th>{savedFirstDate || "Unknown Date 1"}</th>
                <th>{"Today"}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.time}</td>
                  <td style={{ backgroundColor: "rgba(130, 202, 157, 0.2)" }}>
                    {row.secondDate?.total_users || 0}
                  </td>
                  <td style={{ backgroundColor: "rgba(136, 132, 216, 0.2)" }}>
                    {row.firstDate?.total_users || 0}
                  </td>
                  <td style={{ backgroundColor: "rgba(130, 202, 157, 0.2)" }}>
                    {row.secondDate?.views || 0}
                  </td>
                  <td style={{ backgroundColor: "rgba(136, 132, 216, 0.2)" }}>
                    {row.firstDate?.views || 0}
                  </td>
                  <td style={{ backgroundColor: "rgba(130, 202, 157, 0.2)" }}>
                    {row.secondDate?.event_count || 0}
                  </td>
                  <td style={{ backgroundColor: "rgba(136, 132, 216, 0.2)" }}>
                    {row.firstDate?.event_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="weekly-summary-container">
            <Grid container spacing={3} alignItems="stretch">
              {/* Tabel Summary */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Typography variant="h5">
                    User Activity on Last Week
                    {weeklyData.length > 0 && (
                      <Typography variant="subtitle1" component="p">
                        <strong>
                          {weeklyData[0].represent_date
                            ? `${weeklyData[0].represent_date}`
                            : "No date available"}
                        </strong>
                      </Typography>
                    )}
                  </Typography>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Total Users</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weeklyData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2}>No data available</TableCell>
                        </TableRow>
                      ) : (
                        weeklyData.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>{entry.day}</TableCell>
                            <TableCell>{entry.total_users.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>

              {/* Tabel Views by Page Title */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Views by Page Title
                    </Typography>
                    <Tooltip title={pagePaths[0]?.page_title || "No data available"} arrow>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 15,
                          cursor: "pointer",
                        }}
                      >
                        #1 {pagePaths[0]?.page_title || "No data available"}
                      </Typography>
                    </Tooltip>
                    <Typography variant="h6" color="text.secondary">
                      {pagePaths[0]?.views
                        ? `${pagePaths[0].views.toLocaleString()} views`
                        : "No data available"}
                    </Typography>
                  </Box>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Page Title</TableCell>
                        <TableCell align="right">Views</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagePaths.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2}>No data available</TableCell>
                        </TableRow>
                      ) : (
                        pagePaths.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Tooltip title={entry.page_title} arrow>
                                <Typography
                                  sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 15,
                                    cursor: "pointer",
                                  }}
                                >
                                  {entry.page_title}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                              {entry.views.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </div>
      )}

      <style jsx>{`
        .weekly-summary-container {
          margin: 20px 0;
        }

        .tables-container {
          display: flex; /* Use flexbox to align tables side by side */
          justify-content: space-between; /* Space tables apart */
          gap: 20px; /* Add gap between tables */
        }

        .weekly-table-container,
        .page-paths-table {
          width: 48%; /* Set width of each table */
          border: 1px solid #ddd; /* Add a light border */
        }

        .weekly-table,
        .page-paths-table table {
          width: 100%; /* Ensure tables fill their containers */
          border-collapse: collapse; /* Remove space between cells */
        }

        .weekly-table th,
        .weekly-table td,
        .page-paths-table th,
        .page-paths-table td {
          padding: 12px 15px; /* Padding for better spacing */
          text-align: left; /* Align text to the left */
          border-bottom: 1px solid #ddd; /* Border between rows */
        }

        .weekly-table th,
        .page-paths-table th {
          background-color: #f5f5f5; /* Light background for headers */
          font-weight: bold; /* Bold text for headers */
        }

        .weekly-table tr:nth-child(even),
        .page-paths-table tr:nth-child(even) {
          background-color: #f9f9f9; /* Light gray for alternate rows */
        }

        .weekly-table tr:hover,
        .page-paths-table tr:hover {
          background-color: #f1f1f1; /* Darker background on hover */
        }

        .weekly-table td,
        .page-paths-table td {
          font-size: 16px; /* Set font size */
          color: #333; /* Darker text color for contrast */
        }

        .weekly-summary-container h2,
        .weekly-summary-container h3 {
          margin-bottom: 10px; /* Space below titles */
          font-size: 18px; /* Increase font size for titles */
          color: #555; /* Gray color for titles */
          padding: 12px 15px; /* Padding for titles */
        }
        .chart-icon {
          font-size: 16px; /* Make the icon smaller */
          cursor: pointer; /* Keep the pointer cursor */
          position: absolute;
          right: 10px; /* Align it to the far right */
          top: 10px; /* Adjust the top position as needed */
        }

        .comparison-header {
          position: relative; /* Ensure the icon is positioned relative to the header */
        }
        .chart-toggle {
          display: flex;
          flex-direction: column; /* Align checkboxes vertically */
          margin: 10px 0; /* Reduced spacing above and below */
        }

        /* Checkbox label styles */
        .chart-toggle label {
          display: flex;
          align-items: center; /* Center the checkbox and label vertically */
          margin-bottom: 5px; /* Reduced space between each checkbox */
          cursor: pointer; /* Change cursor to pointer on hover */
          font-size: 14px; /* Smaller font size */
        }

        /* Hide the default checkbox */
        .chart-toggle input[type="checkbox"] {
          display: none; /* Hide the checkbox input */
        }

        /* Custom toggle switch styles */
        .chart-toggle input[type="checkbox"] + span {
          width: 28px; /* Reduced width of the toggle switch */
          height: 16px; /* Reduced height of the toggle switch */
          background-color: #ccc; /* Background color when off */
          border-radius: 16px; /* Rounded corners */
          position: relative; /* Positioning context for the toggle circle */
          transition: background-color 0.3s; /* Smooth background transition */
        }

        /* Circle for the toggle switch */
        .chart-toggle input[type="checkbox"] + span::before {
          content: "";
          width: 12px; /* Reduced width of the toggle circle */
          height: 12px; /* Reduced height of the toggle circle */
          background-color: white; /* Circle color */
          border-radius: 50%; /* Round shape for the circle */
          position: absolute; /* Absolute positioning */
          top: 50%; /* Center vertically */
          left: 2px; /* Position from the left */
          transform: translateY(-50%); /* Center the circle */
          transition: transform 0.3s; /* Smooth movement transition */
        }

        /* Change background color and move circle when checked */
        .chart-toggle input[type="checkbox"]:checked + span {
          background-color: #4caf50; /* Background color when on */
        }

        .chart-toggle input[type="checkbox"]:checked + span::before {
          transform: translateY(-50%) translateX(12px); /* Move the circle to the right */
        }

        /* Optional styles for headings */
        .chart-toggle h3 {
          font-size: 16px; /* Smaller heading font size */
          margin-bottom: 5px; /* Reduced spacing below the heading */
        }
        .save-button {
          background-color: #007bff; /* Button color */
          color: white; /* Text color */
          padding: 10px 20px; /* Button padding */
          border: none; /* Remove border */
          border-radius: 5px; /* Rounded corners */
          cursor: pointer; /* Pointer cursor on hover */
          font-size: 16px; /* Font size */
          transition: background-color 0.3s; /* Smooth background color transition */
        }

        .save-button:hover {
          background-color: #0056b3; /* Darker blue on hover */
        }

        .save-button:disabled {
          background-color: #007bff; /* Keep the background color the same */
          color: rgba(
            255,
            255,
            255,
            0.6
          ); /* Change text color to indicate disabled state */
          cursor: not-allowed; /* Change cursor to indicate button is disabled */
        }

        .edit-icon {
          margin-left: 10px;
          font-size: 20px;
          cursor: pointer;
          color: #007bff;
          transition: color 0.3s, transform 0.2s;
        }

        .edit-icon:hover {
          color: #0056b3;
          transform: scale(1.1);
        }

        .options-container {
          display: flex;
          flex-direction: row; /* Stack items vertically */
          gap: 15px; /* Space between items */
          margin-bottom: 20px; /* Space below the options container */
        }
        .dimension-select,
        .date-select {
          display: flex;
          align-items: center; /* Center align the label and input */
          gap: 10px; /* Space between label and input */
        }

        .dimension-select label,
        .date-select label {
          font-weight: bold;
          color: #333;
        }

        select,
        input[type="date"] {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          outline: none;
          transition: border-color 0.3s;
          font-size: 16px;
        }

        select:focus,
        input[type="date"]:focus {
          border-color: #007bff;
          box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .comparison-table th,
        .comparison-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }

        .comparison-table th {
          background-color: #f2f2f2;
        }
        .charts-container {
          display: flex;
          flex-direction: column;
          gap: 20px; /* Add space between large and half charts */
        }

        .large-chart {
          width: 100%; /* Full width for the large chart */
        }

        .half-charts {
          display: flex;
          gap: 20px; /* Space between half charts */
        }

        .half-chart {
          flex: 1; /* Make both half charts take equal space */
          min-width: 0; /* Prevent overflow */
        }
      `}</style>
    </div>
  );
};

export default Comparison;
