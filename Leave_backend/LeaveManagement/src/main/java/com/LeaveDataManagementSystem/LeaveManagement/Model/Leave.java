package com.LeaveDataManagementSystem.LeaveManagement.Model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

@Document(collection = "leaves")
public class Leave {
    @Id
    private String id;

    private String employeeEmail;
    private String employeeName;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;

    // NEW FIELD: Store actual working days for the leave
    private int workingDays = 0;  // Number of working days (excluding weekends & holidays)
    private int totalDays = 0;    // Total calendar days
    private int weekendDays = 0;  // Number of weekends
    private int publicHolidays = 0; // Number of public holidays

    // NEW FIELDS FOR SHORT LEAVE AND HALF DAY
    private boolean isShortLeave = false;
    private boolean isHalfDay = false;
    private String halfDayPeriod; // "MORNING" or "AFTERNOON"
    private LocalTime shortLeaveStartTime; // For short leaves
    private LocalTime shortLeaveEndTime;   // For short leaves

    // NEW: Maternity leave specific fields
    private boolean isMaternityLeave = false;
    private String maternityLeaveType; // "FULL_PAY", "HALF_PAY", "NO_PAY"
    private boolean isMaternityEndDateSet = false;
    private String maternityAdditionalDetails;

    private String actingOfficerEmail;
    private String actingOfficerName;
    private String supervisingOfficerEmail;
    private String supervisingOfficerName;
    private String approvalOfficerEmail;
    private String approvalOfficerName;

    private LeaveStatus status = LeaveStatus.PENDING_ACTING_OFFICER;
    private ActingOfficerStatus actingOfficerStatus = ActingOfficerStatus.PENDING;
    private SupervisingOfficerStatus supervisingOfficerStatus;
    private ApprovalOfficerStatus approvalOfficerStatus = ApprovalOfficerStatus.PENDING;

    private String actingOfficerComments;
    private String supervisingOfficerComments;
    private String approvalOfficerComments;

    private LocalDateTime actingOfficerApprovedAt;
    private LocalDateTime supervisingOfficerApprovedAt;
    private LocalDateTime approvalOfficerApprovedAt;

    private boolean isCancelled = false;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    private String cancellationReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public Leave() {
    }

    // Regular leave constructor
    public Leave(String employeeEmail, String employeeName, String leaveType,
                 LocalDate startDate, LocalDate endDate, String reason,
                 String actingOfficerEmail, String actingOfficerName,
                 String supervisingOfficerEmail, String supervisingOfficerName,
                 String approvalOfficerEmail, String approvalOfficerName) {
        this.employeeEmail = employeeEmail;
        this.employeeName = employeeName;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.actingOfficerEmail = actingOfficerEmail;
        this.actingOfficerName = actingOfficerName;
        this.supervisingOfficerEmail = supervisingOfficerEmail;
        this.supervisingOfficerName = supervisingOfficerName;
        this.approvalOfficerEmail = approvalOfficerEmail;
        this.approvalOfficerName = approvalOfficerName;
        this.createdAt = LocalDateTime.now();
    }

    // Half-day leave constructor
    public Leave(String employeeEmail, String employeeName, String leaveType,
                 LocalDate date, String halfDayPeriod, String reason,
                 String actingOfficerEmail, String actingOfficerName,
                 String supervisingOfficerEmail, String supervisingOfficerName,
                 String approvalOfficerEmail, String approvalOfficerName) {
        this.employeeEmail = employeeEmail;
        this.employeeName = employeeName;
        this.leaveType = leaveType;
        this.startDate = date;
        this.endDate = date;
        this.isHalfDay = true;
        this.halfDayPeriod = halfDayPeriod;
        this.reason = reason;
        this.actingOfficerEmail = actingOfficerEmail;
        this.actingOfficerName = actingOfficerName;
        this.supervisingOfficerEmail = supervisingOfficerEmail;
        this.supervisingOfficerName = supervisingOfficerName;
        this.approvalOfficerEmail = approvalOfficerEmail;
        this.approvalOfficerName = approvalOfficerName;
        this.createdAt = LocalDateTime.now();
    }

    // Short leave constructor
    public Leave(String employeeEmail, String employeeName, LocalDate date,
                 LocalTime startTime, LocalTime endTime, String reason,
                 String actingOfficerEmail, String actingOfficerName,
                 String supervisingOfficerEmail, String supervisingOfficerName,
                 String approvalOfficerEmail, String approvalOfficerName) {
        this.employeeEmail = employeeEmail;
        this.employeeName = employeeName;
        this.leaveType = "SHORT_LEAVE";
        this.startDate = date;
        this.endDate = date;
        this.isShortLeave = true;
        this.shortLeaveStartTime = startTime;
        this.shortLeaveEndTime = endTime;
        this.reason = reason;
        this.actingOfficerEmail = actingOfficerEmail;
        this.actingOfficerName = actingOfficerName;
        this.supervisingOfficerEmail = supervisingOfficerEmail;
        this.supervisingOfficerName = supervisingOfficerName;
        this.approvalOfficerEmail = approvalOfficerEmail;
        this.approvalOfficerName = approvalOfficerName;
        this.createdAt = LocalDateTime.now();
    }

