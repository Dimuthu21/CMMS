

using System;

namespace CMMS_DAL.Modules.Core.TypeMaster.ExpenseType.Entities
{
    public class ExpenseTypeEntity
    {
        public string ExpenseTypeId { get; set; }

        public string Code { get; set; }
        public string Name { get; set; }

        public bool IsUserPreferred { get; set; }

        public int StatusId { get; set; }
        public bool IsDeleted { get; set; }

        // Audit
        public string CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

        public string UpdatedBy { get; set; }
        public DateTime? UpdatedOn { get; set; }
    }
}
