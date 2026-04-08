using System.ComponentModel.DataAnnotations;

namespace FirstAPI.Models.DTOs
{
    public class GetAllEmployeesRequestDTO
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Department { get; set; }
        public string? JobTitle { get; set; }
        public string? Search { get; set; }
    }
}
