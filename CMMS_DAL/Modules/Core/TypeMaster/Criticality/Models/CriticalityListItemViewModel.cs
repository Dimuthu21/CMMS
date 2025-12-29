// =======================================
// CriticalityListItemViewModel.cs
// Module : Core > TypeMaster > Criticality
// Layer  : CMMS_DAL (List ViewModel)
// Version: 1.0.0
// =======================================

namespace CMMS_DAL.Modules.Core.TypeMaster.Criticality.Models
{
    /// <summary>
    /// Lightweight list row model for DataTables (SS #5).
    /// </summary>
    public class CriticalityListItemViewModel
    {
        public string CriticalityId { get; set; }

        public string Code { get; set; }
        public string Level { get; set; }

        public int StatusId { get; set; }
        public string StatusText { get; set; }
    }
}
