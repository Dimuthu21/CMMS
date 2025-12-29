// =======================================
// CriticalityEntity.cs
// Module : Core > TypeMaster > Criticality
// Layer  : CMMS_DAL (Entity)
// Version: 1.0.0
// =======================================

using System;

namespace CMMS_DAL.Modules.Core.TypeMaster.Criticality.Entities
{
    /// <summary>
    /// Entity representing Criticality master record.
    /// UI-only stage: stored in localStorage; later saved via SP + Dapper.
    /// </summary>
    public class CriticalityEntity
    {
        public string CriticalityId { get; set; }   // UI stage: GUID-like string

        public string Code { get; set; }            // e.g., CT0013
        public string Level { get; set; }           // "Criticality Level" (required)

        public int StatusId { get; set; }           // 1=Active, 2=Inactive
        public bool IsDeleted { get; set; }         // soft delete

        // Audit (keep for DB stage)
        public string CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

        public string UpdatedBy { get; set; }
        public DateTime? UpdatedOn { get; set; }
    }
}
