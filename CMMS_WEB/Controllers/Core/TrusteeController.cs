using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class TrusteeController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            ViewBag.Title = "Trustee";
            return View("~/Views/Core/BusinessPartner/Trustee/TrusteeIndex.cshtml", new TrusteeViewModel());
        }
    }
}
