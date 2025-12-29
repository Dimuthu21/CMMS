// =======================================
// CriticalityViewModel.cs
// Module : Core > TypeMaster > Criticality
// Layer  : CMMS_DAL (UI ViewModel)
// Version: 1.0.0
// =======================================

using System.ComponentModel.DataAnnotations;

namespace CMMS_DAL.Modules.Core.TypeMaster.Criticality.Models
{
    /// <summary>
    /// ViewModel for Create/Edit screen (SS #4).
    /// Validation is here (NOT in Controller, NOT in Entity).
    /// </summary>
    public class CriticalityViewModel
    {
        public string CriticalityId { get; set; } // empty for create, set for edit

        public string Code { get; set; }          // auto-generated in JS

        [Required(ErrorMessage = "Criticality level is required")]
        public string Level { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Status is required")]
        public int StatusId { get; set; }

        public bool IsDeleted { get; set; }
    }
}
