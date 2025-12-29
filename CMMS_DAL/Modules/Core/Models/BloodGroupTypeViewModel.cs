using System.ComponentModel.DataAnnotations;

namespace CMMS_DAL.Modules.Core.Models
{
    public class BloodGroupTypeViewModel
    {
        public string Id { get; set; }

        [Required(ErrorMessage = "Code is required")]
        public string Code { get; set; }

        public bool IsUserPreferred { get; set; }

        [Required(ErrorMessage = "Blood Group Type is required")]
        public string BloodGroupType { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; }
    }
}