    // Maternity leave constructor
    public Leave(String employeeEmail, String employeeName, LocalDate startDate,
                 String maternityLeaveType, String reason,
                 String actingOfficerEmail, String actingOfficerName,
                 String supervisingOfficerEmail, String supervisingOfficerName,
                 String approvalOfficerEmail, String approvalOfficerName) {
        this.employeeEmail = employeeEmail;
        this.employeeName = employeeName;
        this.leaveType = "MATERNITY";
        this.startDate = startDate;
        this.endDate = null;
        this.isMaternityLeave = true;
        this.maternityLeaveType = maternityLeaveType;
        this.isMaternityEndDateSet = false;
        this.reason = reason;
        this.actingOfficerEmail = actingOfficerEmail;
        this.actingOfficerName = actingOfficerName;
        this.supervisingOfficerEmail = supervisingOfficerEmail;
        this.supervisingOfficerName = supervisingOfficerName;
        this.approvalOfficerEmail = approvalOfficerEmail;
        this.approvalOfficerName = approvalOfficerName;
        this.createdAt = LocalDateTime.now();
    }

    // Method to calculate effective days for entitlement deduction
    public double getEffectiveDays() {
        if (isShortLeave) {
            return 0;
        } else if (isHalfDay) {
            return 0.5;
        } else if (isMaternityLeave && !isMaternityEndDateSet) {
            return 0;
        } else {
            // Return working days instead of total days
            return workingDays > 0 ? workingDays :
                    (startDate != null && endDate != null ? ChronoUnit.DAYS.between(startDate, endDate) + 1 : 0);
        }
    }

    // NEW: Get display-friendly duration string
    public String getDurationDisplay() {
        if (isShortLeave) {
            return "Short Leave";
        } else if (isHalfDay) {
            return "0.5 day (Half Day)";
        } else if (workingDays > 0) {
            return workingDays + " working day" + (workingDays != 1 ? "s" : "") +
                    " (" + totalDays + " total)";
        } else if (startDate != null && endDate != null) {
            long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
            return days + " day" + (days != 1 ? "s" : "");
        }
        return "N/A";
    }

    // NEW: Getters and Setters for working days fields
    public int getWorkingDays() { return workingDays; }
    public void setWorkingDays(int workingDays) { this.workingDays = workingDays; }

    public int getTotalDays() {
        if (totalDays > 0) {
            return totalDays;
        } else if (startDate != null && endDate != null) {
            return (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
        return 0;
    }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }

    public int getWeekendDays() { return weekendDays; }
    public void setWeekendDays(int weekendDays) { this.weekendDays = weekendDays; }

    public int getPublicHolidays() { return publicHolidays; }
    public void setPublicHolidays(int publicHolidays) { this.publicHolidays = publicHolidays; }

    // Method to get maternity leave duration description
    public String getMaternityLeaveDuration() {
        if (!isMaternityLeave) return null;
        switch (maternityLeaveType) {
            case "FULL_PAY": return "Full Pay - 84 Days";
            case "HALF_PAY": return "Half Pay - 84 Days";
            case "NO_PAY": return "No Pay - 84 Days";
            default: return "Maternity Leave - 84 Days";
        }
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        if (this.createdAt == null || createdAt != null) {
            this.createdAt = createdAt;
        }
    }

    public LocalDateTime getCreatedAt() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        return this.createdAt;
    }

    public boolean canBeCancelled() {
        if (isCancelled ||
                status == LeaveStatus.REJECTED_BY_ACTING_OFFICER ||
                status == LeaveStatus.REJECTED_BY_SUPERVISING_OFFICER ||
                status == LeaveStatus.REJECTED_BY_APPROVAL_OFFICER) {
            return false;
        }
        LocalDate today = LocalDate.now();
        return startDate.isAfter(today);
    }

