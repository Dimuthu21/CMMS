// =======================================
// ExpenseTypeListItemViewModel.cs
// Module : Core > TypeMaster > ExpenseType
// Layer  : CMMS_DAL (List ViewModel)
// Version: 1.0.0
// =======================================

namespace CMMS_DAL.Modules.Core.TypeMaster.ExpenseType.Models
{
    public class ExpenseTypeListItemViewModel
    {
        public string ExpenseTypeId { get; set; }

        public string Code { get; set; }
        public string Name { get; set; }

        public int StatusId { get; set; }
        public string StatusName { get; set; }

        public bool IsUserPreferred { get; set; }
    }
}
