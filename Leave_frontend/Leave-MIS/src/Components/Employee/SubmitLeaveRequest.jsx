import React, { useState, useEffect } from "react";
import { Send, Calendar, AlertCircle, Info } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import EmployeeSidebar from "../Navbar/EmployeeSidebar";
import "../CSS/EmployeeDashboard.css";
import Header from "./EmployeeDashboard";
import API from "../../utils/apiUtils";

// Get leave type display name
const getLeaveTypeDisplayName = (leaveType) => {
  const displayNames = {
    CASUAL: "Casual Leave",
    SICK: "Medical Leave",
    DUTY: "Duty Leave",
    MATERNITY: "Maternity Leave",
    SHORT: "Short Leave",
    HALF_DAY: "Half Day Leave",
  };
  return displayNames[leaveType] || leaveType.replace("_", " ");
};

// Get proper title based on gender and marital status
const getTitle = (gender, maritalStatus) => {
  if (gender === "MALE") {
    return "Mr.";
  } else if (gender === "FEMALE") {
    if (maritalStatus === "MARRIED") {
      return "Mrs.";
    } else {
      return "Miss";
    }
  }
  return "";
};

// Format officer name with title
const formatOfficerName = (officer) => {
  const title = getTitle(officer.gender, officer.maritalStatus);
  return `${title} ${officer.name} - ${officer.designation}`;
};

// Define leave types
const leaveTypes = ["CASUAL", "SICK", "DUTY", "MATERNITY", "HALF_DAY", "SHORT"];

// Define payment options for maternity leave
const maternityPaymentOptions = [
  { value: "FULL_PAY", label: "Full Pay - 84 Days" },
  { value: "HALF_PAY", label: "Half Pay - 84 Days" },
  { value: "NO_PAY", label: "No Pay - 84 Days" },
];

