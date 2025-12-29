

using System.ComponentModel.DataAnnotations;

namespace CMMS_DAL.Modules.Core.TypeMaster.ExpenseType.Models
{
    public class ExpenseTypeViewModel
    {
        public string ExpenseTypeId { get; set; }

        public string Code { get; set; }   // auto-generated (not required)

        [Required(
            ErrorMessage = "Expense type name is required"
        )]
        public string Name { get; set; }

        public bool IsUserPreferred { get; set; }

        [Required(
            ErrorMessage = "Status is required"
        )]
        [Range(1, int.MaxValue, ErrorMessage = "Status is required")]
        public int StatusId { get; set; }

        public bool IsDeleted { get; set; }
    }
}
