using AutoMapper;
using FirstAPI.Contexts;
using FirstAPI.Exceptions;
using FirstAPI.Interfaces;
using FirstAPI.Mappings;
using FirstAPI.Models;
using FirstAPI.Models.DTOs;
using FirstAPI.Services;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace FirstAPI.Tests
{
    public class OvertimeRuleServiceTests : IDisposable
    {
        private readonly TimeSheetContext _context;
        private readonly Mock<IRepository<int, OvertimeRule>> _ruleRepoMock;
        private readonly IMapper _mapper;
        private readonly OvertimeRuleService _service;

        public OvertimeRuleServiceTests()
        {
            var options = new DbContextOptionsBuilder<TimeSheetContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new TimeSheetContext(options);

            _ruleRepoMock = new Mock<IRepository<int, OvertimeRule>>();

            var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
            _mapper = config.CreateMapper();

            _service = new OvertimeRuleService(_ruleRepoMock.Object, _mapper);
        }

        public void Dispose() => _context.Dispose();

        // ── CreateRule Tests ─────────────────────────────────────────

        [Fact]
        public async Task CreateRule_ValidData_ReturnsRuleDto()
        {
            _ruleRepoMock.Setup(r => r.Add(It.IsAny<OvertimeRule>()))
                .ReturnsAsync((OvertimeRule r) => { r.OvertimeRuleId = 1; return r; });

            var dto = new OvertimeRuleCreateDto
            {
                RuleName           = "Standard Rule",
                MaxRegularHours    = 8.0m,
                OvertimeMultiplier = 1.5m,
                EffectiveFrom      = DateTime.Today
            };

            var result = await _service.CreateRule(dto);

            Assert.NotNull(result);
            Assert.Equal("Standard Rule", result.RuleName);
            Assert.Equal(8.0m, result.MaxRegularHours);
            Assert.Equal(1.5m, result.OvertimeMultiplier);
            Assert.True(result.IsActive);
        }

        [Fact]
        public async Task CreateRule_SetsIsActiveTrue()
        {
            _ruleRepoMock.Setup(r => r.Add(It.IsAny<OvertimeRule>()))
                .ReturnsAsync((OvertimeRule r) => r);

            var dto = new OvertimeRuleCreateDto
            {
                RuleName           = "New Rule",
                MaxRegularHours    = 9.0m,
                OvertimeMultiplier = 2.0m,
                EffectiveFrom      = DateTime.Today
            };

            var result = await _service.CreateRule(dto);

            Assert.True(result.IsActive);
        }

        // ── UpdateRule Tests ─────────────────────────────────────────

        [Fact]
        public async Task UpdateRule_ValidData_UpdatesFields()
        {
            var rule = new OvertimeRule
            {
                OvertimeRuleId     = 1,
                RuleName           = "Old Rule",
                MaxRegularHours    = 8.0m,
                OvertimeMultiplier = 1.5m,
                EffectiveFrom      = DateTime.Today,
                IsActive           = true
            };

            _ruleRepoMock.Setup(r => r.Get(1)).ReturnsAsync(rule);
            _ruleRepoMock.Setup(r => r.Update(It.IsAny<OvertimeRule>()))
                .ReturnsAsync((OvertimeRule r) => r);

            var dto = new OvertimeRuleUpdateDto
            {
                RuleName           = "Updated Rule",
                MaxRegularHours    = 9.0m,
                OvertimeMultiplier = 2.0m,
                EffectiveFrom      = DateTime.Today,
                IsActive           = false
            };

            var result = await _service.UpdateRule(1, dto);

            Assert.Equal("Updated Rule", result.RuleName);
            Assert.Equal(9.0m, result.MaxRegularHours);
            Assert.Equal(2.0m, result.OvertimeMultiplier);
            Assert.False(result.IsActive);
        }

        // ── DeleteRule Tests ─────────────────────────────────────────

        [Fact]
        public async Task DeleteRule_ValidId_ReturnsDeletedRule()
        {
            var rule = new OvertimeRule
            {
                OvertimeRuleId     = 1,
                RuleName           = "Rule To Delete",
                MaxRegularHours    = 8.0m,
                OvertimeMultiplier = 1.5m,
                EffectiveFrom      = DateTime.Today,
                IsActive           = true
            };

            _ruleRepoMock.Setup(r => r.Delete(1)).ReturnsAsync(rule);

            var result = await _service.DeleteRule(1);

            Assert.NotNull(result);
            Assert.Equal("Rule To Delete", result.RuleName);
            _ruleRepoMock.Verify(r => r.Delete(1), Times.Once);
        }

        // ── GetRuleById Tests ────────────────────────────────────────

        [Fact]
        public async Task GetRuleById_ValidId_ReturnsRule()
        {
            var rule = new OvertimeRule
            {
                OvertimeRuleId     = 1,
                RuleName           = "Test Rule",
                MaxRegularHours    = 8.0m,
                OvertimeMultiplier = 1.5m,
                EffectiveFrom      = DateTime.Today,
                IsActive           = true
            };

            _ruleRepoMock.Setup(r => r.Get(1)).ReturnsAsync(rule);

            var result = await _service.GetRuleById(1);

            Assert.NotNull(result);
            Assert.Equal("Test Rule", result.RuleName);
        }

        // ── GetAllRules Tests ────────────────────────────────────────

        [Fact]
        public async Task GetAllRules_ReturnsAllRules()
        {
            var rules = new List<OvertimeRule>
            {
                new OvertimeRule { OvertimeRuleId = 1, RuleName = "Rule A", MaxRegularHours = 8m, OvertimeMultiplier = 1.5m, EffectiveFrom = DateTime.Today, IsActive = true },
                new OvertimeRule { OvertimeRuleId = 2, RuleName = "Rule B", MaxRegularHours = 9m, OvertimeMultiplier = 2.0m, EffectiveFrom = DateTime.Today, IsActive = false }
            };

            _ruleRepoMock.Setup(r => r.GetAll()).ReturnsAsync(rules);

            var result = await _service.GetAllRules();

            Assert.Equal(2, result.Count());
        }

        // ── GetActiveRule Tests ──────────────────────────────────────

        [Fact]
        public async Task GetActiveRule_ActiveRuleExists_ReturnsRule()
        {
            _context.OvertimeRules.Add(new OvertimeRule
            {
                OvertimeRuleId     = 1,
                RuleName           = "Active Rule",
                MaxRegularHours    = 8.0m,
                OvertimeMultiplier = 1.5m,
                EffectiveFrom      = DateTime.UtcNow.AddDays(-30),
                EffectiveTo        = null,
                IsActive           = true
            });
            await _context.SaveChangesAsync();

            _ruleRepoMock.Setup(r => r.GetQueryable()).Returns(_context.OvertimeRules);

            var result = await _service.GetActiveRule();

            Assert.NotNull(result);
            Assert.Equal("Active Rule", result.RuleName);
        }

        [Fact]
        public async Task GetActiveRule_NoActiveRule_ReturnsNull()
        {
            // No rules in DB
            _ruleRepoMock.Setup(r => r.GetQueryable()).Returns(_context.OvertimeRules);

            var result = await _service.GetActiveRule();

            Assert.Null(result);
        }

        [Fact]
        public async Task GetActiveRule_ExpiredRule_ReturnsNull()
        {
            _context.OvertimeRules.Add(new OvertimeRule
            {
                OvertimeRuleId     = 1,
                RuleName           = "Expired Rule",
                MaxRegularHours    = 8.0m,
                OvertimeMultiplier = 1.5m,
                EffectiveFrom      = DateTime.UtcNow.AddDays(-60),
                EffectiveTo        = DateTime.UtcNow.AddDays(-1), // expired
                IsActive           = true
            });
            await _context.SaveChangesAsync();

            _ruleRepoMock.Setup(r => r.GetQueryable()).Returns(_context.OvertimeRules);

            var result = await _service.GetActiveRule();

            Assert.Null(result);
        }
    }
}
