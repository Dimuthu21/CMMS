using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class SectorController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            ViewBag.Title = "Sector";
            return View("~/Views/Core/BusinessPartner/Sector/SectorIndex.cshtml", new SectorViewModel());
        }
    }
}