    // Standard getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeEmail() { return employeeEmail; }
    public void setEmployeeEmail(String employeeEmail) { this.employeeEmail = employeeEmail; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public boolean isShortLeave() { return isShortLeave; }
    public void setShortLeave(boolean shortLeave) { isShortLeave = shortLeave; }

    public boolean isHalfDay() { return isHalfDay; }
    public void setHalfDay(boolean halfDay) { isHalfDay = halfDay; }

    public String getHalfDayPeriod() { return halfDayPeriod; }
    public void setHalfDayPeriod(String halfDayPeriod) { this.halfDayPeriod = halfDayPeriod; }

    public LocalTime getShortLeaveStartTime() { return shortLeaveStartTime; }
    public void setShortLeaveStartTime(LocalTime shortLeaveStartTime) { this.shortLeaveStartTime = shortLeaveStartTime; }

    public LocalTime getShortLeaveEndTime() { return shortLeaveEndTime; }
    public void setShortLeaveEndTime(LocalTime shortLeaveEndTime) { this.shortLeaveEndTime = shortLeaveEndTime; }

    public boolean isMaternityLeave() { return isMaternityLeave; }
    public void setMaternityLeave(boolean maternityLeave) { isMaternityLeave = maternityLeave; }

    public String getMaternityLeaveType() { return maternityLeaveType; }
    public void setMaternityLeaveType(String maternityLeaveType) { this.maternityLeaveType = maternityLeaveType; }

    public boolean isMaternityEndDateSet() { return isMaternityEndDateSet; }
    public void setMaternityEndDateSet(boolean maternityEndDateSet) { this.isMaternityEndDateSet = maternityEndDateSet; }

    public String getMaternityAdditionalDetails() { return maternityAdditionalDetails; }
    public void setMaternityAdditionalDetails(String maternityAdditionalDetails) { this.maternityAdditionalDetails = maternityAdditionalDetails; }

    public String getActingOfficerEmail() { return actingOfficerEmail; }
    public void setActingOfficerEmail(String actingOfficerEmail) { this.actingOfficerEmail = actingOfficerEmail; }

    public String getActingOfficerName() { return actingOfficerName; }
    public void setActingOfficerName(String actingOfficerName) { this.actingOfficerName = actingOfficerName; }

    public String getSupervisingOfficerEmail() { return supervisingOfficerEmail; }
    public void setSupervisingOfficerEmail(String supervisingOfficerEmail) { this.supervisingOfficerEmail = supervisingOfficerEmail; }

    public String getSupervisingOfficerName() { return supervisingOfficerName; }
    public void setSupervisingOfficerName(String supervisingOfficerName) { this.supervisingOfficerName = supervisingOfficerName; }

    public String getApprovalOfficerEmail() { return approvalOfficerEmail; }
    public void setApprovalOfficerEmail(String approvalOfficerEmail) { this.approvalOfficerEmail = approvalOfficerEmail; }

    public String getApprovalOfficerName() { return approvalOfficerName; }
    public void setApprovalOfficerName(String approvalOfficerName) { this.approvalOfficerName = approvalOfficerName; }

    public LeaveStatus getStatus() { return status; }
    public void setStatus(LeaveStatus status) { this.status = status; }

    public ActingOfficerStatus getActingOfficerStatus() { return actingOfficerStatus; }
    public void setActingOfficerStatus(ActingOfficerStatus actingOfficerStatus) { this.actingOfficerStatus = actingOfficerStatus; }

    public SupervisingOfficerStatus getSupervisingOfficerStatus() { return supervisingOfficerStatus; }
    public void setSupervisingOfficerStatus(SupervisingOfficerStatus supervisingOfficerStatus) { this.supervisingOfficerStatus = supervisingOfficerStatus; }

    public ApprovalOfficerStatus getApprovalOfficerStatus() { return approvalOfficerStatus; }
    public void setApprovalOfficerStatus(ApprovalOfficerStatus approvalOfficerStatus) { this.approvalOfficerStatus = approvalOfficerStatus; }

    public String getActingOfficerComments() { return actingOfficerComments; }
    public void setActingOfficerComments(String actingOfficerComments) { this.actingOfficerComments = actingOfficerComments; }

    public String getSupervisingOfficerComments() { return supervisingOfficerComments; }
    public void setSupervisingOfficerComments(String supervisingOfficerComments) { this.supervisingOfficerComments = supervisingOfficerComments; }

    public String getApprovalOfficerComments() { return approvalOfficerComments; }
    public void setApprovalOfficerComments(String approvalOfficerComments) { this.approvalOfficerComments = approvalOfficerComments; }

    public LocalDateTime getActingOfficerApprovedAt() { return actingOfficerApprovedAt; }
    public void setActingOfficerApprovedAt(LocalDateTime actingOfficerApprovedAt) { this.actingOfficerApprovedAt = actingOfficerApprovedAt; }

    public LocalDateTime getSupervisingOfficerApprovedAt() { return supervisingOfficerApprovedAt; }
    public void setSupervisingOfficerApprovedAt(LocalDateTime supervisingOfficerApprovedAt) { this.supervisingOfficerApprovedAt = supervisingOfficerApprovedAt; }

    public LocalDateTime getApprovalOfficerApprovedAt() { return approvalOfficerApprovedAt; }
    public void setApprovalOfficerApprovedAt(LocalDateTime approvalOfficerApprovedAt) { this.approvalOfficerApprovedAt = approvalOfficerApprovedAt; }

    public boolean isCancelled() { return isCancelled; }
    public void setCancelled(boolean cancelled) { isCancelled = cancelled; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public double getEffectiveWorkingDays() {
        if (isShortLeave) {
            return 0;
        } else if (isHalfDay) {
            return 0.5;
        } else if (isMaternityLeave && !isMaternityEndDateSet) {
            return 0;
        } else if (workingDays > 0) {
            return workingDays;
        } else if (startDate != null && endDate != null) {
            return ChronoUnit.DAYS.between(startDate, endDate) + 1;
        } else {
            return 0;
        }
    }
}