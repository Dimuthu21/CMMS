using System;

namespace CMMS_DAL.Modules.Core.Entities
{
    // UI-only stage: keep as simple POCO (similar to TrusteeEntity)
    public class BloodGroupTypeEntity
    {
        public string Id { get; set; }

        public string Code { get; set; }

        public string BloodGroupType { get; set; }

        public bool IsUserPreferred { get; set; }

        public string Status { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}
