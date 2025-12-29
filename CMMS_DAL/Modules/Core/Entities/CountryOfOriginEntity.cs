namespace CMMS_DAL.Modules.Core.Entities
{
    // Entity = represents the data structure (DB/table concept).
    // For UI-only stage, it's still useful as the "core object" definition.
    public class CountryOfOriginEntity
    {
        public string Id { get; set; }
        public string Code { get; set; }
        public string CountryName { get; set; }

        public bool IsUserPreferred { get; set; }
        public string Status { get; set; }

        // UI-only localStorage stage: mimic soft delete
        public bool IsDeleted { get; set; }
    }
}
