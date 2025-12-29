using System.ComponentModel.DataAnnotations;

namespace CMMS_DAL.Modules.Core.Models
{
    public class RelationshipViewModel
    {
        public string Id { get; set; }

        [Required(ErrorMessage = "Code is required")]
        public string Code { get; set; }

        [Required(ErrorMessage = "Relationship Name is required")]
        public string RelationshipName { get; set; }

        public bool IsUserPreferred { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; }
    }
}
