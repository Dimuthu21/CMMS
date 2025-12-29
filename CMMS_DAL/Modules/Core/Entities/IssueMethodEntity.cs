namespace CMMS_DAL.Modules.Core.Entities
{
    // UI stage: keep public (same as we do for others)
    public class IssueMethodEntity
    {
        public string Id { get; set; }
        public string Code { get; set; }
        public string IssueTypeName { get; set; }
        public bool IsUserPreferred { get; set; }
        public string Status { get; set; }
        public bool IsDeleted { get; set; }
    }
}
