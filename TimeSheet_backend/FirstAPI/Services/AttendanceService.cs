using AutoMapper;
using FirstAPI.Exceptions;
using FirstAPI.Interfaces;
using FirstAPI.Models;
using FirstAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FirstAPI.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IRepository<int, Attendance> _attendanceRepository;
        private readonly IRepository<int, Employee> _employeeRepository;
        private readonly IMapper _mapper;

        private static readonly TimeSpan IstOffset = TimeSpan.FromHours(5.5);
        private static DateTime NowIst() => DateTime.UtcNow.Add(IstOffset);
        private static DateTime TodayIst() => NowIst().Date;

        public AttendanceService(
            IRepository<int, Attendance> attendanceRepository,
            IRepository<int, Employee> employeeRepository,
            IMapper mapper)
        {
            _attendanceRepository = attendanceRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<AttendanceResponseDto> CheckIn(int employeeId, AttendanceCheckInDto dto)
        {
            var nowIst   = NowIst();
            var todayIst = nowIst.Date;

            var openPrevious = await _attendanceRepository.GetQueryable()
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId
                    && a.Date.Date < todayIst
                    && a.CheckInTime != null
                    && a.CheckOutTime == null);

            if (openPrevious != null)
                throw new Exceptions.ValidationException($"You forgot to check out on {openPrevious.Date:dd MMM yyyy}. Please contact HR to fix it before checking in.");

            var openToday = await _attendanceRepository.GetQueryable()
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId
                    && a.Date.Date == todayIst
                    && a.CheckOutTime == null);

            if (openToday != null)
                throw new Exceptions.ValidationException("You are already checked in. Please check out first.");

            // Store IST time with Unspecified kind so SQL Server saves it as-is (no UTC conversion)
            var checkIn = new DateTime(nowIst.Year, nowIst.Month, nowIst.Day, nowIst.Hour, nowIst.Minute, 0, DateTimeKind.Unspecified);
            var attendance = new Attendance
            {
                EmployeeId  = employeeId,
                Date        = todayIst,
                CheckInTime = checkIn,
                Status      = AttendanceStatus.Present
            };

            await _attendanceRepository.Add(attendance);
            return await MapToResponseDto(attendance);
        }

        public async Task<AttendanceResponseDto> CheckOut(int employeeId, AttendanceCheckOutDto dto)
        {
            var nowIst   = NowIst();
            var todayIst = nowIst.Date;

            var attendance = await _attendanceRepository.GetQueryable()
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId
                    && a.Date.Date == todayIst
                    && a.CheckOutTime == null);

            if (attendance == null)
                throw new EntityNotFoundException("No active check-in found for today. Please check in first.");

            var checkOut = new DateTime(nowIst.Year, nowIst.Month, nowIst.Day, nowIst.Hour, nowIst.Minute, 0, DateTimeKind.Unspecified);
            attendance.CheckOutTime = checkOut;

            var allTodaySessions = await _attendanceRepository.GetQueryable()
                .Where(a => a.EmployeeId == employeeId && a.Date.Date == todayIst && a.CheckOutTime != null)
                .ToListAsync();

            double totalHours = allTodaySessions
                .Sum(a => (a.CheckOutTime!.Value - a.CheckInTime!.Value).TotalHours);
            totalHours += (checkOut - attendance.CheckInTime!.Value).TotalHours;

            var status = totalHours >= 4 ? AttendanceStatus.Present : AttendanceStatus.HalfDay;
            attendance.Status = status;

            var allToday = await _attendanceRepository.GetQueryable()
                .Where(a => a.EmployeeId == employeeId && a.Date.Date == todayIst)
                .ToListAsync();
            foreach (var rec in allToday)
            {
                rec.Status = status;
                if (rec.AttendanceId != attendance.AttendanceId)
                    await _attendanceRepository.Update(rec);
            }

            await _attendanceRepository.Update(attendance);
            return await MapToResponseDto(attendance);
        }

        public async Task<AttendanceResponseDto> GetAttendanceById(int attendanceId)
        {
            var attendance = await _attendanceRepository.GetQueryable()
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.AttendanceId == attendanceId);

            if (attendance == null)
                throw new EntityNotFoundException($"Attendance record with ID {attendanceId} not found");

            return MapToDto(attendance);
        }

        public async Task<IEnumerable<AttendanceResponseDto>> GetAttendanceByEmployee(int employeeId)
        {
            var records = await _attendanceRepository.GetQueryable()
                .Include(a => a.Employee)
                .Where(a => a.EmployeeId == employeeId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();

            return records.Select(MapToDto);
        }

        public async Task<IEnumerable<AttendanceResponseDto>> GetAllAttendance()
        {
            var records = await _attendanceRepository.GetQueryable()
                .Include(a => a.Employee)
                .OrderByDescending(a => a.Date)
                .ToListAsync();

            return records.Select(MapToDto);
        }

        public async Task<AttendanceReportDto> GetAttendanceReport(int employeeId, DateTime fromDate, DateTime toDate)
        {
            var employee = await _employeeRepository.Get(employeeId);
            if (employee == null)
                throw new EntityNotFoundException($"Employee with ID {employeeId} not found");

            var records = await _attendanceRepository.GetQueryable()
                .Where(a => a.EmployeeId == employeeId && a.Date >= fromDate && a.Date <= toDate)
                .ToListAsync();

            return new AttendanceReportDto
            {
                EmployeeId = employeeId,
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                TotalPresent = records.Count(r => r.Status == AttendanceStatus.Present),
                TotalAbsent = records.Count(r => r.Status == AttendanceStatus.Absent),
                TotalHalfDay = records.Count(r => r.Status == AttendanceStatus.HalfDay),
                TotalLeave = records.Count(r => r.Status == AttendanceStatus.Leave),
                FromDate = fromDate,
                ToDate = toDate
            };
        }

        // HR-only: force-close an open session
        public async Task<AttendanceResponseDto> FixCheckout(int attendanceId, AttendanceCheckOutDto dto)
        {
            var attendance = await _attendanceRepository.GetQueryable()
                .FirstOrDefaultAsync(a => a.AttendanceId == attendanceId);

            if (attendance == null)
                throw new EntityNotFoundException($"Attendance record {attendanceId} not found.");

            if (attendance.CheckOutTime != null)
                throw new Exceptions.ValidationException("This session already has a checkout time.");

            var rawCheckOut = dto.CheckOutTime ?? NowIst();
            attendance.CheckOutTime = new DateTime(rawCheckOut.Year, rawCheckOut.Month, rawCheckOut.Day,
                                                   rawCheckOut.Hour, rawCheckOut.Minute, 0, DateTimeKind.Unspecified);

            // Recalculate total hours for that day
            var allSessions = await _attendanceRepository.GetQueryable()
                .Where(a => a.EmployeeId == attendance.EmployeeId && a.Date.Date == attendance.Date.Date)
                .ToListAsync();

            double totalHours = allSessions
                .Where(a => a.AttendanceId != attendanceId && a.CheckOutTime != null)
                .Sum(a => (a.CheckOutTime!.Value - a.CheckInTime!.Value).TotalHours);
            totalHours += (attendance.CheckOutTime.Value - attendance.CheckInTime!.Value).TotalHours;

            var status = totalHours >= 4 ? AttendanceStatus.Present : AttendanceStatus.HalfDay;
            attendance.Status = status;

            foreach (var rec in allSessions.Where(a => a.AttendanceId != attendanceId))
            {
                rec.Status = status;
                await _attendanceRepository.Update(rec);
            }

            await _attendanceRepository.Update(attendance);
            return MapToDto(attendance);
        }

        private async Task<AttendanceResponseDto> MapToResponseDto(Attendance attendance)
        {
            var fullRecord = await _attendanceRepository.GetQueryable()
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.AttendanceId == attendance.AttendanceId);

            return MapToDto(fullRecord ?? attendance);
        }

        private AttendanceResponseDto MapToDto(Attendance attendance)
        {
            return new AttendanceResponseDto
            {
                AttendanceId = attendance.AttendanceId,
                EmployeeId   = attendance.EmployeeId,
                EmployeeName = attendance.Employee != null ? $"{attendance.Employee.FirstName} {attendance.Employee.LastName}" : "",
                Date         = attendance.Date,
                // Return as Unspecified so JSON serializer omits the 'Z' — frontend treats as local IST
                CheckInTime  = attendance.CheckInTime.HasValue
                    ? DateTime.SpecifyKind(attendance.CheckInTime.Value, DateTimeKind.Unspecified)
                    : null,
                CheckOutTime = attendance.CheckOutTime.HasValue
                    ? DateTime.SpecifyKind(attendance.CheckOutTime.Value, DateTimeKind.Unspecified)
                    : null,
                Status = attendance.Status.ToString()
            };
        }
    }
}
