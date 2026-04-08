using FirstAPI.Contexts;
using FirstAPI.Exceptions;
using FirstAPI.Interfaces;
using FirstAPI.Models;
using FirstAPI.Models.DTOs;
using FirstAPI.Services;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace FirstAPI.Tests
{
    public class LeaveRequestServiceTests : IDisposable
    {
        private readonly TimeSheetContext _context;
        private readonly Mock<IRepository<int, LeaveRequest>> _leaveRepoMock;
        private readonly LeaveRequestService _service;

        public LeaveRequestServiceTests()
        {
            var options = new DbContextOptionsBuilder<TimeSheetContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new TimeSheetContext(options);

            _leaveRepoMock = new Mock<IRepository<int, LeaveRequest>>();

            _service = new LeaveRequestService(_leaveRepoMock.Object, _context);
        }

        public void Dispose() => _context.Dispose();

        // ── CreateLeaveRequest Tests ─────────────────────────────────

        [Fact]
        public async Task CreateLeaveRequest_ValidUnpaid_CreatesRequest()
        {
            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);
            _leaveRepoMock.Setup(r => r.Add(It.IsAny<LeaveRequest>()))
                .ReturnsAsync((LeaveRequest l) => { l.LeaveRequestId = 1; return l; });

            var dto = new LeaveRequestCreateDto
            {
                LeaveType = "Unpaid",
                StartDate = DateTime.Today.AddDays(5),
                EndDate   = DateTime.Today.AddDays(7),
                Reason    = "Personal"
            };

            var result = await _service.CreateLeaveRequest(1, dto);

            Assert.NotNull(result);
            Assert.Equal("Unpaid", result.LeaveType);
            Assert.Equal("Pending", result.Status);
        }

        [Fact]
        public async Task CreateLeaveRequest_PastStartDate_ThrowsValidationException()
        {
            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);

            var dto = new LeaveRequestCreateDto
            {
                LeaveType = "Casual",
                StartDate = DateTime.Today.AddDays(-1), // past
                EndDate   = DateTime.Today.AddDays(1)
            };

            await Assert.ThrowsAsync<ValidationException>(
                () => _service.CreateLeaveRequest(1, dto));
        }

        [Fact]
        public async Task CreateLeaveRequest_EndBeforeStart_ThrowsValidationException()
        {
            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);

            var dto = new LeaveRequestCreateDto
            {
                LeaveType = "Casual",
                StartDate = DateTime.Today.AddDays(5),
                EndDate   = DateTime.Today.AddDays(3) // before start
            };

            await Assert.ThrowsAsync<ValidationException>(
                () => _service.CreateLeaveRequest(1, dto));
        }

        [Fact]
        public async Task CreateLeaveRequest_InvalidLeaveType_ThrowsValidationException()
        {
            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);

            var dto = new LeaveRequestCreateDto
            {
                LeaveType = "InvalidType",
                StartDate = DateTime.Today.AddDays(1),
                EndDate   = DateTime.Today.AddDays(2)
            };

            await Assert.ThrowsAsync<ValidationException>(
                () => _service.CreateLeaveRequest(1, dto));
        }

        [Fact]
        public async Task CreateLeaveRequest_OverlappingRequest_ThrowsDuplicateEntityException()
        {
            // Existing pending leave for same period
            _context.LeaveRequests.Add(new LeaveRequest
            {
                LeaveRequestId = 1,
                EmployeeId     = 1,
                LeaveType      = LeaveType.Casual,
                StartDate      = DateTime.Today.AddDays(3),
                EndDate        = DateTime.Today.AddDays(6),
                Status         = LeaveStatus.Pending
            });
            await _context.SaveChangesAsync();

            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);

            var dto = new LeaveRequestCreateDto
            {
                LeaveType = "Unpaid",
                StartDate = DateTime.Today.AddDays(4),
                EndDate   = DateTime.Today.AddDays(5)
            };

            await Assert.ThrowsAsync<DuplicateEntityException>(
                () => _service.CreateLeaveRequest(1, dto));
        }

        [Fact]
        public async Task CreateLeaveRequest_InsufficientBalance_ThrowsValidationException()
        {
            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);

            // Seed a balance with 0 casual days remaining
            _context.LeaveBalances.Add(new LeaveBalance
            {
                EmployeeId  = 1,
                Year        = DateTime.Today.AddDays(5).Year,
                CasualTotal = 10,
                CasualUsed  = 10 // fully used
            });
            await _context.SaveChangesAsync();

            var dto = new LeaveRequestCreateDto
            {
                LeaveType = "Casual",
                StartDate = DateTime.Today.AddDays(5),
                EndDate   = DateTime.Today.AddDays(6)
            };

            await Assert.ThrowsAsync<ValidationException>(
                () => _service.CreateLeaveRequest(1, dto));
        }

        // ── ApproveLeaveRequest Tests ────────────────────────────────

        [Fact]
        public async Task ApproveLeaveRequest_PendingRequest_ChangesToApproved()
        {
            var leave = new LeaveRequest
            {
                LeaveRequestId = 1,
                EmployeeId     = 1,
                LeaveType      = LeaveType.Unpaid,
                StartDate      = DateTime.Today.AddDays(1),
                EndDate        = DateTime.Today.AddDays(2),
                Status         = LeaveStatus.Pending
            };
            _context.LeaveRequests.Add(leave);
            await _context.SaveChangesAsync();

            _leaveRepoMock.Setup(r => r.Get(1)).ReturnsAsync(leave);
            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);
            _leaveRepoMock.Setup(r => r.Update(It.IsAny<LeaveRequest>()))
                .ReturnsAsync((LeaveRequest l) => l);

            var result = await _service.ApproveLeaveRequest(1, "admin");

            Assert.Equal("Approved", result.Status);
            Assert.Equal("admin", result.ReviewedBy);
        }

        [Fact]
        public async Task ApproveLeaveRequest_AlreadyApproved_ThrowsValidationException()
        {
            var leave = new LeaveRequest
            {
                LeaveRequestId = 1,
                EmployeeId     = 1,
                LeaveType      = LeaveType.Casual,
                StartDate      = DateTime.Today.AddDays(1),
                EndDate        = DateTime.Today.AddDays(2),
                Status         = LeaveStatus.Approved
            };

            _leaveRepoMock.Setup(r => r.Get(1)).ReturnsAsync(leave);

            await Assert.ThrowsAsync<ValidationException>(
                () => _service.ApproveLeaveRequest(1, "admin"));
        }

        // ── RejectLeaveRequest Tests ─────────────────────────────────

        [Fact]
        public async Task RejectLeaveRequest_PendingRequest_ChangesToRejected()
        {
            var leave = new LeaveRequest
            {
                LeaveRequestId = 1,
                EmployeeId     = 1,
                LeaveType      = LeaveType.Sick,
                StartDate      = DateTime.Today.AddDays(1),
                EndDate        = DateTime.Today.AddDays(2),
                Status         = LeaveStatus.Pending
            };
            _context.LeaveRequests.Add(leave);
            await _context.SaveChangesAsync();

            _leaveRepoMock.Setup(r => r.Get(1)).ReturnsAsync(leave);
            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);
            _leaveRepoMock.Setup(r => r.Update(It.IsAny<LeaveRequest>()))
                .ReturnsAsync((LeaveRequest l) => l);

            var result = await _service.RejectLeaveRequest(1, "hr");

            Assert.Equal("Rejected", result.Status);
        }

        [Fact]
        public async Task RejectLeaveRequest_NotPending_ThrowsValidationException()
        {
            var leave = new LeaveRequest
            {
                LeaveRequestId = 1,
                EmployeeId     = 1,
                LeaveType      = LeaveType.Sick,
                StartDate      = DateTime.Today.AddDays(1),
                EndDate        = DateTime.Today.AddDays(2),
                Status         = LeaveStatus.Rejected
            };

            _leaveRepoMock.Setup(r => r.Get(1)).ReturnsAsync(leave);

            await Assert.ThrowsAsync<ValidationException>(
                () => _service.RejectLeaveRequest(1, "hr"));
        }

        // ── CancelLeaveRequest Tests ─────────────────────────────────

        [Fact]
        public async Task CancelLeaveRequest_OwnPendingRequest_Cancels()
        {
            var leave = new LeaveRequest
            {
                LeaveRequestId = 1,
                EmployeeId     = 1,
                LeaveType      = LeaveType.Casual,
                StartDate      = DateTime.Today.AddDays(1),
                EndDate        = DateTime.Today.AddDays(2),
                Status         = LeaveStatus.Pending
            };
            _context.LeaveRequests.Add(leave);
            await _context.SaveChangesAsync();

            _leaveRepoMock.Setup(r => r.Get(1)).ReturnsAsync(leave);
            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);
            _leaveRepoMock.Setup(r => r.Update(It.IsAny<LeaveRequest>()))
                .ReturnsAsync((LeaveRequest l) => l);

            var result = await _service.CancelLeaveRequest(1, 1);

            Assert.Equal("Cancelled", result.Status);
        }

        [Fact]
        public async Task CancelLeaveRequest_OtherEmployeeRequest_ThrowsUnAuthorizedException()
        {
            var leave = new LeaveRequest
            {
                LeaveRequestId = 1,
                EmployeeId     = 1, // owned by employee 1
                LeaveType      = LeaveType.Casual,
                StartDate      = DateTime.Today.AddDays(1),
                EndDate        = DateTime.Today.AddDays(2),
                Status         = LeaveStatus.Pending
            };

            _leaveRepoMock.Setup(r => r.Get(1)).ReturnsAsync(leave);

            // Employee 2 trying to cancel employee 1's request
            await Assert.ThrowsAsync<UnAuthorizedException>(
                () => _service.CancelLeaveRequest(1, 2));
        }

        [Fact]
        public async Task CancelLeaveRequest_ApprovedRequest_ThrowsValidationException()
        {
            var leave = new LeaveRequest
            {
                LeaveRequestId = 1,
                EmployeeId     = 1,
                LeaveType      = LeaveType.Casual,
                StartDate      = DateTime.Today.AddDays(1),
                EndDate        = DateTime.Today.AddDays(2),
                Status         = LeaveStatus.Approved
            };

            _leaveRepoMock.Setup(r => r.Get(1)).ReturnsAsync(leave);

            await Assert.ThrowsAsync<ValidationException>(
                () => _service.CancelLeaveRequest(1, 1));
        }

        // ── GetLeaveBalance Tests ────────────────────────────────────

        [Fact]
        public async Task GetLeaveBalance_ExistingBalance_ReturnsBalance()
        {
            _context.LeaveBalances.Add(new LeaveBalance
            {
                EmployeeId  = 1,
                Year        = 2026,
                CasualTotal = 10,
                CasualUsed  = 3
            });
            await _context.SaveChangesAsync();

            var result = await _service.GetLeaveBalance(1, 2026);

            Assert.Equal(2026, result.Year);
            Assert.Equal(10, result.CasualTotal);
            Assert.Equal(3, result.CasualUsed);
            Assert.Equal(7, result.CasualRemaining);
        }

        [Fact]
        public async Task GetLeaveBalance_NoExistingBalance_CreatesDefaultBalance()
        {
            // No balance seeded — should auto-create with defaults
            var result = await _service.GetLeaveBalance(1, 2026);

            Assert.Equal(2026, result.Year);
            Assert.Equal(10, result.CasualTotal);
            Assert.Equal(0, result.CasualUsed);
        }

        // ── GetLeaveRequestsByEmployee Tests ─────────────────────────

        [Fact]
        public async Task GetLeaveRequestsByEmployee_ReturnsOnlyEmployeeRequests()
        {
            // Seed an employee so the Include navigation resolves
            _context.Employees.Add(new Employee
            {
                EmployeeId    = 1,
                Username      = "emp1",
                FirstName     = "John",
                LastName      = "Doe",
                Email         = "john@test.com",
                DateOfJoining = DateTime.Today
            });
            _context.LeaveRequests.AddRange(
                new LeaveRequest { EmployeeId = 1, LeaveType = LeaveType.Casual, StartDate = DateTime.Today.AddDays(1), EndDate = DateTime.Today.AddDays(2), Status = LeaveStatus.Pending, CreatedAt = DateTime.UtcNow },
                new LeaveRequest { EmployeeId = 2, LeaveType = LeaveType.Sick,   StartDate = DateTime.Today.AddDays(1), EndDate = DateTime.Today.AddDays(2), Status = LeaveStatus.Pending, CreatedAt = DateTime.UtcNow }
            );
            await _context.SaveChangesAsync();

            _leaveRepoMock.Setup(r => r.GetQueryable()).Returns(_context.LeaveRequests);

            var result = await _service.GetLeaveRequestsByEmployee(1);

            Assert.Single(result);
            Assert.All(result, r => Assert.Equal(1, r.EmployeeId));
        }
    }
}
