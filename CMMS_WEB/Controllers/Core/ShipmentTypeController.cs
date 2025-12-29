using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class ShipmentTypeController : Controller
    {
        [HttpGet]
        public ActionResult Index(string id)
        {
            ViewBag.Title = "Shipment Type";

            // UI-only: ViewModel just for HTML helpers.
            // Data will be handled by JS + localStorage (like Trustee).
            return View("~/Views/Core/TypeMaster/ShipmentType/ShipmentTypeIndex.cshtml",
                new ShipmentTypeViewModel());
        }
    }
}
