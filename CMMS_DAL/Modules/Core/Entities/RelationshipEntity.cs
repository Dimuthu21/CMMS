using System;

namespace CMMS_DAL.Modules.Core.Entities
{
    public class RelationshipEntity
    {
        public string Id { get; set; }

        public string Code { get; set; }

        public string RelationshipName { get; set; }

        public bool IsUserPreferred { get; set; }

        public string Status { get; set; }

        // UI-stage helpers
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
