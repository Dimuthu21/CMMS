namespace CMMS_DAL.Modules.Core.Models
{
    public class SectorViewModel
    {
        public string Id { get; set; }

        public string Code { get; set; }
        public bool IsUserPreferred { get; set; }

        public string SectorName { get; set; }

        public string Status { get; set; }
    }
}