const SubmitLeaveRequest = ({
  showMessage: propShowMessage,
  refreshData = () => {},
}) => {
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  // Responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [actingOfficers, setActingOfficers] = useState([]);
  const [supervisingOfficers, setSupervisingOfficers] = useState([]);
  const [approvalOfficers, setApprovalOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [workingDaysInfo, setWorkingDaysInfo] = useState(null);

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "",
    actingOfficerEmail: "",
    supervisingOfficerEmail: "",
    approvalOfficerEmail: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    halfDayPeriod: "MORNING",
    reason: "",
    maternityLeaveType: "FULL_PAY",
  });

  const today = new Date().toISOString().split("T")[0];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Message handling
  const showMessage = (message, isError = false) => {
    if (propShowMessage) {
      propShowMessage(message, isError);
    } else {
      if (isError) {
        setError(message);
        setSuccess("");
      } else {
        setSuccess(message);
        setError("");
      }
      setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const user = await API.get(`/employee/me`);
      setCurrentUser(user);
      if (user.department) {
        fetchDepartmentOfficers(user.department, user.email);
      }
    } catch (err) {
      showMessage("Failed to fetch user", true);
      console.error(err);
    }
  };

  // Fetch department officers
  const fetchDepartmentOfficers = async (department, currentUserEmail) => {
    try {
      console.log("Fetching officers for department:", department);

      const response = await API.get(
        `/employee/officers/department/${encodeURIComponent(
          department
        )}/exclude/${encodeURIComponent(currentUserEmail)}`
      );

      console.log("Officers response:", response);

      // Set acting and supervising officers (same department)
      const actingList = Array.isArray(response.acting)
        ? response.acting.sort((a, b) => a.name.localeCompare(b.name))
        : [];

      setActingOfficers(actingList);
      setSupervisingOfficers(actingList);

      // Set approval officers (same department + ALL department)
      const approvalList = Array.isArray(response.approval)
        ? response.approval
            .filter(
              (officer, index, self) =>
                index === self.findIndex((o) => o.email === officer.email)
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        : [];

      setApprovalOfficers(approvalList);

      console.log(
        `Found ${actingList.length} acting officers, ${approvalList.length} approval officers`
      );
    } catch (err) {
      console.error("Error fetching department officers:", err);
      showMessage("Failed to fetch department officers", true);
      setActingOfficers([]);
      setSupervisingOfficers([]);
      setApprovalOfficers([]);
    }
  };

  // Calculate working days when dates change
  const calculateWorkingDays = async (startDate, endDate) => {
    if (!startDate || !endDate) {
      setWorkingDaysInfo(null);
      return;
    }

    try {
      const response = await API.post("/leaves/calculate-working-days", {
        startDate,
        endDate,
      });

      console.log("Working days calculation:", response);
      setWorkingDaysInfo(response);
    } catch (error) {
      console.error("Error calculating working days:", error);
      setWorkingDaysInfo(null);
    }
  };

  // Effect to calculate working days when dates change
  useEffect(() => {
    if (
      leaveForm.startDate &&
      leaveForm.endDate &&
      leaveForm.leaveType &&
      leaveForm.leaveType !== "SHORT" &&
      leaveForm.leaveType !== "HALF_DAY" &&
      leaveForm.leaveType !== "MATERNITY"
    ) {
      calculateWorkingDays(leaveForm.startDate, leaveForm.endDate);
    } else {
      setWorkingDaysInfo(null);
    }
  }, [leaveForm.startDate, leaveForm.endDate, leaveForm.leaveType]);

  // Handle Leave Submission
  const handleSubmitLeave = async () => {
    // Basic validation
    if (
      !leaveForm.leaveType ||
      !leaveForm.approvalOfficerEmail ||
      !leaveForm.startDate
    ) {
      showMessage(
        "Please fill all required fields (Leave Type, Approval Officer, Start Date)!",
        true
      );
      return;
    }

    // Specific validation for different leave types
    if (leaveForm.leaveType === "HALF_DAY") {
      if (!leaveForm.halfDayPeriod) {
        showMessage("Please select half day period!", true);
        return;
      }
    } else if (leaveForm.leaveType === "SHORT") {
      if (!leaveForm.startTime || !leaveForm.endTime) {
        showMessage("Please provide start and end time for short leave!", true);
        return;
      }
      if (leaveForm.startTime >= leaveForm.endTime) {
        showMessage("End time must be after start time!", true);
        return;
      }
    } else if (leaveForm.leaveType === "MATERNITY") {
      if (!leaveForm.maternityLeaveType) {
        showMessage("Please select payment type for maternity leave!", true);
        return;
      }
    } else {
      if (!leaveForm.endDate) {
        showMessage("Please provide end date!", true);
        return;
      }
      if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
        showMessage("End date cannot be before start date!", true);
        return;
      }
    }

    // Officer uniqueness validation
    const selectedOfficers = [
      leaveForm.actingOfficerEmail,
      leaveForm.supervisingOfficerEmail,
      leaveForm.approvalOfficerEmail,
    ].filter((email) => email && email !== "" && email !== "NONE");

    const uniqueOfficers = new Set(selectedOfficers);
    if (selectedOfficers.length !== uniqueOfficers.size) {
      showMessage("Please select different officers for each role!", true);
      return;
    }

    try {
      setLoading(true);

      // Prepare the request data
      let requestData = {
        leaveType: leaveForm.leaveType,
        actingOfficerEmail:
          leaveForm.actingOfficerEmail === "NONE"
            ? null
            : leaveForm.actingOfficerEmail,
        supervisingOfficerEmail:
          leaveForm.supervisingOfficerEmail === "NONE"
            ? null
            : leaveForm.supervisingOfficerEmail,
        approvalOfficerEmail: leaveForm.approvalOfficerEmail,
        startDate: leaveForm.startDate,
        reason: leaveForm.reason || "",
      };

      // Set end date and additional fields based on leave type
      if (leaveForm.leaveType === "HALF_DAY") {
        requestData.endDate = leaveForm.startDate;
        requestData.halfDayPeriod = leaveForm.halfDayPeriod;
        requestData.isHalfDay = true;
      } else if (leaveForm.leaveType === "SHORT") {
        requestData.endDate = leaveForm.startDate;
        requestData.startTime = leaveForm.startTime;
        requestData.endTime = leaveForm.endTime;
      } else if (leaveForm.leaveType === "MATERNITY") {
        requestData.maternityLeaveType = leaveForm.maternityLeaveType;
      } else {
        requestData.endDate = leaveForm.endDate;
      }

      // Validate the leave request before submission
      try {
        let validation;

        if (leaveForm.leaveType === "SHORT") {
          validation = await API.post("/leaves/validate-short-leave", {
            date: leaveForm.startDate,
          });
        } else if (leaveForm.leaveType === "HALF_DAY") {
          validation = await API.post("/leaves/validate-half-day", {
            date: leaveForm.startDate,
            halfDayPeriod: leaveForm.halfDayPeriod,
          });
        } else if (leaveForm.leaveType === "MATERNITY") {
          validation = await API.post("/leaves/validate-maternity", {
            startDate: leaveForm.startDate,
            maternityLeaveType: leaveForm.maternityLeaveType,
          });
        } else {
          validation = await API.post("/leaves/validate", {
            leaveType: leaveForm.leaveType,
            startDate: leaveForm.startDate,
            endDate: leaveForm.endDate,
            isHalfDay: false,
          });
        }

        if (!validation.valid) {
          showMessage(validation.message, true);
          return;
        }
      } catch (validationError) {
        showMessage(validationError.message || "Leave validation failed", true);
        return;
      }

      // Submit the leave request
      const response = await API.post("/leaves/submit", requestData);
      showMessage(
        typeof response === "string"
          ? response.replace("✅ ", "")
          : "Leave submitted successfully"
      );

      // Reset form
      setLeaveForm({
        leaveType: "",
        actingOfficerEmail: "",
        supervisingOfficerEmail: "",
        approvalOfficerEmail: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        halfDayPeriod: "MORNING",
        reason: "",
        maternityLeaveType: "FULL_PAY",
      });

      // Clear working days info
      setWorkingDaysInfo(null);

      // Refresh data
      refreshData();
    } catch (err) {
      showMessage(err.message || "Failed to submit leave request", true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    if (!token || !email) return;

    console.log("Initializing SubmitLeaveRequest component...");
    fetchCurrentUser();
  }, [email, token]);

  // Authentication check
  if (!token || !email) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-warning d-flex align-items-center shadow-lg border-0 rounded-4">
              <AlertCircle size={20} className="me-3 text-warning" />
              <div>
                <h6 className="mb-1 fw-semibold">Authentication Required</h6>
                <p className="mb-0">Please log in to submit a leave request.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #88b3df 0%, #b5cce7 50%, #75e3c0 100%)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Fixed Navbar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1030,
        }}
      >
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Desktop Sidebar */}
      <div
        className="d-none d-lg-block position-fixed"
        style={{
          top: "60px",
          left: 0,
          bottom: 0,
          width: "280px",
          zIndex: 1020,
        }}
      >
        <EmployeeSidebar sidebarOpen={true} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <EmployeeSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      {/* Main Content Area */}
      <div
        className="main-content"
        style={{
          marginLeft: isMobile ? "0" : "280px",
          marginTop: "60px",
          minHeight: "calc(100vh - 60px)",
          padding: isMobile ? "15px" : "20px",
        }}
      >
        {/* Header Component */}
        <Header />

        {/* Submit Leave Form Section */}
        <div className={`container-fluid ${isMobile ? "px-0" : "px-4"} py-4`}>
          {/* Success & Error Messages */}
          {success && (
            <div className="alert alert-success d-flex align-items-center shadow-lg border-0 rounded-4 mb-4">
              <div>
                <strong>Success!</strong> {success}
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center shadow-lg border-0 rounded-4 mb-4">
              <AlertCircle size={20} className="me-3" />
              <div>
                <strong>Error!</strong> {error}
              </div>
            </div>
          )}

          <div className="glass-card rounded-4 mb-4">
            <div className={`p-${isMobile ? "3" : "4"}`}>
              <div
                className={`d-flex align-items-center mb-4 ${
                  isMobile ? "flex-column text-center" : ""
                }`}
              >
                <Send size={isMobile ? 20 : 24} className="text-primary me-3" />
                <h5
                  className={`mb-0 fw-bold text-dark ${isMobile ? "mt-2" : ""}`}
                  style={{ fontSize: isMobile ? "1.1rem" : "1.25rem" }}
                >
                  SUBMIT LEAVE REQUEST
                </h5>
              </div>

              <div
                className="alert alert-info d-flex align-items-start border-0 rounded-3 mb-4"
                style={{ backgroundColor: "#e3f2fd" }}
              >
                <Info
                  size={20}
                  className="me-3 mt-1 text-primary flex-shrink-0"
                />
                <div>
                  <h6
                    className={`mb-3 fw-semibold text-primary ${
                      isMobile ? "fs-6" : ""
                    }`}
                  >
                    Officer Selection Guidelines
                  </h6>

                  {/* Approval Flow */}
                  <div
                    className={`mb-3 p-2 bg-white rounded-2 ${
                      isMobile ? "text-center" : "align-items-center"
                    }`}
                  >
                    <small
                      className="text-muted fw-semibold mx-2"
                      style={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                    >
                      Leave Approval Process:
                    </small>
                    <small
                      className="text-muted mx-2"
                      style={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }}
                    >
                      {isMobile ? (
                        <>Acting → Supervising → Approval Officer</>
                      ) : (
                        <>
                          Acting Officer → Supervising Officer → Approval
                          Officer
                        </>
                      )}
                    </small>
                  </div>

                  <div className="mb-2">
                    <p
                      className="mb-1 text-dark"
                      style={{ fontSize: isMobile ? "12px" : "14px" }}
                    >
                      • You may select <strong>"None"</strong> for Acting or
                      Supervising Officer if they are not required. Your leave
                      will be routed directly to the next available approver.
                    </p>
                  </div>

                  <div className="mb-3">
                    <p
                      className="mb-1 text-danger fw-semibold"
                      style={{ fontSize: isMobile ? "12px" : "14px" }}
                    >
                      • If an Acting Officer or Supervising Officer is required
                      for your leave, you must select them. Otherwise, your
                      leave request will be rejected.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitLeave();
                }}
              >
                <div className="row g-3">
                  {/* Leave Type */}
                  <div
                    className={`${isMobile ? "col-12" : "col-lg-4 col-md-6"}`}
                  >
                    <label
                      className="form-label fw-semibold text-dark"
                      style={{ fontSize: isMobile ? "13px" : "14px" }}
                    >
                      Leave Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select border-0 shadow-sm rounded-3"
                      style={{
                        height: isMobile ? "40px" : "45px",
                        fontSize: isMobile ? "13px" : "14px",
                      }}
                      value={leaveForm.leaveType}
                      onChange={(e) => {
                        setLeaveForm({
                          ...leaveForm,
                          leaveType: e.target.value,
                        });
                        setWorkingDaysInfo(null);
                      }}
                      required
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes.map((type) => (
                        <option key={type} value={type}>
                          {getLeaveTypeDisplayName(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Acting Officer */}
                  <div
                    className={`${isMobile ? "col-12" : "col-lg-4 col-md-6"}`}
                  >
                    <label
                      className="form-label fw-semibold text-dark"
                      style={{ fontSize: isMobile ? "13px" : "14px" }}
                    >
                      Acting Officer{" "}
                      <span className="text-muted">(Optional)</span>
                    </label>
                    <select
                      className="form-select border-0 shadow-sm rounded-3"
                      style={{
                        height: isMobile ? "40px" : "45px",
                        fontSize: isMobile ? "13px" : "14px",
                      }}
                      value={leaveForm.actingOfficerEmail}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          actingOfficerEmail: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        {actingOfficers.length === 0
                          ? "Loading..."
                          : "Select Acting Officer"}
                      </option>
                      <option value="NONE">None</option>
                      {actingOfficers.map((officer) => (
                        <option key={officer.email} value={officer.email}>
                          {formatOfficerName(officer)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Supervising Officer */}
                  <div
                    className={`${isMobile ? "col-12" : "col-lg-4 col-md-6"}`}
                  >
                    <label
                      className="form-label fw-semibold text-dark"
                      style={{ fontSize: isMobile ? "13px" : "14px" }}
                    >
                      Supervising Officer{" "}
                      <span className="text-muted">(Optional)</span>
                    </label>
                    <select
                      className="form-select border-0 shadow-sm rounded-3"
                      style={{
                        height: isMobile ? "40px" : "45px",
                        fontSize: isMobile ? "13px" : "14px",
                      }}
                      value={leaveForm.supervisingOfficerEmail}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          supervisingOfficerEmail: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        {supervisingOfficers.length === 0
                          ? "Loading..."
                          : "Select Supervising Officer"}
                      </option>
                      <option value="NONE">None</option>
                      {supervisingOfficers
                        .filter(
                          (officer) =>
                            officer.email !== leaveForm.actingOfficerEmail
                        )
                        .map((officer) => (
                          <option key={officer.email} value={officer.email}>
                            {formatOfficerName(officer)}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Approval Officer */}
                  <div
                    className={`${isMobile ? "col-12" : "col-lg-4 col-md-6"}`}
                  >
                    <label
                      className="form-label fw-semibold text-dark"
                      style={{ fontSize: isMobile ? "13px" : "14px" }}
                    >
                      Approval Officer <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select border-0 shadow-sm rounded-3"
                      style={{
                        height: isMobile ? "40px" : "45px",
                        fontSize: isMobile ? "13px" : "14px",
                      }}
                      value={leaveForm.approvalOfficerEmail}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          approvalOfficerEmail: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">
                        {approvalOfficers.length === 0
                          ? "Loading..."
                          : "Select Approval Officer"}
                      </option>
                      {approvalOfficers
                        .filter(
                          (officer) =>
                            officer.email !== leaveForm.actingOfficerEmail &&
                            officer.email !== leaveForm.supervisingOfficerEmail
                        )
                        .map((officer) => (
                          <option key={officer.email} value={officer.email}>
                            {formatOfficerName(officer)}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div
                    className={`${isMobile ? "col-12" : "col-lg-4 col-md-6"}`}
                  >
                    <label
                      className="form-label fw-semibold text-dark"
                      style={{ fontSize: isMobile ? "13px" : "14px" }}
                    >
                      Start Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control border-0 shadow-sm rounded-3"
                      style={{
                        height: isMobile ? "40px" : "45px",
                        fontSize: isMobile ? "13px" : "14px",
                      }}
                      value={leaveForm.startDate}
                      min={today}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          startDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* End Date - Only for regular leaves */}
                  {leaveForm.leaveType &&
                    leaveForm.leaveType !== "SHORT" &&
                    leaveForm.leaveType !== "HALF_DAY" &&
                    leaveForm.leaveType !== "MATERNITY" && (
                      <div
                        className={`${
                          isMobile ? "col-12" : "col-lg-4 col-md-6"
                        }`}
                      >
                        <label
                          className="form-label fw-semibold text-dark"
                          style={{ fontSize: isMobile ? "13px" : "14px" }}
                        >
                          End Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control border-0 shadow-sm rounded-3"
                          style={{
                            height: isMobile ? "40px" : "45px",
                            fontSize: isMobile ? "13px" : "14px",
                          }}
                          value={leaveForm.endDate}
                          min={leaveForm.startDate || today}
                          onChange={(e) =>
                            setLeaveForm({
                              ...leaveForm,
                              endDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    )}

                  {/* Working Days Breakdown - Only for regular leaves */}
                  {workingDaysInfo && workingDaysInfo.workingDays >= 0 && (
                    <div className="col-12">
                      <div
                        className="alert border-0 rounded-3 d-flex align-items-start"
                        style={{
                          backgroundColor: "#e8f5e9",
                          borderLeft: "4px solid #4caf50",
                        }}
                      >
                        <Calendar
                          size={20}
                          className="me-3 mt-1 flex-shrink-0"
                          style={{ color: "#4caf50" }}
                        />
                        <div className="w-100">
                          <h6
                            className="mb-2 fw-bold"
                            style={{
                              color: "#2e7d32",
                              fontSize: isMobile ? "13px" : "14px",
                            }}
                          >
                            Leave Duration Breakdown
                          </h6>
                          <div
                            className="row g-2"
                            style={{ fontSize: isMobile ? "12px" : "13px" }}
                          >
                            <div className="col-6 col-md-3">
                              <div className="bg-white rounded-2 p-2 text-center">
                                <small className="text-muted d-block">
                                  Total Days
                                </small>
                                <strong className="fs-5 text-primary">
                                  {workingDaysInfo.totalDays}
                                </strong>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="bg-white rounded-2 p-2 text-center">
                                <small className="text-muted d-block">
                                  Working Days
                                </small>
                                <strong
                                  className="fs-5"
                                  style={{ color: "#4caf50" }}
                                >
                                  {workingDaysInfo.workingDays}
                                </strong>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="bg-white rounded-2 p-2 text-center">
                                <small className="text-muted d-block">
                                  Weekends
                                </small>
                                <strong className="fs-5 text-secondary">
                                  {workingDaysInfo.weekendDays}
                                </strong>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="bg-white rounded-2 p-2 text-center">
                                <small className="text-muted d-block">
                                  Holidays
                                </small>
                                <strong className="fs-5 text-warning">
                                  {workingDaysInfo.publicHolidays}
                                </strong>
                              </div>
                            </div>
                          </div>
                          <div
                            className="mt-3 p-2 bg-white rounded-2"
                            style={{ fontSize: isMobile ? "11px" : "12px" }}
                          >
                            <strong style={{ color: "#2e7d32" }}>
                              ✓ Only {workingDaysInfo.workingDays} working day
                              {workingDaysInfo.workingDays !== 1
                                ? "s"
                                : ""}{" "}
                              will be deducted from your leave balance
                            </strong>
                            <br />
                            <small className="text-muted">
                              Weekends and public holidays are automatically
                              excluded
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Half Day Period - Only for HALF_DAY */}
                  {leaveForm.leaveType === "HALF_DAY" && (
                    <div
                      className={`${isMobile ? "col-12" : "col-lg-4 col-md-6"}`}
                    >
                      <label
                        className="form-label fw-semibold text-dark"
                        style={{ fontSize: isMobile ? "13px" : "14px" }}
                      >
                        Half Day Period <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select border-0 shadow-sm rounded-3"
                        style={{
                          height: isMobile ? "40px" : "45px",
                          fontSize: isMobile ? "13px" : "14px",
                        }}
                        value={leaveForm.halfDayPeriod}
                        onChange={(e) =>
                          setLeaveForm({
                            ...leaveForm,
                            halfDayPeriod: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="MORNING">Morning (1st Half)</option>
                        <option value="AFTERNOON">Afternoon (2nd Half)</option>
                      </select>
                    </div>
                  )}

                  {/* Short Leave Time Selection */}
                  {leaveForm.leaveType === "SHORT" && (
                    <>
                      <div
                        className={`${
                          isMobile ? "col-12" : "col-lg-4 col-md-6"
                        }`}
                      >
                        <label
                          className="form-label fw-semibold text-dark"
                          style={{ fontSize: isMobile ? "13px" : "14px" }}
                        >
                          Start Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="form-control border-0 shadow-sm rounded-3"
                          style={{
                            height: isMobile ? "40px" : "45px",
                            fontSize: isMobile ? "13px" : "14px",
                          }}
                          value={leaveForm.startTime}
                          onChange={(e) =>
                            setLeaveForm({
                              ...leaveForm,
                              startTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div
                        className={`${
                          isMobile ? "col-12" : "col-lg-4 col-md-6"
                        }`}
                      >
                        <label
                          className="form-label fw-semibold text-dark"
                          style={{ fontSize: isMobile ? "13px" : "14px" }}
                        >
                          End Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="form-control border-0 shadow-sm rounded-3"
                          style={{
                            height: isMobile ? "40px" : "45px",
                            fontSize: isMobile ? "13px" : "14px",
                          }}
                          value={leaveForm.endTime}
                          onChange={(e) =>
                            setLeaveForm({
                              ...leaveForm,
                              endTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Maternity Payment Type - Only for MATERNITY leave */}
                  {leaveForm.leaveType === "MATERNITY" && (
                    <div
                      className={`${isMobile ? "col-12" : "col-lg-4 col-md-6"}`}
                    >
                      <label
                        className="form-label fw-semibold text-dark"
                        style={{ fontSize: isMobile ? "13px" : "14px" }}
                      >
                        Payment Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select border-0 shadow-sm rounded-3"
                        style={{
                          height: isMobile ? "40px" : "45px",
                          fontSize: isMobile ? "13px" : "14px",
                        }}
                        value={leaveForm.maternityLeaveType}
                        onChange={(e) =>
                          setLeaveForm({
                            ...leaveForm,
                            maternityLeaveType: e.target.value,
                          })
                        }
                        required
                      >
                        {maternityPaymentOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Reason for Leave */}
                  <div className="col-12">
                    <label
                      className="form-label fw-semibold text-dark"
                      style={{ fontSize: isMobile ? "13px" : "14px" }}
                    >
                      Reason for Leave
                    </label>
                    <textarea
                      className="form-control border-0 shadow-sm rounded-3"
                      rows="3"
                      style={{ fontSize: isMobile ? "13px" : "14px" }}
                      placeholder="Please provide the reason for your leave request..."
                      value={leaveForm.reason}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          reason: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                      style={{
                        fontSize: isMobile ? "14px" : "16px",
                        fontWeight: "600",
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={18} className="me-2" />
                          Submit Leave Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitLeaveRequest;
