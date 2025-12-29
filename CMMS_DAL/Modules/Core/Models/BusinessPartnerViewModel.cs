namespace CMMS_DAL.Modules.Core.Models
{
    public class BusinessPartnerViewModel
    {
        // ---------- Core ----------
        public string Id { get; set; }
        public string Code { get; set; }
        public bool IsUserPreferred { get; set; }

        // ---------- Top panel ----------
        public string Name { get; set; }
        public string Currency { get; set; }

        // readonly/display fields (UI only)
        public int Deliveries { get; set; }
        public decimal AccountBalance { get; set; }
        public int Orders { get; set; }

        // ---------- General tab ----------
        public string TelNo1 { get; set; }
        public string TelNo2 { get; set; }
        public string MobileNumber { get; set; }
        public string Fax { get; set; }

        public string Website { get; set; }
        public string TinNo { get; set; }

        public string Email { get; set; }
        public string RegistrationNumber { get; set; }

        public string IndustryId { get; set; }
        public string TrusteeId { get; set; }
        public string SectorId { get; set; }

        public bool IsSupplier { get; set; }
        public bool IsCustomer { get; set; }

        public string Status { get; set; }

        // ---------- Other tabs (later) ----------
        public string Remarks { get; set; }
        public string ParentBusinessPartnerId { get; set; }
    }
}
