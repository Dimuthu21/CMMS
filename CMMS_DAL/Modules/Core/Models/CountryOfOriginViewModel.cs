using System.ComponentModel.DataAnnotations;

namespace CMMS_DAL.Modules.Core.Models
{
    // ViewModel = ONLY what the UI needs (validation + binding).
    // This is what your .cshtml uses as @model.
    public class CountryOfOriginViewModel
    {
        public string Id { get; set; }

        [Required(ErrorMessage = "Code is required")]
        public string Code { get; set; }

        [Required(ErrorMessage = "Country Name is required")]
        public string CountryName { get; set; }

        public bool IsUserPreferred { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; }
    }
}
