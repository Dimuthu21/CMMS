namespace CMMS_DAL.Modules.Core.Entities
{
    public class ShipmentTypeEntity
    {
        public string Id { get; set; }
        public string Code { get; set; }
        public string ShipmentTypeName { get; set; }
        public bool IsUserPreferred { get; set; }
        public string Status { get; set; }
    }
}
